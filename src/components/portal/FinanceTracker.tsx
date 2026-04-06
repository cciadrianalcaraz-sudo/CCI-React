import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Search, TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Edit2, 
    Upload, 
    Download, 
    Calendar
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../ui/Button';

interface FinanceRecord {
    id: string;
    user_id: string;
    concept: string;
    date: string;
    payment_method: string;
    provider: string;
    income: number;
    expense: number;
    description: string;
    created_at: string;
    expense_type: string;
}

interface PaymentMethod {
    id: string;
    user_id: string;
    name: string;
}

interface FinanceCredit {
    id: string;
    user_id: string;
    name: string;
    initial_balance: number;
    annual_rate: number;
    start_date: string;
    created_at: string;
}

interface FinanceTrackerProps {
    user: any;
    records?: FinanceRecord[];
    onRefresh?: () => void;
}

export default function FinanceTracker({ user, records: propsRecords, onRefresh }: FinanceTrackerProps) {
    const [localRecords, setLocalRecords] = useState<FinanceRecord[]>([]);
    const records = propsRecords || localRecords;
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Gráficos de Colores
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#6366f1', '#ec4899', '#14b8a6', '#84cc16', '#f43f5e', '#a855f7', '#0ea5e9'];

    // View modes
    const [viewMode, setViewMode] = useState<'detailed' | 'summary' | 'balances' | 'budget' | 'credits'>(() => {
        const saved = localStorage.getItem(`finance_view_mode_${user.id}`);
        return (saved === 'detailed' || saved === 'summary' || saved === 'balances' || saved === 'budget' || saved === 'credits') ? saved : 'detailed';
    });

    // Save viewMode to localStorage whenever it changes
    useEffect(() => {
        if (user?.id) {
            localStorage.setItem(`finance_view_mode_${user.id}`, viewMode);
        }
    }, [viewMode, user?.id]);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [uniqueMonths, setUniqueMonths] = useState<{label: string, value: string}[]>([]);
    const [summaryData, setSummaryData] = useState<{concept: string, income: number, expense: number}[]>([]);
    const [paymentBalancesData, setPaymentBalancesData] = useState<{method: string, initialBalance: number, income: number, expense: number, finalBalance: number}[]>([]);
    
    // ESTADO NUEVO: Almacena los datos del presupuesto calculado
    const [budgetData, setBudgetData] = useState<{concept: string, avgBudget: number, currentExpense: number, difference: number}[]>([]);
    const [manualBudgets, setManualBudgets] = useState<Record<string, number>>({});
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    
    // Form state
    const [concept, setConcept] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [provider, setProvider] = useState('');
    const [income, setIncome] = useState<number | ''>('');
    const [expense, setExpense] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [expenseType, setExpenseType] = useState('Variable');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // Payment Methods
    const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
    
    // Account management states (Saldos tab)
    const [initialBalanceAmount, setInitialBalanceAmount] = useState<number | ''>('');
    const [initialBalancePM, setInitialBalancePM] = useState('');
    const [initialBalanceDate, setInitialBalanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [transferAmount, setTransferAmount] = useState<number | ''>('');
    const [transferOrigin, setTransferOrigin] = useState('');
    const [transferDest, setTransferDest] = useState('');
    const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
    const [transferDesc, setTransferDesc] = useState('');
    const [accMgmtTab, setAccMgmtTab] = useState<'initial' | 'transfer' | 'accounts'>('initial');
    const [newAccountName, setNewAccountName] = useState('');

    // Credit Tracker states
    const [credits, setCredits] = useState<FinanceCredit[]>([]);
    const [creditName, setCreditName] = useState('');
    const [creditInitialBalance, setCreditInitialBalance] = useState<number | ''>('');
    const [creditAnnualRate, setCreditAnnualRate] = useState<number | ''>('');
    const [creditStartDate, setCreditStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [isCreditFormOpen, setIsCreditFormOpen] = useState(false);
    const [isSavingCredit, setIsSavingCredit] = useState(false);

    // Credit Payment Form states
    const [isCreditPaymentFormOpen, setIsCreditPaymentFormOpen] = useState(false);
    const [activeCreditForPayment, setActiveCreditForPayment] = useState<FinanceCredit | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [creditPaymentMethod, setCreditPaymentMethod] = useState('');
    const [isSavingPayment, setIsSavingPayment] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper: Formato de fecha sin desajuste de zona horaria
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        // Para YYYY-MM-DD, evitamos UTC shifts dividiendo y usando los componentes locales
        if (dateStr.includes('-')) {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    };

    useEffect(() => {
        if (!propsRecords) {
            loadRecords();
        } else {
            setLoading(false);
        }
        loadCredits();
        loadPaymentMethods();
    }, [user.id, propsRecords]);

    const loadPaymentMethods = async () => {
        try {
            const { data, error } = await supabase
                .from('finance_payment_methods')
                .select('*')
                .order('name', { ascending: true });
            
            if (error) throw error;
            if (data) setSavedPaymentMethods(data as PaymentMethod[]);
        } catch (error) {
            console.error("Error loading payment methods:", error);
        }
    };

    const handleSavePaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAccountName.trim()) return;
        try {
            const { error } = await supabase
                .from('finance_payment_methods')
                .insert([{ user_id: user.id, name: newAccountName.trim().toUpperCase() }]);
            if (error) throw error;
            setNewAccountName('');
            loadPaymentMethods();
            alert("Cuenta agregada correctamente.");
        } catch (error: any) {
            console.error("Error saving payment method:", error);
            alert("No se pudo agregar la cuenta. (¿Ya existe?)");
        }
    };

    const handleDeletePaymentMethod = async (id: string, name: string) => {
        if (!window.confirm(`¿Seguro que deseas eliminar la cuenta "${name}"? Esto no borrará sus registros históricos.`)) return;
        try {
            const { error } = await supabase.from('finance_payment_methods').delete().eq('id', id);
            if (error) throw error;
            loadPaymentMethods();
        } catch (error) {
            console.error("Error deleting payment method:", error);
            alert("No se pudo eliminar la cuenta.");
        }
    };

    useEffect(() => {
        if (selectedMonth) {
            loadBudgets(selectedMonth);
        }
    }, [selectedMonth, user.id]);

    const loadBudgets = async (month: string) => {
        try {
            const { data, error } = await supabase
                .from('finance_budgets')
                .select('concept, amount')
                .eq('month', month)
                .eq('user_id', user.id);
            
            if (error) {
                console.error("Error loading budgets for " + month + ":", error);
                return;
            }
            
            const budgetMap: Record<string, number> = {};
            if (data) {
                data.forEach(b => {
                    budgetMap[b.concept] = Number(b.amount);
                });
            }
            setManualBudgets(budgetMap);
        } catch (error) {
            console.error("Exception loading budgets:", error);
        }
    };

    const handleSaveBudget = async (concept: string, amount: number) => {
        try {
            const { error } = await supabase
                .from('finance_budgets')
                .upsert({ 
                    user_id: user.id, 
                    concept, 
                    month: selectedMonth,
                    amount,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,concept,month' });

            if (error) throw error;
            
            setManualBudgets(prev => ({
                ...prev,
                [concept]: amount
            }));
        } catch (error) {
            console.error("Error saving budget:", error);
            alert("No se pudo guardar el presupuesto.");
        }
    };

    const handleDeleteBudget = async (concept: string) => {
        if (!window.confirm(`¿Seguro que deseas eliminar el presupuesto personalizado para "${concept}"?`)) return;
        try {
            const { error } = await supabase
                .from('finance_budgets')
                .delete()
                .eq('concept', concept)
                .eq('month', selectedMonth);

            if (error) throw error;
            
            const newBudgets = { ...manualBudgets };
            delete newBudgets[concept];
            setManualBudgets(newBudgets);
        } catch (error) {
            console.error("Error deleting budget:", error);
            alert("No se pudo eliminar el presupuesto.");
        }
    };

    const loadCredits = async () => {
        try {
            const { data, error } = await supabase
                .from('finance_credits')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            if (data) setCredits(data as FinanceCredit[]);
        } catch (error) {
            console.error("Error loading credits:", error);
        }
    };

    const handleSaveCredit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingCredit(true);
        try {
            const { data, error } = await supabase
                .from('finance_credits')
                .insert([{
                    user_id: user.id,
                    name: creditName,
                    initial_balance: Number(creditInitialBalance),
                    annual_rate: Number(creditAnnualRate),
                    start_date: creditStartDate
                }])
                .select();

            if (error) throw error;
            if (data) {
                setCredits([...data, ...credits]);
                setCreditName('');
                setCreditInitialBalance('');
                setCreditAnnualRate('');
                setCreditStartDate(new Date().toISOString().split('T')[0]);
                setIsCreditFormOpen(false);
            }
        } catch (error) {
            console.error("Error saving credit:", error);
            alert("Error al guardar crédito.");
        } finally {
            setIsSavingCredit(false);
        }
    };

    const handleDeleteCredit = async (id: string) => {
        if (!window.confirm("¿Seguro que quieres eliminar este crédito?")) return;
        try {
            const { error } = await supabase
                .from('finance_credits')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            setCredits(credits.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error deleting credit:", error);
        }
    };

    const handleSaveCreditPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCreditForPayment) return;
        setIsSavingPayment(true);
        try {
            const { error } = await supabase
                .from('finance_records')
                .insert([{
                    user_id: user.id,
                    concept: `PAGO CAPITAL: ${activeCreditForPayment.name.toUpperCase()}`,
                    date: paymentDate,
                    payment_method: creditPaymentMethod || 'Transferencia',
                    provider: 'Banco',
                    income: 0,
                    expense: Number(paymentAmount),
                    description: `Abono directo a capital: ${activeCreditForPayment.name}`,
                    expense_type: 'Deuda'
                }]);

            if (error) throw error;
            
            // Recargar datos
            loadRecords();
            setIsCreditPaymentFormOpen(false);
            setPaymentAmount('');
            setActiveCreditForPayment(null);
        } catch (error) {
            console.error("Error saving credit payment:", error);
            alert("No se pudo registrar el pago.");
        } finally {
            setIsSavingPayment(false);
        }
    };
    const loadRecords = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('finance_records')
                .select('*')
                .order('date', { ascending: true })
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (data) {
                setLocalRecords(data as FinanceRecord[]);
                if (onRefresh) onRefresh();
            }
        } catch (error) {
            console.error("Error loading finance records:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Obtener meses de los registros reales (normalizando formato)
        const recordMonths = Array.from(new Set(records.map(r => {
            if (r.date.includes('/')) return r.date.split('/').reverse().join('-').substring(0, 7);
            return r.date.substring(0, 7);
        })));
        
        // 2. Generar meses futuros (próximos 12 meses desde hoy)
        const futureMonths: string[] = [];
        const today = new Date();
        for (let i = 0; i <= 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            futureMonths.push(`${yyyy}-${mm}`);
        }

        // 3. Combinar, ordenar y formatear
        const allMonths = Array.from(new Set([...recordMonths, ...futureMonths])).sort().reverse();
        
        const formattedMonths = allMonths.map(m => {
            const [year, month] = m.split('-');
            const date = new Date(Number(year), Number(month) - 1, 1);
            return {
                value: m,
                label: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
            };
        });
        
        setUniqueMonths([{label: 'Todos los meses', value: 'all'}, ...formattedMonths]);
        
        // Inicializar mes seleccionado si está vacíoo (usar el mes actual si existe en la lista)
        if (!selectedMonth && formattedMonths.length > 0) {
            const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            const hasCurrentMonth = formattedMonths.some(m => m.value === currentMonthStr);
            setSelectedMonth(hasCurrentMonth ? currentMonthStr : formattedMonths[0].value);
        }
    }, [records]);

    useEffect(() => {
        if (!selectedMonth) return;
        
        const filteredRecords = selectedMonth === 'all' 
            ? records 
            : records.filter(r => {
                const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
                return rDate.startsWith(selectedMonth);
            });
        
        const grouped = filteredRecords
            .filter(r => {
                const c = (r.concept || '').toUpperCase().trim();
                return c !== 'SALDO INICIAL' && !c.includes('TRASPASO');
            })
            .reduce((acc, curr) => {
                const c = curr.concept || 'SIN CONCEPTO';
                if (!acc[c]) {
                    acc[c] = { concept: c, income: 0, expense: 0 };
                }
                acc[c].income += Number(curr.income) || 0;
                acc[c].expense += Number(curr.expense) || 0;
                return acc;
            }, {} as Record<string, {concept: string, income: number, expense: number}>);
        
        const sortedSummary = Object.values(grouped).sort((a, b) => a.concept.localeCompare(b.concept));
        setSummaryData(sortedSummary);
        
        // =========================================================================
        // NUEVO: CÁLCULO DE PRESUPUESTO (Promedio histórico)
        // =========================================================================
        const historicalRecords = selectedMonth === 'all' 
            ? records 
            : records.filter(r => {
                const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
                return rDate.substring(0, 7) < selectedMonth;
            });
            
        const historicalMonthsCount = new Set(historicalRecords.map(r => {
                const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
                return rDate.substring(0, 7);
            })).size || 1;
        
        const historicalExpenses = historicalRecords
            .filter(r => {
                const c = (r.concept || '').toUpperCase().trim();
                return c !== 'SALDO INICIAL' && !c.includes('TRASPASO') && Number(r.expense) > 0;
            })
            .reduce((acc, curr) => {
                const c = curr.concept || 'SIN CONCEPTO';
                if (!acc[c]) acc[c] = 0;
                acc[c] += Number(curr.expense);
                return acc;
            }, {} as Record<string, number>);
            
        const allEverConcepts = Array.from(new Set(records.map(r => (r.concept || '').toUpperCase().trim())))
            .filter(c => c !== '' && c !== 'SALDO INICIAL' && !c.includes('TRASPASO'));

        const allConcepts = new Set([
            ...allEverConcepts,
            ...Object.keys(manualBudgets)
        ]);
        
        const budgetArr = Array.from(allConcepts)
            .filter(c => c && c.trim() !== '')
            .map(concept => {
                const totalHistorical = historicalExpenses[concept] || 0;
                const histAvg = totalHistorical / historicalMonthsCount;
                const currentExp = grouped[concept]?.expense || 0;
                const definedBudget = manualBudgets[concept] !== undefined ? manualBudgets[concept] : histAvg;
                
                return {
                    concept,
                    avgBudget: definedBudget,
                    currentExpense: currentExp,
                    difference: definedBudget - currentExp
                };
            })
            .sort((a,b) => b.avgBudget - a.avgBudget);
          
        setBudgetData(budgetArr);
        // =========================================================================

        const paymentMap: Record<string, { initial: number, income: number, expense: number, finalBalance: number }> = {};
        
        // The saldos tab always needs the FULL historical picture up to (and including) the selected month.
        // We iterate ALL records chronologically, accumulating balances per account.
        // For the current/selected month we also track income/expense for that period.
        const cutoffMonth = selectedMonth === 'all' ? '9999-12' : selectedMonth;

        [...records]
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .filter(r => {
            const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
            return rDate.substring(0, 7) <= cutoffMonth;
          })
          .forEach(r => {
            const pm = r.payment_method || 'SIN ESPECIFICAR';
            if (!paymentMap[pm]) {
                paymentMap[pm] = { initial: 0, income: 0, expense: 0, finalBalance: 0 };
            }
            
            const recordMonth = r.date.substring(0, 7);
            const isInitialBalance = (r.concept || '').toUpperCase().trim() === 'SALDO INICIAL';
            const recordIncome = Number(r.income) || 0;
            const recordExpense = Number(r.expense) || 0;

            // Records BEFORE the selected month: accumulate into the "initial" carry-forward balance
            if (selectedMonth !== 'all' && recordMonth < selectedMonth) {
                if (isInitialBalance) {
                    paymentMap[pm].finalBalance = recordIncome - recordExpense;
                } else {
                    paymentMap[pm].finalBalance += recordIncome - recordExpense;
                }
                // Keep updating initial so it reflects carry-forward at start of selected month
                paymentMap[pm].initial = paymentMap[pm].finalBalance;

            } else {
                // Records IN the selected month (or all months)
                if (isInitialBalance) {
                    const resetValue = recordIncome - recordExpense;
                    paymentMap[pm].initial = resetValue;
                    paymentMap[pm].finalBalance = resetValue;
                    paymentMap[pm].income = 0;
                    paymentMap[pm].expense = 0;
                } else {
                    paymentMap[pm].income += recordIncome;
                    paymentMap[pm].expense += recordExpense;
                    paymentMap[pm].finalBalance += recordIncome - recordExpense;
                }
            }
        });
        
        // Show ALL accounts that have ever had any record, even if current balance is zero
        const balances = Object.entries(paymentMap)
            .map(([method, data]) => ({
                method,
                initialBalance: data.initial,
                income: data.income,
                expense: data.expense,
                finalBalance: data.finalBalance 
            }))
            .sort((a,b) => b.finalBalance - a.finalBalance);
            
        setPaymentBalancesData(balances);
        
    }, [records, selectedMonth, manualBudgets]);

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const numIncome = Number(income) || 0;
            const numExpense = Number(expense) || 0;

            if (editingId) {
                // Actualizar Registro Existente
                const { error, data } = await supabase
                    .from('finance_records')
                    .update({
                        concept,
                        date,
                        payment_method: paymentMethod,
                        provider,
                        income: numIncome,
                        expense: numExpense,
                        description,
                        expense_type: expenseType
                    })
                    .eq('id', editingId)
                    .select();

                if (error) throw error;
                if (data && data.length > 0) {
                    loadRecords();
                    resetForm();
                    setIsFormOpen(false);
                }
            } else {
                // Registro Normal
                const { data, error } = await supabase
                    .from('finance_records')
                    .insert([{
                        user_id: user.id,
                        concept,
                        date,
                        payment_method: paymentMethod,
                        provider,
                        income: numIncome,
                        expense: numExpense,
                        description,
                        expense_type: expenseType
                    }])
                    .select();

                if (error) throw error;
                if (data && data.length > 0) {
                    loadRecords();
                    resetForm();
                    setIsFormOpen(false);
                }
            }
        } catch (error) {
            console.error("Error adding/updating record:", error);
            alert("Hubo un error al guardar el registro.");
        }
    };

    const handleAddInitialBalance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!initialBalancePM || initialBalanceAmount === '') {
            alert("Por favor selecciona una cuenta y un monto.");
            return;
        }

        try {
            const { error } = await supabase.from('finance_records').insert([{
                user_id: user.id,
                concept: 'SALDO INICIAL',
                date: initialBalanceDate,
                payment_method: initialBalancePM,
                income: Number(initialBalanceAmount) >= 0 ? Number(initialBalanceAmount) : 0,
                expense: Number(initialBalanceAmount) < 0 ? Math.abs(Number(initialBalanceAmount)) : 0,
                provider: 'SISTEMA',
                description: 'Carga inicial de saldo'
            }]);

            if (error) throw error;
            setInitialBalanceAmount('');
            setInitialBalancePM('');
            setInitialBalanceDate(new Date().toISOString().split('T')[0]);
            loadRecords();
            alert("Saldo inicial registrado correctamente.");
        } catch (error) {
            console.error("Error setting initial balance:", error);
            alert("Error al guardar saldo inicial.");
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferOrigin || !transferDest || !transferAmount || transferOrigin === transferDest) {
            alert("Por favor selecciona cuentas de origen y destino válidas y un monto.");
            return;
        }

        try {
            const numAmount = Number(transferAmount);

            // Registro de Salida
            const { error: outErr } = await supabase.from('finance_records').insert([{
                user_id: user.id,
                concept: 'TRASPASO INTERNO',
                date: transferDate,
                payment_method: transferOrigin,
                provider: `Hacia: ${transferDest}`,
                income: 0,
                expense: numAmount,
                description: `${transferDesc} (Traspaso: ${transferOrigin} -> ${transferDest})`
            }]);
            if (outErr) throw outErr;

            // Registro de Entrada
            const { error: inErr } = await supabase.from('finance_records').insert([{
                user_id: user.id,
                concept: 'TRASPASO INTERNO',
                date: transferDate,
                payment_method: transferDest,
                provider: `Desde: ${transferOrigin}`,
                income: numAmount,
                expense: 0,
                description: `${transferDesc} (Traspaso: ${transferOrigin} -> ${transferDest})`
            }]);
            if (inErr) throw inErr;

            setTransferAmount('');
            setTransferOrigin('');
            setTransferDest('');
            setTransferDesc('');
            loadRecords();
            alert("Traspaso registrado correctamente.");
        } catch (error) {
            console.error("Error creating transfer:", error);
            alert("No se pudo realizar el traspaso.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;
        try {
            const { error } = await supabase
                .from('finance_records')
                .delete()
                .eq('id', id);

            if (error) throw error;
            if (onRefresh) {
                onRefresh();
            } else {
                setLocalRecords(records.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error("Error deleting record:", error);
        }
    };

    const resetForm = () => {
        setConcept('');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('');
        setProvider('');
        setIncome('');
        setExpense('');
        setDescription('');
        setExpenseType('Variable');
        setEditingId(null);
    };

    const handleEditClick = (record: FinanceRecord) => {
        setConcept(record.concept);
        setDate(record.date.split('T')[0]);
        setPaymentMethod(record.payment_method || '');
        setProvider(record.provider || '');
        setIncome((record.income && Number(record.income) !== 0) ? Number(record.income) : '');
        setExpense((record.expense && Number(record.expense) !== 0) ? Number(record.expense) : '');
        setDescription(record.description || '');
        setExpenseType(record.expense_type || 'Variable');
        setEditingId(record.id);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        console.log("Iniciando importación de:", file.name);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

            if (jsonData.length === 0) {
                throw new Error('El archivo está vacío o no tiene el formato correcto.');
            }

            console.log(`Leídas ${jsonData.length} filas del archivo.`);

            const normalizeKey = (k: string) => k.toUpperCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
                .replace(/[^A-Z0-9]/g, ""); // Solo letras y números

            const recordsToInsert = jsonData.map((row) => {
                const getValue = (keywords: string[]) => {
                    const normalizedKeywords = keywords.map(kw => normalizeKey(kw));
                    const keys = Object.keys(row);
                    
                    // Prioridad 1: Coincidencia exacta (normalizada)
                    let foundKey = keys.find(k => {
                        const normK = normalizeKey(k);
                        return normalizedKeywords.some(kw => normK === kw);
                    });
                    
                    // Prioridad 2: Coincidencia parcial (el nombre de la columna contiene la palabra clave)
                    if (!foundKey) {
                        foundKey = keys.find(k => {
                            const normK = normalizeKey(k);
                            return normalizedKeywords.some(kw => normK.includes(kw));
                        });
                    }

                    return foundKey ? row[foundKey] : undefined;
                };

                const parseNumber = (val: any) => {
                    if (typeof val === 'number') return val;
                    if (!val) return 0;
                    
                    let str = String(val).replace(/[^\d.,-]/g, '').trim();
                    if (!str) return 0;

                    const lastComma = str.lastIndexOf(',');
                    const lastDot = str.lastIndexOf('.');
                    
                    if (lastComma > lastDot) {
                        str = str.replace(/\./g, '').replace(',', '.');
                    } else if (lastDot > lastComma) {
                        str = str.replace(/,/g, '');
                    } else if (lastComma !== -1) {
                        str = str.replace(',', '.');
                    }
                    
                    const parsed = Number(str);
                    return isNaN(parsed) ? 0 : parsed; // Permitimos valores negativos para devoluciones
                };

                // Mejorar detección de fecha
                const rawDate = getValue(['FECHA', 'DATE', 'DIA', 'MOMENTO', 'FEC', 'VALOR']);
                let dateStr = "";

                if (rawDate instanceof Date) {
                    dateStr = rawDate.toISOString().split('T')[0];
                } else if (typeof rawDate === 'number') {
                    const jsDate = new Date((rawDate - 25569) * 86400 * 1000);
                    dateStr = jsDate.toISOString().split('T')[0];
                } else if (rawDate) {
                    const sDate = String(rawDate).trim();
                    const parts = sDate.split(/[/.-]/);
                    if (parts.length === 3) {
                        if (parts[2].length === 4) {
                            dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        } else if (parts[0].length === 4) {
                            dateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                        }
                    }
                }

                if (!dateStr) {
                    dateStr = new Date().toISOString().split('T')[0];
                }

                const conceptValue = String(getValue(['CONCEPTO', 'CONCEPT', 'NOMBRE', 'TITULO', 'SERVICIO', 'MOVIMIENTO', 'DESCRIPCION', 'DETALLE', 'MOTIVO']) || '').trim().toUpperCase();
                const incomeValue = parseNumber(getValue(['INGRESO', 'ENTRADA', 'POSITIVO', 'DEPOSITO', 'ABONO', 'CREDITO', 'INPUT', 'CASHIN']));
                const expenseValue = parseNumber(getValue(['GASTO', 'SALIDA', 'NEGATIVO', 'EGRESO', 'CARGO', 'RETIRO', 'DEBITO', 'OUTPUT', 'CASHOUT']));

                // Tipo de movimiento
                const validTypes = ['Variable', 'Fijo', 'Ahorro', 'Deuda', 'Ingreso', 'Traspaso'];
                const rawType = String(getValue(['TIPO', 'TIPOGASTO', 'TIPOMOVIMIENTO', 'CATEGORIA', 'CATEGORY', 'TYPE']) || '').trim();
                // Capitalize first letter to match valid values (e.g. 'fijo' -> 'Fijo')
                const normalizedType = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
                const expenseTypeValue = validTypes.includes(normalizedType) ? normalizedType : 'Variable';

                // Si no hay concepto ni montos, es una fila vacía
                if (!conceptValue && incomeValue === 0 && expenseValue === 0) {
                    return null;
                }

                return {
                    user_id: user.id,
                    concept: conceptValue || 'MOVIMIENTO SIN NOMBRE',
                    date: dateStr,
                    payment_method: String(getValue(['FORMADEPAGO', 'PAGO', 'CUENTA', 'METODO', 'VIA', 'BANCO', 'ORIGEN']) || 'SIN ESPECIFICAR').trim().toUpperCase(),
                    provider: String(getValue(['PROVEEDOR', 'PROVIDER', 'LUGAR', 'ESTABLECIMIENTO', 'DESTINO', 'COMERCIO']) || '').trim().toUpperCase(),
                    income: incomeValue,
                    expense: expenseValue,
                    expense_type: expenseTypeValue,
                    description: String(getValue(['DESCRIPCION', 'DETALLE', 'MOTIVO', 'COMENTARIO', 'OBSERVACION', 'REFERENCIA', 'NOTAS']) || '').trim()
                };
            }).filter(record => record !== null); // Eliminar filas vacías

            if (recordsToInsert.length === 0) {
                // Si falló, mostramos en consola qué columnas sí encontramos para ayudar a depurar
                const keys = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
                console.error("Columnas encontradas en el Excel:", keys);
                throw new Error(`No se encontraron columnas de Concepto/Descripción ni de Importes (Ingreso/Gasto). Columnas detectadas: ${keys.slice(0, 5).join(', ')}...`);
            }

            console.log(`Insertando ${recordsToInsert.length} registros en Supabase...`);

            const { error } = await supabase
                .from('finance_records')
                .insert(recordsToInsert);

            if (error) throw error;
            
            alert(`¡Importación exitosa! Se añadieron ${recordsToInsert.length} registros.`);
            loadRecords();

        } catch (error: any) {
            console.error("Error detallado al importar excel:", error);
            alert(`Error al importar: ${error.message || 'Verifica el formato del archivo'}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const handleExportExcel = () => {
        if (displayRecords.length === 0) {
            alert("No hay registros para exportar en el mes seleccionado.");
            return;
        }

        console.log(`Exportando ${displayRecords.length} registros a Excel...`);
        
        try {
            const dataToExport = displayRecords.map((r, index) => ({
                'NO.': index + 1,
                'CONCEPTO': r.concept,
                'FECHA': r.date.split('-').reverse().join('/'),
                'FORMA DE PAGO': r.payment_method || 'SIN ESPECIFICAR',
                'PROVEEDOR': r.provider || '',
                'INGRESO': Number(r.income) || 0,
                'GASTO': Number(r.expense) || 0,
                'SALDO': Number(r.balance) || 0,
                'DESCRIPCION': r.description || ''
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Finanzas");
            
            // Ajustar anchos de columna (opcional pero recomendado)
            const wscols = [
                {wch: 5},  // No.
                {wch: 25}, // Concepto
                {wch: 12}, // Fecha
                {wch: 20}, // Forma de pago
                {wch: 20}, // Proveedor
                {wch: 10}, // Ingreso
                {wch: 10}, // Gasto
                {wch: 12}, // Saldo
                {wch: 40}  // Descripcion
            ];
            ws['!cols'] = wscols;

            const fileName = `Finanzas_${selectedMonth === 'all' ? 'Completo' : selectedMonth}.xlsx`;
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            alert("No se pudo generar el archivo Excel.");
        }
    };

    const filteredRecords = selectedMonth === 'all' 
        ? records 
        : records.filter(r => r.date.startsWith(selectedMonth));

    let runningBalanceFlow = 0;
    const displayRecords = filteredRecords.map(record => {
        const isAdjustment = (record.concept || '').toUpperCase().trim() === 'SALDO INICIAL';
        if (!isAdjustment) {
            runningBalanceFlow = runningBalanceFlow + Number(record.income) - Number(record.expense);
        }
        return {
            ...record,
            balance: runningBalanceFlow
        };
    });

    const renderPaymentOptions = () => (
        <>
            <option value="" disabled>Seleccione pago...</option>
            {savedPaymentMethods.length > 0 ? (
                savedPaymentMethods.map(pm => (
                    <option key={pm.id} value={pm.name}>{pm.name}</option>
                ))
            ) : (
                <>
                    <option value="EFECTIVO">EFECTIVO</option>
                    <option value="TARJETA DÉBITO">TARJETA DÉBITO</option>
                    <option value="TARJETA CRÉDITO">TARJETA CRÉDITO</option>
                </>
            )}
        </>
    );

    return (
        <div className="bg-white rounded-[2rem] border border-light-beige shadow-sm overflow-hidden animate-fade-in">
            <div className="p-8 border-b border-light-beige flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-primary-dark">Registro de Finanzas Personales</h2>
                    <p className="text-sm text-neutral-500 mt-1">Control de ingresos, gastos y saldo al día.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileUpload} 
                    />
                    <Button outline className="text-[10px] font-black uppercase tracking-widest py-2.5 px-5 flex items-center gap-2 border-neutral-200 hover:border-primary-dark transition-all" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        <Upload size={14} className="text-primary-dark" /> {isUploading ? 'Importando...' : 'Importar Excel'}
                    </Button>
                    <Button outline className="text-[10px] font-black uppercase tracking-widest py-2.5 px-5 flex items-center gap-2 border-neutral-200 hover:border-primary-dark transition-all" onClick={handleExportExcel} disabled={displayRecords.length === 0}>
                        <Download size={14} className="text-primary-dark" /> Exportar
                    </Button>
                    <Button outline className="text-[10px] font-black uppercase tracking-widest py-2.5 px-5 flex items-center gap-2 border-neutral-200 hover:border-primary-dark transition-all" onClick={() => loadRecords()}>
                        <Calendar size={14} className="text-primary-dark" /> Actualizar
                    </Button>
                    <Button primary className="text-[10px] font-black uppercase tracking-widest py-2.5 px-6 flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all" onClick={() => setIsFormOpen(!isFormOpen)}>
                        <Plus size={14} /> {isFormOpen ? 'Cerrar Panel' : 'Nuevo Registro'}
                    </Button>
                </div>
            </div>

            {isFormOpen && (
                <div className="mb-10 bg-white/70 backdrop-blur-sm p-8 rounded-[32px] border border-white shadow-sm animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                    
                    <h3 className="text-xl font-heading font-black text-primary-dark mb-8 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary-dark flex items-center justify-center text-white">
                            <Plus size={20} />
                        </div>
                        {editingId ? 'Editar Movimiento' : 'Registrar Nuevo Movimiento'}
                    </h3>

                    <datalist id="concept-options">
                        <option value="SALDO INICIAL" />
                        <option value="ALIMENTOS" />
                        <option value="AHORRO" />
                        <option value="FAM CASTILLO" />
                        <option value="ASEO PERSONAL" />
                        <option value="ANGELITO" />
                        <option value="ROPA Y CALZADO" />
                        <option value="NEGOCIO" />
                        <option value="SERVICIOS BASICOS" />
                        <option value="CASA" />
                        <option value="FAM PRECIADO" />
                        <option value="CUMPLEAÑOS" />
                        <option value="OTROS INGRESOS" />
                        <option value="SUELDO" />
                        <option value="HONORARIOS" />
                        <option value="INFONAVIT" />
                        <option value="FAM ALCA" />
                        <option value="TRANSPORTE" />
                        <option value="PPR" />
                        <option value="SALUD" />
                        <option value="CREDITO CARRO" />
                        <option value="COMISIONES BANCARIAS" />
                        <option value="VALES DE GASOLINA" />
                        <option value="TRABAJO" />
                        <option value="GRUPO ALCA" />
                        <option value="DESPENSA" />
                        <option value="ART LIMPIEZA" />
                        <option value="PAY" />
                        <option value="DONACION" />
                        <option value="FIESTA ANGELITO" />
                        <option value="CASHBACK" />
                        <option value="FACHADA CASA" />
                        <option value="VIAJES ALCA" />
                        <option value="INVERSIÓN CETES" />
                    </datalist>
                    <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block ml-1">Concepto</label>
                            <input list="concept-options" type="text" required value={concept} onChange={e => setConcept(e.target.value)} placeholder="Seleccione concepto..." className="w-full bg-white border border-neutral-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-accent transition-all shadow-sm" />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block ml-1">Tipo de Movimiento</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-white border border-neutral-200 rounded-2xl px-5 py-3 text-sm font-black text-primary-dark outline-none focus:border-accent transition-all shadow-sm appearance-none cursor-pointer"
                                    value={expenseType}
                                    onChange={(e) => setExpenseType(e.target.value)}
                                >
                                    <option value="Variable">💅 Variable / Lujo</option>
                                    <option value="Fijo">🏡 Gasto Fijo</option>
                                    <option value="Ahorro">💰 Ahorro / Inversión</option>
                                    <option value="Deuda">💳 Pago a Deuda</option>
                                    <option value="Ingreso">💵 Ingreso</option>
                                    <option value="Traspaso">🔄 Traspaso</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                    <TrendingDown size={14} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block ml-1">Fecha</label>
                            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white border border-neutral-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-accent transition-all shadow-sm" />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block ml-1">Forma de pago</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <select required value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-white border border-neutral-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-accent transition-all shadow-sm appearance-none cursor-pointer">
                                        {renderPaymentOptions()}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><TrendingDown size={14} /></div>
                                </div>
                                <button type="button" onClick={() => { setViewMode('balances'); setAccMgmtTab('accounts'); setIsFormOpen(false); }} className="px-4 bg-primary-dark text-white rounded-2xl hover:bg-accent transition-colors" title="Administrar formas de pago">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block ml-1">Proveedor / Tienda</label>
                            <input type="text" required value={provider} onChange={e => setProvider(e.target.value)} placeholder="Ej. Amazon, Walmart..." className="w-full bg-white border border-neutral-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-accent transition-all shadow-sm" />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block ml-1">Ingreso ($)</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-green-600 font-black">$</span>
                                <input type="number" step="0.01" value={income} onChange={e => setIncome(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full bg-white border border-neutral-200 rounded-2xl pl-10 pr-5 py-3 text-sm font-black text-green-600 outline-none focus:border-accent transition-all shadow-sm" />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block ml-1">Gasto ($)</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-red-500 font-black">$</span>
                                <input type="number" step="0.01" value={expense} onChange={e => setExpense(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full bg-white border border-neutral-200 rounded-2xl pl-10 pr-5 py-3 text-sm font-black text-red-500 outline-none focus:border-accent transition-all shadow-sm" />
                            </div>
                        </div>
                        
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block ml-1">Descripción / Notas</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalles adicionales del movimiento..." className="w-full bg-white border border-neutral-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-accent transition-all shadow-sm" />
                        </div>
                        <div className="lg:col-span-4 flex justify-end gap-3 pt-6 border-t border-neutral-100/50">
                            <Button outline type="button" onClick={() => { setIsFormOpen(false); resetForm(); }} className="text-[10px] font-black uppercase tracking-widest py-3 px-8 border-neutral-200">Cancelar</Button>
                            <Button primary type="submit" className="text-[10px] font-black uppercase tracking-widest py-3 px-10 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                                {editingId ? 'Actualizar Registro' : 'Confirmar Registro'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-[#faf7f2] pt-4 pb-2 border-b border-light-beige/30">
                {/* GLOBAL KPI BAR - NOT STICKY */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-5 text-green-600 group-hover:scale-110 transition-transform"><TrendingUp size={40} /></div>
                        <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mb-1">Ingresos Periodo</p>
                        <p className="text-xl font-heading font-black text-green-600">
                            ${summaryData.reduce((acc, row) => acc + row.income, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-5 text-red-600 group-hover:scale-110 transition-transform"><TrendingDown size={40} /></div>
                        <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mb-1">Gastos Periodo</p>
                        <p className="text-xl font-heading font-black text-red-500">
                            ${summaryData.reduce((acc, row) => acc + row.expense, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-primary-dark to-[#3d686d] p-4 rounded-2xl shadow-lg flex flex-col justify-center relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-20 text-white group-hover:rotate-12 transition-transform"><DollarSign size={40} /></div>
                        <p className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-1">Balance Periodo</p>
                        <p className="text-xl font-heading font-black text-white">
                            ${(summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/60 p-2 rounded-[24px] border border-white/60 shadow-sm">
                    <div className="flex bg-white/80 p-1.5 rounded-full shadow-sm border border-neutral-200 w-full md:w-auto overflow-x-auto no-scrollbar">
                        <button 
                            onClick={() => setViewMode('detailed')}
                            className={`px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'detailed' ? 'bg-primary-dark text-white shadow-lg scale-[1.02]' : 'text-neutral-400 hover:text-primary-dark hover:bg-neutral-50'}`}
                        >
                            Registro
                        </button>
                        <button 
                            onClick={() => setViewMode('summary')}
                            className={`px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'summary' ? 'bg-primary-dark text-white shadow-lg scale-[1.02]' : 'text-neutral-400 hover:text-primary-dark hover:bg-neutral-50'}`}
                        >
                            Resumen
                        </button>
                        <button 
                            onClick={() => setViewMode('balances')}
                            className={`px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'balances' ? 'bg-primary-dark text-white shadow-lg scale-[1.02]' : 'text-neutral-400 hover:text-primary-dark hover:bg-neutral-50'}`}
                        >
                            Saldos
                        </button>
                        <button 
                            onClick={() => setViewMode('budget')}
                            className={`px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'budget' ? 'bg-primary-dark text-white shadow-lg scale-[1.02]' : 'text-neutral-400 hover:text-primary-dark hover:bg-neutral-50'}`}
                        >
                            Presupuesto
                        </button>
                        <button 
                            onClick={() => setViewMode('credits')}
                            className={`px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === 'credits' ? 'bg-primary-dark text-white shadow-lg scale-[1.02]' : 'text-neutral-400 hover:text-primary-dark hover:bg-neutral-50'}`}
                        >
                            Créditos
                        </button>
                    </div>
                    
                    {uniqueMonths.length > 0 && (
                        <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-neutral-200 shadow-sm transition-all hover:border-accent group">
                            <Calendar size={16} className="text-neutral-400 group-hover:text-accent transition-colors" />
                            <select 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-transparent text-sm font-black text-primary-dark outline-none cursor-pointer capitalize appearance-none pr-6 relative"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%234A7C82\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '16px' }}
                            >
                                {uniqueMonths.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>
       
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                    </div>
                ) : viewMode === 'credits' ? (
                    <div className="p-8 space-y-10 animate-fade-in">
                        <div className="flex justify-between items-center bg-primary-dark/5 p-6 rounded-[2.5rem] border border-primary-dark/5">
                            <div>
                                <h3 className="text-2xl font-black text-primary-dark tracking-tighter">Gestión de Créditos</h3>
                                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1">Control de deudas y aceleración de libertad financiera</p>
                            </div>
                            <Button primary className="flex items-center gap-2 group" onClick={() => setIsCreditFormOpen(!isCreditFormOpen)}>
                                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Nuevo Crédito
                            </Button>
                        </div>

                        {isCreditFormOpen && (
                            <div className="bg-white p-8 rounded-[2.5rem] border border-light-beige shadow-xl animate-scale-in relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-accent/10 transition-all duration-700"></div>
                                <h4 className="text-lg font-black text-primary-dark mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary-dark flex items-center justify-center text-white">
                                        <Plus size={20} />
                                    </div>
                                    Registrar Nuevo Crédito Bancario
                                </h4>
                                <form onSubmit={handleSaveCredit} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Nombre del Crédito</label>
                                        <input type="text" required value={creditName} onChange={e => setCreditName(e.target.value)} placeholder="Ej: Crédito Hipotecario" className="w-full bg-neutral-50 border border-light-beige rounded-2xl px-5 py-3.5 text-sm font-bold text-primary-dark outline-none focus:border-accent transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Monto Inicial ($)</label>
                                        <input type="number" required value={creditInitialBalance} onChange={e => setCreditInitialBalance(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full bg-neutral-50 border border-light-beige rounded-2xl px-5 py-3.5 text-sm font-black text-primary-dark outline-none focus:border-accent transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Tasa Anual (%)</label>
                                        <input type="number" step="0.1" required value={creditAnnualRate} onChange={e => setCreditAnnualRate(e.target.value === '' ? '' : Number(e.target.value))} placeholder="21.0" className="w-full bg-neutral-50 border border-light-beige rounded-2xl px-5 py-3.5 text-sm font-black text-accent outline-none focus:border-accent transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Fecha de Inicio</label>
                                        <input type="date" required value={creditStartDate} onChange={e => setCreditStartDate(e.target.value)} className="w-full bg-neutral-50 border border-light-beige rounded-2xl px-5 py-3.5 text-sm font-bold text-primary-dark outline-none focus:border-accent transition-all" />
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-4 pt-4 border-t border-neutral-100">
                                        <Button outline type="button" onClick={() => setIsCreditFormOpen(false)}>Cancelar</Button>
                                        <Button primary type="submit" loading={isSavingCredit}>Guardar Crédito</Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {credits.length === 0 && !isCreditFormOpen && (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-light-beige rounded-[3rem]">
                                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300">
                                        <TrendingDown size={40} />
                                    </div>
                                    <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">No tienes créditos registrados</p>
                                    <p className="text-xs text-neutral-300 mt-2">Usa el botón superior para añadir tu primer compromiso financiero.</p>
                                </div>
                            )}
                            {credits.map(credit => {
                                // Lógica de cálculo DIARIO para la UI
                                const creditPayments = records.filter(r => 
                                    (r.concept.toUpperCase().includes(credit.name.toUpperCase()) || 
                                     r.description.toUpperCase().includes(credit.name.toUpperCase())) && 
                                    Number(r.expense) > 0
                                );
                                
                                const totalPaid = creditPayments.reduce((acc, r) => acc + Number(r.expense), 0);
                                
                                // FECHAS CLAVE
                                const start = new Date(credit.start_date);
                                const today = new Date();
                                
                                // Tasa diaria
                                const dailyRate = (credit.annual_rate / 100) / 365;
                                
                                // Cálculo Progresivo Día a Día
                                let currentBalance = credit.initial_balance;
                                let interestSinceLastPayment = 0;
                                let iterDate = new Date(start);

                                // Iterar día por día desde el inicio hasta hoy
                                while (iterDate <= today) {
                                    const dateStr = iterDate.toISOString().substring(0, 10);
                                    
                                    // 1. Restar pagos realizados este día específico 
                                    // (Se restan ANTES del interés si el pago fue el mismo día de inicio)
                                    const dayPayments = creditPayments.filter(p => p.date === dateStr);
                                    const dayPaid = dayPayments.reduce((acc, p) => acc + Number(p.expense), 0);
                                    
                                    if (dayPaid > 0) {
                                        currentBalance -= dayPaid;
                                        interestSinceLastPayment = 0; 
                                    }

                                    // Avanzar un día
                                    iterDate.setDate(iterDate.getDate() + 1);

                                    // 2. Aplicar interés del nuevo día sobre el saldo insoluto (si aún no llegamos al futuro)
                                    if (iterDate <= today) {
                                        const dayInterest = currentBalance * dailyRate;
                                        currentBalance += dayInterest;
                                        interestSinceLastPayment += dayInterest;
                                    }
                                }

                                const progress = Math.min(100, Math.max(0, ((credit.initial_balance - currentBalance) / credit.initial_balance) * 100));

                                return (
                                    <div key={credit.id} className="bg-white rounded-[3rem] p-10 border border-light-beige shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => {
                                                    setActiveCreditForPayment(credit);
                                                    setIsCreditPaymentFormOpen(true);
                                                }}
                                                className="w-10 h-10 rounded-full bg-accent/5 text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm"
                                                title="Abonar a Capital"
                                            >
                                                <DollarSign size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteCredit(credit.id)} className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-4 mb-10">
                                            <div className="w-14 h-14 rounded-2xl bg-primary-dark flex items-center justify-center text-accent shadow-inner">
                                                <DollarSign size={28} />
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-primary-dark tracking-tighter capitalize">{credit.name.toLowerCase()}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-accent uppercase tracking-widest">{credit.annual_rate}% Tasa Anual</span>
                                                    <div className="w-1 h-1 rounded-full bg-neutral-200"></div>
                                                    <span className="text-[10px] font-bold text-neutral-400">Inicio: {formatDate(credit.start_date)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 mb-10">
                                            <div className="bg-neutral-50/50 p-6 rounded-[2rem] border border-neutral-100">
                                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2">Saldo al Día</p>
                                                <p className="text-3xl font-black text-primary-dark tracking-tighter">${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                            <div className="bg-orange-50/30 p-6 rounded-[2rem] border border-orange-100 flex flex-col justify-center">
                                                <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Costo del Dinero</p>
                                                <p className="text-xl font-black text-primary-dark tracking-tight mb-1">${interestSinceLastPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                <p className="text-[8px] text-orange-600 font-bold uppercase tracking-tighter">Intereses acumulados</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Barra de Libertad Financiera</span>
                                                    <span className="text-sm font-black text-primary-dark">{progress.toFixed(1)}% Liquidado</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-neutral-400 italic">Meta: $0.00</span>
                                            </div>
                                            <div className="w-full h-4 bg-neutral-50 rounded-full border border-neutral-100 overflow-hidden p-1 shadow-inner">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-primary-dark to-accent rounded-full transition-all duration-1000 relative" 
                                                    style={{ width: `${progress}%` }}
                                                >
                                                    <div className="absolute top-0 right-0 w-full h-full bg-white/20 animate-pulse-subtle"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10 pt-8 border-t border-neutral-100 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Monto Original</p>
                                                <p className="text-sm font-bold text-neutral-600">${credit.initial_balance.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Abonado</p>
                                                <p className="text-sm font-black text-green-600">${totalPaid.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : viewMode === 'detailed' ? (
                    displayRecords.length === 0 ? (
                        <div className="p-12 text-center text-neutral-400">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary/30">
                                    <Search size={24} />
                                </div>
                            </div>
                            <p className="font-bold text-primary-dark mb-1">Sin registros financieros</p>
                            <p className="text-sm">Comienza agregando tu primer movimiento.</p>
                        </div>
                    ) : (
                        <div className="bg-white/70 backdrop-blur-sm rounded-[32px] border border-white shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse animate-fade-in delay-100">
                                <thead>
                                    <tr className="border-b border-light-beige">
                                        <th className="sticky top-0 z-10 p-5 whitespace-nowrap bg-primary-dark text-white text-[10px] font-black uppercase tracking-[0.2em]">ID</th>
                                        <th className="sticky top-0 z-10 p-5 whitespace-nowrap bg-primary-dark text-white text-[10px] font-black uppercase tracking-[0.2em]">Concepto</th>
                                        <th className="sticky top-0 z-10 p-5 whitespace-nowrap bg-primary-dark text-white text-[10px] font-black uppercase tracking-[0.2em]">Fecha</th>
                                        <th className="sticky top-0 z-10 p-5 whitespace-nowrap bg-primary-dark text-white text-[10px] font-black uppercase tracking-[0.2em]">Pago</th>
                                        <th className="sticky top-0 z-10 p-5 whitespace-nowrap bg-primary-dark text-white text-[10px] font-black uppercase tracking-[0.2em]">Proveedor</th>
                                        <th className="sticky top-0 z-10 p-5 text-right whitespace-nowrap bg-primary-dark text-white text-[10px] font-black uppercase tracking-[0.2em]">Ingreso</th>
                                        <th className="sticky top-0 z-10 p-5 text-right whitespace-nowrap bg-primary-dark text-white text-[10px] font-black uppercase tracking-[0.2em]">Gasto</th>
                                        <th className="sticky top-0 z-10 p-5 text-right whitespace-nowrap bg-primary-dark text-white text-[10px] font-black uppercase tracking-[0.2em]">Saldo</th>
                                        <th className="sticky top-0 z-10 p-5 whitespace-nowrap max-w-xs bg-primary-dark text-white text-[10px] font-black uppercase tracking-[0.2em]">Descripción</th>
                                        <th className="sticky top-0 z-10 p-5 text-center whitespace-nowrap bg-primary-dark text-white text-[10px] font-black uppercase tracking-[0.2em]">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100/50">
                                    {displayRecords.map((record, index) => {
                                        const isInitialBalance = record.concept.toUpperCase() === 'SALDO INICIAL';
                                        return (
                                            <tr key={record.id} className={`hover:bg-white transition-colors group ${isInitialBalance ? 'bg-amber-50/20' : ''}`}>
                                                <td className="p-4 px-5 whitespace-nowrap text-neutral-400 font-bold text-[10px]">{index + 1}</td>
                                                <td className="p-4 px-5 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-xs text-primary-dark uppercase tracking-wider">{record.concept}</span>
                                                        {isInitialBalance && <span className="text-[8px] bg-accent/20 text-accent-dark px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Ajuste</span>}
                                                    </div>
                                                    <div className="mt-1">
                                                        <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest ${
                                                            record.expense_type === 'Fijo' ? 'bg-indigo-100 text-indigo-700' :
                                                            record.expense_type === 'Ahorro' ? 'bg-teal-100 text-teal-700' :
                                                            record.expense_type === 'Deuda' ? 'bg-orange-100 text-orange-700' :
                                                            record.expense_type === 'Ingreso' ? 'bg-green-100 text-green-700' :
                                                            'bg-neutral-100 text-neutral-500'
                                                        }`}>
                                                            {record.expense_type || 'Variable'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 px-5 whitespace-nowrap text-xs text-neutral-500 font-medium">
                                                    {formatDate(record.date)}
                                                </td>
                                                <td className="p-4 px-5 whitespace-nowrap">
                                                    <span className="bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">{record.payment_method}</span>
                                                </td>
                                                <td className="p-4 px-5 whitespace-nowrap text-xs font-medium text-neutral-600">{record.provider}</td>
                                                <td className="p-4 px-5 text-right whitespace-nowrap text-green-600 font-bold text-sm">
                                                    {isInitialBalance ? '-' : (Number(record.income) !== 0 ? `$${Number(record.income).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-')}
                                                </td>
                                                <td className="p-4 px-5 text-right whitespace-nowrap text-red-500 font-bold text-sm">
                                                    {isInitialBalance ? '-' : (Number(record.expense) !== 0 ? `$${Number(record.expense).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-')}
                                                </td>
                                                <td className={`p-4 px-5 text-right whitespace-nowrap font-black text-sm ${Number(record.balance) < 0 ? 'text-red-500' : 'text-primary-dark'}`}>
                                                    ${Number(record.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4 px-5 text-xs text-neutral-400 max-w-xs truncate italic">{record.description}</td>
                                                 <td className="p-4 px-5">
                                                    <div className="flex justify-center gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleEditClick(record); }}
                                                            className="p-2 hover:bg-primary-dark/10 rounded-xl text-primary-dark transition-all hover:scale-110 active:scale-95"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={15} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                                                            className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-all hover:scale-110 active:scale-95"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : viewMode === 'summary' ? (
                    <div className="p-8 max-w-7xl mx-auto animate-fade-in delay-100">
                        {selectedMonth && (
                            <h3 className="text-2xl font-black font-heading text-center text-primary-dark mb-10 capitalize flex items-center justify-center gap-4">
                                <div className="h-px bg-neutral-200 flex-1"></div>
                                <span className="bg-white px-6 py-2 rounded-2xl border border-neutral-100 shadow-sm">
                                    {uniqueMonths.find(m => m.value === selectedMonth)?.label}
                                </span>
                                <div className="h-px bg-neutral-200 flex-1"></div>
                            </h3>
                        )}

                        {summaryData.length > 0 ? (
                            <>
                                {/* Gráficas Primera Fila */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Ingresos - Pastel Pequeño */}
                                    <div className="bg-white/70 backdrop-blur-sm p-8 rounded-[32px] border border-white shadow-sm hover:shadow-md transition-all">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-primary-dark mb-8 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                            Distribución de Ingresos
                                        </h4>
                                        <div className="h-64">
                                            {summaryData.filter(d => d.income > 0).length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie 
                                                            data={summaryData.filter(d => d.income > 0).sort((a,b) => b.income - a.income)} 
                                                            dataKey="income" 
                                                            nameKey="concept" 
                                                            cx="50%" cy="50%" 
                                                            innerRadius={60} outerRadius={80} 
                                                            paddingAngle={5}
                                                        >
                                                            {summaryData.filter(d => d.income > 0).sort((a,b) => b.income - a.income).map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-neutral-400 text-sm italic">Sin ingresos</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Gastos - Dona Grande */}
                                    <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm p-8 rounded-[32px] border border-white shadow-sm hover:shadow-md transition-all relative">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-primary-dark mb-8 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                                            Análisis de Gastos por Categoría
                                        </h4>
                                        <div className="h-[400px]">
                                            {summaryData.filter(d => d.expense > 0).length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie 
                                                            data={summaryData.filter(d => d.expense > 0).sort((a,b) => b.expense - a.expense)} 
                                                            dataKey="expense" 
                                                            nameKey="concept" 
                                                            cx="50%" cy="50%" 
                                                            innerRadius={110} outerRadius={170} 
                                                            paddingAngle={1}
                                                            label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(1)}%`}
                                                            labelLine={{stroke: '#9ca3af', strokeWidth: 1}}
                                                        >
                                                            {summaryData.filter(d => d.expense > 0).sort((a,b) => b.expense - a.expense).map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-neutral-400 text-sm italic">Sin gastos</div>
                                            )}
                                        </div>
                                        
                                        {/* Centro decorativo de la dona */}
                                        <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center -mt-4 pointer-events-none">
                                            <span className="text-neutral-400 text-[10px] uppercase tracking-widest font-black">Total Gastos</span>
                                            <span className="text-4xl font-heading font-black text-red-500 mt-2">
                                                ${summaryData.reduce((a, b) => a + b.expense, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabla de Resumen por Concepto */}
                                <div className="mt-12 overflow-hidden rounded-[32px] border border-neutral-200 shadow-sm bg-white/50 backdrop-blur-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-primary-dark text-white text-[10px] uppercase tracking-[0.2em] font-black">
                                                <th className="p-5 border-r border-white/10">Concepto</th>
                                                <th className="p-5 border-r border-white/10 text-right w-48 font-bold">Total Ingreso</th>
                                                <th className="p-5 text-right w-48 font-bold">Total Gasto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {summaryData.map((row) => (
                                                <tr key={row.concept} className="hover:bg-white transition-colors">
                                                    <td className="p-4 px-6 font-black text-xs text-primary-dark uppercase tracking-wider">{row.concept}</td>
                                                    <td className="p-4 px-6 text-right font-bold text-sm text-green-600">
                                                        {row.income > 0 ? `$${row.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                                    </td>
                                                    <td className="p-4 px-6 text-right font-bold text-sm text-red-500">
                                                        {row.expense > 0 ? `$${row.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-primary-dark/5 font-black border-t-2 border-primary-dark/10">
                                            <tr>
                                                <td className="p-5 px-6 text-[10px] uppercase tracking-widest text-primary-dark opacity-50">Totales del Periodo</td>
                                                <td className="p-5 px-6 text-right text-green-600 border-r border-primary-dark/10">
                                                    ${summaryData.reduce((acc, row) => acc + row.income, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-5 px-6 text-right text-red-500">
                                                    ${summaryData.reduce((acc, row) => acc + row.expense, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                            <tr className="bg-primary-dark text-white">
                                                <td colSpan={2} className="p-4 px-6 text-xs uppercase tracking-[0.15em]">Balance Neto del Mes</td>
                                                <td className="p-4 px-6 text-right font-black text-lg">
                                                    ${(summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="p-16 text-center bg-white/40 backdrop-blur-sm rounded-[32px] border border-white/20">
                                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary/30 mx-auto mb-6">
                                    <Search size={32} />
                                </div>
                                <p className="font-heading font-black text-primary-dark text-xl mb-2">Sin movimientos en este periodo</p>
                                <p className="text-neutral-500 max-w-sm mx-auto">No hay registros de ingresos o gastos para el mes seleccionado. Comienza agregando uno nuevo.</p>
                            </div>
                        )}
                    </div>
                ) : viewMode === 'budget' ? (
                    <div className="p-8 max-w-7xl mx-auto animate-fade-in delay-100">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                            <div>
                                <h3 className="text-3xl font-black font-heading text-primary-dark uppercase tracking-tighter">
                                    Control de Presupuesto
                                </h3>
                                <p className="text-neutral-500 text-xs mt-1 font-medium tracking-wide">Planeación vs Gasto Real del periodo seleccionado.</p>
                            </div>
                            <Button 
                                outline={!isEditingBudget}
                                primary={isEditingBudget}
                                className={`text-[10px] font-black uppercase tracking-widest py-3 px-8 shadow-xl transition-all ${isEditingBudget ? 'scale-105' : 'hover:scale-105'}`}
                                onClick={() => setIsEditingBudget(!isEditingBudget)}
                            >
                                {isEditingBudget ? 'Finalizar Edición' : 'Personalizar Presupuesto'}
                            </Button>
                        </div>

                        {isEditingBudget && (
                            <div className="mb-8 p-6 bg-primary-dark rounded-[24px] text-white shadow-xl flex gap-4 items-start animate-slide-in relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <div className="bg-white/10 p-2 rounded-xl">
                                    <TrendingUp className="text-accent" size={20} />
                                </div>
                                <div className="relative z-10">
                                    <p className="font-black text-[10px] uppercase tracking-widest mb-1 opacity-60">Modo Edición Activo</p>
                                    <p className="text-sm font-medium leading-relaxed">Modifica los montos en la columna <strong className="text-accent">Presupuesto Objetivo</strong>. Los valores se sincronizarán al cambiar de campo.</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white/70 backdrop-blur-sm overflow-hidden rounded-[32px] border border-white shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-primary-dark/5 text-primary-dark text-[10px] font-black uppercase tracking-[0.2em] border-b border-light-beige">
                                        <th className="p-5 border-r border-light-beige/30">Concepto</th>
                                        <th className="p-5 border-r border-light-beige/30 text-right w-48">Presupuesto</th>
                                        <th className="p-5 border-r border-light-beige/30 text-right w-64">Gasto Real</th>
                                        <th className="p-5 text-right w-40">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100/50">
                                    {budgetData.length > 0 ? (
                                        budgetData.map((row) => {
                                            const percentSpent = row.avgBudget > 0 ? (row.currentExpense / row.avgBudget) * 100 : 0;
                                            const isOverBudget = percentSpent > 100;
                                            const progressColor = percentSpent > 100 ? 'bg-red-500' : percentSpent > 85 ? 'bg-amber-500' : 'bg-green-500';
                                            
                                            return (
                                                <tr key={row.concept} className="hover:bg-white transition-colors group">
                                                    <td className="p-5 font-black text-xs text-primary-dark uppercase tracking-wider">{row.concept}</td>
                                                    <td className="p-5 border-l border-neutral-100/50 bg-neutral-50/20 text-right">
                                                        {isEditingBudget ? (
                                                            <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl pl-4 pr-1.5 py-1.5 shadow-sm focus-within:border-accent transition-all group-hover:border-accent/40">
                                                                <span className="text-accent font-black">$</span>
                                                                <input 
                                                                    type="number" 
                                                                    className="w-8/12 bg-transparent outline-none text-right font-black text-sm text-primary-dark"
                                                                    defaultValue={row.avgBudget}
                                                                    onBlur={(e) => handleSaveBudget(row.concept, parseFloat(e.target.value) || 0)}
                                                                />
                                                                <button 
                                                                    onClick={() => handleDeleteBudget(row.concept)}
                                                                    className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors ml-auto"
                                                                    title="Reiniciar a promedio histórico"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="font-black text-sm text-primary-dark">
                                                                ${row.avgBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-5 border-l border-neutral-100/50">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center px-1">
                                                                <span className="text-[10px] font-black text-neutral-400">{percentSpent.toFixed(0)}% Utilizado</span>
                                                                <span className="text-sm font-black text-primary-dark">${row.currentExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full transition-all duration-700 ease-out rounded-full ${progressColor}`}
                                                                    style={{ width: `${Math.min(percentSpent, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-5 text-right font-bold">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isOverBudget ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                            {isOverBudget ? 'Excedido' : 'En Control'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-16 text-center text-neutral-400 italic text-sm">
                                                No hay suficientes datos para mostrar el presupuesto en este periodo.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : viewMode === 'balances' ? (
                    <div className="p-8 max-w-7xl mx-auto animate-fade-in delay-100">
                        {selectedMonth && (
                            <h3 className="text-2xl font-black font-heading text-center text-primary-dark mb-10 capitalize flex items-center justify-center gap-4">
                                <div className="h-px bg-neutral-200 flex-1"></div>
                                <span className="bg-white px-6 py-2 rounded-2xl border border-neutral-100 shadow-sm">
                                    {uniqueMonths.find(m => m.value === selectedMonth)?.label}
                                </span>
                                <div className="h-px bg-neutral-200 flex-1"></div>
                            </h3>
                        )}
                        
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Tabla Balance por Forma de Pago */}
                            <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm overflow-hidden rounded-[32px] border border-white shadow-sm">
                                <h4 className="text-[10px] font-black text-center text-primary-dark p-6 bg-primary-dark/5 border-b border-light-beige uppercase tracking-[0.2em]">
                                    Estado Actual de Cuentas
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-light-beige">
                                                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-neutral-400">Cuenta</th>
                                                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-neutral-400 text-right">Inicial</th>
                                                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-neutral-400 text-right">Entradas</th>
                                                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-neutral-400 text-right">Salidas</th>
                                                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-primary-dark text-right">Final</th>
                                                <th className="p-5 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100/50">
                                            {paymentBalancesData.map((row) => (
                                                <tr key={row.method} className="hover:bg-white transition-colors group">
                                                    <td className="p-5 font-black text-primary-dark text-xs uppercase tracking-wider">{row.method}</td>
                                                    <td className="p-5 text-right text-sm text-neutral-400 font-medium">
                                                        ${row.initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-5 text-right text-sm text-green-600 font-bold">
                                                        {row.income > 0 ? `$${row.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                                    </td>
                                                    <td className="p-5 text-right text-sm text-red-500 font-bold">
                                                        {row.expense > 0 ? `$${row.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                                    </td>
                                                    <td className={`p-5 text-right text-sm font-black ${row.finalBalance < 0 ? 'text-red-600' : 'text-primary-dark'}`}>
                                                        ${row.finalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <button 
                                                            onClick={async () => {
                                                                const target = window.prompt(`Reasignar registros de "${row.method}" a otra cuenta.\n\nEscribe el nombre EXACTO de la cuenta destino:\n(Cuentas disponibles: ${savedPaymentMethods.map(p => p.name).join(', ') || 'ninguna registrada'})`);
                                                                if (!target) return;
                                                                const targetUpper = target.trim().toUpperCase();
                                                                const count = records.filter(r => r.payment_method === row.method).length;
                                                                if (!window.confirm(`¿Mover ${count} registro(s) de "${row.method}" → "${targetUpper}"?`)) return;
                                                                try {
                                                                    const { error } = await supabase.from('finance_records').update({ payment_method: targetUpper }).eq('payment_method', row.method).eq('user_id', user.id);
                                                                    if (error) throw error;
                                                                    if (onRefresh) onRefresh();
                                                                    loadRecords();
                                                                    alert(`✅ ${count} registro(s) movidos a "${targetUpper}" exitosamente.`);
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert("Error al reasignar la cuenta. Intenta de nuevo.");
                                                                }
                                                            }}
                                                            className="text-amber-500 hover:bg-amber-50 hover:text-amber-600 p-2 rounded-xl transition-all"
                                                            title={`Reasignar registros de ${row.method} a otra cuenta`}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Gestión de Cuentas Paneles */}
                            <div className="bg-primary-dark rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-accent/20"></div>
                                
                                <div className="flex bg-white/10 p-1.5 rounded-2xl mb-8 border border-white/5 relative z-10">
                                    <button 
                                        onClick={() => setAccMgmtTab('initial')}
                                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accMgmtTab === 'initial' ? 'bg-white text-primary-dark shadow-lg scale-[1.02]' : 'text-white/40 hover:text-white'}`}
                                    >
                                        Saldo Inicial
                                    </button>
                                    <button 
                                        onClick={() => setAccMgmtTab('transfer')}
                                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accMgmtTab === 'transfer' ? 'bg-white text-primary-dark shadow-lg scale-[1.02]' : 'text-white/40 hover:text-white'}`}
                                    >
                                        Traspaso
                                    </button>
                                    <button 
                                        onClick={() => setAccMgmtTab('accounts')}
                                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accMgmtTab === 'accounts' ? 'bg-white text-primary-dark shadow-lg scale-[1.02]' : 'text-white/40 hover:text-white'}`}
                                    >
                                        Mis Cuentas
                                    </button>
                                </div>

                                <div className="relative z-10">
                                    {accMgmtTab === 'initial' ? (
                                        <div className="animate-fade-in">
                                            <h3 className="text-xl font-heading font-black mb-2 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
                                                    <DollarSign size={18} className="text-accent" />
                                                </div>
                                                Ajustar Saldo
                                            </h3>
                                            <p className="text-white/40 text-[10px] mb-8 font-black uppercase tracking-widest">Balance de partida por cuenta</p>
                                            
                                            <form onSubmit={handleAddInitialBalance} className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block ml-1">Cuenta / Banco</label>
                                                    <div className="relative">
                                                        <select
                                                            required
                                                            value={initialBalancePM}
                                                            onChange={e => setInitialBalancePM(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-accent transition-all font-medium appearance-none cursor-pointer"
                                                        >
                                                            {renderPaymentOptions()}
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><TrendingDown size={14} className="text-white" /></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block ml-1">Monto Inicial</label>
                                                    <div className="relative group">
                                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-accent font-black">$</span>
                                                        <input 
                                                            type="number"
                                                            step="0.01"
                                                            required
                                                            value={initialBalanceAmount}
                                                            onChange={e => setInitialBalanceAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                                            placeholder="0.00"
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-3.5 text-sm font-black text-white outline-none focus:border-accent placeholder:text-white/20 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block ml-1">Fecha del Ajuste</label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={initialBalanceDate}
                                                        onChange={e => setInitialBalanceDate(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-accent transition-all font-medium"
                                                    />
                                                </div>
                                                <Button primary type="submit" className="w-full py-4 text-xs font-black uppercase tracking-widest shadow-2xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                                    Guardar Ajuste
                                                </Button>
                                            </form>
                                        </div>
                                    ) : accMgmtTab === 'transfer' ? (
                                        <div className="animate-fade-in">
                                            <h3 className="text-xl font-heading font-black mb-2 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
                                                    <TrendingUp size={18} className="text-accent" />
                                                </div>
                                                Nuevo Traspaso
                                            </h3>
                                            <p className="text-white/40 text-[10px] mb-8 font-black uppercase tracking-widest">Movimiento entre cuentas</p>
                                            
                                            <form onSubmit={handleTransfer} className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block ml-1">Origen</label>
                                                        <div className="relative">
                                                            <select required value={transferOrigin} onChange={e => setTransferOrigin(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-accent font-medium appearance-none cursor-pointer">
                                                                {renderPaymentOptions()}
                                                            </select>
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><TrendingDown size={12} className="text-white" /></div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block ml-1">Destino</label>
                                                        <div className="relative">
                                                            <select required value={transferDest} onChange={e => setTransferDest(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-accent font-medium appearance-none cursor-pointer">
                                                                {renderPaymentOptions()}
                                                            </select>
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><TrendingDown size={12} className="text-white" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block ml-1">Monto ($)</label>
                                                    <input type="number" step="0.01" required value={transferAmount} onChange={e => setTransferAmount(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-black text-white outline-none focus:border-accent" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block ml-1">Fecha</label>
                                                    <input type="date" required value={transferDate} onChange={e => setTransferDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-accent" />
                                                </div>
                                                <Button primary type="submit" className="w-full py-4 text-xs font-black uppercase tracking-widest shadow-2xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                                    Realizar Traspaso
                                                </Button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="animate-fade-in">
                                            <h3 className="text-xl font-heading font-black mb-2 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
                                                    <DollarSign size={18} className="text-accent" />
                                                </div>
                                                Cuentas y Métodos
                                            </h3>
                                            <p className="text-white/40 text-[10px] mb-6 font-black uppercase tracking-widest">Catálogo de formas de pago</p>
                                            
                                            <form onSubmit={handleSavePaymentMethod} className="flex gap-2 mb-6">
                                                <input 
                                                    type="text" 
                                                    required 
                                                    value={newAccountName} 
                                                    onChange={e => setNewAccountName(e.target.value)} 
                                                    placeholder="Nueva Cuenta (Ej. BBVA)" 
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-xs text-white outline-none focus:border-accent" 
                                                />
                                                <Button primary type="submit" className="py-3 px-6 shadow-xl hover:scale-[1.02] transition-all text-xs font-black uppercase tracking-widest">
                                                    Crear
                                                </Button>
                                            </form>

                                            <div className="space-y-2 max-h-56 overflow-y-auto pr-2 no-scrollbar">
                                                {savedPaymentMethods.length === 0 ? (
                                                    <div className="text-center p-6 border border-white/10 border-dashed rounded-2xl text-white/40 text-xs font-bold uppercase tracking-widest">
                                                        No tienes cuentas registradas
                                                    </div>
                                                ) : (
                                                    savedPaymentMethods.map(pm => (
                                                        <div key={pm.id} className="flex items-center justify-between p-3 px-5 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                                            <span className="font-black text-sm uppercase tracking-wider">{pm.name}</span>
                                                            <button 
                                                                onClick={() => handleDeletePaymentMethod(pm.id, pm.name)}
                                                                className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                                                                title="Eliminar Cuenta"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* CREDIT PAYMENT MODAL */}
            {isCreditPaymentFormOpen && activeCreditForPayment && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setIsCreditPaymentFormOpen(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-scale-in border border-light-beige">
                        <h4 className="text-xl font-black text-primary-dark mb-2 flex items-center gap-3">
                            <Plus size={24} className="text-accent" /> Registar Abono
                        </h4>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-8">
                            Pago directo a {activeCreditForPayment.name}
                        </p>
                        
                        <form onSubmit={handleSaveCreditPayment} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Monto del Pago ($)</label>
                                <input 
                                    type="number" 
                                    required 
                                    autoFocus
                                    value={paymentAmount} 
                                    onChange={e => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))} 
                                    placeholder="0.00" 
                                    className="w-full bg-neutral-50 border border-light-beige rounded-2xl px-6 py-4 text-lg font-black text-primary-dark outline-none focus:border-accent" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Fecha del Movimiento</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={paymentDate} 
                                    onChange={e => setPaymentDate(e.target.value)} 
                                    className="w-full bg-neutral-50 border border-light-beige rounded-2xl px-6 py-4 text-sm font-bold text-primary-dark outline-none focus:border-accent" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Forma de Pago (Origen)</label>
                                <div className="relative">
                                    <select 
                                        required 
                                        value={creditPaymentMethod} 
                                        onChange={e => setCreditPaymentMethod(e.target.value)} 
                                        className="w-full bg-neutral-50 border border-light-beige rounded-2xl px-6 py-4 text-sm font-bold text-primary-dark outline-none focus:border-accent appearance-none cursor-pointer" 
                                    >
                                        {renderPaymentOptions()}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><TrendingDown size={14} /></div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button outline className="flex-1 py-4" onClick={() => setIsCreditPaymentFormOpen(false)}>Cancelar</Button>
                                <Button primary className="flex-1 py-4" type="submit" loading={isSavingPayment}>Confirmar Pago</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* FLOATING TOTALS BAR - Only visible in Registro mode */}
            {viewMode === 'detailed' && displayRecords.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-3xl animate-slide-up">
                    <div className="bg-primary-dark/80 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-2 pr-6 flex items-center justify-between gap-4">
                        <div className="flex bg-white/10 rounded-full p-1">
                            <div className="px-6 py-2 rounded-full flex flex-col items-center">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Ingresos</span>
                                <span className="text-sm font-black text-green-400">
                                    ${summaryData.reduce((acc, row) => acc + row.income, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="w-px h-6 bg-white/10 self-center"></div>
                            <div className="px-6 py-2 rounded-full flex flex-col items-center">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Gastos</span>
                                <span className="text-sm font-black text-red-400">
                                    ${summaryData.reduce((acc, row) => acc + row.expense, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Utilidad Neta</span>
                            <span className={`text-lg font-heading font-black ${(summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)) >= 0 ? 'text-white' : 'text-red-400'}`}>
                                ${(summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOATING TOTALS BAR - Budget mode */}
            {viewMode === 'budget' && budgetData.length > 0 && (() => {
                const totalBudget = budgetData.reduce((acc, row) => acc + row.avgBudget, 0);
                const totalSpent = budgetData.reduce((acc, row) => acc + row.currentExpense, 0);
                const diff = totalBudget - totalSpent;
                const isOver = diff < 0;
                return (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-3xl animate-slide-up">
                        <div className="bg-primary-dark/80 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-2 pr-6 flex items-center justify-between gap-4">
                            <div className="flex bg-white/10 rounded-full p-1">
                                <div className="px-5 py-2 rounded-full flex flex-col items-center">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Presupuestado</span>
                                    <span className="text-sm font-black text-white">
                                        ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="w-px h-6 bg-white/10 self-center"></div>
                                <div className="px-5 py-2 rounded-full flex flex-col items-center">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Gastado</span>
                                    <span className="text-sm font-black text-red-400">
                                        ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/50">{isOver ? 'Exceso' : 'Margen'}</span>
                                <span className={`text-lg font-heading font-black ${isOver ? 'text-red-400' : 'text-green-400'}`}>
                                    {isOver ? '-' : '+'}${Math.abs(diff).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
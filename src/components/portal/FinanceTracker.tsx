import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    Plus, Trash2, TrendingUp, TrendingDown, DollarSign, 
    Edit2, Calendar, Sparkles, User 
} from 'lucide-react';
import * as XLSX from 'xlsx';

import Button from '../ui/Button';
import { toast } from '../../lib/toast';
import { Toaster } from '../ui/Toaster';
import { useConfirm } from '../../hooks/useConfirm';

// import AICopilot from './AICopilot';
// import AIBriefingWidget from './finance/AIBriefingWidget';
import { useFinance } from '../../hooks/useFinance';
import FinanceHeader from './finance/FinanceHeader';
import RecordForm from './finance/RecordForm';
import MovementsDetailedView from './finance/MovementsDetailedView';
// import MovementsSummaryView from './finance/MovementsSummaryView';

import BudgetTracker from './finance/BudgetTracker';
import DashboardView from './finance/DashboardView';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { FinanceRecord } from '../../types/finance';

interface FinanceTrackerProps {
    user: { id: string; [key: string]: unknown };
    records?: FinanceRecord[];
    onRefresh?: () => void;
}

export default function FinanceTracker({ user, records: propsRecords, onRefresh }: FinanceTrackerProps) {
    const { 
        records, 
        loading, 
        paymentMethods: savedPaymentMethods, 
        credits, 
        goals,
        companyIds,
        refreshRecords: loadRecords,
        refreshPaymentMethods: loadPaymentMethods
    } = useFinance(user, propsRecords);

    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // View modes
    const [viewMode, setViewMode] = useState<'detailed' | 'balances' | 'budget' | 'credits'>(() => {
        const saved = localStorage.getItem(`finance_view_mode_${user.id}`);
        const validModes = ['detailed', 'balances', 'budget', 'credits'];
        return (saved && validModes.includes(saved)) ? (saved as any) : 'detailed';
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
    const [uniqueConcepts, setUniqueConcepts] = useState<string[]>([]);
    const [paymentBalancesData, setPaymentBalancesData] = useState<{method: string, initialBalance: number, income: number, expense: number, finalBalance: number}[]>([]);
    
    // Budget states
    const [budgetData, setBudgetData] = useState<any[]>([]);
    const [manualBudgets, setManualBudgets] = useState<Record<string, number>>({});
    
    // ESTADO NUEVO: Almacena los datos del presupuesto calculado
    
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
    const [searchTerm, setSearchTerm] = useState('');
    
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

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Toast & Confirm
    const { confirm, ConfirmModal } = useConfirm();

    // Reassign account modal
    const [reassignModal, setReassignModal] = useState<{ method: string; count: number } | null>(null);
    const [reassignTarget, setReassignTarget] = useState('');
    const [isReassigning, setIsReassigning] = useState(false);

    // AI OCR States
    const [isProcessingOCR, setIsProcessingOCR] = useState(false);

    // Savings Goal States
    const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
    const [goalName, setGoalName] = useState('');
    const [goalTarget, setGoalTarget] = useState<number | ''>('');
    const [goalDeadline, setGoalDeadline] = useState('');
    const [isSavingGoal, setIsSavingGoal] = useState(false);

    // Credit States
    const [isCreditFormOpen, setIsCreditFormOpen] = useState(false);
    const [creditName, setCreditName] = useState('');
    const [creditInitialBalance, setCreditInitialBalance] = useState<number | ''>('');
    const [creditAnnualRate, setCreditAnnualRate] = useState<number | ''>('');
    const [creditStartDate, setCreditStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSavingCredit, setIsSavingCredit] = useState(false);

    // Credit Payment States
    const [isCreditPaymentFormOpen, setIsCreditPaymentFormOpen] = useState(false);
    const [activeCreditForPayment, setActiveCreditForPayment] = useState<any | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [creditPaymentMethod, setCreditPaymentMethod] = useState('');
    const [isSavingPayment, setIsSavingPayment] = useState(false);
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
            toast.success('Cuenta agregada correctamente.');
        } catch (error) {
            console.error('Error saving payment method:', error);
            toast.error(`No se pudo agregar la cuenta: ${(error as any).message || '¿Ya existe una con ese nombre?'}`);
        }
    };

    const handleDeletePaymentMethod = async (id: string, name: string) => {
        const ok = await confirm({
            title: 'Eliminar Cuenta',
            message: `¿Seguro que deseas eliminar "${name}"? Sus registros históricos se conservarán.`,
            confirmLabel: 'Eliminar',
            danger: true,
        });
        if (!ok) return;
        try {
            const { error } = await supabase.from('finance_payment_methods').delete().eq('id', id);
            if (error) throw error;
            loadPaymentMethods();
            toast.success(`Cuenta "${name}" eliminada.`);
        } catch (error) {
            console.error('Error deleting payment method:', error);
            toast.error('No se pudo eliminar la cuenta.');
        }
    };


    // SAVINGS GOALS HANDLERS
    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goalName.trim() || !goalTarget) return;

        setIsSavingGoal(true);
        try {
            const { error } = await supabase
                .from('finance_goals')
                .insert([{
                    user_id: user.id,
                    name: goalName.trim().toUpperCase(),
                    target_amount: Number(goalTarget),
                    current_amount: 0,
                    deadline: goalDeadline || null,
                    color: '#4A7C82' // Default color
                }]);

            if (error) throw error;
            toast.success('Meta de ahorro creada.');
            setIsGoalFormOpen(false);
            setGoalName('');
            setGoalTarget('');
            setGoalDeadline('');
            loadRecords(); // Refresh logic if needed
        } catch (error) {
            console.error('Error saving goal:', error);
            toast.error(`No se pudo crear la meta: ${(error as any).message}`);
        } finally {
            setIsSavingGoal(false);
        }
    };

    const handleDeleteGoal = async (id: string, name: string) => {
        const ok = await confirm({
            title: 'Eliminar Meta',
            message: `¿Seguro que deseas eliminar la meta "${name}"?`,
            confirmLabel: 'Eliminar',
            danger: true
        });
        if (!ok) return;

        try {
            const { error } = await supabase.from('finance_goals').delete().eq('id', id);
            if (error) throw error;
            toast.success('Meta eliminada.');
            loadRecords();
        } catch (error) {
            console.error('Error deleting goal:', error);
            toast.error('No se pudo eliminar la meta.');
        }
    };

    const handleUpdateGoalAmount = async (id: string, currentAmount: number) => {
        const amount = prompt('¿Cuánto deseas abonar a esta meta?');
        if (!amount || isNaN(Number(amount))) return;

        try {
            const { error } = await supabase
                .from('finance_goals')
                .update({ current_amount: currentAmount + Number(amount) })
                .eq('id', id);

            if (error) throw error;
            toast.success('Abono registrado con éxito.');
            loadRecords();
        } catch (error) {
            console.error('Error updating goal:', error);
            toast.error(`No se pudo actualizar la meta: ${(error as any).message}`);
        }
    };

    // CREDIT HANDLERS
    const handleSaveCredit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!creditName.trim() || !creditInitialBalance) return;

        setIsSavingCredit(true);
        try {
            const { error } = await supabase
                .from('finance_credits')
                .insert([{
                    user_id: user.id,
                    name: creditName.trim().toUpperCase(),
                    initial_balance: Number(creditInitialBalance),
                    annual_rate: Number(creditAnnualRate) || 0,
                    start_date: creditStartDate
                }]);

            if (error) throw error;
            toast.success('Línea de crédito registrada.');
            setIsCreditFormOpen(false);
            setCreditName('');
            setCreditInitialBalance('');
            setCreditAnnualRate('');
            loadRecords();
        } catch (error) {
            console.error('Error saving credit:', error);
            toast.error(`Error: ${(error as any).message}`);
        } finally {
            setIsSavingCredit(false);
        }
    };

    const handleDeleteCredit = async (id: string, name: string) => {
        const ok = await confirm({
            title: 'Eliminar Crédito',
            message: `¿Seguro que deseas eliminar el crédito "${name}"?`,
            confirmLabel: 'Eliminar',
            danger: true
        });
        if (!ok) return;

        try {
            const { error } = await supabase.from('finance_credits').delete().eq('id', id);
            if (error) throw error;
            toast.success('Crédito eliminado.');
            loadRecords();
        } catch (error) {
            console.error('Error deleting credit:', error);
            toast.error(`No se pudo eliminar el crédito: ${(error as any).message}`);
        }
    };

    const handleSaveCreditPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCreditForPayment || !paymentAmount) return;

        setIsSavingPayment(true);
        try {
            const { error } = await supabase
                .from('finance_records')
                .insert([{
                    user_id: user.id,
                    concept: `PAGO CRÉDITO: ${activeCreditForPayment.name}`,
                    date: paymentDate,
                    payment_method: creditPaymentMethod || 'TARJETA CRÉDITO',
                    expense: Number(paymentAmount),
                    income: 0,
                    expense_type: 'Deuda',
                    provider: activeCreditForPayment.name,
                    description: `Abono a línea de crédito ${activeCreditForPayment.name}`
                }]);

            if (error) throw error;
            toast.success('Abono registrado correctamente.');
            setIsCreditPaymentFormOpen(false);
            setActiveCreditForPayment(null);
            setPaymentAmount('');
            loadRecords();
        } catch (error) {
            console.error('Error saving payment:', error);
            toast.error(`No se pudo registrar el pago: ${(error as any).message}`);
        } finally {
            setIsSavingPayment(false);
        }
    };


    // Helper: Formato de fecha sin desajuste de zona horaria
    const formatDateLocal = (dateStr: string) => {
        if (!dateStr) return '';
        if (dateStr.includes('-')) {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    };

    const loadManualBudgets = async (month: string) => {
        if (!month || month === 'all') return;
        try {
            const { data, error } = await supabase
                .from('finance_budgets')
                .select('concept, amount')
                .eq('month', month)
                .in('user_id', companyIds);
            
            if (error) throw error;
            
            const budgetMap: Record<string, number> = {};
            if (data) {
                data.forEach((b: any) => {
                    budgetMap[b.concept] = Number(b.amount);
                });
            }
            setManualBudgets(budgetMap);
        } catch (error) {
            console.error("Error loading budgets:", error);
        }
    };

    useEffect(() => {
        if (selectedMonth) {
            loadManualBudgets(selectedMonth);
        }
    }, [selectedMonth, user.id]);



    // Smart Categorization Logic
    useEffect(() => {
        if (editingId) return; // Don't auto-categorize when editing existing records
        
        const conceptUpper = (concept || '').toUpperCase();
        const providerUpper = (provider || '').toUpperCase();
        const combined = `${conceptUpper} ${providerUpper}`;

        const SMART_MAP = {
            'Variable': ['AMAZON', 'UBER', 'DIDI', 'NETFLIX', 'SPOTIFY', 'RESTAURANTE', 'CINE', 'STARBUCKS', 'RAPPI', 'MERCADO LIBRE', 'APPLE', 'VAPE', 'TIENDA'],
            'Fijo': ['CFE', 'RENTA', 'INTERNET', 'TELCEL', 'IZZI', 'TOTALPLAY', 'AGUA', 'GAS', 'HIPOTECA', 'SEGURO', 'PPR', 'MANTENIMIENTO'],
            'Ingreso': ['SUELDO', 'HONORARIOS', 'PAGO', 'VENTA', 'DIVIDENDO', 'CASHBACK', 'NOMINA', 'TRANSFERENCIA RECIBIDA'],
            'Ahorro': ['CETES', 'GBM', 'INVERSION', 'AHORRO', 'NU', 'BONOS'],
            'Deuda': ['TARJETA', 'PRESTAMO', 'CREDITO', 'PAGO A DEUDA']
        };

        for (const [type, keywords] of Object.entries(SMART_MAP)) {
            if (keywords.some(kw => combined.includes(kw))) {
                setExpenseType(type);
                break;
            }
        }
    }, [concept, provider, editingId]);





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
        
        // Inicializar mes seleccionado si está vacío (usar el mes actual si existe en la lista)
        if (!selectedMonth && formattedMonths.length > 0) {
            const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            const hasCurrentMonth = formattedMonths.some(m => m.value === currentMonthStr);
            setSelectedMonth(hasCurrentMonth ? currentMonthStr : formattedMonths[0].value);
        }
    }, [records, selectedMonth]);


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
            .reduce((acc: Record<string, {concept: string, income: number, expense: number}>, curr: FinanceRecord) => {
                const c = curr.concept || 'SIN CONCEPTO';
                if (!acc[c]) {
                    acc[c] = { concept: c, income: 0, expense: 0 };
                }
                acc[c].income += Number(curr.income) || 0;
                acc[c].expense += Number(curr.expense) || 0;
                return acc;
            }, {});
        
        const sortedSummary = Object.values(grouped).sort((a, b) => a.concept.localeCompare(b.concept));
        setSummaryData(sortedSummary);
        
        // =========================================================================
        // NUEVO: CÁLCULO DE PRESUPUESTO (Promedio histórico)
        // =========================================================================
        const historicalRecords = selectedMonth === 'all' 
            ? records 
            : records.filter((r: FinanceRecord) => {
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
            .reduce((acc: Record<string, number>, curr: FinanceRecord) => {
                const c = curr.concept || 'SIN CONCEPTO';
                if (!acc[c]) acc[c] = 0;
                acc[c] += Number(curr.expense);
                return acc;
            }, {});
            
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
        
        // Actualizar lista de conceptos únicos para el autocompletado del formulario
        setUniqueConcepts(allEverConcepts);
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
        
    }, [records, selectedMonth]);

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
                    toast.success('Registro actualizado correctamente.');
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
                    toast.success('Registro guardado correctamente.');
                }
            }
        } catch (error) {
            console.error('Error adding/updating record:', error);
            toast.error(`Hubo un error al guardar el registro: ${(error as Error).message}`);
        }
    };

    const handleAddInitialBalance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!initialBalancePM || initialBalanceAmount === '') {
            toast.warning('Por favor selecciona una cuenta y un monto.');
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
            toast.success('Saldo inicial registrado correctamente.');
        } catch (error) {
            console.error('Error setting initial balance:', error);
            toast.error('Error al guardar saldo inicial.');
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferOrigin || !transferDest || !transferAmount || transferOrigin === transferDest) {
            toast.warning('Por favor selecciona cuentas de origen y destino válidas y un monto.');
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
            toast.success('Traspaso registrado correctamente.');
        } catch (error) {
            console.error('Error creating transfer:', error);
            toast.error(`No se pudo realizar el traspaso: ${(error as any).message}`);
        }
    };

    const handleDelete = async (id: string) => {
        const ok = await confirm({
            title: 'Eliminar Registro',
            message: '¿Seguro que deseas eliminar este movimiento? Esta acción no se puede deshacer.',
            confirmLabel: 'Eliminar',
            danger: true,
        });
        if (!ok) return;
        try {
            const { error } = await supabase
                .from('finance_records')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Registro eliminado.');
            if (onRefresh) {
                onRefresh();
            } else {
                loadRecords();
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error(`No se pudo eliminar el registro: ${(error as any).message}`);
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            
            const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

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

                const parseNumber = (val: unknown) => {
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
            
            toast.success(`¡Importación exitosa! Se añadieron ${recordsToInsert.length} registros.`);
            loadRecords();

        } catch (error) {
            console.error("Error detallado al importar excel:", error);
            toast.error(`Error al importar: ${(error as Error).message || 'Verifica el formato del archivo'}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleExportPDF = async () => {
        const element = document.getElementById('finance-dashboard-content');
        if (!element) {
            toast.error("No se encontró el contenido del reporte.");
            return;
        }

        toast.info("Generando PDF... por favor espera.");
        
        try {
            const isDarkMode = document.documentElement.classList.contains('dark');
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: isDarkMode ? '#151515' : '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Reporte_Mensual_${selectedMonth || 'Global'}.pdf`);
            toast.success("PDF generado con éxito.");
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Error al generar el PDF.");
        }
    };
    
    const handleExportExcel = () => {
        if (displayRecords.length === 0) {
            toast.warning('No hay registros para exportar en el mes seleccionado.');
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
            toast.success(`Archivo "${fileName}" exportado correctamente.`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            toast.error('No se pudo generar el archivo Excel.');
        }
    };

    const filteredRecords = selectedMonth === 'all' 
        ? records 
        : records.filter(r => r.date.startsWith(selectedMonth));

    let runningBalanceFlow = 0;
    const displayRecords = filteredRecords
        .filter(record => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                (record.concept || '').toLowerCase().includes(search) ||
                (record.provider || '').toLowerCase().includes(search) ||
                (record.payment_method || '').toLowerCase().includes(search) ||
                (record.description || '').toLowerCase().includes(search)
            );
        })
        .map(record => {
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
        <div className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[2rem] border border-[var(--border-color)] dark:border-white/10 shadow-sm overflow-hidden animate-fade-in backdrop-blur-md">
            <FinanceHeader 
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                uniqueMonths={uniqueMonths}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isUploading={isUploading}
                onImportExcel={() => fileInputRef.current?.click()}
                onExportExcel={handleExportExcel}
                onRefresh={loadRecords}
                onExportPDF={handleExportPDF}
                onToggleForm={() => setIsFormOpen(!isFormOpen)}
                isFormOpen={isFormOpen}
                kpis={{
                    income: summaryData.reduce((acc, row) => acc + row.income, 0),
                    expense: summaryData.reduce((acc, row) => acc + row.expense, 0),
                    balance: summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)
                }}
            />

            <RecordForm 
                isOpen={isFormOpen}
                isEditing={!!editingId}
                isProcessingOCR={isProcessingOCR}
                setIsProcessingOCR={setIsProcessingOCR}
                onClose={() => { setIsFormOpen(false); resetForm(); }}
                onSubmit={handleAddRecord}
                concept={concept} setConcept={setConcept}
                date={date} setDate={setDate}
                paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                provider={provider} setProvider={setProvider}
                income={income} setIncome={setIncome}
                expense={expense} setExpense={setExpense}
                description={description} setDescription={setDescription}
                expenseType={expenseType} setExpenseType={setExpenseType}
                renderPaymentOptions={renderPaymentOptions}
                concepts={uniqueConcepts}
            />
        
            <div className="overflow-x-auto" id="finance-dashboard-content">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                    </div>
                ) : viewMode === 'credits' ? (
                    <div className="p-8 space-y-10 animate-fade-in text-[var(--text-primary)]">
                        <div className="flex justify-between items-center bg-accent/10 p-6 rounded-[2.5rem] border border-accent/10">
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter">Gestión de Créditos</h3>
                                <p className="text-[10px] opacity-60 font-bold uppercase tracking-wider mt-1">Control de deudas y aceleración de libertad financiera</p>
                            </div>
                            <Button primary className="flex items-center gap-2 group" onClick={() => setIsCreditFormOpen(!isCreditFormOpen)}>
                                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Nuevo Crédito
                            </Button>
                        </div>

                        {isCreditFormOpen && (
                            <div className="bg-[var(--bg-card)] dark:bg-white/5 p-8 rounded-[2.5rem] border border-[var(--border-color)] dark:border-white/10 shadow-xl animate-scale-in relative overflow-hidden group backdrop-blur-md">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-accent/10 transition-all duration-700"></div>
                                <h4 className="text-lg font-black mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-white">
                                        <Plus size={20} />
                                    </div>
                                    Registrar Nuevo Crédito Bancario
                                </h4>
                                <form onSubmit={handleSaveCredit} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase opacity-40 ml-1">Nombre del Crédito</label>
                                        <input type="text" required value={creditName} onChange={e => setCreditName(e.target.value)} placeholder="Ej: Crédito Hipotecario" className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase opacity-40 ml-1">Monto Inicial ($)</label>
                                        <input type="number" required value={creditInitialBalance} onChange={e => setCreditInitialBalance(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black outline-none focus:border-accent transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase opacity-40 ml-1">Tasa Anual (%)</label>
                                        <input type="number" step="0.1" required value={creditAnnualRate} onChange={e => setCreditAnnualRate(e.target.value === '' ? '' : Number(e.target.value))} placeholder="21.0" className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black text-accent outline-none focus:border-accent transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase opacity-40 ml-1">Fecha de Inicio</label>
                                        <input type="date" required value={creditStartDate} onChange={e => setCreditStartDate(e.target.value)} className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all" />
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-4 pt-4 border-t border-[var(--border-color)]">
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
                                const iterDate = new Date(start);

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
                                            <button onClick={() => handleDeleteCredit(credit.id, credit.name)} className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
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
                                                    <span className="text-[10px] font-bold text-neutral-400">Inicio: {formatDateLocal(credit.start_date)}</span>
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
                    <MovementsDetailedView 
                        records={displayRecords}
                        onEdit={handleEditClick}
                        onDelete={handleDelete}
                    />
                ) : viewMode === 'budget' ? (
                    <BudgetTracker 
                        userId={user.id}
                        records={records}
                        selectedMonth={selectedMonth}
                    />
                ) : viewMode === 'balances' ? (
                    <div className="p-8 max-w-7xl mx-auto animate-fade-in delay-100 text-[var(--text-primary)]">
                        {selectedMonth && (
                            <h3 className="text-2xl font-black font-heading text-center mb-10 capitalize flex items-center justify-center gap-4">
                                <div className="h-px bg-[var(--border-color)] dark:bg-white/10 flex-1"></div>
                                <span className="bg-[var(--bg-card)] dark:bg-white/5 px-6 py-2 rounded-2xl border border-[var(--border-color)] dark:border-white/10 shadow-sm">
                                    {uniqueMonths.find(m => m.value === selectedMonth)?.label}
                                </span>
                                <div className="h-px bg-[var(--border-color)] dark:bg-white/10 flex-1"></div>
                            </h3>
                        )}
                        
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Tabla Balance por Forma de Pago */}
                            <div className="lg:col-span-2 bg-[var(--bg-card)]/50 dark:bg-white/5 backdrop-blur-md overflow-hidden rounded-[32px] border border-[var(--border-color)] dark:border-white/10 shadow-sm">
                                <h4 className="text-[10px] font-black text-center p-6 bg-accent/5 border-b border-[var(--border-color)] dark:border-white/10 uppercase tracking-[0.2em]">
                                    Estado Actual de Cuentas
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-[var(--border-color)] dark:border-white/10">
                                                <th className="p-5 font-black text-[10px] uppercase tracking-widest opacity-40">Cuenta</th>
                                                <th className="p-5 font-black text-[10px] uppercase tracking-widest opacity-40 text-right">Inicial</th>
                                                <th className="p-5 font-black text-[10px] uppercase tracking-widest opacity-40 text-right">Entradas</th>
                                                <th className="p-5 font-black text-[10px] uppercase tracking-widest opacity-40 text-right">Salidas</th>
                                                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-right">Final</th>
                                                <th className="p-5 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-color)] dark:divide-white/5">
                                            {paymentBalancesData.map((row) => (
                                                <tr key={row.method} className="hover:bg-[var(--bg-main)] dark:hover:bg-white/5 transition-colors group">
                                                    <td className="p-5 font-black text-xs uppercase tracking-wider">{row.method}</td>
                                                    <td className="p-5 text-right text-sm opacity-40 font-medium">
                                                        ${row.initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-5 text-right text-sm text-green-600 font-bold">
                                                        {row.income > 0 ? `$${row.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                                    </td>
                                                    <td className="p-5 text-right text-sm text-red-500 font-bold">
                                                        {row.expense > 0 ? `$${row.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                                    </td>
                                                    <td className={`p-5 text-right text-sm font-black ${row.finalBalance < 0 ? 'text-red-600' : ''}`}>
                                                        ${row.finalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <button 
                                                            onClick={() => {
                                                                const count = records.filter(r => r.payment_method === row.method).length;
                                                                setReassignModal({ method: row.method, count });
                                                                setReassignTarget('');
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
                            <div className="bg-accent rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-white/20"></div>
                                
                                <div className="flex bg-white/10 p-1.5 rounded-2xl mb-8 border border-white/5 relative z-10">
                                    <button 
                                        onClick={() => setAccMgmtTab('initial')}
                                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accMgmtTab === 'initial' ? 'bg-white text-accent shadow-lg scale-[1.02]' : 'text-white/40 hover:text-white'}`}
                                    >
                                        Saldo Inicial
                                    </button>
                                    <button 
                                        onClick={() => setAccMgmtTab('transfer')}
                                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accMgmtTab === 'transfer' ? 'bg-white text-accent shadow-lg scale-[1.02]' : 'text-white/40 hover:text-white'}`}
                                    >
                                        Traspaso
                                    </button>
                                    <button 
                                        onClick={() => setAccMgmtTab('accounts')}
                                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${accMgmtTab === 'accounts' ? 'bg-white text-accent shadow-lg scale-[1.02]' : 'text-white/40 hover:text-white'}`}
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

                        {/* 📈 SECCIÓN DE METAS DE AHORRO */}
                        <div className="mt-12 bg-[var(--bg-card)] dark:bg-white/5 rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm animate-fade-in delay-200 relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                <div>
                                    <h2 className="text-2xl font-black flex items-center gap-3 text-[var(--text-primary)]">
                                        <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                            <Sparkles size={20} />
                                        </div>
                                        Mis Metas de Ahorro
                                    </h2>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Control de ahorro por objetivos específicos</p>
                                </div>
                                <Button primary className="rounded-full px-8 py-4 shadow-xl shadow-accent/20 hover:scale-105 transition-all flex items-center gap-2" onClick={() => setIsGoalFormOpen(true)}>
                                    <Plus size={18} /> Nueva Meta
                                </Button>
                            </div>

                            {goals.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] dark:border-white/10 rounded-[2.5rem] group hover:border-accent/30 transition-all cursor-pointer" onClick={() => setIsGoalFormOpen(true)}>
                                    <div className="w-16 h-16 bg-neutral-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50 group-hover:scale-110 transition-transform">
                                        <TrendingUp size={24} className="text-[var(--text-primary)]" />
                                    </div>
                                    <p className="text-sm font-bold text-neutral-400">Todavía no tienes metas activas. Comienza a ahorrar hoy mismo.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {goals.map(goal => {
                                        const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
                                        return (
                                            <div key={goal.id} className="bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform`} style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                                                        <span className="text-2xl">{goal.icon || '🎯'}</span>
                                                    </div>
                                                    <button onClick={() => handleDeleteGoal(goal.id, goal.name)} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-neutral-300 hover:text-red-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                                                </div>
                                                <h4 className="text-lg font-black mb-1 text-[var(--text-primary)]">{goal.name}</h4>
                                                <div className="flex justify-between items-end mb-4">
                                                    <span className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--text-primary)]">Progreso</span>
                                                    <span className="text-xs font-black text-[var(--text-primary)]">${(goal.current_amount || 0).toLocaleString()} / ${(goal.target_amount || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="h-2.5 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden mb-6">
                                                    <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.1)]" style={{ width: `${progress}%`, backgroundColor: goal.color }}></div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-2xl font-black text-[var(--text-primary)]">{Math.round(progress)}%</span>
                                                    <button onClick={() => handleUpdateGoalAmount(goal.id, goal.current_amount)} className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">Abonar capital</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
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
                                    ${summaryData.reduce((acc: number, row) => acc + row.income, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="w-px h-6 bg-white/10 self-center"></div>
                            <div className="px-6 py-2 rounded-full flex flex-col items-center">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Gastos</span>
                                <span className="text-sm font-black text-red-400">
                                    ${summaryData.reduce((acc: number, row) => acc + row.expense, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Utilidad Neta</span>
                            <span className={`text-lg font-heading font-black ${(summaryData.reduce((acc: number, row: {income: number}) => acc + row.income, 0) - summaryData.reduce((acc: number, row: {expense: number}) => acc + row.expense, 0)) >= 0 ? 'text-white' : 'text-red-400'}`}>
                                ${(summaryData.reduce((acc: number, row: {income: number}) => acc + row.income, 0) - summaryData.reduce((acc: number, row: {expense: number}) => acc + row.expense, 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOATING TOTALS BAR - Budget mode */}
            {viewMode === 'budget' && budgetData.length > 0 && (() => {
                const totalBudget = budgetData.reduce((acc: number, row: {avgBudget: number}) => acc + row.avgBudget, 0);
                const totalSpent = budgetData.reduce((acc: number, row: {currentExpense: number}) => acc + row.currentExpense, 0);
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
            {/* REASSIGN MODAL */}
            {reassignModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setReassignModal(null)}></div>
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-scale-in border border-light-beige">
                        <h4 className="text-xl font-black text-primary-dark mb-2 flex items-center gap-3">
                            <Edit2 size={24} className="text-amber-500" /> Reasignar Cuenta
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-8 leading-relaxed">
                            Mover {reassignModal.count} registros de <span className="text-primary-dark font-black">{reassignModal.method}</span> a otra cuenta.
                        </p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Seleccionar Cuenta Destino</label>
                                <div className="relative">
                                    <select 
                                        value={reassignTarget} 
                                        onChange={e => setReassignTarget(e.target.value)}
                                        className="w-full bg-neutral-50 border border-light-beige rounded-2xl px-6 py-4 text-sm font-bold text-primary-dark outline-none focus:border-accent appearance-none cursor-pointer"
                                    >
                                        <option value="">Selecciona una cuenta...</option>
                                        {savedPaymentMethods.filter(p => p.name !== reassignModal.method).map(pm => (
                                            <option key={pm.id} value={pm.name}>{pm.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><TrendingDown size={14} /></div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button outline className="flex-1 py-4" onClick={() => setReassignModal(null)}>Cancelar</Button>
                                <Button 
                                    primary 
                                    className="flex-1 py-4" 
                                    disabled={!reassignTarget || isReassigning}
                                    loading={isReassigning}
                                    onClick={async () => {
                                        setIsReassigning(true);
                                        try {
                                            const { error } = await supabase
                                                .from('finance_records')
                                                .update({ payment_method: reassignTarget })
                                                .eq('payment_method', reassignModal.method)
                                                .in('user_id', companyIds);
                                            
                                            if (error) throw error;
                                            toast.success(`Movidos ${reassignModal.count} registros a ${reassignTarget}`);
                                            setReassignModal(null);
                                            if (onRefresh) onRefresh();
                                            loadRecords();
                                        } catch (err) {
                                            console.error(err);
                                            toast.error('Error al reasignar registros');
                                        } finally {
                                            setIsReassigning(false);
                                        }
                                    }}
                                >
                                    Confirmar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Toaster />
            {ConfirmModal}

            {/* SAVINGS GOAL MODAL */}
            {isGoalFormOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setIsGoalFormOpen(false)}></div>
                    <div className="bg-[var(--bg-card)] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-scale-in border border-[var(--border-color)]">
                        <h4 className="text-xl font-black text-[var(--text-primary)] mb-2 flex items-center gap-3">
                            <TrendingUp size={24} className="text-accent" /> Nueva Meta de Ahorro
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-8">Define un objetivo claro para tus finanzas.</p>

                        <form onSubmit={handleAddGoal} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Nombre de la Meta</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        required 
                                        value={goalName} 
                                        onChange={e => setGoalName(e.target.value)}
                                        placeholder="Ej: Fondo de Emergencia"
                                        className="w-full bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><User size={16} /></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Monto Objetivo ($)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        required 
                                        value={goalTarget} 
                                        onChange={e => setGoalTarget(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="0.00"
                                        className="w-full bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><DollarSign size={16} /></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Fecha Límite (Opcional)</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        value={goalDeadline} 
                                        onChange={e => setGoalDeadline(e.target.value)}
                                        className="w-full bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><Calendar size={16} /></div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button outline className="flex-1 py-4" onClick={() => setIsGoalFormOpen(false)}>Cancelar</Button>
                                <Button 
                                    primary 
                                    className="flex-1 py-4" 
                                    disabled={isSavingGoal}
                                    type="submit"
                                >
                                    Crear Meta
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx, .xls"
                className="hidden"
            />
{/* <AICopilot records={records} /> */}
        </div>
    );
}
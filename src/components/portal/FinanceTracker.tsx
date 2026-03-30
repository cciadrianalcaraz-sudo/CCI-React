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
    const [viewMode, setViewMode] = useState<'detailed' | 'summary' | 'balances' | 'budget'>('detailed');
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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // Account management states (Saldos tab)
    const [initialBalanceAmount, setInitialBalanceAmount] = useState<number | ''>('');
    const [initialBalancePM, setInitialBalancePM] = useState('');
    const [transferAmount, setTransferAmount] = useState<number | ''>('');
    const [transferOrigin, setTransferOrigin] = useState('');
    const [transferDest, setTransferDest] = useState('');
    const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
    const [transferDesc, setTransferDesc] = useState('');
    const [accMgmtTab, setAccMgmtTab] = useState<'initial' | 'transfer'>('initial');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!propsRecords) {
            loadRecords();
        } else {
            setLoading(false);
        }
    }, [user.id, propsRecords]);

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
        
        records.forEach(r => {
            const pm = r.payment_method || 'SIN ESPECIFICAR';
            if (!paymentMap[pm]) {
                paymentMap[pm] = { initial: 0, income: 0, expense: 0, finalBalance: 0 };
            }
            
            const recordMonth = r.date.substring(0, 7);
            const isInitialBalance = (r.concept || '').toUpperCase().trim() === 'SALDO INICIAL';
            const recordIncome = Number(r.income) || 0;
            const recordExpense = Number(r.expense) || 0;
            
            if (selectedMonth !== 'all' && recordMonth < selectedMonth) {
                if (isInitialBalance) {
                    paymentMap[pm].finalBalance = recordIncome - recordExpense; 
                } else {
                    paymentMap[pm].finalBalance += recordIncome - recordExpense; 
                }
                paymentMap[pm].initial = paymentMap[pm].finalBalance;

            } else if (selectedMonth === 'all' || recordMonth === selectedMonth) {
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
        
        const balances = Object.entries(paymentMap)
            .map(([method, data]) => ({
                method,
                initialBalance: data.initial,
                income: data.income,
                expense: data.expense,
                finalBalance: data.finalBalance 
            }))
            .filter(p => p.initialBalance !== 0 || p.income !== 0 || p.expense !== 0 || p.finalBalance !== 0)
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
                        description
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
                        description
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
                date: new Date().toISOString().split('T')[0],
                payment_method: initialBalancePM,
                income: Number(initialBalanceAmount) >= 0 ? Number(initialBalanceAmount) : 0,
                expense: Number(initialBalanceAmount) < 0 ? Math.abs(Number(initialBalanceAmount)) : 0,
                provider: 'SISTEMA',
                description: 'Carga inicial de saldo'
            }]);

            if (error) throw error;
            setInitialBalanceAmount('');
            setInitialBalancePM('');
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

                    <datalist id="payment-options">
                        <option value="EFECTIVO LAURA" />
                        <option value="EFECTIVO ADRIAN" />
                        <option value="TD STR LAURA" />
                        <option value="TD BBVA LAURA" />
                        <option value="TC STR LAURA" />
                        <option value="CPM LAURA" />
                        <option value="CPM ADRIAN" />
                        <option value="CPM CRÉDITO" />
                        <option value="CETES" />
                        <option value="TD STR ADRIAN" />
                        <option value="TD DESPENSA" />
                        <option value="VALES" />
                        <option value="ALCANCIA" />
                        <option value="CASHI" />
                    </datalist>

                    <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block ml-1">Concepto</label>
                            <input list="concept-options" type="text" required value={concept} onChange={e => setConcept(e.target.value)} placeholder="Seleccione concepto..." className="w-full bg-white border border-neutral-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-accent transition-all shadow-sm" />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block ml-1">Fecha</label>
                            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white border border-neutral-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-accent transition-all shadow-sm" />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 block ml-1">Forma de pago</label>
                            <input list="payment-options" type="text" required value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} placeholder="Seleccione pago..." className="w-full bg-white border border-neutral-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-accent transition-all shadow-sm" />
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

            {/* NEW GLOBAL KPI BAR - Now Sticky */}
            <div className="sticky top-[80px] md:top-[100px] z-20 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pt-4 pb-2 bg-[#faf7f2]/80 backdrop-blur-md transition-all">
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:bg-white/80 transition-all">
                    <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-5 text-green-600 group-hover:scale-110 transition-transform"><TrendingUp size={40} /></div>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mb-1">Ingresos</p>
                    <p className="text-xl font-heading font-black text-green-600">
                        ${summaryData.reduce((acc, row) => acc + row.income, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:bg-white/80 transition-all">
                    <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-5 text-red-600 group-hover:scale-110 transition-transform"><TrendingDown size={40} /></div>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mb-1">Gastos</p>
                    <p className="text-xl font-heading font-black text-red-500">
                        ${summaryData.reduce((acc, row) => acc + row.expense, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-primary-dark to-[#3d686d] p-4 rounded-2xl shadow-lg flex flex-col justify-center relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-20 text-white group-hover:rotate-12 transition-transform"><DollarSign size={40} /></div>
                    <p className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-1">Balance</p>
                    <p className="text-xl font-heading font-black text-white">
                        ${(summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            <div className="sticky top-[240px] md:top-[185px] z-20 flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-white/40 backdrop-blur-md p-2 rounded-[24px] border border-white/60 shadow-sm">
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
       
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
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
                                    <tr className="bg-primary-dark/5 text-primary-dark text-[10px] font-black uppercase tracking-[0.2em] border-b border-light-beige">
                                        <th className="p-5 whitespace-nowrap">ID</th>
                                        <th className="p-5 whitespace-nowrap">Concepto</th>
                                        <th className="p-5 whitespace-nowrap">Fecha</th>
                                        <th className="p-5 whitespace-nowrap">Pago</th>
                                        <th className="p-5 whitespace-nowrap">Proveedor</th>
                                        <th className="p-5 text-right whitespace-nowrap">Ingreso</th>
                                        <th className="p-5 text-right whitespace-nowrap">Gasto</th>
                                        <th className="p-5 text-right whitespace-nowrap font-black">Saldo</th>
                                        <th className="p-5 whitespace-nowrap max-w-xs">Descripción</th>
                                        <th className="p-5 text-center whitespace-nowrap">Acciones</th>
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
                                                </td>
                                                <td className="p-4 px-5 whitespace-nowrap text-xs text-neutral-500 font-medium">
                                                    {record.date.split('-').reverse().join('/')}
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
                                                    <input 
                                                        list="payment-options"
                                                        required
                                                        value={initialBalancePM}
                                                        onChange={e => setInitialBalancePM(e.target.value)}
                                                        placeholder="Selecciona..."
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-accent placeholder:text-white/20 transition-all font-medium"
                                                    />
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
                                                <Button primary type="submit" className="w-full py-4 text-xs font-black uppercase tracking-widest shadow-2xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                                    Guardar Ajuste
                                                </Button>
                                            </form>
                                        </div>
                                    ) : (
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
                                                        <input list="payment-options" required value={transferOrigin} onChange={e => setTransferOrigin(e.target.value)} placeholder="De..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-accent font-medium" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block ml-1">Destino</label>
                                                        <input list="payment-options" required value={transferDest} onChange={e => setTransferDest(e.target.value)} placeholder="A..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-accent font-medium" />
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
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
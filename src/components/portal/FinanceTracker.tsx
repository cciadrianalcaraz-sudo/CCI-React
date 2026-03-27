import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Search, TrendingUp, TrendingDown, DollarSign, Edit2, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
}

export default function FinanceTracker({ user }: FinanceTrackerProps) {
    const [records, setRecords] = useState<FinanceRecord[]>([]);
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadRecords();
    }, [user.id]);

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
            alert("No se pudo guardar el presupuesto. ¿Ya creaste la tabla en Supabase?");
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
            if (data) setRecords(data as FinanceRecord[]);
        } catch (error) {
            console.error("Error loading finance records:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (records.length === 0) return;
        
        const months = Array.from(new Set(records.map(r => r.date.substring(0, 7)))).sort().reverse();
        const formattedMonths = months.map(m => {
            const [year, month] = m.split('-');
            const date = new Date(Number(year), Number(month) - 1, 1);
            return {
                value: m,
                label: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
            };
        });
        
        setUniqueMonths([{label: 'Todos los meses', value: 'all'}, ...formattedMonths]);
        
        if (!selectedMonth && formattedMonths.length > 0) {
            setSelectedMonth(formattedMonths[0].value);
        }
    }, [records]);

    useEffect(() => {
        if (!selectedMonth) return;
        
        const filteredRecords = selectedMonth === 'all' ? records : records.filter(r => r.date.startsWith(selectedMonth));
        
        const grouped = filteredRecords
            .filter(r => (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL')
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
            : records.filter(r => r.date.substring(0, 7) < selectedMonth);
            
        const historicalMonthsCount = new Set(historicalRecords.map(r => r.date.substring(0, 7))).size || 1;
        
        const historicalExpenses = historicalRecords
            .filter(r => (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL' && Number(r.expense) > 0)
            .reduce((acc, curr) => {
                const c = curr.concept || 'SIN CONCEPTO';
                if (!acc[c]) acc[c] = 0;
                acc[c] += Number(curr.expense);
                return acc;
            }, {} as Record<string, number>);
            
        const allConcepts = new Set([
            ...Object.keys(historicalExpenses),
            ...Object.keys(grouped).filter(c => grouped[c].expense > 0)
        ]);
        
        const budgetArr = Array.from(allConcepts).map(concept => {
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
        }).filter(b => b.avgBudget > 0 || b.currentExpense > 0)
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

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;
        try {
            const { error } = await supabase
                .from('finance_records')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setRecords(records.filter(r => r.id !== id));
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
        setIncome((record.income && Number(record.income) > 0) ? Number(record.income) : '');
        setExpense((record.expense && Number(record.expense) > 0) ? Number(record.expense) : '');
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
                    return isNaN(parsed) ? 0 : Math.abs(parsed); // Usamos Math.abs porque a veces los gastos vienen con signo negativo
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

    let runningBalance = 0;
    const recordsWithBalance = records.map(record => {
        const isInitialBalance = (record.concept || '').toUpperCase().trim() === 'SALDO INICIAL';
        
        if (!isInitialBalance) {
            runningBalance = runningBalance + Number(record.income) - Number(record.expense);
        }
        
        return {
            ...record,
            balance: runningBalance
        };
    });

    const displayRecords = selectedMonth === 'all' 
        ? recordsWithBalance 
        : recordsWithBalance.filter(r => r.date.startsWith(selectedMonth));

    return (
        <div className="bg-white rounded-[2rem] border border-light-beige shadow-sm overflow-hidden animate-fade-in">
            <div className="p-8 border-b border-light-beige flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-primary-dark">Registro de Finanzas Personales</h2>
                    <p className="text-sm text-neutral-500 mt-1">Control de ingresos, gastos y saldo al día.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileUpload} 
                    />
                    <Button outline className="text-sm py-2 flex items-center gap-2" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        <Upload size={16} /> {isUploading ? 'Importando...' : 'Importar Excel'}
                    </Button>
                    <Button outline className="text-sm py-2" onClick={() => loadRecords()}>
                        Actualizar
                    </Button>
                    <Button primary className="text-sm py-2 flex items-center gap-2" onClick={() => setIsFormOpen(!isFormOpen)}>
                        <Plus size={16} /> Nuevo Registro
                    </Button>
                </div>
            </div>

            {isFormOpen && (
                <div className="p-8 border-b border-light-beige bg-neutral-50 animate-slide-in">
                    
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

                    <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-primary-dark">Concepto</label>
                            <input list="concept-options" type="text" required value={concept} onChange={e => setConcept(e.target.value)} placeholder="Ej. FIESTA ANGELITO" className="w-full text-sm border border-light-beige rounded-xl px-3 py-2 outline-none focus:border-accent bg-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-primary-dark">Fecha</label>
                            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full text-sm border border-light-beige rounded-xl px-3 py-2 outline-none focus:border-accent" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-primary-dark">Forma de pago</label>
                            <input list="payment-options" type="text" required value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} placeholder="Ej. Efectivo Laura" className="w-full text-sm border border-light-beige rounded-xl px-3 py-2 outline-none focus:border-accent bg-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-primary-dark">Proveedor</label>
                            <input type="text" required value={provider} onChange={e => setProvider(e.target.value)} placeholder="Ej. BODEGA" className="w-full text-sm border border-light-beige rounded-xl px-3 py-2 outline-none focus:border-accent" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-primary-dark">Ingreso ($)</label>
                            <input type="number" step="0.01" value={income} onChange={e => setIncome(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full text-sm border border-light-beige rounded-xl px-3 py-2 outline-none focus:border-accent" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-primary-dark">Gasto ($)</label>
                            <input type="number" step="0.01" value={expense} onChange={e => setExpense(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.00" className="w-full text-sm border border-light-beige rounded-xl px-3 py-2 outline-none focus:border-accent" />
                        </div>
                        <div className="space-y-1 lg:col-span-2">
                            <label className="text-xs font-bold text-primary-dark">Descripción</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej. TOMATE, CHILE SERRANO Y CEBOLLA" className="w-full text-sm border border-light-beige rounded-xl px-3 py-2 outline-none focus:border-accent" />
                        </div>
                        <div className="lg:col-span-4 flex justify-end gap-3 mt-2">
                            <Button outline type="button" onClick={() => { setIsFormOpen(false); resetForm(); }} className="text-sm py-2">Cancelar</Button>
                            <Button primary type="submit" className="text-sm py-2">{editingId ? 'Actualizar Registro' : 'Guardar Registro'}</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="p-6 border-b border-light-beige bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex bg-neutral-100 p-1 rounded-xl w-fit">
                    <button 
                        onClick={() => setViewMode('detailed')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'detailed' ? 'bg-white shadow-sm text-primary-dark' : 'text-neutral-500 hover:text-primary-dark'}`}
                    >
                        Registro Detallado
                    </button>
                    <button 
                        onClick={() => setViewMode('summary')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'summary' ? 'bg-white shadow-sm text-primary-dark' : 'text-neutral-500 hover:text-primary-dark'}`}
                    >
                        Resumen por Mes
                    </button>
                    <button 
                        onClick={() => setViewMode('balances')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'balances' ? 'bg-white shadow-sm text-primary-dark' : 'text-neutral-500 hover:text-primary-dark'}`}
                    >
                        Saldos
                    </button>
                    <button 
                        onClick={() => setViewMode('budget')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'budget' ? 'bg-white shadow-sm text-primary-dark' : 'text-neutral-500 hover:text-primary-dark'}`}
                    >
                        Presupuesto
                    </button>
                </div>
                
                {uniqueMonths.length > 0 && (
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-bold text-primary-dark uppercase tracking-wider">Mes:</label>
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-white border border-light-beige rounded-xl px-4 py-2 text-sm font-bold text-accent outline-none focus:border-accent capitalize"
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
                ) : displayRecords.length === 0 ? (
                    <div className="p-12 text-center text-neutral-400">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary/30">
                                <Search size={24} />
                            </div>
                        </div>
                        <p className="font-bold text-primary-dark mb-1">Sin registros financieros</p>
                        <p className="text-sm">Comienza agregando tu primer movimiento.</p>
                    </div>
                ) : viewMode === 'detailed' ? (
                    <table className="w-full text-left border-collapse animate-fade-in delay-100">
                        <thead>
                            <tr className="bg-primary/5 text-primary-dark text-xs uppercase tracking-wider">
                                <th className="p-4 border-b border-light-beige font-bold whitespace-nowrap">No.</th>
                                <th className="p-4 border-b border-light-beige font-bold whitespace-nowrap">Concepto</th>
                                <th className="p-4 border-b border-light-beige font-bold whitespace-nowrap">Fecha</th>
                                <th className="p-4 border-b border-light-beige font-bold whitespace-nowrap">Forma de pago</th>
                                <th className="p-4 border-b border-light-beige font-bold whitespace-nowrap">Proveedor</th>
                                <th className="p-4 border-b border-light-beige font-bold text-right whitespace-nowrap">Ingreso</th>
                                <th className="p-4 border-b border-light-beige font-bold text-right whitespace-nowrap">Gasto</th>
                                <th className="p-4 border-b border-light-beige font-bold text-right whitespace-nowrap">Saldo</th>
                                <th className="p-4 border-b border-light-beige font-bold max-w-xs">Descripción</th>
                                <th className="p-4 border-b border-light-beige font-bold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-beige/50">
                            {displayRecords.map((record, index) => {
                                const isInitialBalance = record.concept.toUpperCase() === 'SALDO INICIAL';
                                return (
                                    <tr key={record.id} className={`hover:bg-[#faf7f2]/50 transition-colors text-sm text-neutral-700 ${isInitialBalance ? 'bg-amber-50/10 opacity-75' : ''}`}>
                                        <td className="p-4 whitespace-nowrap text-neutral-400 font-medium">{index + 1}</td>
                                        <td className="p-4 whitespace-nowrap font-medium text-primary-dark">
                                            {record.concept}
                                            {isInitialBalance && <span className="ml-2 text-[9px] bg-primary/10 text-primary-dark px-1 py-0.5 rounded uppercase tracking-wider">Ajuste</span>}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className="bg-neutral-100 px-2 py-1 rounded text-xs">{record.payment_method}</span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">{record.provider}</td>
                                        <td className="p-4 text-right whitespace-nowrap text-green-600 font-medium">
                                            {isInitialBalance ? '-' : (Number(record.income) > 0 ? `$${Number(record.income).toFixed(2)}` : '-')}
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap text-red-600 font-medium">
                                            {isInitialBalance ? '-' : (Number(record.expense) > 0 ? `$${Number(record.expense).toFixed(2)}` : '-')}
                                        </td>
                                        <td className={`p-4 text-right whitespace-nowrap font-bold ${Number(record.balance) < 0 ? 'text-red-600' : 'text-primary-dark'}`}>
                                            ${Number(record.balance).toFixed(2)}
                                        </td>
                                        <td className="p-4 break-words min-w-[200px] text-xs leading-relaxed text-neutral-500">
                                            {record.description}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleEditClick(record)}
                                                    className="px-3 py-1.5 flex items-center gap-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-xs font-bold shadow-sm"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={14} /> Editar
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDelete(record.id)}
                                                    className="px-3 py-1.5 flex items-center gap-1.5 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-xs font-bold shadow-sm"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={14} /> Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-neutral-50/50">
                            <tr>
                                <td colSpan={5} className="p-4 text-right font-bold text-primary-dark text-sm uppercase">Total Mostrado <span className="text-[10px] text-neutral-400 block normal-case">(Excluye Saldos Iniciales)</span></td>
                                <td className="p-4 text-right font-bold text-green-600">
                                    ${displayRecords.filter(r => r.concept.toUpperCase() !== 'SALDO INICIAL').reduce((acc, curr) => acc + Number(curr.income), 0).toFixed(2)}
                                </td>
                                <td className="p-4 text-right font-bold text-red-600">
                                    ${displayRecords.filter(r => r.concept.toUpperCase() !== 'SALDO INICIAL').reduce((acc, curr) => acc + Number(curr.expense), 0).toFixed(2)}
                                </td>
                                <td colSpan={3}></td>
                            </tr>
                        </tfoot>
                    </table>
                ) : viewMode === 'summary' ? (
                    <div className="p-8 max-w-7xl mx-auto animate-fade-in delay-100">
                        {selectedMonth && (
                            <h3 className="text-2xl font-bold font-heading text-center text-primary-dark mb-10 capitalize decoration-accent underline underline-offset-8">
                                {uniqueMonths.find(m => m.value === selectedMonth)?.label}
                            </h3>
                        )}

                        {summaryData.length > 0 && (
                            <>
                                {/* Tarjetas de Resumen Rápido (KPIs) */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                    <div className="bg-white p-6 rounded-3xl border border-light-beige shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-10 text-green-500 group-hover:scale-110 transition-transform"><TrendingUp size={64} /></div>
                                        <p className="text-neutral-500 font-bold uppercase tracking-wider text-xs mb-2 z-10">Ingresos Totales</p>
                                        <p className="text-3xl font-heading font-extrabold text-green-600 z-10">
                                            <span className="text-xl font-normal opacity-70 mr-1">$</span>
                                            {summaryData.reduce((acc, row) => acc + row.income, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-light-beige shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-5 text-red-500 group-hover:scale-110 transition-transform"><TrendingDown size={64} /></div>
                                        <p className="text-neutral-500 font-bold uppercase tracking-wider text-xs mb-2 z-10">Gastos Totales</p>
                                        <p className="text-3xl font-heading font-extrabold text-red-500 z-10">
                                            <span className="text-xl font-normal opacity-70 mr-1">$</span>
                                            {summaryData.reduce((acc, row) => acc + row.expense, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-primary-dark to-[#3d686d] p-6 rounded-3xl shadow-md flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-shadow">
                                        <div className="absolute -right-4 -bottom-4 opacity-10 text-white group-hover:rotate-12 transition-transform"><DollarSign size={96} /></div>
                                        <p className="text-white/70 font-bold uppercase tracking-wider text-xs mb-2 z-10">Balance Neto</p>
                                        <p className="text-3xl font-heading font-extrabold text-white z-10">
                                            <span className="text-xl font-normal opacity-50 mr-1">$</span>
                                            {(summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>

                                {/* Gráficas Primera Fila */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                                    {/* Ingresos - Pastel Pequeño */}
                                    <div className="bg-white p-6 rounded-3xl border border-light-beige shadow-sm">
                                        <h4 className="text-xl font-bold font-heading text-center text-primary-dark mb-6">Ingresos</h4>
                                        <div className="h-64">
                                            {summaryData.filter(d => d.income > 0).length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie 
                                                            data={summaryData.filter(d => d.income > 0).sort((a,b) => b.income - a.income)} 
                                                            dataKey="income" 
                                                            nameKey="concept" 
                                                            cx="50%" cy="50%" 
                                                            innerRadius={50} outerRadius={90} 
                                                            paddingAngle={2}
                                                        >
                                                            {summaryData.filter(d => d.income > 0).sort((a,b) => b.income - a.income).map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-neutral-400 text-sm">Sin ingresos</div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Gastos - Barras */}
                                    <div className="bg-white p-6 rounded-3xl border border-light-beige shadow-sm lg:col-span-2">
                                        <h4 className="text-xl font-bold font-heading text-center text-primary-dark mb-6">Gastos por Concepto</h4>
                                        <div className="h-[280px]">
                                            {summaryData.filter(d => d.expense > 0).length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={summaryData.filter(d => d.expense > 0).sort((a,b) => b.expense - a.expense)} margin={{ top: 10, right: 30, left: 10, bottom: 65 }}>
                                                        <defs>
                                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={1}/>
                                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                        <XAxis dataKey="concept" angle={-45} textAnchor="end" height={60} tick={{fontSize: 9, fill: '#6B7280', fontWeight: 'bold'}} interval={0} />
                                                        <YAxis tickFormatter={(val) => `$${val}`} tick={{fontSize: 11, fill: '#6B7280'}} width={80} />
                                                        <Tooltip 
                                                            formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} 
                                                            cursor={{fill: '#f3f4f6'}}
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                        />
                                                        <Bar dataKey="expense" radius={[6, 6, 0, 0]} fill="url(#colorExpense)">
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-neutral-400 text-sm">Sin gastos</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Gastos - Dona Gigante */}
                                <div className="bg-white p-8 rounded-3xl border border-light-beige shadow-sm mb-12 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-accent-light"></div>
                                    <h4 className="text-3xl font-bold font-heading text-center text-primary-dark mt-4 mb-1">Gastos</h4>
                                    <p className="text-center text-neutral-500 text-sm mb-8 font-medium">Distribución porcentual de los gastos en el mes</p>
                                    
                                    <div className="h-[450px]">
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
                                            <div className="h-full flex items-center justify-center text-neutral-400 text-sm">Sin gastos registrados</div>
                                        )}
                                    </div>
                                    
                                    {/* Centro decorativo de la dona */}
                                    <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center -mt-4 pointer-events-none">
                                        <span className="text-neutral-400 text-sm uppercase tracking-widest font-bold">Total Gastos</span>
                                        <span className="text-3xl font-heading font-extrabold text-[#ef4444] mt-1">
                                            ${summaryData.reduce((a, b) => a + b.expense, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {/* Tabla de Resumen por Concepto */}
                        <div className="border-t-[3px] border-b-[3px] border-[#4a7c82] overflow-hidden rounded-md shadow-sm mb-12">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#4a7c82] text-white">
                                        <th className="p-3 font-extrabold tracking-wider border-r border-[#3d686d] text-sm">Concepto</th>
                                        <th className="p-3 font-extrabold tracking-wider border-r border-[#3d686d] text-sm text-right w-32">SUM de Ingreso</th>
                                        <th className="p-3 font-extrabold tracking-wider text-sm text-right w-32">SUM de Gasto</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {summaryData.length > 0 ? summaryData.map((row) => (
                                        <tr key={row.concept} className="hover:bg-neutral-50 font-bold border-b border-neutral-200">
                                            <td className="py-1 px-3 border-r border-neutral-200 text-sm text-neutral-700 uppercase">{row.concept}</td>
                                            <td className="py-1 px-3 border-r border-neutral-200 text-sm text-right text-gray-800">
                                                <div className="flex justify-between">
                                                    <span className="text-neutral-400 font-normal">$</span>
                                                    <span>{row.income > 0 ? row.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</span>
                                                </div>
                                            </td>
                                            <td className="py-1 px-3 text-sm text-right text-gray-800">
                                                <div className="flex justify-between">
                                                    <span className="text-neutral-400 font-normal">$</span>
                                                    <span>{row.expense > 0 ? row.expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-neutral-400 font-normal">No hay movimientos en este mes.</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-[#e2e8f0] border-t-[3px] border-double border-neutral-800 font-extrabold">
                                        <td className="p-3 border-r border-neutral-300 text-sm uppercase">Suma total</td>
                                        <td className="p-3 border-r border-neutral-300 text-sm text-right text-gray-900">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-500 font-normal">$</span>
                                                <span>{summaryData.reduce((acc, row) => acc + row.income, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-sm text-right text-gray-900">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-500 font-normal">$</span>
                                                <span>{summaryData.reduce((acc, row) => acc + row.expense, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="bg-white">
                                        <td className="p-2 border-r border-neutral-200"></td>
                                        <td className="p-2 border-r border-neutral-200"></td>
                                        <td className="p-2 text-sm text-right font-extrabold text-neutral-800 flex justify-between">
                                            <span className="text-neutral-500 font-normal">$</span>
                                            <span>
                                                {(summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                    </div>
                ) : viewMode === 'budget' ? (
                    <div className="p-8 max-w-7xl mx-auto animate-fade-in delay-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold font-heading text-primary-dark uppercase tracking-wider">
                                Control de Presupuesto
                            </h3>
                            <Button 
                                outline={!isEditingBudget}
                                primary={isEditingBudget}
                                className="text-sm py-2 px-6 flex items-center gap-2"
                                onClick={() => setIsEditingBudget(!isEditingBudget)}
                            >
                                {isEditingBudget ? 'Finalizar Edición' : 'Editar Presupuestos'}
                            </Button>
                        </div>

                        {isEditingBudget && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-sm flex gap-3">
                                <TrendingUp className="text-blue-500 shrink-0" size={20} />
                                <p>Modifica los valores en la columna <strong>Presupuesto Objetivo</strong>. Los cambios se guardan automáticamente al terminar de escribir.</p>
                            </div>
                        )}

                        <div className="border border-neutral-200 overflow-hidden rounded-2xl shadow-sm bg-white">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-neutral-800 text-white">
                                        <th className="p-4 font-bold tracking-wider text-xs uppercase border-r border-neutral-700">Concepto</th>
                                        <th className="p-4 font-bold tracking-wider text-xs uppercase border-r border-neutral-700 text-right w-48">Presupuesto Objetivo</th>
                                        <th className="p-4 font-bold tracking-wider text-xs uppercase border-r border-neutral-700 text-right w-48">Gasto Real ({uniqueMonths.find(m => m.value === selectedMonth)?.label || 'Mes'})</th>
                                        <th className="p-4 font-bold tracking-wider text-xs uppercase text-right w-48">Diferencia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {budgetData.length > 0 ? budgetData.map((row) => (
                                        <tr key={row.concept} className="hover:bg-neutral-50 transition-colors">
                                            <td className="p-4 font-bold text-sm text-neutral-700 uppercase">{row.concept}</td>
                                            <td className="p-4 border-l border-neutral-100 bg-neutral-50/30">
                                                {isEditingBudget ? (
                                                    <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-lg px-2 py-1 shadow-sm focus-within:border-accent transition-all">
                                                        <span className="text-neutral-400 text-xs">$</span>
                                                        <input 
                                                            type="number"
                                                            defaultValue={row.avgBudget}
                                                            onBlur={(e) => handleSaveBudget(row.concept, Number(e.target.value))}
                                                            className="w-full text-right outline-none text-sm font-bold text-primary-dark"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between text-sm font-bold text-gray-600">
                                                        <span className="text-neutral-400 font-normal">$</span>
                                                        <span>{row.avgBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-right border-l border-neutral-100">
                                                <div className="flex justify-between text-sm font-bold text-red-600">
                                                    <span className="text-neutral-400 font-normal">$</span>
                                                    <span>{row.currentExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            </td>
                                            <td className={`p-4 text-right border-l border-neutral-100 font-black text-sm ${row.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                <div className="flex justify-between">
                                                    <span className="text-neutral-400 font-normal">$</span>
                                                    <span>{row.difference.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-neutral-400 italic">No hay suficientes datos para mostrar el control de presupuesto.</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-neutral-50 font-extrabold border-t-2 border-neutral-200">
                                    <tr>
                                        <td className="p-4 text-xs uppercase text-right tracking-widest text-neutral-500">Totales Globales</td>
                                        <td className="p-4 text-right text-gray-900 border-l border-neutral-200">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400 font-normal">$</span>
                                                <span>{budgetData.reduce((acc, row) => acc + row.avgBudget, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-red-700 border-l border-neutral-200">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400 font-normal">$</span>
                                                <span>{budgetData.reduce((acc, row) => acc + row.currentExpense, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </td>
                                        <td className={`p-4 text-right border-l border-neutral-200 text-sm ${budgetData.reduce((acc, row) => acc + row.difference, 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-400 font-normal">$</span>
                                                <span>{budgetData.reduce((acc, row) => acc + row.difference, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                ) : viewMode === 'balances' ? (
                    <div className="p-8 max-w-7xl mx-auto animate-fade-in delay-100">
                        {selectedMonth && (
                            <h3 className="text-2xl font-bold font-heading text-center text-primary-dark mb-10 capitalize decoration-accent underline underline-offset-8">
                                {uniqueMonths.find(m => m.value === selectedMonth)?.label}
                            </h3>
                        )}
                        {/* Tabla Balance por Forma de Pago */}
                        {paymentBalancesData.length > 0 && (
                            <div className="bg-white overflow-hidden rounded-md shadow-sm border border-neutral-200">
                                <h4 className="text-xl font-bold text-center text-primary-dark p-6 bg-neutral-50 border-b border-light-beige">
                                    Control de Efectivo por Cuenta
                                </h4>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-neutral-100 text-neutral-600 uppercase text-xs tracking-wider">
                                            <th className="p-4 border-b border-neutral-200 font-bold whitespace-nowrap">Forma de Pago</th>
                                            <th className="p-4 border-b border-neutral-200 font-bold text-right whitespace-nowrap">Saldo Inicial</th>
                                            <th className="p-4 border-b border-neutral-200 font-bold text-right whitespace-nowrap">Ingresos</th>
                                            <th className="p-4 border-b border-neutral-200 font-bold text-right whitespace-nowrap">Gastos</th>
                                            <th className="p-4 border-b border-neutral-200 font-bold text-right whitespace-nowrap">Saldo Final</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {paymentBalancesData.map((row) => (
                                            <tr key={row.method} className="hover:bg-neutral-50 transition-colors">
                                                <td className="p-4 font-bold text-primary-dark text-sm">{row.method}</td>
                                                <td className="p-4 text-right text-sm text-neutral-600">
                                                    <span className="opacity-50 font-normal mr-1">$</span>
                                                    {row.initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4 text-right text-sm text-green-600 font-medium">
                                                    {row.income > 0 ? <><span className="opacity-50 font-normal mr-1">$</span>{row.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</> : '-'}
                                                </td>
                                                <td className="p-4 text-right text-sm text-red-600 font-medium">
                                                    {row.expense > 0 ? <><span className="opacity-50 font-normal mr-1">$</span>{row.expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</> : '-'}
                                                </td>
                                                <td className={`p-4 text-right text-sm font-bold ${row.finalBalance < 0 ? 'text-red-600' : 'text-primary-dark'}`}>
                                                    <span className="opacity-50 font-normal mr-1">$</span>
                                                    {row.finalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-[#f8f9fa] border-t-[3px] border-double border-neutral-800">
                                        <tr>
                                            <td className="p-4 font-black text-primary-dark text-sm uppercase text-right">Totales Acumulados</td>
                                            <td className="p-4 text-right font-black text-neutral-700 text-sm">
                                                <span className="opacity-50 font-normal mr-1">$</span>
                                                {paymentBalancesData.reduce((acc, r) => acc + r.initialBalance, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 text-right font-black text-green-600 text-sm">
                                                <span className="opacity-50 font-normal mr-1">$</span>
                                                {paymentBalancesData.reduce((acc, r) => acc + r.income, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 text-right font-black text-red-600 text-sm">
                                                <span className="opacity-50 font-normal mr-1">$</span>
                                                {paymentBalancesData.reduce((acc, r) => acc + r.expense, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 text-right font-black text-primary-dark text-sm">
                                                <span className="opacity-50 font-normal mr-1">$</span>
                                                {paymentBalancesData.reduce((acc, r) => acc + r.finalBalance, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
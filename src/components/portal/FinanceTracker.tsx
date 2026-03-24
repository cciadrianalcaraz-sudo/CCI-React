import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Search, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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
    const [viewMode, setViewMode] = useState<'detailed' | 'summary'>('detailed');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [uniqueMonths, setUniqueMonths] = useState<{label: string, value: string}[]>([]);
    const [summaryData, setSummaryData] = useState<{concept: string, income: number, expense: number}[]>([]);
    
    // Form state
    const [concept, setConcept] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [provider, setProvider] = useState('');
    const [income, setIncome] = useState<number | ''>('');
    const [expense, setExpense] = useState<number | ''>('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadRecords();
    }, [user.id]);

    const loadRecords = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('finance_records')
                .select('*')
                .order('date', { ascending: true })
                .order('created_at', { ascending: true }); // chronological order

            if (error) throw error;
            if (data) setRecords(data as FinanceRecord[]);
        } catch (error) {
            console.error("Error loading finance records:", error);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique months and pivot table data
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
        
        setUniqueMonths(formattedMonths);
        
        // Auto-select the most recent month initially if none selected
        if (!selectedMonth && formattedMonths.length > 0) {
            setSelectedMonth(formattedMonths[0].value);
        }
    }, [records]);

    useEffect(() => {
        if (!selectedMonth) return;
        
        const filteredRecords = records.filter(r => r.date.startsWith(selectedMonth));
        
        const grouped = filteredRecords.reduce((acc, curr) => {
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
    }, [records, selectedMonth]);

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const numIncome = Number(income) || 0;
            const numExpense = Number(expense) || 0;

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

            if (data) {
                // To keep correct chronological sorting calculate balance properly
                loadRecords();
                resetForm();
                setIsFormOpen(false);
            }
        } catch (error) {
            console.error("Error adding record:", error);
            alert("Hubo un error al guardar el registro.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;
        try {
            const { error } = await supabase
                .from('finance_records')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

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
    };

    // Calculate running balance based on chronological order
    let runningBalance = 0;
    const recordsWithBalance = records.map(record => {
        runningBalance = runningBalance + Number(record.income) - Number(record.expense);
        return {
            ...record,
            balance: runningBalance
        };
    });

    return (
        <div className="bg-white rounded-[2rem] border border-light-beige shadow-sm overflow-hidden animate-fade-in">
            <div className="p-8 border-b border-light-beige flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-primary-dark">Registro de Finanzas Personales</h2>
                    <p className="text-sm text-neutral-500 mt-1">Control de ingresos, gastos y saldo al día.</p>
                </div>
                <div className="flex items-center gap-3">
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
                    
                    {/* Listas sugeridas (Dropdowns / Autocomplete) */}
                    <datalist id="concept-options">
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
                        <option value="CPM" />
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
                            <Button outline type="button" onClick={() => setIsFormOpen(false)} className="text-sm py-2">Cancelar</Button>
                            <Button primary type="submit" className="text-sm py-2">Guardar Registro</Button>
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
                </div>
                
                {viewMode === 'summary' && uniqueMonths.length > 0 && (
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
                ) : recordsWithBalance.length === 0 ? (
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
                            {recordsWithBalance.map((record, index) => (
                                <tr key={record.id} className="hover:bg-[#faf7f2]/50 transition-colors text-sm text-neutral-700">
                                    <td className="p-4 whitespace-nowrap text-neutral-400 font-medium">{index + 1}</td>
                                    <td className="p-4 whitespace-nowrap font-medium text-primary-dark">{record.concept}</td>
                                    <td className="p-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className="bg-neutral-100 px-2 py-1 rounded text-xs">{record.payment_method}</span>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">{record.provider}</td>
                                    <td className="p-4 text-right whitespace-nowrap text-green-600 font-medium">
                                        {Number(record.income) > 0 ? `$${Number(record.income).toFixed(2)}` : '-'}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-red-600 font-medium">
                                        {Number(record.expense) > 0 ? `$${Number(record.expense).toFixed(2)}` : '-'}
                                    </td>
                                    <td className={`p-4 text-right whitespace-nowrap font-bold ${Number(record.balance) < 0 ? 'text-red-600' : 'text-primary-dark'}`}>
                                        ${Number(record.balance).toFixed(2)}
                                    </td>
                                    <td className="p-4 break-words min-w-[200px] text-xs leading-relaxed text-neutral-500">
                                        {record.description}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => handleDelete(record.id)}
                                            className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-neutral-50/50">
                            <tr>
                                <td colSpan={5} className="p-4 text-right font-bold text-primary-dark text-sm uppercase">Total</td>
                                <td className="p-4 text-right font-bold text-green-600">
                                    ${recordsWithBalance.reduce((acc, curr) => acc + Number(curr.income), 0).toFixed(2)}
                                </td>
                                <td className="p-4 text-right font-bold text-red-600">
                                    ${recordsWithBalance.reduce((acc, curr) => acc + Number(curr.expense), 0).toFixed(2)}
                                </td>
                                <td className="p-4 text-right font-bold text-primary-dark">
                                    ${runningBalance.toFixed(2)}
                                </td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    </table>
                ) : (
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
                        
                        <div className="border-t-[3px] border-b-[3px] border-[#4a7c82] overflow-hidden rounded-md shadow-sm">
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
                )}
            </div>
        </div>
    );
}

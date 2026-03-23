import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Search } from 'lucide-react';
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
                        <option value="FIESTA ANGELITO" />
                        <option value="ALIMENTOS" />
                        <option value="DESPENSA" />
                        <option value="NÓMINA" />
                        <option value="SERVICIOS BÁSICOS" />
                        <option value="TRANSPORTE / GASOLINA" />
                        <option value="RENTA" />
                        <option value="HONORARIOS" />
                    </datalist>

                    <datalist id="payment-options">
                        <option value="Efectivo Laura" />
                        <option value="TD Str Adrian" />
                        <option value="TD Str Laura" />
                        <option value="Transferencia" />
                        <option value="Tarjeta de Crédito" />
                        <option value="Tarjeta de Débito" />
                        <option value="Efectivo" />
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

            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                    </div>
                ) : recordsWithBalance.length > 0 ? (
                    <table className="w-full text-left border-collapse">
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
                    <div className="p-12 text-center text-neutral-400">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary/30">
                                <Search size={24} />
                            </div>
                        </div>
                        <p className="font-bold text-primary-dark mb-1">Sin registros financieros</p>
                        <p className="text-sm">Comienza agregando tu primer movimiento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { Plus, TrendingDown, DollarSign, Trash2 } from 'lucide-react';
import Button from '../../ui/Button';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../hooks/useConfirm';
import type { FinanceCredit, FinanceRecord, PaymentMethod } from '../../../types/finance';
import { formatDate } from '../../../utils/financeUtils';

interface CreditTrackerProps {
    userId: string;
    credits: FinanceCredit[];
    records: FinanceRecord[];
    paymentMethods: PaymentMethod[];
    onRefreshCredits: () => void;
    onRefreshRecords: () => void;
}

const CreditTracker: React.FC<CreditTrackerProps> = ({ 
    userId, 
    credits, 
    records, 
    paymentMethods, 
    onRefreshCredits, 
    onRefreshRecords 
}) => {
    const { confirm, ConfirmModal } = useConfirm();

    // Credit Tracker states
    const [isCreditFormOpen, setIsCreditFormOpen] = useState(false);
    const [creditName, setCreditName] = useState('');
    const [creditInitialBalance, setCreditInitialBalance] = useState<number | ''>('');
    const [creditAnnualRate, setCreditAnnualRate] = useState<number | ''>('');
    const [creditStartDate, setCreditStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSavingCredit, setIsSavingCredit] = useState(false);

    // Credit Payment Form states
    const [isCreditPaymentFormOpen, setIsCreditPaymentFormOpen] = useState(false);
    const [activeCreditForPayment, setActiveCreditForPayment] = useState<FinanceCredit | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [creditPaymentMethod, setCreditPaymentMethod] = useState('');
    const [isSavingPayment, setIsSavingPayment] = useState(false);

    const handleSaveCredit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingCredit(true);
        try {
            const { error } = await supabase
                .from('finance_credits')
                .insert([{
                    user_id: userId,
                    name: creditName,
                    initial_balance: Number(creditInitialBalance),
                    annual_rate: Number(creditAnnualRate),
                    start_date: creditStartDate
                }]);

            if (error) throw error;
            onRefreshCredits();
            setCreditName('');
            setCreditInitialBalance('');
            setCreditAnnualRate('');
            setCreditStartDate(new Date().toISOString().split('T')[0]);
            setIsCreditFormOpen(false);
            toast.success('Crédito registrado correctamente.');
        } catch (error) {
            console.error('Error saving credit:', error);
            toast.error('Error al guardar el crédito.');
        } finally {
            setIsSavingCredit(false);
        }
    };

    const handleDeleteCredit = async (id: string) => {
        const ok = await confirm({
            title: 'Eliminar Crédito',
            message: '¿Seguro que quieres eliminar este crédito? Se perderá todo su historial de cálculo.',
            confirmLabel: 'Eliminar',
            danger: true,
        });
        if (!ok) return;
        try {
            const { error } = await supabase
                .from('finance_credits')
                .delete()
                .eq('id', id);

            if (error) throw error;
            onRefreshCredits();
            toast.success('Crédito eliminado correctamente.');
        } catch (error) {
            console.error('Error deleting credit:', error);
            toast.error('No se pudo eliminar el crédito.');
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
                    user_id: userId,
                    concept: `PAGO CAPITAL: ${activeCreditForPayment.name.toUpperCase()}`,
                    date: paymentDate,
                    payment_method: creditPaymentMethod || 'Transferencia',
                    provider: 'Banco',
                    income: 0,
                    expense: Number(paymentAmount),
                    description: `Abono directo a capital: ${activeCreditForPayment.name}`,
                    expense_type: 'Deuda' // Automatically set to Deuda for payments
                }]);

            if (error) throw error;
            
            onRefreshRecords();
            setIsCreditPaymentFormOpen(false);
            setPaymentAmount('');
            setActiveCreditForPayment(null);
            toast.success(`Pago de $${Number(paymentAmount).toLocaleString()} registrado.`);
        } catch (error) {
            console.error('Error saving credit payment:', error);
            toast.error('No se pudo registrar el pago.');
        } finally {
            setIsSavingPayment(false);
        }
    };

    return (
        <div className="p-8 space-y-10 animate-fade-in text-[var(--text-primary)] w-full max-w-7xl mx-auto">
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
                        <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-4 pt-4 border-t border-[var(--border-color)] dark:border-white/5">
                            <Button outline type="button" onClick={() => setIsCreditFormOpen(false)}>Cancelar</Button>
                            <Button primary type="submit" loading={isSavingCredit}>Guardar Crédito</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {credits.length === 0 && !isCreditFormOpen && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-[var(--border-color)] dark:border-white/10 rounded-[3rem]">
                        <div className="w-20 h-20 bg-[var(--bg-main)] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300">
                            <TrendingDown size={40} />
                        </div>
                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">No tienes créditos registrados</p>
                        <p className="text-xs text-neutral-400/60 mt-2">Usa el botón superior para añadir tu primer compromiso financiero.</p>
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
                        <div key={credit.id} className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => {
                                        setActiveCreditForPayment(credit);
                                        setIsCreditPaymentFormOpen(true);
                                    }}
                                    className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm"
                                    title="Abonar a Capital"
                                >
                                    <DollarSign size={18} />
                                </button>
                                <button onClick={() => handleDeleteCredit(credit.id)} className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
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
                                        <div className="w-1 h-1 rounded-full bg-neutral-200 dark:bg-white/10"></div>
                                        <span className="text-[10px] font-bold text-neutral-400">Inicio: {formatDate(credit.start_date)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="bg-[var(--bg-main)] dark:bg-white/5 p-6 rounded-[2rem] border border-[var(--border-color)] dark:border-white/5">
                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2">Saldo al Día</p>
                                    <p className="text-3xl font-black text-primary-dark tracking-tighter">${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="bg-orange-500/10 dark:bg-orange-500/5 p-6 rounded-[2rem] border border-orange-500/20 flex flex-col justify-center">
                                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">Costo del Dinero</p>
                                    <p className="text-xl font-black text-primary-dark tracking-tight mb-1">${interestSinceLastPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    <p className="text-[8px] text-orange-600/70 font-bold uppercase tracking-tighter">Intereses acumulados</p>
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
                                <div className="w-full h-4 bg-[var(--bg-main)] dark:bg-white/5 rounded-full border border-[var(--border-color)] dark:border-white/5 overflow-hidden p-1 shadow-inner">
                                    <div 
                                        className="h-full bg-gradient-to-r from-primary-dark to-accent rounded-full transition-all duration-1000 relative" 
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute top-0 right-0 w-full h-full bg-white/20 animate-pulse-subtle"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-[var(--border-color)] dark:border-white/10 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Monto Original</p>
                                    <p className="text-sm font-bold text-neutral-500">${credit.initial_balance.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Abonado</p>
                                    <p className="text-sm font-black text-green-500">${totalPaid.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CREDIT PAYMENT MODAL */}
            {isCreditPaymentFormOpen && activeCreditForPayment && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in text-[var(--text-primary)]">
                    <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setIsCreditPaymentFormOpen(false)}></div>
                    <div className="bg-[var(--bg-card)] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-scale-in border border-[var(--border-color)]">
                        <h4 className="text-xl font-black mb-2 flex items-center gap-3">
                            <Plus size={24} className="text-accent" /> Registrar Abono
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
                                    className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-lg font-black outline-none focus:border-accent" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Fecha del Movimiento</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={paymentDate} 
                                    onChange={e => setPaymentDate(e.target.value)} 
                                    className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-accent" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Forma de Pago (Origen)</label>
                                <div className="relative">
                                    <select 
                                        required 
                                        value={creditPaymentMethod} 
                                        onChange={e => setCreditPaymentMethod(e.target.value)} 
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-accent appearance-none cursor-pointer" 
                                    >
                                        <option value="">Selecciona cuenta origen...</option>
                                        {paymentMethods.map((pm) => (
                                            <option key={pm.id} value={pm.name}>{pm.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"><TrendingDown size={14} /></div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4 border-t border-[var(--border-color)] dark:border-white/5">
                                <Button outline className="flex-1 py-4" onClick={() => setIsCreditPaymentFormOpen(false)}>Cancelar</Button>
                                <Button primary className="flex-1 py-4 shadow-lg shadow-accent/20" type="submit" loading={isSavingPayment}>Confirmar Pago</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {ConfirmModal}
        </div>
    );
};

export default CreditTracker;

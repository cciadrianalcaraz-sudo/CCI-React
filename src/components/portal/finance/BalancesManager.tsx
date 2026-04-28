import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Edit2, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import Button from '../../ui/Button';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../hooks/useConfirm';
import SavingsGoalsManager from './SavingsGoalsManager';

interface BalancesManagerProps {
    user: { id: string; [key: string]: unknown };
    companyIds: string[];
    records: any[];
    goals: any[];
    savedPaymentMethods: any[];
    paymentBalancesData: any[];
    selectedMonth: string;
    uniqueMonths: { label: string; value: string }[];
    onRefresh: () => void;
}

export default function BalancesManager({
    user,
    companyIds,
    records,
    goals,
    savedPaymentMethods,
    paymentBalancesData,
    selectedMonth,
    uniqueMonths,
    onRefresh
}: BalancesManagerProps) {
    const [accMgmtTab, setAccMgmtTab] = useState<'initial' | 'transfer' | 'accounts'>('initial');
    const [newAccountName, setNewAccountName] = useState('');
    const [initialBalanceAmount, setInitialBalanceAmount] = useState<number | ''>('');
    const [initialBalancePM, setInitialBalancePM] = useState('');
    const [initialBalanceDate, setInitialBalanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [transferAmount, setTransferAmount] = useState<number | ''>('');
    const [transferOrigin, setTransferOrigin] = useState('');
    const [transferDest, setTransferDest] = useState('');
    const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
    const [transferDesc, setTransferDesc] = useState('');

    const [reassignModal, setReassignModal] = useState<{ method: string; count: number } | null>(null);
    const [reassignTarget, setReassignTarget] = useState('');
    const [isReassigning, setIsReassigning] = useState(false);

    const { confirm, ConfirmModal } = useConfirm();

    const handleSavePaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAccountName.trim()) return;
        try {
            const { error } = await supabase
                .from('finance_payment_methods')
                .insert([{ user_id: user.id, name: newAccountName.trim().toUpperCase() }]);
            if (error) throw error;
            setNewAccountName('');
            onRefresh();
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
            onRefresh();
            toast.success(`Cuenta "${name}" eliminada.`);
        } catch (error) {
            console.error('Error deleting payment method:', error);
            toast.error('No se pudo eliminar la cuenta.');
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
            onRefresh();
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
            onRefresh();
            toast.success('Traspaso registrado correctamente.');
        } catch (error) {
            console.error('Error creating transfer:', error);
            toast.error(`No se pudo realizar el traspaso: ${(error as any).message}`);
        }
    };

    const handleDeleteAccount = async (method: string) => {
        const recordsCount = records.filter(r => r.payment_method === method).length;
        const ok = await confirm({
            title: `Eliminar Cuenta: ${method}`,
            message: `¿Seguro que deseas eliminar esta cuenta? Se eliminarán permanentemente los ${recordsCount} registros asociados a ella. Esta acción no se puede deshacer.`,
            confirmLabel: 'Eliminar Todo',
            danger: true
        });
        if (!ok) return;

        try {
            const { error } = await supabase
                .from('finance_records')
                .delete()
                .eq('payment_method', method);
            
            if (error) throw error;
            toast.success(`Cuenta ${method} y sus registros eliminados.`);
            onRefresh();
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('No se pudo eliminar la cuenta.');
        }
    };

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
                    <div className="overflow-x-auto custom-scrollbar pb-4">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] dark:border-white/10">
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest opacity-40">Cuenta</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest opacity-40 text-right">Inicial</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest opacity-40 text-right">Entradas</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest opacity-40 text-right">Salidas</th>
                                    <th className="p-5 font-black text-[10px] uppercase tracking-widest text-right">Final</th>
                                    <th className="p-5 text-center font-black text-[10px] uppercase tracking-widest opacity-40">Acciones</th>
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
                                        <td className="p-5 text-center flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    const count = records.filter(r => r.payment_method === row.method).length;
                                                    setReassignModal({ method: row.method, count });
                                                    setReassignTarget('');
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-amber-500 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all"
                                                title={`Reasignar / Modificar cuenta ${row.method}`}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteAccount(row.method)}
                                                className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                                                title={`Eliminar cuenta ${row.method} y sus registros`}
                                            >
                                                <Trash2 size={14} />
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
                                            onRefresh();
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

            <SavingsGoalsManager user={user} goals={goals} onRefresh={onRefresh} />
            
            {ConfirmModal}
        </div>
    );
}

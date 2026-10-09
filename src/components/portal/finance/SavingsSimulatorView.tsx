import React, { useState, useMemo, useRef, useCallback } from 'react';
import type { FinanceRecord, FinanceGoal, PaymentMethod } from '../../../types/finance';
import { supabase } from '../../../lib/supabase';
import { Target, Plus, Vault, Sparkles, TrendingUp, X, List, ArrowDownToLine, Wallet, GripVertical, CheckCircle2 } from 'lucide-react';
import { toast } from '../../../lib/toast';

interface SavingsSimulatorViewProps {
    records: FinanceRecord[];
    goals: FinanceGoal[];
    paymentMethods: PaymentMethod[];
    userId: string;
    onRefreshGoals: () => Promise<void> | void;
    onRefreshRecords: () => Promise<void> | void;
}

const CircularProgress = ({ value, label, size = 120, strokeWidth = 8, color = 'emerald' }: { value: number, label?: string, size?: number, strokeWidth?: number, color?: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    
    const colorStops = color === 'amber' ? ['#f59e0b', '#d97706'] : 
                       color === 'sky' ? ['#0ea5e9', '#0284c7'] : 
                       color === 'rose' ? ['#f43f5e', '#e11d48'] :
                       ['#10b981', '#059669'];

    return (
        <div className="relative inline-flex items-center justify-center group" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <defs>
                    <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colorStops[0]} />
                        <stop offset="100%" stopColor={colorStops[1]} />
                    </linearGradient>
                </defs>
                <circle cx={size / 2} cy={size / 2} r={radius} className="stroke-black/5 dark:stroke-white/5" fill="none" strokeWidth={strokeWidth} />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} stroke={`url(#grad-${color})`} strokeDasharray={circumference} strokeDashoffset={offset}  strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-800 dark:text-white">{Math.round(value)}%</span>
                {label && <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{label}</span>}
            </div>
        </div>
    );
};

export default function SavingsSimulatorView({ records, goals, paymentMethods, userId, onRefreshGoals, onRefreshRecords }: SavingsSimulatorViewProps) {
    const [isCreatingGoal, setIsCreatingGoal] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [isFundingGoal, setIsFundingGoal] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Drag & Drop state
    const [draggingRecordId, setDraggingRecordId] = useState<string | null>(null);
    const [dragOverGoalId, setDragOverGoalId] = useState<string | null>(null);
    const [assignedRecordIds, setAssignedRecordIds] = useState<Set<string>>(new Set());
    const [droppingGoalId, setDroppingGoalId] = useState<string | null>(null);
    const dragRecordRef = useRef<FinanceRecord | null>(null);

    // Formularios
    const [newGoalData, setNewGoalData] = useState({ name: '', target: '', color: 'emerald' });
    const [fundAmount, setFundAmount] = useState('');
    const [withdrawData, setWithdrawData] = useState({ amount: '', goalId: 'general', destinationMethod: '', notes: '' });

    // Historial real filtrado (excluye ya asignados)
    const savingsRecords = useMemo(() => {
        return records.filter(r => {
            if (assignedRecordIds.has(r.id)) return false;
            const type = (r.expense_type || '').toUpperCase();
            const concept = (r.concept || '').toUpperCase();
            return (type === 'AHORRO' || concept.includes('AHORRO') || type === 'RETIRO AHORRO' || concept.includes('RETIRO AHORRO'));
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [records, assignedRecordIds]);

    // Cálculo puro con redondeo preciso para evitar imprecisiones de punto flotante
    const totalSaved = useMemo(() => {
        const sum = records.filter(r => {
            const type = (r.expense_type || '').toUpperCase();
            const concept = (r.concept || '').toUpperCase();
            return (type === 'AHORRO' || concept.includes('AHORRO') || type === 'RETIRO AHORRO' || concept.includes('RETIRO AHORRO'));
        }).reduce((acc, r) => {
            const isRetiro = (r.concept || '').toUpperCase().includes('RETIRO') || (r.expense_type || '').toUpperCase().includes('RETIRO');
            const amount = Math.max(Number(r.income) || 0, Number(r.expense) || 0);
            return isRetiro ? acc - amount : acc + amount;
        }, 0);
        return Math.round((sum + Number.EPSILON) * 100) / 100;
    }, [records]);

    const totalAllocated = useMemo(() => {
        const sum = goals.reduce((acc, g) => acc + (Number(g.current_amount) || 0), 0);
        return Math.round((sum + Number.EPSILON) * 100) / 100;
    }, [goals]);

    const unallocated = useMemo(() => {
        const diff = totalSaved - totalAllocated;
        return diff <= 0.009 ? 0 : Math.round((diff + Number.EPSILON) * 100) / 100;
    }, [totalSaved, totalAllocated]);

    // === DRAG & DROP HANDLERS ===
    const handleDragStart = useCallback((e: React.DragEvent, record: FinanceRecord) => {
        setDraggingRecordId(record.id);
        dragRecordRef.current = record;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', record.id);
        // Custom drag image
        const el = e.currentTarget as HTMLElement;
        e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggingRecordId(null);
        setDragOverGoalId(null);
        dragRecordRef.current = null;
    }, []);

    const handleGoalDragOver = useCallback((e: React.DragEvent, goalId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverGoalId(goalId);
    }, []);

    const handleGoalDragLeave = useCallback(() => {
        setDragOverGoalId(null);
    }, []);

    const handleGoalDrop = useCallback(async (e: React.DragEvent, goal: FinanceGoal) => {
        e.preventDefault();
        setDragOverGoalId(null);
        
        const record = dragRecordRef.current;
        if (!record) return;

        const isRetiro = (record.concept || '').toUpperCase().includes('RETIRO') || (record.expense_type || '').toUpperCase().includes('RETIRO');
        if (isRetiro) {
            toast.error('No puedes asignar un retiro a una meta.');
            setDraggingRecordId(null);
            dragRecordRef.current = null;
            return;
        }

        const amount = Math.max(Number(record.income) || 0, Number(record.expense) || 0);
        if (amount <= 0) {
            toast.error('Este movimiento no tiene monto válido.');
            setDraggingRecordId(null);
            dragRecordRef.current = null;
            return;
        }

        // Optimistic UI: marcar como asignado
        setAssignedRecordIds(prev => new Set([...prev, record.id]));
        setDroppingGoalId(goal.id);
        setDraggingRecordId(null);
        dragRecordRef.current = null;

        try {
            const newAmount = Number(goal.current_amount) + amount;
            const { error } = await supabase
                .from('finance_goals')
                .update({ current_amount: newAmount })
                .eq('id', goal.id);

            if (error) throw error;

            toast.success(`+$${amount.toLocaleString()} asignado a "${goal.name}" ✓`);
            if (onRefreshGoals) await onRefreshGoals();
        } catch (err: any) {
            // Revertir en caso de error
            setAssignedRecordIds(prev => {
                const next = new Set(prev);
                next.delete(record.id);
                return next;
            });
            toast.error(`Error al asignar: ${err.message}`);
        } finally {
            setTimeout(() => setDroppingGoalId(null), 600);
        }
    }, [goals, onRefreshGoals]);

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const targetAmount = Number(newGoalData.target);
            if (!newGoalData.name || targetAmount <= 0) throw new Error('Datos inválidos');

            const { error } = await supabase.from('finance_goals').insert([{ user_id: userId, name: newGoalData.name, target_amount: targetAmount, current_amount: 0, color: newGoalData.color }]);
            if (error) throw error;
            toast.success('Meta creada con éxito.');
            setIsCreatingGoal(false);
            setNewGoalData({ name: '', target: '', color: 'emerald' });
            if (onRefreshGoals) await onRefreshGoals();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFundGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const amountToAdd = Number(fundAmount);
            if (amountToAdd <= 0) throw new Error('El monto a agregar debe ser mayor a 0');
            if (amountToAdd > unallocated) throw new Error('No tienes suficientes ahorros sin asignar.');

            const goalToUpdate = goals.find(g => g.id === isFundingGoal);
            if (!goalToUpdate) throw new Error('Meta no encontrada');

            const { error } = await supabase.from('finance_goals').update({ current_amount: Number(goalToUpdate.current_amount) + amountToAdd }).eq('id', goalToUpdate.id);
            if (error) throw error;
            toast.success('Fondos asignados exitosamente.');
            setIsFundingGoal(null);
            setFundAmount('');
            if (onRefreshGoals) await onRefreshGoals();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const amount = Number(withdrawData.amount);
            if (amount <= 0) throw new Error('Monto inválido para retirar');
            if (!withdrawData.destinationMethod) throw new Error('Selecciona un destino para los fondos');
            
            let conceptText = 'RETIRO AHORRO';
            
            if (withdrawData.goalId !== 'general') {
                 const goal = goals.find(g => g.id === withdrawData.goalId);
                 if (!goal) throw new Error('Meta no encontrada');
                 if (amount > Number(goal.current_amount)) throw new Error(`El fondo de '${goal.name}' no tiene fondos suficientes.`);
                 conceptText = `RETIRO AHORRO - ${goal.name.toUpperCase()}`;
                 
                 const {error: goalErr} = await supabase.from('finance_goals').update({ current_amount: Number(goal.current_amount) - amount }).eq('id', goal.id);
                 if (goalErr) throw goalErr;
            } else {
                 if (amount > unallocated) throw new Error('Los fondos generales sin asignar no son suficientes.');
            }

            const { error: recErr } = await supabase.from('finance_records').insert([{
                 user_id: userId,
                 concept: conceptText,
                 date: new Date().toISOString().split('T')[0],
                 payment_method: withdrawData.destinationMethod,
                 provider: 'Bóveda de Progreso (Propio)',
                 income: amount,
                 expense: 0,
                 description: withdrawData.notes || 'Disposición de fondos ahorrados',
                 expense_type: 'Retiro Ahorro'
            }]);

            if (recErr) throw recErr;
            
            toast.success('Retiro / Traspaso procesado correctamente');
            setIsWithdrawing(false);
            setWithdrawData({ amount: '', goalId: 'general', destinationMethod: '', notes: '' });
            if (onRefreshGoals) await onRefreshGoals();
            if (onRefreshRecords) await onRefreshRecords();

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDragging = draggingRecordId !== null;

    return (
        <div className="p-8 md:p-10 space-y-12 animate-fade-in relative pb-48">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            
            {/* Header: Bóveda Principal */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 w-full">
                <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                        <Vault size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Bóveda de Progreso</h2>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                            <Sparkles size={12} /> Gestiona y Dispón de tus Fondos
                        </p>
                    </div>
                </div>
                
                <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
                    {!isCreatingGoal && !isWithdrawing && (
                        <>
                            <button 
                                onClick={() => setIsWithdrawing(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-500/10 text-rose-500 px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-sm"
                            >
                                <ArrowDownToLine size={16} strokeWidth={3} /> Disponer Recursos
                            </button>
                            <button 
                                onClick={() => setIsCreatingGoal(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                <Plus size={16} strokeWidth={3} /> Nueva Meta
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Drag hint banner — only show when there IS balance to assign */}
            {savingsRecords.length > 0 && goals.length > 0 && unallocated > 0 && !isCreatingGoal && !isWithdrawing && (
                <div className="relative z-10 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-3 animate-fade-in">
                    <GripVertical size={16} className="text-emerald-500 flex-shrink-0" />
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        <span className="font-black">¡Tip!</span> Arrastra cualquier movimiento consolidador directamente hacia la meta de ahorro para asignarlo automáticamente.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                {/* Saldo Global e Historial (Izquierda) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white/5 dark:to-white/5 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl border border-slate-700/50 dark:border-white/10">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black text-emerald-400/80 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <TrendingUp size={14} /> Total Acumulado Real
                                </h3>
                                <div className="text-4xl md:text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
                                    ${totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="h-px bg-white/10 w-full" />
                            <div>
                                <h3 className="text-[10px] font-black text-sky-400/80 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <Target size={14} /> Disponible P/ Asignar
                                </h3>
                                <div className="text-3xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
                                    ${unallocated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Movimientos Consolidadores - Draggable */}
                    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                            <List size={14} className="text-emerald-500" /> Movimientos Consolidadores
                        </h3>

                        {/* When no unallocated balance: show fully-allocated state */}
                        {unallocated <= 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle2 size={24} className="text-emerald-500" />
                                </div>
                                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">Fondos 100% asignados</p>
                                <p className="text-[10px] text-slate-400 font-bold max-w-[200px] leading-relaxed">
                                    Todos tus ahorros están distribuidos en tus metas. ¡Excelente trabajo!
                                </p>
                            </div>
                        ) : savingsRecords.length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-4">
                                No hay movimientos de ahorro registrados.
                            </p>
                        ) : (
                            <>
                            <p className="text-[9px] text-slate-400 font-bold mb-4 flex items-center gap-1.5">
                                <GripVertical size={11} className="text-emerald-400" />
                                Arrastra hacia una meta para asignar
                            </p>
                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                {savingsRecords.map(r => {
                                    const isRetiro = (r.concept || '').toUpperCase().includes('RETIRO') || (r.expense_type || '').toUpperCase().includes('RETIRO');
                                    const amount = Math.max(Number(r.income) || 0, Number(r.expense) || 0);
                                    const isBeingDragged = draggingRecordId === r.id;
                                    const canDrag = !isRetiro && goals.length > 0 && unallocated > 0;

                                    return (
                                        <div
                                            key={r.id}
                                            draggable={canDrag}
                                            onDragStart={canDrag ? (e) => handleDragStart(e, r) : undefined}
                                            onDragEnd={handleDragEnd}
                                            className={`
                                                flex justify-between items-center border p-4 py-3 rounded-2xl
                                                transition-all duration-200 select-none
                                                ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                                                ${isBeingDragged
                                                    ? 'opacity-30 scale-95 border-emerald-400/50 bg-emerald-50 dark:bg-emerald-900/20'
                                                    : 'bg-white/50 dark:bg-white/5 border-slate-200/50 dark:border-white/5 hover:shadow-md hover:border-emerald-300/50 dark:hover:border-emerald-400/30 hover:-translate-y-0.5 group'
                                                }
                                            `}
                                        >
                                            {canDrag && (
                                                <div className="mr-2 text-slate-300 dark:text-white/20 group-hover:text-emerald-400 transition-colors flex-shrink-0">
                                                    <GripVertical size={14} />
                                                </div>
                                            )}
                                            <div className="truncate pr-4 flex-1">
                                                <div className="text-[11px] font-black text-slate-900 dark:text-white truncate">{r.concept || 'Sin Concepto'}</div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{r.date.split('T')[0]} • {r.payment_method}</div>
                                            </div>
                                            <div className={`font-mono font-black tabular-nums text-right text-sm flex-shrink-0 ${isRetiro ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {isRetiro ? '-' : '+'}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid de Metas o Formularios (Derecha) */}
                <div className="lg:col-span-7">
                    {isCreatingGoal ? (
                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-[3rem] shadow-xl animate-scale-in flex flex-col justify-center max-w-xl mx-auto mt-4">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-black text-slate-800 dark:text-white">Crear Nueva Meta</h3>
                                <button onClick={() => setIsCreatingGoal(false)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 bg-slate-100 dark:bg-white/5 rounded-full"><X size={16} strokeWidth={3} /></button>
                            </div>
                            <form onSubmit={handleCreateGoal} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nombre de la Meta (Ej. Viaje a Japón)</label>
                                    <input type="text" required value={newGoalData.name} onChange={e => setNewGoalData({...newGoalData, name: e.target.value})} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors" placeholder="Mi próxima aventura..." />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Monto Objetivo ($)</label>
                                    <input type="number" required min="1" value={newGoalData.target} onChange={e => setNewGoalData({...newGoalData, target: e.target.value})} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors tabular-nums" placeholder="50000" />
                                </div>
                                <div className="pt-2">
                                    <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-500 text-white rounded-xl py-4 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-md">
                                        {isSubmitting ? 'Guardando...' : 'Crear Meta'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : isWithdrawing ? (
                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-[3rem] shadow-xl animate-scale-in flex flex-col justify-center max-w-xl mx-auto mt-4">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-3">
                                    <ArrowDownToLine className="text-rose-500" size={24} /> Disponer de Ahorro
                                </h3>
                                <button onClick={() => setIsWithdrawing(false)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 bg-slate-100 dark:bg-white/5 rounded-full"><X size={16} strokeWidth={3} /></button>
                            </div>
                            
                            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 p-4 rounded-2xl mb-8 text-[11px] font-medium leading-relaxed">
                                Este proceso registrará un <strong className="font-bold">Ingreso Especial</strong> a la cuenta destino que elijas, descontando el recurso de tu total ahorrado. Todo matemáticamente exacto.
                            </div>

                            <form onSubmit={handleWithdraw} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Monto a retirar ($)</label>
                                    <input type="number" required min="1" value={withdrawData.amount} onChange={e => setWithdrawData({...withdrawData, amount: e.target.value})} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-xl font-black text-slate-900 dark:text-white outline-none focus:border-rose-500 transition-colors tabular-nums" placeholder="0.00" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Origen de los Fondos</label>
                                        <select required value={withdrawData.goalId} onChange={e => setWithdrawData({...withdrawData, goalId: e.target.value})} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-rose-500 transition-colors appearance-none cursor-pointer">
                                            <option value="general" className="text-slate-900 bg-white">Fondo Sin Asignar (${unallocated.toLocaleString()})</option>
                                            {goals.map(g => (
                                                <option key={g.id} value={g.id} className="text-slate-900 bg-white">Meta: {g.name} (${Number(g.current_amount).toLocaleString()})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Wallet size={12} /> Cuenta Destino</label>
                                        <select required value={withdrawData.destinationMethod} onChange={e => setWithdrawData({...withdrawData, destinationMethod: e.target.value})} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-rose-500 transition-colors appearance-none cursor-pointer">
                                            <option value="" disabled className="text-slate-900 bg-white">Seleccione destino...</option>
                                            {paymentMethods.length > 0 ? (
                                                paymentMethods.map(pm => (<option key={pm.id} value={pm.name} className="text-slate-900 bg-white">{pm.name}</option>))
                                            ) : (
                                                <>
                                                    <option value="EFECTIVO" className="text-slate-900 bg-white">EFECTIVO</option>
                                                    <option value="TARJETA DÉBITO" className="text-slate-900 bg-white">TARJETA DÉBITO</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button disabled={isSubmitting} type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl py-4 font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/20">
                                        {isSubmitting ? 'Procesando Retiro...' : 'Confirmar Retiro'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20">
                            {goals.length === 0 ? (
                                <div className="col-span-full border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center opacity-70">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400 mb-6"><Target size={32} /></div>
                                    <p className="font-black text-slate-900 dark:text-white mb-2 text-xl">Sin Metas Establecidas</p>
                                    <p className="text-sm font-bold text-slate-500 max-w-sm">Distribuye tus fondos y dale un propósito a cada esfuerzo de ahorro.</p>
                                </div>
                            ) : (
                                goals.map(goal => {
                                    const percent = goal.target_amount > 0 ? Math.min(100, Math.max(0, (goal.current_amount / goal.target_amount) * 100)) : 0;
                                    const isComplete = percent >= 100;
                                    const isDropTarget = dragOverGoalId === goal.id;
                                    const isFreshDrop = droppingGoalId === goal.id;

                                    return (
                                        <div
                                            key={goal.id}
                                            onDragOver={isDragging ? (e) => handleGoalDragOver(e, goal.id) : undefined}
                                            onDragLeave={isDragging ? handleGoalDragLeave : undefined}
                                            onDrop={isDragging ? (e) => handleGoalDrop(e, goal) : undefined}
                                            className={`
                                                backdrop-blur-xl border p-6 rounded-[2rem] shadow-sm transition-all duration-200 group relative overflow-hidden flex flex-col min-h-[300px]
                                                ${isDropTarget
                                                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-2xl shadow-emerald-500/20 scale-[1.03] ring-2 ring-emerald-400/50'
                                                    : isFreshDrop
                                                    ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                                                    : isDragging
                                                    ? 'border-dashed border-emerald-300/60 dark:border-emerald-400/30 bg-emerald-50/30 dark:bg-emerald-900/5 hover:border-emerald-400 hover:scale-[1.02]'
                                                    : 'bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:shadow-xl'
                                                }
                                            `}
                                        >
                                            {isComplete && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[40px] pointer-events-none rounded-full" />}
                                            
                                            {/* Drop overlay label */}
                                            {isDropTarget && (
                                                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none animate-fade-in">
                                                    <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center gap-2">
                                                        <CheckCircle2 size={18} />
                                                        Soltar aquí
                                                    </div>
                                                </div>
                                            )}

                                            {/* Drag indicator glow */}
                                            {isDragging && !isDropTarget && (
                                                <div className="absolute inset-0 border-2 border-dashed border-emerald-400/40 rounded-[2rem] pointer-events-none animate-pulse" />
                                            )}
                                            
                                            <div className="flex justify-between items-start mb-6 z-10 w-full relative">
                                                <div className="truncate w-full pr-4">
                                                    <h3 className="font-black text-slate-900 dark:text-white tracking-tight truncate w-full">{goal.name}</h3>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">
                                                        META: ${Number(goal.target_amount).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col items-center justify-center z-10">
                                                <CircularProgress value={percent} label={isComplete ? "Logrado" : "Progreso"} color={isComplete ? 'emerald' : goal.color || 'sky'} />
                                                <div className="mt-4 text-center">
                                                    <div className={`text-xl font-black tabular-nums tracking-tighter transition-all duration-500 ${isFreshDrop ? 'text-emerald-500 scale-110' : 'text-slate-900 dark:text-white'}`}>
                                                        ${Number(goal.current_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 z-10">
                                                {isFundingGoal === goal.id ? (
                                                    <form onSubmit={handleFundGoal} className="flex gap-2">
                                                        <input 
                                                            type="number" autoFocus required min="1" max={unallocated}
                                                            value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                                                            placeholder={`Máx $${unallocated.toLocaleString()}`}
                                                            className="flex-1 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-black outline-none focus:border-sky-500 tabular-nums"
                                                        />
                                                        <button type="submit" disabled={isSubmitting} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider">Añadir</button>
                                                        <button type="button" onClick={() => {setIsFundingGoal(null); setFundAmount('');}} className="text-slate-400 hover:text-rose-500 px-2"><X size={14} /></button>
                                                    </form>
                                                ) : (
                                                    <button 
                                                        disabled={isComplete || unallocated <= 0}
                                                        onClick={() => setIsFundingGoal(goal.id)}
                                                        className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/20 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed group-hover:border-solid flex items-center justify-center gap-2"
                                                    >
                                                        {isComplete ? 'Meta Alcanzada' : (unallocated <= 0 ? 'Sin saldo disponible' : <><Plus size={12} strokeWidth={3} /> Asignar Fondos</>)}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Inline CSS for drag animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

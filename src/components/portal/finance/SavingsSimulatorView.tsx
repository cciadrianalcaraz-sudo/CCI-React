import React, { useState, useMemo } from 'react';
import type { FinanceRecord, FinanceGoal } from '../../../types/finance';
import { supabase } from '../../../lib/supabase';
import { Target, Plus, Vault, Sparkles, TrendingUp, X } from 'lucide-react';
import { toast } from '../../../lib/toast';

interface SavingsSimulatorViewProps {
    records: FinanceRecord[];
    goals: FinanceGoal[];
    userId: string;
    onRefreshGoals: () => Promise<void> | void;
}

const CircularProgress = ({ value, label, size = 120, strokeWidth = 8, color = 'emerald' }: { value: number, label?: string, size?: number, strokeWidth?: number, color?: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    
    // Convert generic color string to tailwind utility mappings (simplified)
    const colorStops = color === 'amber' ? ['#f59e0b', '#d97706'] : 
                       color === 'sky' ? ['#0ea5e9', '#0284c7'] : 
                       color === 'rose' ? ['#f43f5e', '#e11d48'] :
                       ['#10b981', '#059669']; // default emerald

    return (
        <div className="relative inline-flex items-center justify-center group" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <defs>
                    <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colorStops[0]} />
                        <stop offset="100%" stopColor={colorStops[1]} />
                    </linearGradient>
                </defs>
                {/* Background Circle */}
                <circle 
                    cx={size / 2} cy={size / 2} r={radius} 
                    className="stroke-black/5 dark:stroke-white/5" 
                    fill="none" strokeWidth={strokeWidth} 
                />
                {/* Progress Circle */}
                <circle 
                    cx={size / 2} cy={size / 2} r={radius} 
                    fill="none" strokeWidth={strokeWidth} 
                    stroke={`url(#grad-${color})`}
                    strokeDasharray={circumference} 
                    strokeDashoffset={offset} 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-800 dark:text-white">{Math.round(value)}%</span>
                {label && <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{label}</span>}
            </div>
        </div>
    );
};

export default function SavingsSimulatorView({ records, goals, userId, onRefreshGoals }: SavingsSimulatorViewProps) {
    const [isCreatingGoal, setIsCreatingGoal] = useState(false);
    const [isFundingGoal, setIsFundingGoal] = useState<string | null>(null);
    const [newGoalData, setNewGoalData] = useState({ name: '', target: '', color: 'emerald' });
    const [fundAmount, setFundAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cálculos Principales
    const totalSaved = useMemo(() => {
        const savingsRecords = records.filter(r => (r.expense_type || '').toUpperCase() === 'AHORRO' || (r.concept || '').toUpperCase().includes('AHORRO'));
        return savingsRecords.reduce((acc, r) => acc + Math.max(Number(r.income) || 0, Number(r.expense) || 0), 0);
    }, [records]);

    const totalAllocated = useMemo(() => {
        return goals.reduce((acc, g) => acc + (Number(g.current_amount) || 0), 0);
    }, [goals]);

    const unallocated = Math.max(0, totalSaved - totalAllocated);

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const targetAmount = Number(newGoalData.target);
            if (!newGoalData.name || targetAmount <= 0) throw new Error('Datos inválidos');

            const { error } = await supabase.from('finance_goals').insert([{
                user_id: userId,
                name: newGoalData.name,
                target_amount: targetAmount,
                current_amount: 0,
                color: newGoalData.color
            }]);
            
            if (error) throw error;
            toast.success('Meta creada con éxito.');
            setIsCreatingGoal(false);
            setNewGoalData({ name: '', target: '', color: 'emerald' });
            await onRefreshGoals();
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
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

            const newAmount = Number(goalToUpdate.current_amount) + amountToAdd;

            const { error } = await supabase.from('finance_goals')
                .update({ current_amount: newAmount })
                .eq('id', goalToUpdate.id);

            if (error) throw error;
            toast.success('Fondos asignados exitosamente.');
            setIsFundingGoal(null);
            setFundAmount('');
            await onRefreshGoals();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 md:p-10 space-y-12 animate-fade-in relative pb-48">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            
            {/* Header: Bóveda Principal */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                        <Vault size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Bóveda de Progreso</h2>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                            <Sparkles size={12} /> Gestiona tus Metas Inteligentes
                        </p>
                    </div>
                </div>
                {!isCreatingGoal && (
                    <button 
                        onClick={() => setIsCreatingGoal(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={16} strokeWidth={3} /> Nueva Meta
                    </button>
                )}
            </div>

            {/* Dashboard Acumulado */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                {/* Saldo Global (Izquierda) */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white/5 dark:to-white/5 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl border border-slate-700/50 dark:border-white/10">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="relative z-10 space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black text-emerald-400/80 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <TrendingUp size={14} /> Total Acumulado en Ahorros
                            </h3>
                            <div className="text-4xl md:text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
                                ${totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>

                        <div className="h-px bg-white/10 w-full" />

                        <div>
                            <h3 className="text-[10px] font-black text-sky-400/80 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <Target size={14} /> Disponible para Asignar
                            </h3>
                            <div className="text-3xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
                                ${unallocated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid de Metas (Derecha) */}
                <div className="lg:col-span-7">
                    {isCreatingGoal ? (
                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl animate-scale-in h-full flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-slate-800 dark:text-white">Crear Nueva Meta</h3>
                                <button onClick={() => setIsCreatingGoal(false)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 bg-slate-100 dark:bg-white/5 rounded-full"><X size={16} strokeWidth={3} /></button>
                            </div>
                            <form onSubmit={handleCreateGoal} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nombre de la Meta (Ej. Viaje a Japón)</label>
                                    <input 
                                        type="text" required
                                        value={newGoalData.name} onChange={e => setNewGoalData({...newGoalData, name: e.target.value})}
                                        className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="Mi próxima aventura..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Monto Objetivo ($)</label>
                                    <input 
                                        type="number" required min="1"
                                        value={newGoalData.target} onChange={e => setNewGoalData({...newGoalData, target: e.target.value})}
                                        className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-5 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors tabular-nums"
                                        placeholder="50000"
                                    />
                                </div>
                                <div className="pt-2">
                                    <button 
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="w-full bg-emerald-500 text-white rounded-xl py-4 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Guardando...' : 'Crear Meta'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
                            {goals.length === 0 ? (
                                <div className="col-span-full border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center opacity-70">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400 mb-4"><Target size={24} /></div>
                                    <p className="font-black text-slate-900 dark:text-white mb-2">No tienes metas activas</p>
                                    <p className="text-xs font-bold text-slate-500">Comienza a distribuir tus ahorros creando tu primera meta.</p>
                                </div>
                            ) : (
                                goals.map(goal => {
                                    const percent = goal.target_amount > 0 ? Math.min(100, Math.max(0, (goal.current_amount / goal.target_amount) * 100)) : 0;
                                    const isComplete = percent >= 100;

                                    return (
                                        <div key={goal.id} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
                                            {isComplete && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[40px] pointer-events-none rounded-full" />}
                                            
                                            <div className="flex justify-between items-start mb-6 z-10">
                                                <div>
                                                    <h3 className="font-black text-slate-900 dark:text-white tracking-tight line-clamp-1">{goal.name}</h3>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">META: ${Number(goal.target_amount).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col items-center justify-center z-10">
                                                <CircularProgress value={percent} label={isComplete ? "Logrado" : "Progreso"} color={isComplete ? 'emerald' : goal.color || 'sky'} />
                                                <div className="mt-4 text-center">
                                                    <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
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
                                                        <button 
                                                            type="submit" disabled={isSubmitting}
                                                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider"
                                                        >
                                                            Añadir
                                                        </button>
                                                        <button 
                                                            type="button" onClick={() => {setIsFundingGoal(null); setFundAmount('');}}
                                                            className="text-slate-400 hover:text-rose-500 px-2"
                                                        >
                                                            <X size={14} />
                                                        </button>
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
        </div>
    );
}

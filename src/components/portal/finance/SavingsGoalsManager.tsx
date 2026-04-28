import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, TrendingUp, Sparkles, User, DollarSign, Calendar } from 'lucide-react';
import Button from '../../ui/Button';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../hooks/useConfirm';

interface SavingsGoalsManagerProps {
    user: { id: string; [key: string]: unknown };
    goals: any[];
    onRefresh: () => void;
}

export default function SavingsGoalsManager({ user, goals, onRefresh }: SavingsGoalsManagerProps) {
    const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
    const [goalName, setGoalName] = useState('');
    const [goalTarget, setGoalTarget] = useState<number | ''>('');
    const [goalDeadline, setGoalDeadline] = useState('');
    const [isSavingGoal, setIsSavingGoal] = useState(false);

    const { confirm, ConfirmModal } = useConfirm();

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
            onRefresh();
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
            onRefresh();
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
            onRefresh();
        } catch (error) {
            console.error('Error updating goal:', error);
            toast.error(`No se pudo actualizar la meta: ${(error as any).message}`);
        }
    };

    return (
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

            {/* SAVINGS GOAL MODAL */}
            {isGoalFormOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setIsGoalFormOpen(false)}></div>
                    <div className="bg-[var(--bg-card)] dark:bg-[#1a1a1a] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-scale-in border border-[var(--border-color)] dark:border-white/10">
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
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent"
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
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent"
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
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent"
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
            
            {ConfirmModal}
        </div>
    );
}

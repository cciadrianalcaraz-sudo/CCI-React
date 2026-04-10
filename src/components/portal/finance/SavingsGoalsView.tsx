import React, { useState } from 'react';
import { Plus, TrendingUp, Trash2, Sparkles, User, DollarSign, Calendar } from 'lucide-react';
import Button from '../../ui/Button';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../hooks/useConfirm';
import { FinanceGoal } from '../../../types/finance';

interface SavingsGoalsViewProps {
    userId: string;
    goals: FinanceGoal[];
    onRefresh: () => void;
}

const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({ userId, goals, onRefresh }) => {
    const { confirm, ConfirmModal } = useConfirm();

    // Savings Goals states
    const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
    const [goalName, setGoalName] = useState('');
    const [goalTarget, setGoalTarget] = useState<number | ''>('');
    const [goalDeadline, setGoalDeadline] = useState('');
    const [isSavingGoal, setIsSavingGoal] = useState(false);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goalName || !goalTarget) return;

        setIsSavingGoal(true);
        try {
            const { error } = await supabase.from('finance_goals').insert([{
                user_id: userId,
                name: goalName,
                target_amount: Number(goalTarget),
                current_amount: 0,
                deadline: goalDeadline || null
            }]);

            if (error) throw error;
            toast.success("Meta de ahorro creada");
            setGoalName('');
            setGoalTarget('');
            setGoalDeadline('');
            setIsGoalFormOpen(false);
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Error al crear la meta");
        } finally {
            setIsSavingGoal(false);
        }
    };

    const handleDeleteGoal = async (id: string) => {
        if (!await confirm({
            title: 'Eliminar Meta',
            message: '¿Seguro que quieres eliminar esta meta de ahorro?',
            confirmLabel: 'Eliminar',
            danger: true,
        })) return;
        try {
            const { error } = await supabase.from('finance_goals').delete().eq('id', id);
            if (error) throw error;
            toast.success("Meta eliminada");
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar la meta");
        }
    };
    
    const handleUpdateGoalAmount = async (id: string, current: number) => {
        const amount = window.prompt("¿Cuánto deseas abonar a esta meta?", "0");
        if (!amount || isNaN(Number(amount))) return;
        
        try {
            const { error } = await supabase
                .from('finance_goals')
                .update({ current_amount: current + Number(amount) })
                .eq('id', id);
            if (error) throw error;
            toast.success("Ahorro actualizado");
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar la meta");
        }
    };

    return (
        <div className="mt-12 bg-[var(--bg-card)] dark:bg-white/5 rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm animate-fade-in delay-200 relative z-10 w-full mb-12">
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
                            <div key={goal.id} className="bg-[var(--bg-card)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 text-right">
                                    <button 
                                        onClick={() => handleDeleteGoal(goal.id)}
                                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-all shadow-sm"
                                        title="Eliminar Meta"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform`} style={{ backgroundColor: `${goal.color || '#3b82f6'}20`, color: goal.color || '#3b82f6' }}>
                                        <span className="text-2xl">{goal.icon || '🎯'}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">{progress.toFixed(0)}% Alcanzado</span>
                                    </div>
                                </div>
                                <h4 className="text-lg font-black mb-4 text-[var(--text-primary)]">{goal.name}</h4>
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Acumulado</p>
                                        <p className="text-sm font-black text-accent">${(goal.current_amount || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Objetivo</p>
                                        <p className="text-sm font-black text-[var(--text-primary)] opacity-40">${(goal.target_amount || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="h-3 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden mb-6 border border-white/5">
                                    <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.1)]" style={{ width: `${progress}%`, backgroundColor: goal.color || '#10b981' }}></div>
                                </div>
                                <div className="flex justify-center group-hover:block transition-all text-center">
                                    <button 
                                        onClick={() => handleUpdateGoalAmount(goal.id, goal.current_amount)} 
                                        className="px-4 py-2 bg-accent/5 hover:bg-accent text-accent hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full"
                                    >
                                        Abonar Capital
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* SAVINGS GOAL FORM MODAL */}
            {isGoalFormOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-fade-in text-[var(--text-primary)]">
                    <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setIsGoalFormOpen(false)}></div>
                    <div className="bg-[var(--bg-card)] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-scale-in border border-[var(--border-color)]">
                        <h4 className="text-xl font-black mb-2 flex items-center gap-3">
                            <TrendingUp size={24} className="text-accent" /> Nueva Meta de Ahorro
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-8">Define un objetivo claro para tus finanzas.</p>

                        <form onSubmit={handleAddGoal} className="space-y-6 relative z-10 w-full text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Nombre de la Meta</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        required 
                                        value={goalName} 
                                        onChange={e => setGoalName(e.target.value)}
                                        placeholder="Ej: Fondo de Emergencia"
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-accent"
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
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-accent"
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
                                        className="w-full bg-[var(--bg-main)] dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-accent"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><Calendar size={16} /></div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-[var(--border-color)] dark:border-white/5">
                                <Button outline className="flex-1 py-4" onClick={() => setIsGoalFormOpen(false)}>Cancelar</Button>
                                <Button 
                                    primary 
                                    className="flex-1 py-4 shadow-lg shadow-accent/20" 
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
};

export default SavingsGoalsView;

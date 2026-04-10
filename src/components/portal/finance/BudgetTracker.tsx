import React, { useState, useEffect } from 'react';
import { TrendingUp, Trash2 } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-toastify';
import { confirm } from '../../../components/ConfirmDialog';
import Button from '../../../components/ui/Button';
import { FinanceRecord } from '../../../types/finance';

interface BudgetData {
    concept: string;
    avgBudget: number;
    currentExpense: number;
    difference: number;
}

interface BudgetTrackerProps {
    userId: string;
    records: FinanceRecord[];
    selectedMonth: string;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({
    userId,
    records,
    selectedMonth
}) => {
    const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
    const [manualBudgets, setManualBudgets] = useState<Record<string, number>>({});
    const [isEditingBudget, setIsEditingBudget] = useState(false);

    useEffect(() => {
        if (selectedMonth) {
            loadBudgets(selectedMonth);
        }
    }, [selectedMonth, userId]);

    const loadBudgets = async (month: string) => {
        try {
            const { data, error } = await supabase
                .from('finance_budgets')
                .select('concept, amount')
                .eq('month', month)
                .eq('user_id', userId);
            
            if (error) {
                console.error("Error loading budgets for " + month + ":", error);
                return;
            }
            
            const budgetMap: Record<string, number> = {};
            if (data) {
                data.forEach((b: any) => {
                    budgetMap[b.concept] = Number(b.amount);
                });
            }
            setManualBudgets(budgetMap);
        } catch (error) {
            console.error("Exception loading budgets:", error);
        }
    };

    useEffect(() => {
        const historicalMonthsCount = Math.max(1, new Set(records.map(r => r.date.substring(0, 7))).size);
        
        const historicalExpenses = records
            .filter(r => (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL' && !r.concept?.toUpperCase().includes('TRASPASO'))
            .reduce((acc: Record<string, number>, curr: FinanceRecord) => {
                const c = curr.concept || 'SIN CONCEPTO';
                if (!acc[c]) acc[c] = 0;
                acc[c] += Number(curr.expense);
                return acc;
            }, {});

        const grouped = records
            .filter(r => {
                const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
                const isSelectedMonth = selectedMonth === 'all' || rMonth === selectedMonth;
                return isSelectedMonth && (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL' && !r.concept?.toUpperCase().includes('TRASPASO');
            })
            .reduce((acc: Record<string, number>, curr: FinanceRecord) => {
                const c = curr.concept || 'SIN CONCEPTO';
                if (!acc[c]) acc[c] = 0;
                acc[c] += Number(curr.expense);
                return acc;
            }, {});
            
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
                const currentExp = grouped[concept] || 0;
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
    }, [records, selectedMonth, manualBudgets]);

    const handleSaveBudget = async (concept: string, amount: number) => {
        try {
            const { error } = await supabase
                .from('finance_budgets')
                .upsert({ 
                    user_id: userId, 
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
            console.error('Error saving budget:', error);
            toast.error('No se pudo guardar el presupuesto.');
        }
    };

    const handleDeleteBudget = async (concept: string) => {
        const ok = await confirm({
            title: 'Reiniciar Presupuesto',
            message: `¿Deseas eliminar el presupuesto personalizado de "${concept}"? Se usará el promedio histórico.`,
            confirmLabel: 'Reiniciar',
            danger: true,
        });
        if (!ok) return;
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
            toast.success(`Presupuesto de "${concept}" reiniciado.`);
        } catch (error) {
            console.error('Error deleting budget:', error);
            toast.error('No se pudo eliminar el presupuesto.');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in delay-100 text-[var(--text-primary)]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                <div>
                    <h3 className="text-3xl font-black font-heading uppercase tracking-tighter">
                        Control de Presupuesto
                    </h3>
                    <p className="opacity-40 text-xs mt-1 font-medium tracking-wide">Planeación vs Gasto Real del periodo seleccionado.</p>
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

            <div className="bg-[var(--bg-card)]/50 dark:bg-white/5 backdrop-blur-md overflow-hidden rounded-[32px] border border-[var(--border-color)] dark:border-white/10 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-accent/5 text-[var(--text-primary)] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[var(--border-color)] dark:border-white/10">
                            <th className="p-5 border-r border-[var(--border-color)] dark:border-white/10">Concepto</th>
                            <th className="p-5 border-r border-[var(--border-color)] dark:border-white/10 text-right w-48">Presupuesto</th>
                            <th className="p-5 border-r border-[var(--border-color)] dark:border-white/10 text-right w-64">Gasto Real</th>
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
    );
};

export default BudgetTracker;

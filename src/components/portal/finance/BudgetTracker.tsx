import React, { useState, useMemo } from 'react';
import { TrendingUp, Trash2, ChevronDown, ChevronRight, AlertCircle, Flame } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../hooks/useConfirm';
import Button from '../../ui/Button';
import type { FinanceRecord, BudgetData } from '../../../types/finance';

interface BudgetTrackerProps {
    userId: string;
    selectedMonth: string;
    budgetData: BudgetData[];
    planningAnalysis?: {
        fixedPct: number;
        variablePct: number;
        savingsPct: number;
        totalBudgetedExpense: number;
        margin: number;
    };
    records: FinanceRecord[];
    onBudgetUpdated: () => void;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({
    userId,
    selectedMonth,
    budgetData,
    planningAnalysis,
    records,
    onBudgetUpdated
}) => {
    const { confirm, ConfirmModal } = useConfirm();
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [expandedConcept, setExpandedConcept] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
    const [expenseSubFilter, setExpenseSubFilter] = useState<'all' | 'Fijo' | 'Variable' | 'AhorroDeuda'>('all');

    // Calculate Month Pacing
    const pacing = useMemo(() => {
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        if (selectedMonth !== currentMonthStr) return 1; // 100% if not current month

        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();
        return currentDay / daysInMonth;
    }, [selectedMonth]);

    // Filter data based on active tab before grouping
    const filteredBudgetData = useMemo(() => {
        return budgetData.filter(item => item.category === activeTab);
    }, [budgetData, activeTab]);

    // Group Data by Type
    const groupedData = useMemo(() => {
        const groups: Record<string, BudgetData[]> = {};
        filteredBudgetData.forEach(item => {
            const type = item.type || 'Variable';
            if (!groups[type]) groups[type] = [];
            groups[type].push(item);
        });
        return groups;
    }, [filteredBudgetData]);

    const handleSaveBudget = async (concept: string, amount: number, category: string = 'expense', type?: string) => {
        try {
            const { error } = await supabase
                .from('finance_budgets')
                .upsert({ 
                    user_id: userId, 
                    concept, 
                    month: selectedMonth,
                    amount,
                    budget_category: category,
                    expense_type: type,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,concept,month,budget_category' });

            if (error) throw error;
            
            onBudgetUpdated();
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

            onBudgetUpdated();
            toast.success(`Presupuesto de "${concept}" reiniciado.`);
        } catch (error) {
            console.error('Error deleting budget:', error);
            toast.error('No se pudo eliminar el presupuesto.');
        }
    };

    const toggleDrillDown = (concept: string) => {
        setExpandedConcept(expandedConcept === concept ? null : concept);
    };

    // 50/30/20 Calculation
    const budgetAnalysis = useMemo(() => {
        const totals = {
            fijo: 0,
            variable: 0,
            ahorroDeuda: 0,
            total: 0
        };

        budgetData.forEach(item => {
            if (item.category === 'income') return; // Only expenses for 50/30/20
            const amount = item.currentAmount;
            totals.total += amount;
            if (item.type === 'Fijo') totals.fijo += amount;
            else if (item.type === 'Variable') totals.variable += amount;
            else if (item.type === 'Ahorro' || item.type === 'Deuda') totals.ahorroDeuda += amount;
        });

        if (totals.total === 0) return null;

        return {
            needs: { label: 'Necesidades (50%)', current: (totals.fijo / totals.total) * 100, target: 50, color: 'bg-blue-500' },
            wants: { label: 'Deseos (30%)', current: (totals.variable / totals.total) * 100, target: 30, color: 'bg-purple-500' },
            savings: { label: 'Ahorro/Deuda (20%)', current: (totals.ahorroDeuda / totals.total) * 100, target: 20, color: 'bg-green-500' }
        };
    }, [budgetData]);

    const getConceptRecords = (concept: string, category: 'income' | 'expense') => {
        return records.filter(r => {
            const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
            const matchesConcept = (r.concept || '').toUpperCase().trim() === concept.toUpperCase().trim();
            const hasAmount = category === 'income' ? (Number(r.income) > 0) : (Number(r.expense) > 0);
            return rMonth === selectedMonth && matchesConcept && hasAmount;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const renderGroup = (type: string, items: BudgetData[]) => {
        const totalBudget = items.reduce((acc, curr) => acc + curr.avgBudget, 0);
        const totalReal = items.reduce((acc, curr) => acc + curr.currentAmount, 0);
        const category = items[0]?.category;
        const isIncome = category === 'income';

        return (
            <div key={type} className="mb-10 animate-fade-in">
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                            isIncome ? 'bg-green-500' :
                            type === 'Fijo' ? 'bg-blue-500' : 
                            type === 'Variable' ? 'bg-purple-500' : 
                            type === 'Ahorro' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        <h4 className="text-lg font-black uppercase tracking-tighter text-primary-dark">{isIncome ? `Meta de ${type}` : type}</h4>
                        <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{items.length} Conceptos</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">{isIncome ? 'Subtotal Recibido' : 'Subtotal Gastado'}</p>
                        <p className="text-sm font-black text-primary-dark">
                            ${totalReal.toLocaleString('en-US', { minimumFractionDigits: 2 })} 
                            <span className="opacity-20 mx-2">/</span>
                            <span className="opacity-40">${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </p>
                    </div>
                </div>

                <div className="bg-[var(--bg-card)]/50 dark:bg-white/5 backdrop-blur-md overflow-hidden rounded-[24px] border border-[var(--border-color)] dark:border-white/10 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-accent/5 text-[var(--text-primary)] text-[9px] font-black uppercase tracking-[0.2em] border-b border-[var(--border-color)] dark:border-white/10">
                                <th className="p-4 border-r border-[var(--border-color)] dark:border-white/10">Concepto</th>
                                <th className="p-4 border-r border-[var(--border-color)] dark:border-white/10 text-right w-40">Presupuesto</th>
                                <th className="p-4 border-r border-[var(--border-color)] dark:border-white/10 text-right w-56">{isIncome ? 'Ingreso Real' : 'Gasto Real'}</th>
                                <th className="p-4 text-right w-36">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100/50">
                            {items.map((row) => {
                                const percent = row.avgBudget > 0 ? (row.currentAmount / row.avgBudget) * 100 : 0;
                                const isOverBudget = !isIncome && percent > 100;
                                const isGoalMet = isIncome && percent >= 100;
                                const isPacingWarning = !isIncome && selectedMonth !== 'all' && (percent / 100) > (pacing + 0.1) && !isOverBudget;
                                
                                let progressColor = 'bg-green-500';
                                if (isIncome) {
                                    progressColor = isGoalMet ? 'bg-green-500' : percent > 50 ? 'bg-emerald-400' : 'bg-amber-400';
                                } else {
                                    progressColor = percent > 100 ? 'bg-red-500' : percent > 85 ? 'bg-amber-500' : 'bg-green-500';
                                }

                                const isExpanded = expandedConcept === row.concept;
                                
                                return (
                                    <React.Fragment key={row.concept}>
                                        <tr 
                                            className={`hover:bg-white/50 transition-colors group cursor-pointer ${isExpanded ? 'bg-accent/5' : ''}`}
                                            onClick={() => toggleDrillDown(row.concept)}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {isExpanded ? <ChevronDown size={14} className="text-accent" /> : <ChevronRight size={14} className="opacity-20" />}
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-xs text-primary-dark uppercase tracking-wider">{row.concept}</span>
                                                        {isEditingBudget && !isIncome && (
                                                            <select 
                                                                className="mt-1 text-[8px] font-black uppercase tracking-widest bg-neutral-100 border-none rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-accent"
                                                                defaultValue={row.type}
                                                                onChange={(e) => handleSaveBudget(row.concept, row.avgBudget, row.category, e.target.value)}
                                                            >
                                                                <option value="Fijo">Fijo</option>
                                                                <option value="Variable">Variable</option>
                                                                <option value="Ahorro">Ahorro</option>
                                                                <option value="Deuda">Deuda</option>
                                                            </select>
                                                        )}
                                                    </div>
                                                    {isPacingWarning && (
                                                        <div className="flex items-center gap-1 text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
                                                            <Flame size={10} /> RITMO ACELERADO
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 border-l border-neutral-100/50 bg-neutral-50/20 text-right" onClick={(e) => e.stopPropagation()}>
                                                {isEditingBudget ? (
                                                    <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl pl-3 pr-1 py-1 shadow-sm focus-within:border-accent transition-all group-hover:border-accent/40">
                                                        <span className="text-accent font-black text-xs">$</span>
                                                        <input 
                                                            type="number" 
                                                            className="w-20 bg-transparent outline-none text-right font-black text-xs text-primary-dark"
                                                            defaultValue={row.avgBudget}
                                                            onBlur={(e) => handleSaveBudget(row.concept, parseFloat(e.target.value) || 0, row.category, row.type)}
                                                        />
                                                        <button 
                                                            onClick={() => handleDeleteBudget(row.concept)}
                                                            className="p-1 hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="font-black text-xs text-primary-dark">
                                                        ${row.avgBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 border-l border-neutral-100/50">
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-center px-1">
                                                        <span className="text-[9px] font-black text-neutral-400">{percent.toFixed(0)}%</span>
                                                        <span className="text-xs font-black text-primary-dark">${row.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden relative">
                                                        <div 
                                                            className={`h-full transition-all duration-700 ease-out rounded-full ${progressColor}`}
                                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                                        ></div>
                                                        {selectedMonth !== 'all' && pacing < 1 && (
                                                            <div 
                                                                className="absolute top-0 w-0.5 h-full bg-primary-dark/20 z-10"
                                                                style={{ left: `${pacing * 100}%` }}
                                                                title="Hoy"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-bold">
                                                {isIncome ? (
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isGoalMet ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                        {isGoalMet ? 'Logrado' : 'En Progreso'}
                                                    </span>
                                                ) : (
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isOverBudget ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                        {isOverBudget ? 'Excedido' : 'En Control'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-neutral-50/50 border-l-2 border-accent">
                                                <td colSpan={4} className="p-0">
                                                    <div className="p-4 animate-slide-in">
                                                        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-inner">
                                                            <table className="w-full text-[10px]">
                                                                <thead className="bg-neutral-50 text-neutral-400 font-black uppercase tracking-widest border-b">
                                                                    <tr>
                                                                        <th className="p-2 text-left">Fecha</th>
                                                                        <th className="p-2 text-left">{isIncome ? 'Fuente' : 'Proveedor'}</th>
                                                                        <th className="p-2 text-right">Monto</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y">
                                                                    {getConceptRecords(row.concept, row.category).length > 0 ? (
                                                                        getConceptRecords(row.concept, row.category).map(rec => (
                                                                            <tr key={rec.id} className="hover:bg-neutral-50 transition-colors">
                                                                                <td className="p-2 text-neutral-500">{new Date(rec.date).toLocaleDateString('es-ES')}</td>
                                                                                <td className="p-2 font-bold text-primary-dark uppercase">{rec.provider || (isIncome ? 'Sin fuente' : 'Sin proveedor')}</td>
                                                                                <td className="p-2 text-right font-black text-primary-dark">${(isIncome ? rec.income : rec.expense).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan={3} className="p-4 text-center italic text-neutral-400">No hay movimientos registrados para este concepto en {selectedMonth}.</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const groupOrder = ['Ingreso', 'Fijo', 'Variable', 'Ahorro', 'Deuda'];
    const sortedGroups = Object.keys(groupedData).sort((a, b) => {
        const indexA = groupOrder.indexOf(a);
        const indexB = groupOrder.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const filteredGroups = sortedGroups.filter(group => {
        if (activeTab === 'income') return true; // Already filtered at groupedData level
        if (expenseSubFilter === 'all') return true;
        if (expenseSubFilter === 'AhorroDeuda') return group === 'Ahorro' || group === 'Deuda';
        return group === expenseSubFilter;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in delay-100 text-[var(--text-primary)]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                <div>
                    <h3 className="text-3xl font-black font-heading uppercase tracking-tighter">
                        Control Presupuestal
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="opacity-40 text-xs font-medium tracking-wide">Metas de Ingresos vs Límites de Gastos.</p>
                        {selectedMonth !== 'all' && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary-dark/5 rounded-full border border-primary-dark/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-dark animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Día {new Date().getDate()} del mes ({(pacing * 100).toFixed(0)}%)</span>
                            </div>
                        )}
                    </div>
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
                <div className="mb-12 p-6 bg-primary-dark rounded-[24px] text-white shadow-xl flex gap-4 items-start animate-slide-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="bg-white/10 p-2 rounded-xl">
                        <TrendingUp className="text-accent" size={20} />
                    </div>
                    <div className="relative z-10">
                        <p className="font-black text-[10px] uppercase tracking-widest mb-1 opacity-60">Modo Edición Activo</p>
                        <p className="text-sm font-medium leading-relaxed">Modifica los montos en la columna <strong className="text-accent">Presupuesto</strong>. Haz clic fuera para guardar.</p>
                    </div>
                </div>
            )}

            {/* Sub-tabs Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-[var(--border-color)] dark:border-white/10 pb-4">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setActiveTab('expense')}
                        className={`text-sm font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all ${activeTab === 'expense' ? 'bg-primary-dark text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                    >
                        Gastos
                    </button>
                    <button 
                        onClick={() => setActiveTab('income')}
                        className={`text-sm font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all ${activeTab === 'income' ? 'bg-green-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                    >
                        Ingresos
                    </button>
                </div>

                {activeTab === 'expense' && (
                    <div className="flex bg-neutral-100 dark:bg-white/5 p-1 rounded-2xl self-start">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'Fijo', label: 'Fijos' },
                            { id: 'Variable', label: 'Variables' },
                            { id: 'AhorroDeuda', label: 'Ahorro / Deuda' }
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setExpenseSubFilter(filter.id as any)}
                                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                    expenseSubFilter === filter.id 
                                        ? 'bg-white dark:bg-white/10 shadow-sm text-primary-dark dark:text-white' 
                                        : 'opacity-40 hover:opacity-60'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Planning Analysis Bar */}
            {planningAnalysis && (
                <div className="mb-12 bg-white dark:bg-white/5 p-8 rounded-[32px] border border-[var(--border-color)] dark:border-white/10 shadow-sm animate-slide-up">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h4 className="text-xl font-black uppercase tracking-tighter text-primary-dark">Análisis de Planificación</h4>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Cómo se distribuye tu meta de ingresos según la regla 50/30/20.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 block">Margen Libre en Plan</span>
                            <span className={`text-xl font-black ${planningAnalysis.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${planningAnalysis.margin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="w-full h-8 bg-neutral-100 dark:bg-white/10 rounded-2xl overflow-hidden flex shadow-inner">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-1000 relative group"
                                style={{ width: `${Math.min(planningAnalysis.fixedPct, 100)}%` }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                                    <span className="text-[8px] font-black text-white">FIJO: {planningAnalysis.fixedPct.toFixed(1)}%</span>
                                </div>
                            </div>
                            <div 
                                className="h-full bg-purple-500 transition-all duration-1000 relative group"
                                style={{ width: `${Math.min(planningAnalysis.variablePct, 100)}%` }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                                    <span className="text-[8px] font-black text-white">VAR: {planningAnalysis.variablePct.toFixed(1)}%</span>
                                </div>
                            </div>
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-1000 relative group"
                                style={{ width: `${Math.min(planningAnalysis.savingsPct, 100)}%` }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                                    <span className="text-[8px] font-black text-white">AHORRO: {planningAnalysis.savingsPct.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black opacity-40 uppercase">Necesidades</span>
                                    <span className="text-xs font-black">{planningAnalysis.fixedPct.toFixed(1)}% <span className="text-[8px] opacity-30">vs 50%</span></span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black opacity-40 uppercase">Deseos</span>
                                    <span className="text-xs font-black">{planningAnalysis.variablePct.toFixed(1)}% <span className="text-[8px] opacity-30">vs 30%</span></span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black opacity-40 uppercase">Ahorro/Deuda</span>
                                    <span className="text-xs font-black">{planningAnalysis.savingsPct.toFixed(1)}% <span className="text-[8px] opacity-30">vs 20%</span></span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-neutral-300" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black opacity-40 uppercase">Total Gastos</span>
                                    <span className="text-xs font-black">{((planningAnalysis.totalBudgetedExpense / (planningAnalysis.totalBudgetedExpense + Math.max(0, planningAnalysis.margin))) * 100 || 0).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'expense' && budgetAnalysis && (
                <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                    {Object.entries(budgetAnalysis).map(([key, data]) => (
                        <div key={key} className="bg-white dark:bg-white/5 p-6 rounded-[24px] border border-[var(--border-color)] dark:border-white/10 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{data.label}</span>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                                    data.current > data.target ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                }`}>
                                    Ideal: {data.target}%
                                </span>
                            </div>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-2xl font-black text-primary-dark">{data.current.toFixed(1)}%</span>
                                <span className="text-[10px] font-bold opacity-30 mb-1">del total gastado</span>
                            </div>
                            <div className="w-full h-2 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${data.color}`}
                                    style={{ width: `${Math.min(data.current, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredGroups.length > 0 ? (
                filteredGroups.map(group => renderGroup(group, groupedData[group]))
            ) : (
                <div className="bg-white/50 backdrop-blur-md p-16 text-center rounded-[32px] border border-dashed border-neutral-200">
                    <AlertCircle className="mx-auto text-neutral-300 mb-4" size={40} />
                    <p className="text-neutral-400 italic text-sm">
                        {activeTab === 'income' 
                            ? 'No hay metas de ingresos definidas para este periodo.' 
                            : 'No hay límites de gastos definidos para este periodo.'}
                    </p>
                </div>
            )}

            {ConfirmModal}
        </div>
    );
};

export default BudgetTracker;

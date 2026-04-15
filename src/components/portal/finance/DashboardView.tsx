import React, { useMemo } from 'react';
import { 
    TrendingUp, TrendingDown, DollarSign, Target, 
    ArrowUpRight, ArrowDownRight, Wallet, PieChart, 
    BarChart3, Sparkles, Activity, CreditCard
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { FinanceRecord, FinanceGoal, FinanceCredit } from '../../../types/finance';
import AIBriefingWidget from './AIBriefingWidget';

interface DashboardViewProps {
    records: FinanceRecord[];
    goals: FinanceGoal[];
    credits: FinanceCredit[];
    selectedMonth: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ records, goals, credits, selectedMonth }) => {
    
    // 1. Cálculos de KPIs principales
    const stats = useMemo(() => {
        const today = new Date();
        const currentMonth = selectedMonth === 'all' 
            ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
            : selectedMonth;

        const filtered = records.filter(r => {
            const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
            return selectedMonth === 'all' || rMonth === currentMonth;
        });

        const income = filtered.reduce((acc, r) => acc + (Number(r.income) || 0), 0);
        const expense = filtered.reduce((acc, r) => acc + (Number(r.expense) || 0), 0);
        const balance = income - expense;
        const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
        
        const totalDebt = credits.reduce((acc, c) => acc + (c.initial_balance || 0), 0); // Simplificado para el KPI
        
        return { income, expense, balance, savingsRate, totalDebt };
    }, [records, selectedMonth, credits]);

    // 2. Datos para la Gráfica de Rendimiento (Últimos 6 meses)
    const chartData = useMemo(() => {
        const last6Months = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('es-ES', { month: 'short' });
            
            const monthRecords = records.filter(r => {
                const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
                return rMonth === monthStr && (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL' && !r.concept?.toUpperCase().includes('TRASPASO');
            });

            const income = monthRecords.reduce((acc, r) => acc + (Number(r.income) || 0), 0);
            const expense = monthRecords.reduce((acc, r) => acc + (Number(r.expense) || 0), 0);

            last6Months.push({ name: label, ingresos: income, gastos: expense });
        }
        return last6Months;
    }, [records]);

    // 3. Distribución por Categoría (Top 5)
    const categoryData = useMemo(() => {
        const currentMonth = selectedMonth === 'all' ? '' : selectedMonth;
        const filtered = records.filter(r => {
            const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
            return (selectedMonth === 'all' || rMonth === currentMonth) && Number(r.expense) > 0;
        });

        const catMap: Record<string, number> = {};
        filtered.forEach(r => {
            const cat = r.expense_type || 'Otros';
            catMap[cat] = (catMap[cat] || 0) + Number(r.expense);
        });

        return Object.entries(catMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));
    }, [records, selectedMonth]);

    const COLORS = ['#4A7C82', '#6366f1', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <div className="p-8 space-y-8 animate-fade-in text-[var(--text-primary)]">
            
            {/* AI Strategic Widget - Executive Priority */}
            <AIBriefingWidget records={records} goals={goals} credits={credits} />

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Main Performance Chart */}
                <div className="lg:col-span-8 bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <Activity size={20} className="text-accent" />
                                Tendencia de Rendimiento
                            </h3>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Comparativa semestral de flujo de efectivo</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-accent"></div>
                                <span className="text-[10px] font-bold opacity-60">Ingresos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <span className="text-[10px] font-bold opacity-60">Gastos</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[300px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4A7C82" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4A7C82" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.05} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, opacity: 0.5}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, opacity: 0.5}} />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '1.5rem', 
                                        border: 'none', 
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '1rem'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="ingresos" stroke="#4A7C82" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                                <Area type="monotone" dataKey="gastos" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorGastos)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                </div>

                {/* Vertical KPI Cards Bundle */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gradient-to-br from-primary-dark to-[#2c4a4e] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Capacidad de Ahorro</p>
                        <div className="flex items-end gap-3">
                            <h4 className="text-4xl font-black tracking-tight">{stats.savingsRate.toFixed(1)}%</h4>
                            <div className={`flex items-center gap-1 mb-1 text-[10px] font-bold ${stats.savingsRate > 20 ? 'text-green-400' : 'text-amber-400'}`}>
                                {stats.savingsRate > 20 ? <ArrowUpRight size={14} /> : <Activity size={14} />}
                                {stats.savingsRate > 20 ? 'Excelente' : 'Ajustado'}
                            </div>
                        </div>
                        <div className="mt-6 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, stats.savingsRate)}%` }}></div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -mr-16 -mt-16"></div>
                    </div>

                    <div className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md relative group">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Balance del Mes</p>
                        <h4 className={`text-3xl font-black tracking-tight ${stats.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            ${stats.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h4>
                        <div className="flex items-center gap-2 mt-4 text-[10px] font-bold opacity-60">
                            <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                                <ArrowUpRight size={14} />
                            </div>
                            <span>Ingresos: ${stats.income.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Compromisos Totales</p>
                        <h4 className="text-3xl font-black tracking-tight text-red-400">
                            ${stats.totalDebt.toLocaleString()}
                        </h4>
                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-2">Suma de saldos iniciales de crédito</p>
                    </div>
                </div>

                {/* Distribution Chart (Medium Area) */}
                <div className="lg:col-span-5 bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md relative">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                        <PieChart size={20} className="text-purple-500" />
                        Distribución de Gastos
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fontWeight: 900, fill: 'currentColor', opacity: 0.5}}
                                />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Goals Preview (Medium Area) */}
                <div className="lg:col-span-7 bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md overflow-hidden relative group">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black flex items-center gap-3">
                                <Target size={20} className="text-amber-500" />
                                Metas Prioritarias
                            </h3>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Enfoque de ahorro actual</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {goals.length === 0 ? (
                            <div className="py-12 text-center opacity-30 italic text-sm">No hay metas activas</div>
                        ) : (
                            goals.slice(0, 3).map(goal => {
                                const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
                                return (
                                    <div key={goal.id} className="relative">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{goal.icon || '🎯'}</span>
                                                <span className="text-sm font-black uppercase tracking-wider">{goal.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-accent">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-all duration-1000" 
                                                style={{ width: `${progress}%`, backgroundColor: goal.color }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Liquidity List (Bottom Area) */}
                <div className="lg:col-span-12 bg-white/30 dark:bg-white/5 rounded-[2.5rem] p-6 border border-white/20 dark:border-white/10 shadow-sm backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <Wallet size={18} className="text-accent" />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Liquidez por Cuenta</h4>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {records.reduce((acc: any[], r) => {
                            if (!r.payment_method) return acc;
                            const existing = acc.find(a => a.name === r.payment_method);
                            const val = (Number(r.income) || 0) - (Number(r.expense) || 0);
                            if (existing) existing.balance += val;
                            else acc.push({ name: r.payment_method, balance: val });
                            return acc;
                        }, []).sort((a, b) => b.balance - a.balance).map((acc, i) => (
                            <div key={i} className="min-w-[180px] bg-[var(--bg-card)] dark:bg-white/10 p-5 rounded-3xl border border-[var(--border-color)] dark:border-white/10 shadow-sm group hover:-translate-y-1 transition-all">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 group-hover:text-accent transition-colors">{acc.name}</p>
                                <p className="text-lg font-black tracking-tighter">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardView;

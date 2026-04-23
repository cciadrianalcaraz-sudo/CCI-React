import React, { useMemo, useRef } from 'react';
import { 
    Target, 
    ArrowUpRight, Wallet, PieChart, 
    Activity, AlertTriangle, TrendingUp,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
    PieChart as RePieChart, Pie
} from 'recharts';
import type { FinanceRecord, FinanceGoal, FinanceCredit, PaymentMethod } from '../../../types/finance';
import { COLORS } from '../../../utils/financeUtils';

interface DashboardViewProps {
    records: FinanceRecord[];
    goals: FinanceGoal[];
    credits: FinanceCredit[];
    selectedMonth: string;
    summaryData: {concept: string, income: number, expense: number}[];
    uniqueMonths: {label: string, value: string}[];
    paymentMethods: PaymentMethod[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
    records, goals, credits, selectedMonth, 
    summaryData, paymentMethods
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };
    
    // 1. Cálculos de KPIs principales
    const stats = useMemo(() => {
        const today = new Date();
        const currentMonth = selectedMonth === 'all' 
            ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
            : selectedMonth;

        const filtered = records.filter(r => {
            const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
            const c = (r.concept || '').toUpperCase().trim();
            const isInternal = c === 'SALDO INICIAL' || c.includes('TRASPASO');
            return (selectedMonth === 'all' || rMonth === currentMonth) && !isInternal;
        });

        const income = filtered.reduce((acc, r) => acc + (Number(r.income) || 0), 0);
        const expense = filtered.reduce((acc, r) => acc + (Number(r.expense) || 0), 0);
        const balance = income - expense;
        const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
        
        const totalDebt = credits.reduce((acc, c) => acc + (c.initial_balance || 0), 0); 
        
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
            const c = (r.concept || '').toUpperCase().trim();
            const isInternal = c === 'SALDO INICIAL' || c.includes('TRASPASO');
            return (selectedMonth === 'all' || rMonth === currentMonth) && Number(r.expense) > 0 && !isInternal;
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

    // 4. Cálculo de Saldos de Cuentas (Sincronizado con FinanceTracker)
    const accountBalances = useMemo(() => {
        const paymentMap: Record<string, number> = {};
        
        // Ordenar cronológicamente para manejar correctamente el SALDO INICIAL
        const sortedRecords = [...records].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA !== dateB) return dateA - dateB;
            return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        });

        sortedRecords.forEach(r => {
            const pm = (r.payment_method || 'SIN ESPECIFICAR').toUpperCase().trim();
            const isInitial = (r.concept || '').toUpperCase().trim() === 'SALDO INICIAL';
            const val = (Number(r.income) || 0) - (Number(r.expense) || 0);

            if (isInitial) {
                paymentMap[pm] = val;
            } else {
                paymentMap[pm] = (paymentMap[pm] || 0) + val;
            }
        });

        // Filtrar solo las cuentas que están registradas oficialmente
        const registeredNames = new Set(paymentMethods.map(pm => pm.name.toUpperCase().trim()));

        return Object.entries(paymentMap)
            .filter(([name]) => registeredNames.has(name))
            .map(([name, balance]) => ({ name, balance }))
            .sort((a, b) => b.balance - a.balance);
    }, [records, paymentMethods]);

    // 5. Lógica de Resumen (Integrada)
    const totalExpenses = summaryData.reduce((a, b) => a + b.expense, 0);
    const totalIncome = summaryData.reduce((a, b) => a + b.income, 0);
    
    const topExpenseData = [...summaryData].sort((a,b) => b.expense - a.expense)[0];
    const topExpenseConcept = topExpenseData?.expense > 0 ? topExpenseData.concept : null;
    const topExpenseAmount = topExpenseData?.expense > 0 ? topExpenseData.expense : 0;
    const topExpensePercentage = totalExpenses > 0 ? (topExpenseAmount / totalExpenses) * 100 : 0;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{payload[0].name}</p>
                    <p className="text-lg font-black text-white">${Number(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 space-y-8 animate-fade-in text-[var(--text-primary)]">
            
            {/* AI Strategic Widget - Executive Priority (OCULTO POR SOLICITUD) */}
            {/* <AIBriefingWidget records={records} goals={goals} credits={credits} /> */}

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Main Performance Chart */}
                <div className="lg:col-span-8 bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-6 md:p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md relative overflow-hidden group">
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
                    <div className="bg-gradient-to-br from-primary-dark to-[#2c4a4e] rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
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

                    {/* Fuga Principal (Importada de Resumen) */}
                    <div className="bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm relative group overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[50px] group-hover:bg-red-500/10 transition-all duration-500"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 mb-4">
                            <AlertTriangle size={14} className="text-red-500" /> Mayor Gasto (Periodo)
                        </h4>
                        
                        {topExpenseConcept ? (
                            <div className="flex flex-col justify-between flex-1">
                                <div>
                                    <p className="text-xl font-black font-heading text-[var(--text-primary)] leading-tight mb-1 capitalize truncate" title={topExpenseConcept}>
                                        {topExpenseConcept.toLowerCase()}
                                    </p>
                                    <p className="text-sm font-bold text-red-500">
                                        ${topExpenseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                
                                <div className="mt-4 flex items-center gap-3 bg-red-500/5 dark:bg-red-500/10 p-3 rounded-2xl border border-red-500/10">
                                    <div className="flex-1">
                                        <div className="w-full h-1.5 bg-red-500/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${topExpensePercentage}%` }}></div>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-red-500">{topExpensePercentage.toFixed(0)}%</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center opacity-30 py-4">
                                <Target size={24} />
                                <p className="text-[10px] uppercase tracking-widest font-bold mt-2">Sin gastos</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-6 md:p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md relative group">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Balance del Periodo</p>
                        <h4 className={`text-3xl font-black tracking-tight ${stats.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            ${stats.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h4>
                    </div>
                </div>

                {/* Gastos por Tipo (BARRAS) */}
                <div className="lg:col-span-5 bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-6 md:p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md relative">
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
                                    {categoryData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Entradas de Capital (PIE) - Importado de Resumen */}
                <div className="lg:col-span-3 bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm flex flex-col">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 mb-4">
                        <TrendingUp size={14} className="text-green-500" /> Entradas de Capital
                    </h4>
                    <p className="text-xl font-heading font-black text-[var(--text-primary)] mb-6">
                        ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    
                    <div className="flex-1 h-[140px] w-full relative">
                        {summaryData.filter(d => d.income > 0).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie 
                                        data={summaryData.filter(d => d.income > 0).sort((a,b) => b.income - a.income)} 
                                        dataKey="income" 
                                        nameKey="concept" 
                                        cx="50%" cy="50%" 
                                        innerRadius={45} 
                                        outerRadius={65} 
                                        paddingAngle={5}
                                        stroke="none"
                                    >
                                        {summaryData.filter(d => d.income > 0).map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </RePieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-neutral-300 text-[10px] font-black uppercase tracking-widest">Sin ingresos</div>
                        )}
                    </div>
                </div>

                {/* Goals Preview */}
                <div className="lg:col-span-4 bg-[var(--bg-card)] dark:bg-white/5 rounded-[2.5rem] p-6 md:p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md overflow-hidden relative group">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black flex items-center gap-3">
                                <Target size={20} className="text-amber-500" />
                                Metas
                            </h3>
                        </div>
                    </div>
                    
                    <div className="space-y-5">
                        {goals.length === 0 ? (
                            <div className="py-12 text-center opacity-30 italic text-sm font-bold uppercase tracking-widest">Sin metas</div>
                        ) : (
                            goals.slice(0, 3).map(goal => {
                                const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
                                return (
                                    <div key={goal.id} className="relative">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black uppercase tracking-wider">{goal.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-accent">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
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

                {/* Liquidity List */}
                <div className="lg:col-span-12 bg-white/30 dark:bg-white/5 rounded-[2.5rem] p-6 border border-white/20 dark:border-white/10 shadow-sm backdrop-blur-xl group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Wallet size={18} className="text-accent" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Liquidez por Cuenta</h4>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                    <div 
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
                    >
                        {accountBalances.length > 0 ? (
                            accountBalances.map((acc, i) => (
                                <div key={i} className="min-w-[180px] bg-[var(--bg-card)] dark:bg-white/10 p-5 rounded-3xl border border-[var(--border-color)] dark:border-white/10 shadow-sm group/card hover:-translate-y-1 transition-all">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 group-hover/card:text-accent transition-colors">{acc.name}</p>
                                    <p className="text-lg font-black tracking-tighter">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-xs font-bold opacity-30 uppercase tracking-widest">No hay cuentas registradas con movimientos</div>
                        )}
                    </div>
                </div>

            </div>

            {/* TABLA DE DESGLOSE AVANZADA (Importada de Resumen) */}
            <div className="bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl overflow-hidden rounded-[3rem] border border-[var(--border-color)] dark:border-white/10 shadow-sm">
                <div className="p-8 border-b border-[var(--border-color)] dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h4 className="text-lg font-heading font-black text-[var(--text-primary)] flex items-center gap-3">
                            <Activity size={20} className="text-accent" />
                            Desglose Detallado por Concepto
                        </h4>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">Comparativa de flujos y peso sobre el gasto total</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-main)] dark:bg-white/5 text-[10px] uppercase tracking-[0.2em] font-black text-neutral-400 border-b-2 border-[var(--border-color)] dark:border-white/10">
                                <th className="p-6">Concepto / Categoría</th>
                                <th className="p-6 w-1/4">Peso en Gasto</th>
                                <th className="p-6 text-right w-40">Ingreso</th>
                                <th className="p-6 text-right w-40">Gasto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)] dark:divide-white/5">
                            {summaryData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-neutral-400 font-bold uppercase tracking-widest text-xs italic">
                                        Sin datos en el periodo seleccionado
                                    </td>
                                </tr>
                            ) : summaryData.sort((a,b) => b.expense - a.expense).map((row, i) => {
                                const weight = totalExpenses > 0 ? (row.expense / totalExpenses) * 100 : 0;
                                return (
                                    <tr key={row.concept} className="hover:bg-[var(--bg-main)] dark:hover:bg-white/5 transition-colors group">
                                        <td className="p-6 font-black text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.expense > 0 ? COLORS[i % COLORS.length] : 'transparent' }}></div>
                                            {row.concept}
                                        </td>
                                        <td className="p-6">
                                            {row.expense > 0 ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-full h-1.5 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden flex-1">
                                                        <div className="h-full rounded-full transition-all group-hover:brightness-110" 
                                                             style={{ width: `${weight}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-neutral-400 w-8">{weight.toFixed(0)}%</span>
                                                </div>
                                            ) : <span className="text-neutral-300 dark:text-neutral-600">-</span>}
                                        </td>
                                        <td className="p-6 text-right font-bold text-sm text-green-600">
                                            {row.income > 0 ? `$${row.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                        <td className="p-6 text-right font-bold text-sm text-red-500">
                                            {row.expense > 0 ? `$${row.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-[var(--bg-main)] dark:bg-white/5 font-black">
                            <tr>
                                <td colSpan={2} className="p-6 text-[10px] uppercase tracking-[0.2em] opacity-40">Totales Globales</td>
                                <td className="p-6 text-right text-green-600 border-x border-[var(--border-color)] dark:border-white/10">
                                    ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-6 text-right text-red-500">
                                    ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;

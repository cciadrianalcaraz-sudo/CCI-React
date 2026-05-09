import React, { useMemo, useState } from 'react';
import { 
    Calendar as CalendarIcon, 
    ChevronLeft, 
    ChevronRight, 
    AlertCircle, 
    CheckCircle2, 
    ArrowUpRight, 
    ArrowDownRight,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';

import type { FinanceRecord, FinanceCredit, FinanceBudget, PaymentMethod } from '../../../types/finance';

interface CashflowCalendarProps {
    records: FinanceRecord[];
    credits: FinanceCredit[];
    budgets: FinanceBudget[];
    paymentMethods: PaymentMethod[];
}

const CashflowCalendar: React.FC<CashflowCalendarProps> = ({ 
    records, 
    credits, 
    budgets,
    paymentMethods
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // 1. Calculate Initial Liquidity for the current month
    // We sum all payment methods' current balances
    const initialLiquidity = useMemo(() => {
        const paymentMap: Record<string, number> = {};
        
        // We need all records to get current balance accurately
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

        const registeredNames = new Set(paymentMethods.map(pm => pm.name.toUpperCase().trim()));
        return Object.entries(paymentMap)
            .filter(([name]) => registeredNames.has(name))
            .reduce((acc, [_, balance]) => acc + balance, 0);
    }, [records, paymentMethods]);

    // 2. Identify Scheduled Items for the current month
    const scheduledItems = useMemo(() => {
        const items: any[] = [];

        // Fixed items from budgets
        // We only take items that have a due_day and are for the current selected month
        const relevantBudgets = budgets.filter(b => b.month === currentMonthStr && b.due_day);
        
        relevantBudgets.forEach(b => {
            if (!b.due_day) return;

            // Parse multiple days (e.g., "15, 30")
            const days = b.due_day.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
            const amountPerDay = b.amount / (days.length || 1);

            days.forEach(day => {
                // Check if already paid in this month (This is tricky with multiple days)
                // For now, we'll mark as paid if there's AT LEAST ONE record for this concept this month
                // Ideally we'd match the specific installment, but without more data, this is the first step.
                const isPaid = records.some(r => {
                    const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
                    const rDay = parseInt(r.date.includes('/') ? r.date.split('/')[0] : r.date.split('-')[2]);
                    
                    return rMonth === currentMonthStr && 
                           r.concept.toUpperCase().trim() === b.concept.toUpperCase().trim() &&
                           (b.budget_category === 'income' ? Number(r.income) > 0 : Number(r.expense) > 0) &&
                           (days.length === 1 || Math.abs(rDay - day) <= 3); // Simple heuristic: if payment is within 3 days of scheduled day
                });

                items.push({
                    type: b.budget_category === 'income' ? 'income' : 'expense',
                    concept: b.concept,
                    amount: amountPerDay,
                    day: day,
                    isPaid,
                    original: b
                });
            });
        });



        // Credit payments
        credits.forEach(c => {
            if (c.payment_day) {
                // Check if paid (simplified check: any record containing credit name in this month)
                const isPaid = records.some(r => {
                    const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
                    return rMonth === currentMonthStr && 
                           (r.concept.toUpperCase().includes(c.name.toUpperCase()) || 
                            r.description.toUpperCase().includes(c.name.toUpperCase())) &&
                           Number(r.expense) > 0;
                });

                items.push({
                    type: 'expense',
                    concept: `Pago: ${c.name}`,
                    amount: 0, // In forecast we might want to estimate this, but for now we mark it
                    day: c.payment_day,
                    isPaid,
                    isCredit: true,
                    original: c
                });
            }
            if (c.cutoff_day) {
                items.push({
                    type: 'info',
                    concept: `Corte: ${c.name}`,
                    day: c.cutoff_day,
                    isCutoff: true,
                    original: c
                });
            }
        });

        return items;
    }, [budgets, credits, records, currentMonthStr]);

    // 3. Calendar Grid Logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const calendarDays = useMemo(() => {
        const days = [];
        // Pad for the first week
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    }, [daysInMonth, firstDayOfMonth]);

    // 4. Projection Logic (Day by Day)
    const dailyProjection = useMemo(() => {
        const projection: Record<number, { balance: number, items: any[] }> = {};
        let runningBalance = initialLiquidity;

        // Note: initialLiquidity is CURRENT liquidity. 
        // For projection, if we are in the middle of the month, we should ideally know the balance at start of month.
        // But let's assume we want to know "What will my balance be at end of month starting from TODAY".
        // Actually, let's just use scheduled items to see the flow.
        
        for (let d = 1; d <= 31; d++) {
            const dayItems = scheduledItems.filter(item => item.day === d);
            const unpaidExpenses = dayItems.filter(i => i.type === 'expense' && !i.isPaid).reduce((acc, i) => acc + i.amount, 0);
            const pendingIncome = dayItems.filter(i => i.type === 'income' && !i.isPaid).reduce((acc, i) => acc + i.amount, 0);
            
            // We only subtract/add if not already accounted for in liquidity (i.e. not paid)
            // This is a rough estimation.
            runningBalance = runningBalance + pendingIncome - unpaidExpenses;
            
            projection[d] = {
                balance: runningBalance,
                items: dayItems
            };
        }
        return projection;
    }, [initialLiquidity, scheduledItems]);

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
        setSelectedDay(null);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && 
               today.getMonth() === currentDate.getMonth() && 
               today.getFullYear() === currentDate.getFullYear();
    };

    return (
        <div className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[3rem] p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm animate-fade-in text-[var(--text-primary)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h3 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                            <CalendarIcon size={24} />
                        </div>
                        Cashflow Forecast
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-2 ml-16">Proyección ejecutiva de liquidez y compromisos</p>
                </div>
                
                <div className="flex items-center gap-4 bg-[var(--bg-main)] dark:bg-white/5 p-2 rounded-2xl border border-[var(--border-color)] dark:border-white/5">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-accent hover:text-white rounded-xl transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-black uppercase tracking-widest px-4 min-w-[160px] text-center capitalize">
                        {monthName}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-accent hover:text-white rounded-xl transition-all">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* CALENDAR GRID */}
                <div className="lg:col-span-8">
                    <div className="grid grid-cols-7 mb-4">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest opacity-30 py-2">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-3">
                        {calendarDays.map((day, i) => {
                            if (day === null) return <div key={`empty-${i}`} className="aspect-square"></div>;
                            
                            const dayData = dailyProjection[day];
                            const hasIncomes = dayData.items.some(it => it.type === 'income');
                            const hasExpenses = dayData.items.some(it => it.type === 'expense');
                            const hasCutoffs = dayData.items.some(it => it.isCutoff);
                            const allPaid = dayData.items.length > 0 && dayData.items.every(it => it.isPaid || it.type === 'info');
                            const isSelected = selectedDay === day;

                            return (
                                <button 
                                    key={day} 
                                    onClick={() => setSelectedDay(day)}
                                    className={`aspect-square rounded-3xl border transition-all relative flex flex-col p-3 group
                                        ${isToday(day) ? 'bg-accent/5 border-accent shadow-lg shadow-accent/10' : 'bg-[var(--bg-main)] dark:bg-white/5 border-[var(--border-color)] dark:border-white/5 hover:border-accent/40'}
                                        ${isSelected ? 'ring-2 ring-accent ring-offset-4 dark:ring-offset-primary-dark border-accent scale-105 z-10' : ''}
                                    `}
                                >
                                    <span className={`text-sm font-black ${isToday(day) ? 'text-accent' : 'opacity-60'}`}>{day}</span>
                                    
                                    <div className="mt-auto flex flex-wrap gap-1">
                                        {hasIncomes && <div className={`w-1.5 h-1.5 rounded-full ${dayData.items.filter(it => it.type === 'income' && !it.isPaid).length > 0 ? 'bg-green-500 animate-pulse' : 'bg-green-500/30'}`}></div>}
                                        {hasExpenses && <div className={`w-1.5 h-1.5 rounded-full ${dayData.items.filter(it => it.type === 'expense' && !it.isPaid).length > 0 ? 'bg-red-500 animate-pulse' : 'bg-red-500/30'}`}></div>}
                                        {hasCutoffs && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                                    </div>

                                    {dayData.items.length > 0 && allPaid && (
                                        <div className="absolute top-3 right-3 text-green-500 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <CheckCircle2 size={12} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* DAY DETAILS / PROJECTION */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[var(--bg-main)] dark:bg-white/5 rounded-[2.5rem] p-8 border border-[var(--border-color)] dark:border-white/10 h-full">
                        {selectedDay ? (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-center mb-8">
                                    <h4 className="text-xl font-black tracking-tighter">Día {selectedDay}</h4>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Proyección Saldo</span>
                                        <span className="text-lg font-black text-accent">${dailyProjection[selectedDay].balance.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {dailyProjection[selectedDay].items.length === 0 ? (
                                        <div className="py-20 text-center opacity-30 italic text-sm font-bold uppercase tracking-widest">
                                            Sin compromisos este día
                                        </div>
                                    ) : (
                                        dailyProjection[selectedDay].items.map((item, i) => (
                                            <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between group transition-all ${
                                                item.isPaid ? 'bg-green-500/5 border-green-500/20' : 
                                                item.type === 'expense' ? 'bg-red-500/5 border-red-500/20' :
                                                item.type === 'income' ? 'bg-green-500/5 border-green-500/20' :
                                                'bg-blue-500/5 border-blue-500/20'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                                        item.isPaid ? 'bg-green-500 text-white' : 
                                                        item.type === 'expense' ? 'bg-red-500/10 text-red-500' :
                                                        item.type === 'income' ? 'bg-green-500/10 text-green-500' :
                                                        'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                        {item.isPaid ? <CheckCircle2 size={16} /> : 
                                                         item.type === 'expense' ? <ArrowDownRight size={16} /> :
                                                         item.type === 'income' ? <ArrowUpRight size={16} /> :
                                                         <AlertCircle size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-tight truncate max-w-[120px]">{item.concept}</p>
                                                        <p className="text-[8px] font-bold opacity-40 uppercase">{item.isPaid ? 'Ejecutado' : 'Pendiente'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-black ${item.type === 'expense' ? 'text-red-500' : item.type === 'income' ? 'text-green-500' : 'text-blue-500'}`}>
                                                        {item.amount > 0 ? `$${item.amount.toLocaleString()}` : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mb-6">
                                    <TrendingUp size={40} className="text-accent/40" />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest mb-2">Resumen de Flujo</h4>
                                <p className="text-xs font-bold leading-relaxed max-w-[200px]">
                                    Selecciona un día para ver el detalle de los movimientos programados.
                                </p>
                                
                                <div className="mt-12 w-full space-y-4 text-left">
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Liquidez Actual</span>
                                        <span className="text-sm font-black text-green-500">${initialLiquidity.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Efecto Forecast</span>
                                        <span className={`text-sm font-black ${dailyProjection[31].balance >= initialLiquidity ? 'text-green-500' : 'text-red-500'}`}>
                                            {dailyProjection[31].balance >= initialLiquidity ? '+' : '-'} 
                                            ${Math.abs(dailyProjection[31].balance - initialLiquidity).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12 p-6 bg-accent/5 rounded-[2rem] border border-accent/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <ShieldCheck size={24} className="text-accent" />
                    <div>
                        <p className="text-xs font-black uppercase tracking-tight">Estrategia de Tesorería Activa</p>
                        <p className="text-[10px] font-bold opacity-60">El sistema monitorea tus fechas de corte y vencimiento para optimizar tu flujo.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Ingresos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Gastos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Info</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashflowCalendar;

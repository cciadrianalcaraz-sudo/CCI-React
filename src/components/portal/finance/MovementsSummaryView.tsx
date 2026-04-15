import React from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../../utils/financeUtils';

interface MovementsSummaryViewProps {
    summaryData: {concept: string, income: number, expense: number}[];
    selectedMonth: string;
    uniqueMonths: {label: string, value: string}[];
}

const MovementsSummaryView: React.FC<MovementsSummaryViewProps> = ({
    summaryData,
    selectedMonth,
    uniqueMonths
}) => {
    const monthLabel = uniqueMonths.find(m => m.value === selectedMonth)?.label;

    if (summaryData.length === 0) {
        return (
            <div className="p-16 text-center bg-[var(--bg-card)]/40 dark:bg-white/5 backdrop-blur-xl rounded-[3rem] border border-[var(--border-color)] dark:border-white/10 animate-fade-in">
                <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center text-accent mx-auto mb-8 relative">
                    <Search size={40} className="relative z-10" />
                    <div className="absolute inset-0 border-2 border-dashed border-accent/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                </div>
                <h3 className="font-heading font-black text-[var(--text-primary)] text-3xl mb-3 tracking-tight">Sin movimientos registrados</h3>
                <p className="text-neutral-500 max-w-md mx-auto text-sm">No encontramos registros financieros para el periodo seleccionado. Agrega nuevos movimientos para comenzar el análisis.</p>
            </div>
        );
    }

    const totalExpenses = summaryData.reduce((a, b) => a + b.expense, 0);
    const totalIncome = summaryData.reduce((a, b) => a + b.income, 0);
    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;
    
    // Top Expense Category
    const topExpenseData = [...summaryData].sort((a,b) => b.expense - a.expense)[0];
    const topExpenseConcept = topExpenseData?.expense > 0 ? topExpenseData.concept : null;
    const topExpenseAmount = topExpenseData?.expense > 0 ? topExpenseData.expense : 0;
    const topExpensePercentage = totalExpenses > 0 ? (topExpenseAmount / totalExpenses) * 100 : 0;

    // Custom Tooltip for charts
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
        <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-fade-in delay-100 space-y-6 text-[var(--text-primary)]">
            {/* Header del Periodo */}
            {selectedMonth && (
                <div className="flex flex-col items-center justify-center mb-10 w-full relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-color)] dark:via-white/20 to-transparent w-full"></div>
                    </div>
                    <span className="relative bg-[var(--bg-main)] dark:bg-[#151515] px-8 py-3 rounded-full border border-[var(--border-color)] dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-lg font-heading font-black capitalize tracking-tight flex items-center gap-3">
                        <CalendarIcon />
                        {monthLabel}
                    </span>
                </div>
            )}

            {/* BENTO GRID PRINCIPAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 auto-rows-min">
                
                {/* 1. Kpi de Salud Financiera (Savings Rate) - Toma 4 columnas */}
                <div className="xl:col-span-4 bg-gradient-to-br from-primary-dark via-primary-dark to-black rounded-[2.5rem] p-8 relative overflow-hidden group shadow-lg border border-white/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-accent/30 transition-all duration-700"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2 mb-2">
                                <Activity size={14} className="text-green-400" /> Salud Financiera
                            </h4>
                            <p className="text-white text-3xl font-heading font-black tracking-tighter">
                                {savingsRate >= 0 ? '+' : ''}{savingsRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-white/40 mt-1 font-medium">Tasa de ahorro / Margen libre</p>
                        </div>
                        
                        <div className="mt-8">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Balance Neto</span>
                                <span className={`font-black ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'} text-xl`}>
                                    ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                                <div className="h-full bg-green-500 rounded-l-full" style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }}></div>
                                <div className="h-full bg-red-500 rounded-r-full" style={{ width: `${netBalance < 0 ? 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Alerta de Top Gasto - Toma 4 columnas */}
                <div className="xl:col-span-4 bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm relative group overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[50px] group-hover:bg-red-500/10 transition-all duration-500"></div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 mb-6">
                        <AlertTriangle size={14} className="text-red-500" /> Fuga Principal
                    </h4>
                    
                    {topExpenseConcept ? (
                        <div className="flex flex-col justify-between flex-1 mt-auto">
                            <div>
                                <p className="text-2xl font-black font-heading text-[var(--text-primary)] leading-none mb-1 capitalize truncate" title={topExpenseConcept}>
                                    {topExpenseConcept.toLowerCase()}
                                </p>
                                <p className="text-sm font-bold text-red-500">
                                    ${topExpenseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            
                            <div className="mt-8 flex items-center gap-4 bg-red-500/5 dark:bg-red-500/10 p-4 rounded-2xl border border-red-500/10">
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500/70 mb-1">Impacto Global</p>
                                    <div className="w-full h-1.5 bg-red-500/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${topExpensePercentage}%` }}></div>
                                    </div>
                                </div>
                                <span className="text-lg font-black text-red-500">{topExpensePercentage.toFixed(0)}%</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 mt-4">
                            <Target size={32} />
                            <p className="text-xs uppercase tracking-widest font-bold mt-2">Sin gastos</p>
                        </div>
                    )}
                </div>

                {/* 3. Distribución de Ingresos - Toma 4 columnas */}
                <div className="xl:col-span-4 bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm flex flex-col">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2 mb-4">
                        <TrendingUp size={14} className="text-green-500" /> Entradas de Capital
                    </h4>
                    <p className="text-xl font-heading font-black text-[var(--text-primary)] mb-6">
                        ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    
                    <div className="flex-1 h-[140px] w-full relative">
                        {summaryData.filter(d => d.income > 0).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
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
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-neutral-300 text-xs font-bold uppercase tracking-widest">Sin ingresos</div>
                        )}
                    </div>
                </div>

                {/* 4. Dona Central de Gastos - Toma 8 columnas */}
                <div className="xl:col-span-8 bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-[var(--border-color)] dark:border-white/10 shadow-sm relative group overflow-hidden flex flex-col md:flex-row items-center gap-8 min-h-[380px]">
                    <div className="flex-1 w-full h-[300px] relative">
                         {summaryData.filter(d => d.expense > 0).length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={summaryData.filter(d => d.expense > 0).sort((a,b) => b.expense - a.expense)} 
                                            dataKey="expense" 
                                            nameKey="concept" 
                                            cx="50%" cy="50%" 
                                            innerRadius={90} 
                                            outerRadius={130} 
                                            paddingAngle={2}
                                            stroke="none"
                                            cornerRadius={8}
                                        >
                                            {summaryData.filter(d => d.expense > 0).map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} 
                                                      className="drop-shadow-sm hover:opacity-80 transition-opacity" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-none">
                                    <span className="text-neutral-400 text-[9px] uppercase tracking-[0.2em] font-black">Gastos Totales</span>
                                    <span className="text-3xl font-heading font-black text-red-500 mt-1">
                                        ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-neutral-400 text-sm italic border-2 border-dashed border-[var(--border-color)] rounded-full w-64 mx-auto">
                                No hay gastos registrados
                            </div>
                        )}
                    </div>
                    
                    <div className="w-full md:w-1/3 flex flex-col justify-center">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-6 flex items-center gap-2">
                            <TrendingDown size={14} className="text-red-500" /> Análisis de Gastos
                        </h4>
                        
                        <div className="space-y-4">
                            {summaryData.filter(d => d.expense > 0).sort((a,b) => b.expense - a.expense).slice(0, 4).map((item, index) => (
                                <div key={index} className="group cursor-default">
                                    <div className="flex justify-between items-end mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-xs font-bold text-[var(--text-primary)] uppercase truncate w-32" title={item.concept}>{item.concept}</span>
                                        </div>
                                        <span className="text-xs font-black text-[var(--text-primary)]">
                                            ${item.expense.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full transition-all duration-1000 ease-out" 
                                             style={{ width: `${(item.expense / totalExpenses) * 100}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    </div>
                                </div>
                            ))}
                            {summaryData.filter(d => d.expense > 0).length > 4 && (
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center mt-4">
                                    + {summaryData.filter(d => d.expense > 0).length - 4} categorías más
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 5. Evolución (Placeholder Barras) - Toma 4 columnas */}
                 <div className="xl:col-span-4 bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 border border-[var(--border-color)] dark:border-white/10 shadow-sm flex flex-col justify-center items-center text-center group">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                        <DollarSign size={24} />
                    </div>
                    <h3 className="text-lg font-black font-heading text-[var(--text-primary)] mb-2">Visión 360°</h3>
                    <p className="text-xs text-neutral-400">Revisa el desglose completo en la tabla inferior para un análisis contable a detalle de cada uno de tus conceptos.</p>
                 </div>
            </div>

            {/* TABLA DE DESGLOSE AVANZADA */}
            <div className="mt-6 bg-[var(--bg-card)] dark:bg-white/5 backdrop-blur-xl overflow-hidden rounded-[3rem] border border-[var(--border-color)] dark:border-white/10 shadow-sm">
                <div className="p-8 border-b border-[var(--border-color)] dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h4 className="text-lg font-heading font-black text-[var(--text-primary)]">Desglose Detallado</h4>
                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">Comparativa de flujos por concepto</p>
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
                            {summaryData.sort((a,b) => b.expense - a.expense).map((row, i) => {
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
            
            <style>{`
                /* Specific keyframes for local animations if not globally injected */
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// Mini componente de apoyo
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

export default MovementsSummaryView;


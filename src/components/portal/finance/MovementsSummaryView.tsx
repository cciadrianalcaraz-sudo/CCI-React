import React from 'react';
import { Search, TrendingUp } from 'lucide-react';
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
            <div className="p-16 text-center bg-white/40 backdrop-blur-sm rounded-[32px] border border-white/20">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary/30 mx-auto mb-6">
                    <Search size={32} />
                </div>
                <p className="font-heading font-black text-primary-dark text-xl mb-2">Sin movimientos en este periodo</p>
                <p className="text-neutral-500 max-w-sm mx-auto">No hay registros de ingresos o gastos para el mes seleccionado.</p>
            </div>
        );
    }

    const totalExpenses = summaryData.reduce((a, b) => a + b.expense, 0);
    const totalIncome = summaryData.reduce((a, b) => a + b.income, 0);

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in delay-100">
            {selectedMonth && (
                <h3 className="text-2xl font-black font-heading text-center text-primary-dark mb-10 capitalize flex items-center justify-center gap-4">
                    <div className="h-px bg-neutral-200 flex-1"></div>
                    <span className="bg-white px-6 py-2 rounded-2xl border border-neutral-100 shadow-sm">
                        {monthLabel}
                    </span>
                    <div className="h-px bg-neutral-200 flex-1"></div>
                </h3>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ingresos - Pastel Pequeño */}
                <div className="bg-[var(--bg-card)]/50 dark:bg-white/5 backdrop-blur-sm p-8 rounded-[32px] border border-[var(--border-color)] dark:border-white/10 shadow-sm hover:shadow-md transition-all">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary-dark mb-8 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                        Distribución de Ingresos
                    </h4>
                    <div className="h-64">
                        {summaryData.filter(d => d.income > 0).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={summaryData.filter(d => d.income > 0).sort((a,b) => b.income - a.income)} 
                                        dataKey="income" 
                                        nameKey="concept" 
                                        cx="50%" cy="50%" 
                                        innerRadius={60} outerRadius={80} 
                                        paddingAngle={5}
                                    >
                                        {summaryData.filter(d => d.income > 0).map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-neutral-400 text-sm italic">Sin ingresos</div>
                        )}
                    </div>
                </div>

                {/* Gastos - Dona Grande */}
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm p-8 rounded-[32px] border border-white shadow-sm hover:shadow-md transition-all relative">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary-dark mb-8 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                        Análisis de Gastos por Categoría
                    </h4>
                    <div className="h-[400px]">
                        {summaryData.filter(d => d.expense > 0).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={summaryData.filter(d => d.expense > 0).sort((a,b) => b.expense - a.expense)} 
                                        dataKey="expense" 
                                        nameKey="concept" 
                                        cx="50%" cy="50%" 
                                        innerRadius={110} outerRadius={170} 
                                        paddingAngle={1}
                                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(1)}%`}
                                        labelLine={{stroke: '#9ca3af', strokeWidth: 1}}
                                    >
                                        {summaryData.filter(d => d.expense > 0).map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-neutral-400 text-sm italic">Sin gastos</div>
                        )}
                    </div>
                    
                    <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center -mt-4 pointer-events-none">
                        <span className="text-neutral-400 text-[10px] uppercase tracking-widest font-black">Total Gastos</span>
                        <span className="text-4xl font-heading font-black text-red-500 mt-2">
                            ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabla de Resumen por Concepto */}
            <div className="mt-12 overflow-hidden rounded-[32px] border border-neutral-200 shadow-sm bg-white/50 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-primary-dark text-white text-[10px] uppercase tracking-[0.2em] font-black">
                            <th className="p-5 border-r border-white/10">Concepto</th>
                            <th className="p-5 border-r border-white/10 text-right w-48 font-bold">Total Ingreso</th>
                            <th className="p-5 text-right w-48 font-bold">Total Gasto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] dark:divide-white/5 text-[var(--text-primary)]">
                        {summaryData.map((row) => (
                            <tr key={row.concept} className="hover:bg-[var(--bg-main)] dark:hover:bg-white/5 transition-colors">
                                <td className="p-4 px-6 font-black text-xs uppercase tracking-wider">{row.concept}</td>
                                <td className="p-4 px-6 text-right font-bold text-sm text-green-600">
                                    {row.income > 0 ? `$${row.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                </td>
                                <td className="p-4 px-6 text-right font-bold text-sm text-red-500">
                                    {row.expense > 0 ? `$${row.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-[var(--bg-main)] dark:bg-white/5 font-black border-t-2 border-[var(--border-color)] dark:border-white/10">
                        <tr>
                            <td className="p-5 px-6 text-[10px] uppercase tracking-widest opacity-50">Totales del Periodo</td>
                            <td className="p-5 px-6 text-right text-green-600 border-r border-[var(--border-color)] dark:border-white/10">
                                ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-5 px-6 text-right text-red-500">
                                ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                        <tr className="bg-accent text-white">
                            <td colSpan={2} className="p-4 px-6 text-xs uppercase tracking-[0.15em]">Balance Neto del Mes</td>
                            <td className="p-4 px-6 text-right font-black text-lg">
                                ${(totalIncome - totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default MovementsSummaryView;

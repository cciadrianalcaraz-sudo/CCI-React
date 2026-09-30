import React, { useState, useMemo } from 'react';
import type { FinanceRecord } from '../../../types/finance';
import { TrendingUp, Sparkles, Activity } from 'lucide-react';

interface SavingsSimulatorViewProps {
    records: FinanceRecord[];
}

const SavingsSimulatorView: React.FC<SavingsSimulatorViewProps> = ({ records }) => {
    const [extraMonthly, setExtraMonthly] = useState<number>(2000);
    const [projectionMonths, setProjectionMonths] = useState<number>(12);

    const totalSaved = useMemo(() => {
        const savingsRecords = records.filter(r => (r.expense_type || '').toUpperCase() === 'AHORRO' || (r.concept || '').toUpperCase().includes('AHORRO'));
        return savingsRecords.reduce((acc, r) => {
            const amount = Math.max(Number(r.income) || 0, Number(r.expense) || 0);
            return acc + amount;
        }, 0);
    }, [records]);

    const projectedTotal = totalSaved + (extraMonthly * projectionMonths);

    return (
        <div className="p-8 md:p-10 space-y-8 animate-fade-in relative pb-48">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Simulador de Metas y Ahorro</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Descubre el poder del interés y la constancia</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Visualizer */}
                <div className="lg:col-span-7 space-y-8">
                    {/* The Glass Jar / Visualizer */}
                    <div className="bg-slate-900 dark:bg-white/5 rounded-[3rem] p-8 md:p-12 relative overflow-hidden border border-slate-800 dark:border-white/10 shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5 pointer-events-none" />
                        
                        <div className="text-center z-10 space-y-2 relative">
                            <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">Ahorro Histórico Acumulado</h3>
                            <div className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] tabular-nums">
                                ${totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* Interactive Future Projection Glow */}
                        <div className="mt-16 text-center z-10 w-full relative">
                            <div className="absolute -inset-x-10 top-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
                            <div className="inline-flex items-center gap-5 bg-white/10 backdrop-blur-2xl border border-white/20 px-8 py-5 rounded-3xl shadow-[0_10px_40px_-10px_rgba(16,185,129,0.4)]">
                                <div className="p-2 bg-emerald-500/20 rounded-xl">
                                    <TrendingUp className="text-emerald-400" size={28} />
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">En {projectionMonths} Meses alcanzarás</h4>
                                        <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase shadow-sm">Proyección</span>
                                    </div>
                                    <div className="text-3xl font-black text-white tracking-tight mt-1 tabular-nums">
                                        ${projectedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Controls */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-slate-200 dark:border-white/10 shadow-lg">
                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-8 flex items-center gap-3">
                            <Activity className="text-emerald-500" size={18} />
                            Variables de Simulación
                        </h3>
                        
                        <div className="space-y-10">
                            {/* Slider 1: Extra Monthly */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ahorro Mensual Adicional</label>
                                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                                            ${extraMonthly.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 tabular-nums">
                                        +$ {(extraMonthly * projectionMonths).toLocaleString()} aportación
                                    </div>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="50000" 
                                    step="500"
                                    value={extraMonthly}
                                    onChange={(e) => setExtraMonthly(Number(e.target.value))}
                                    className="w-full h-3 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/20" 
                                />
                            </div>

                            <div className="h-px bg-slate-200 dark:bg-white/5" />

                            {/* Slider 2: Months */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo de Proyección</label>
                                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                                            {projectionMonths} {projectionMonths === 1 ? 'Mes' : 'Meses'}
                                        </div>
                                    </div>
                                    <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20 tabular-nums">
                                        {(projectionMonths / 12).toFixed(1)} Años
                                    </div>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="120" 
                                    step="1"
                                    value={projectionMonths}
                                    onChange={(e) => setProjectionMonths(Number(e.target.value))}
                                    className="w-full h-3 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400 transition-all focus:outline-none focus:ring-4 focus:ring-sky-500/20" 
                                />
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/5">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/5">
                                <strong className="text-slate-700 dark:text-white font-black uppercase tracking-wider block mb-1">Nota de Simulación</strong>
                                Este escenario es una visualización puramente interactiva. Ninguna meta mostrada aquí altera tus registros. El &quot;Ahorro Histórico Acumulado&quot; se calcula automáticamente sumando todos los movimientos con tipo de gasto &quot;Ahorro&quot;.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavingsSimulatorView;

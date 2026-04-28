import React, { useRef, useState } from 'react';
import { Sparkles, Plus, Camera, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from '../../../lib/toast';

interface SnapshotModalProps {
    showSnapshot: boolean;
    setShowSnapshot: (show: boolean) => void;
    summaryData: { concept: string; income: number; expense: number }[];
    uniqueMonths: { label: string; value: string }[];
    selectedMonth: string;
}

export default function SnapshotModal({ 
    showSnapshot, 
    setShowSnapshot, 
    summaryData, 
    uniqueMonths, 
    selectedMonth 
}: SnapshotModalProps) {
    const snapshotRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!showSnapshot) return null;

    const handleDownload = async () => {
        if (!snapshotRef.current) return;
        
        setIsDownloading(true);
        toast.info("Generando imagen...");
        
        try {
            const canvas = await html2canvas(snapshotRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                backgroundColor: null, // Transparent to keep border-radius if needed
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            // Create a temporary link to download
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `Resumen_Financiero_${selectedMonth || 'Global'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success("¡Imagen descargada con éxito!");
            setShowSnapshot(false);
        } catch (error) {
            console.error("Error generating snapshot:", error);
            toast.error("Error al generar la imagen.");
        } finally {
            setIsDownloading(false);
        }
    };

    const totalIncome = summaryData.reduce((a, b) => a + b.income, 0);
    const totalExpense = summaryData.reduce((a, b) => a + b.expense, 0);
    const totalBalance = totalIncome - totalExpense;

    const maxExpense = summaryData.length > 0 
        ? summaryData.reduce((prev, current) => (prev.expense > current.expense) ? prev : current)
        : null;

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowSnapshot(false)}></div>
            <div className="relative z-10 w-full max-w-[380px] bg-white rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/20 animate-scale-in flex flex-col">
                
                {/* Contenedor que será capturado por html2canvas */}
                <div ref={snapshotRef} className="bg-gradient-to-br from-primary-dark to-[#1a3033] p-10 text-white relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                    
                    <div className="flex justify-between items-start mb-12 relative z-10">
                        <div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/5 shadow-xl">
                                <Sparkles size={24} className="text-accent" />
                            </div>
                            <h3 className="text-2xl font-black font-heading leading-tight">Resumen Ejecutivo</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mt-1">
                                {uniqueMonths.find(m => m.value === selectedMonth)?.label || 'General'}
                            </p>
                        </div>
                        {/* El botón de cerrar no debería salir en la captura si lo ponemos fuera del ref, pero por diseño original estaba aquí */}
                        <button onClick={() => setShowSnapshot(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all data-html2canvas-ignore">
                            <Plus size={20} className="rotate-45" />
                        </button>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Balance Total</p>
                            <p className="text-5xl font-black tracking-tighter">
                                ${totalBalance.toLocaleString()}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-green-400">Ingresos</p>
                                <p className="text-xl font-black text-white/90">
                                    +${totalIncome.toLocaleString()}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-red-400">Gastos</p>
                                <p className="text-xl font-black text-white/90">
                                    -${totalExpense.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Mayor Gasto del Mes</p>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                {maxExpense && maxExpense.expense > 0 ? (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black uppercase tracking-tight truncate max-w-[150px]">
                                            {maxExpense.concept}
                                        </span>
                                        <span className="text-sm font-black text-red-400">
                                            ${maxExpense.expense.toLocaleString()}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xs font-bold opacity-30 italic">Sin gastos registrados</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 flex flex-col items-center gap-4 relative z-10">
                        <div className="px-6 py-2 bg-accent/20 rounded-full border border-accent/30">
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent">CCI Portal Clientes</span>
                        </div>
                        <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Generado el {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                
                {/* Sección de Botón de Descarga - Fuera de la captura de html2canvas */}
                <div className="p-6 bg-white dark:bg-[#1a3033] border-t border-neutral-100 dark:border-white/5 mt-auto">
                    <button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full py-4 bg-primary-dark text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Download size={16} /> Descargar Imagen
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Bot, AlertCircle } from 'lucide-react';
import { generateAIBriefing } from '../../../lib/gemini';
import Button from '../../../components/ui/Button';
import type { FinanceRecord, FinanceGoal, FinanceCredit } from '../../../types/finance';
import ReactMarkdown from 'react-markdown';

interface AIBriefingWidgetProps {
    records: FinanceRecord[];
    goals: FinanceGoal[];
    credits: FinanceCredit[];
}

const AIBriefingWidget: React.FC<AIBriefingWidgetProps> = ({ records, goals, credits }) => {
    const [briefing, setBriefing] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // Función para obtener las estadísticas que alimentarán el SuperPrompt de Gemini
    const getStats = () => {
        const today = new Date();
        const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        
        // Obtener el mes anterior (cuidado con Enero)
        const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

        const processRecords = (targetMonth: string) => {
            const monthRecords = records.filter(r => {
                const rMonth = r.date.includes('/') ? r.date.split('/').reverse().join('-').substring(0, 7) : r.date.substring(0, 7);
                return rMonth === targetMonth && (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL';
            });

            const income = monthRecords.reduce((acc, r) => acc + (Number(r.income) || 0), 0);
            const expense = monthRecords.reduce((acc, r) => acc + (Number(r.expense) || 0), 0);

            // Calcular top categorías
            const catMap: Record<string, number> = {};
            monthRecords.forEach(r => {
                if (Number(r.expense) > 0) {
                    const type = r.concept || 'Otros';
                    catMap[type] = (catMap[type] || 0) + Number(r.expense);
                }
            });

            const topCategories = Object.entries(catMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([name, amount]) => ({ name, amount }));

            return { income, expense, topCategories };
        };

        return {
            currentMonth: new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(today),
            current: processRecords(currentMonthStr),
            previous: processRecords(prevMonthStr),
            goals,
            credits
        };
    };

    const fetchBriefing = async (force: boolean = false) => {
        const cached = localStorage.getItem('ai_last_briefing');
        const cachedDate = localStorage.getItem('ai_last_briefing_date');
        const todayStr = new Date().toISOString().split('T')[0];

        // Si no se fuerza y ya hay caché de hoy, lo usamos
        if (!force && cached && cachedDate === todayStr) {
            setBriefing(cached);
            return;
        }

        setIsLoading(true);
        setError('');
        
        try {
            const stats = getStats();
            const response = await generateAIBriefing(stats);
            
            if (response) {
                setBriefing(response);
                localStorage.setItem('ai_last_briefing', response);
                localStorage.setItem('ai_last_briefing_date', todayStr);
            } else {
                setError("No se pudo generar el análisis. Verifica la conexión.");
            }
        } catch (err) {
            console.error("AI Briefing failed:", err);
            setError("Hubo un problema de conexión con el Asesor Gemini.");
        } finally {
            setIsLoading(false);
        }
    };

    // Intentar cargar la primera vez
    useEffect(() => {
        if (records.length > 0) {
            fetchBriefing(false);
        }
    }, [records]);

    if (!records || records.length === 0) return null;

    return (
        <div className="w-full relative bg-gradient-to-br from-primary-dark via-primary-dark to-black rounded-[3rem] p-10 shadow-2xl overflow-hidden mt-6 mb-12 border border-white/10 group">
            {/* Elementos Decorativos */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-accent/30 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] -ml-10 -mb-10"></div>
            
            {/* Cabecera del Widget */}
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                        <Sparkles size={28} className="text-accent animate-pulse-subtle" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            Executive Copilot
                            <div className="bg-accent/20 text-accent text-[9px] px-2 py-0.5 rounded-full border border-accent/20 font-bold tracking-widest uppercase inline-flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                                Live AI
                            </div>
                        </h2>
                        <p className="text-xs text-white/50 font-medium tracking-wide mt-1">
                            Análisis proactivo de tu salud financiera actual.
                        </p>
                    </div>
                </div>
                
                <Button 
                    outline 
                    onClick={() => fetchBriefing(true)}
                    disabled={isLoading}
                    className="border-white/20 text-white hover:bg-white/10 text-xs py-2 w-full sm:w-auto flex items-center gap-2 justify-center"
                >
                    {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {isLoading ? 'Analizando...' : 'Actualizar Insight'}
                </Button>
            </div>

            {/* Contenido del Briefing (Markdown) */}
            <div className="relative z-10">
                {isLoading && !briefing ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4 text-white/50">
                        <Bot size={40} className="animate-bounce text-accent/50" />
                        <p className="text-sm font-medium animate-pulse">Consultando patrones financieros...</p>
                    </div>
                ) : error ? (
                    <div className="py-10 flex flex-col items-center justify-center gap-3 text-red-400">
                        <AlertCircle size={32} />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                ) : (
                    <div className="prose prose-invert max-w-none prose-p:text-white/80 prose-headings:text-white prose-strong:text-accent prose-li:text-white/80 prose-ul:list-disc">
                        {briefing ? (
                            <ReactMarkdown>{briefing}</ReactMarkdown>
                        ) : (
                            <p className="text-white/50 italic">Todavía no hay suficientes datos para generar un insight profundo. Registra algunos movimientos primero.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIBriefingWidget;

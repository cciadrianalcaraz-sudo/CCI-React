import React from 'react';
import { 
    Plus, Upload, Download, Calendar, Search, X, Printer, 
    TrendingUp, TrendingDown, Camera, Wallet
} from 'lucide-react';

interface FinanceHeaderProps {
    viewMode: 'detailed' | 'balances' | 'budget' | 'credits';
    setViewMode: (mode: 'detailed' | 'balances' | 'budget' | 'credits') => void;
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
    uniqueMonths: {label: string, value: string}[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isUploading: boolean;
    onImportExcel: () => void;
    onExportExcel: () => void;
    onRefresh: () => void;
    onExportPDF: () => void;
    onShowSnapshot: () => void;
    onToggleForm: () => void;
    isFormOpen: boolean;
    kpis: {
        income: number;
        expense: number;
        balance: number;
    };
}

const FinanceHeader: React.FC<FinanceHeaderProps> = ({
    viewMode, setViewMode,
    selectedMonth, setSelectedMonth, uniqueMonths,
    searchTerm, setSearchTerm,
    isUploading, onImportExcel, onExportExcel, onExportPDF,
    onShowSnapshot,
    onToggleForm, isFormOpen,
    kpis
}) => {
    return (
        <div className="bg-transparent">
            {/* Main Header Section */}
            <div className="p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="animate-slide-up">
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Centro Financiero</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Gestión Inteligente de Patrimonio
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 animate-slide-up delay-100">
                    <div className="flex bg-white dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                        {[
                            { icon: Camera, title: 'Snapshot', action: onShowSnapshot, color: 'text-sky-500', bg: 'hover:bg-sky-500/10' },
                            { icon: Upload, title: 'Importar', action: onImportExcel, color: 'text-indigo-500', bg: 'hover:bg-indigo-500/10', disabled: isUploading },
                            { icon: Download, title: 'Exportar', action: onExportExcel, color: 'text-emerald-500', bg: 'hover:bg-emerald-500/10' },
                            { icon: Printer, title: 'Reporte', action: onExportPDF, color: 'text-rose-500', bg: 'hover:bg-rose-500/10' }
                        ].map((btn, i) => (
                            <button
                                key={i}
                                onClick={btn.action}
                                disabled={btn.disabled}
                                title={btn.title}
                                className={`p-3 rounded-xl transition-all duration-300 ${btn.bg} ${btn.color} active:scale-90 group relative`}
                            >
                                <btn.icon size={20} strokeWidth={2.5} />
                                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    {btn.title}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={onToggleForm}
                        className={`py-3.5 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-500 flex items-center gap-3 shadow-xl ${
                            isFormOpen 
                                ? 'bg-slate-800 text-white shadow-slate-900/20' 
                                : 'bg-sky-500 text-white shadow-sky-500/25 hover:bg-sky-600 hover:-translate-y-0.5'
                        }`}
                    >
                        {isFormOpen ? <X size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                        <span>{isFormOpen ? 'Cerrar Panel' : 'Nuevo Registro'}</span>
                    </button>
                </div>
            </div>

            {/* KPI Summary Section */}
            <div className="px-8 md:px-10 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Ingresos Totales', value: kpis.income, color: 'text-emerald-600', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10', icon: TrendingUp },
                        { label: 'Gastos Ejecutados', value: kpis.expense, color: 'text-rose-600', bg: 'bg-rose-500/5', border: 'border-rose-500/10', icon: TrendingDown },
                        { label: 'Balance Neto', value: kpis.balance, color: kpis.balance >= 0 ? 'text-sky-600' : 'text-rose-600', bg: 'bg-slate-900', border: 'border-white/5', icon: Wallet, dark: true }
                    ].map((kpi, i) => (
                        <div key={i} className={`p-6 rounded-[2rem] border ${kpi.bg} ${kpi.border} shadow-sm group hover:shadow-md transition-all duration-500 animate-slide-up`} style={{ animationDelay: `${200 + i * 100}ms` }}>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-black uppercase tracking-[0.15em] opacity-40 ${kpi.dark ? 'text-white' : 'text-slate-900'}`}>{kpi.label}</span>
                                <div className={`p-2 rounded-xl ${kpi.dark ? 'bg-white/10 text-white' : 'bg-white dark:bg-white/5 text-slate-400 group-hover:text-accent'}`}>
                                    <kpi.icon size={16} />
                                </div>
                            </div>
                            <p className={`text-2xl font-black tracking-tight ${kpi.dark ? 'text-white' : kpi.color}`}>
                                ${kpi.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation & Filters Section */}
            <div className="px-8 md:px-10 pb-6 border-b border-slate-200 dark:border-white/5">
                <div className="flex flex-col xl:flex-row justify-between items-center gap-6 bg-white dark:bg-white/[0.03] p-2 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-xl">
                    <nav className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-full w-full xl:w-auto overflow-x-auto no-scrollbar">
                        {(['detailed', 'balances', 'budget', 'credits'] as const).map((mode) => (
                            <button 
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-8 py-3 rounded-full text-[10px] font-black tracking-[0.15em] uppercase transition-all duration-300 whitespace-nowrap ${
                                    viewMode === mode 
                                        ? 'bg-white dark:bg-white/10 text-sky-500 shadow-sm scale-[1.02]' 
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                                }`}
                            >
                                {mode === 'detailed' ? 'Movimientos' : 
                                 mode === 'balances' ? 'Cuentas' : 
                                 mode === 'budget' ? 'Presupuesto' : 'Créditos'}
                            </button>
                        ))}
                    </nav>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto px-4">
                        {viewMode === 'detailed' && (
                            <div className="relative w-full sm:w-72 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={16} strokeWidth={3} />
                                <input 
                                    type="text"
                                    placeholder="FILTRAR REGISTROS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-100 dark:bg-white/5 pl-11 pr-10 py-3 rounded-2xl text-[10px] font-black tracking-widest outline-none border border-transparent focus:border-sky-500/50 transition-all placeholder:text-slate-300"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors">
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                        )}
                        
                        <div className="relative w-full sm:w-auto">
                            <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 px-6 py-3 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all group cursor-pointer">
                                <Calendar size={16} className="text-slate-400 group-hover:text-sky-500 transition-colors" strokeWidth={2.5} />
                                <select 
                                    value={selectedMonth} 
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="bg-transparent text-[10px] font-black text-slate-500 dark:text-slate-400 outline-none cursor-pointer uppercase tracking-widest appearance-none pr-8"
                                >
                                    {uniqueMonths.map(m => (
                                        <option key={m.value} value={m.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{m.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-6 pointer-events-none text-slate-300">
                                    <TrendingDown size={12} strokeWidth={4} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceHeader;

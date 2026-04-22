import React from 'react';
import { 
    Plus, Upload, Download, Calendar, Search, X, Printer, 
    TrendingUp, TrendingDown, DollarSign 
} from 'lucide-react';
import Button from '../../ui/Button';

interface FinanceHeaderProps {
    viewMode: 'dashboard' | 'detailed' | 'balances' | 'budget' | 'credits';
    setViewMode: (mode: 'dashboard' | 'detailed' | 'balances' | 'budget' | 'credits') => void;
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
    isUploading, onImportExcel, onExportExcel, onRefresh, onExportPDF,
    onToggleForm, isFormOpen,
    kpis
}) => {
    return (
        <div className="bg-[var(--bg-main)]">
            <div className="p-8 border-b border-[var(--border-color)] dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">Registro de Finanzas Personales</h2>
                    <p className="text-sm opacity-40 mt-1">Control de ingresos, gastos y saldo al día.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button outline className="text-[10px] font-black uppercase tracking-widest py-2.5 px-5 flex items-center gap-2 border-[var(--border-color)] hover:border-accent transition-all" onClick={onImportExcel} disabled={isUploading}>
                        <Upload size={14} className="opacity-70" /> {isUploading ? 'Importando...' : 'Importar Excel'}
                    </Button>
                    <Button outline className="text-[10px] font-black uppercase tracking-widest py-2.5 px-5 flex items-center gap-2 border-[var(--border-color)] hover:border-accent transition-all" onClick={onExportExcel}>
                        <Download size={14} className="opacity-70" /> Exportar
                    </Button>
                    <Button outline className="text-[10px] font-black uppercase tracking-widest py-2.5 px-5 flex items-center gap-2 border-[var(--border-color)] hover:border-accent transition-all" onClick={onRefresh}>
                        <Calendar size={14} className="opacity-70" /> Actualizar
                    </Button>
                    <div className="flex items-center gap-3">
                        <Button 
                            outline 
                            className="text-[10px] font-black uppercase tracking-widest py-2.5 px-6 flex items-center gap-2"
                            onClick={onExportPDF}
                        >
                            <Printer size={14} /> Reporte PDF
                        </Button>
                        <Button primary className="text-[10px] font-black uppercase tracking-widest py-2.5 px-6 flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all" onClick={onToggleForm}>
                            <Plus size={14} /> {isFormOpen ? 'Cerrar Panel' : 'Nuevo Registro'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="pt-4 pb-2 border-b border-[var(--border-color)]">
                {/* GLOBAL KPI BAR */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 px-8">
                    <div className="bg-[var(--bg-card)] dark:bg-white/5 p-4 rounded-2xl border border-[var(--border-color)] dark:border-white/10 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-5 text-green-600 group-hover:scale-110 transition-transform"><TrendingUp size={40} /></div>
                        <p className="opacity-40 font-bold uppercase tracking-widest text-[10px] mb-1">Ingresos Periodo</p>
                        <p className="text-xl font-heading font-black text-green-600">
                            ${kpis.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-[var(--bg-card)] dark:bg-white/5 p-4 rounded-2xl border border-[var(--border-color)] dark:border-white/10 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-5 text-red-600 group-hover:scale-110 transition-transform"><TrendingDown size={40} /></div>
                        <p className="opacity-40 font-bold uppercase tracking-widest text-[10px] mb-1">Gastos Periodo</p>
                        <p className="text-xl font-heading font-black text-red-500">
                            ${kpis.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-primary-dark to-[#3d686d] p-4 rounded-2xl shadow-lg flex flex-col justify-center relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-20 text-white group-hover:rotate-12 transition-transform"><DollarSign size={40} /></div>
                        <p className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-1">Balance Periodo</p>
                        <p className="text-xl font-heading font-black text-white">
                            ${kpis.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[var(--bg-card)]/60 dark:bg-white/5 p-2 mx-8 rounded-[24px] border border-[var(--border-color)] dark:border-white/10 shadow-sm backdrop-blur-md">
                    <div className="flex bg-[var(--bg-card)]/80 dark:bg-white/5 p-1.5 rounded-full shadow-sm border border-[var(--border-color)] dark:border-white/10 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {(['detailed', 'balances', 'budget', 'credits'] as const).map((mode) => (
                            <button 
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${viewMode === mode ? 'bg-accent text-white shadow-lg scale-[1.02]' : 'opacity-40 hover:opacity-100 hover:bg-neutral-50 dark:hover:bg-white/10'}`}
                            >
                                {mode === 'detailed' ? 'Registro' : 
                                 mode === 'balances' ? 'Saldos' : 
                                 mode === 'budget' ? 'Presupuesto' : 'Créditos'}
                            </button>
                        ))}
                    </div>
                    
                    {uniqueMonths.length > 0 && (
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            {viewMode === 'detailed' && (
                                <div className="flex items-center gap-2 bg-[var(--bg-card)]/80 dark:bg-white/5 px-4 py-2 rounded-full border border-[var(--border-color)] dark:border-white/10 shadow-sm transition-all focus-within:border-accent group w-full md:w-64">
                                    <Search size={16} className="text-neutral-400 group-focus-within:text-accent transition-colors" />
                                    <input 
                                        type="text"
                                        placeholder="Buscar..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-transparent text-sm font-bold text-[var(--text-primary)] outline-none w-full"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="text-neutral-400 hover:text-red-500 transition-colors">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-2 bg-[var(--bg-card)]/80 dark:bg-white/5 px-4 py-2 rounded-full border border-[var(--border-color)] dark:border-white/10 shadow-sm transition-all hover:border-accent group">
                                <Calendar size={16} className="text-neutral-400 group-hover:text-accent transition-colors" />
                                <select 
                                    value={selectedMonth} 
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="bg-transparent text-sm font-black text-[var(--text-primary)] outline-none cursor-pointer capitalize appearance-none pr-6 relative"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%234A7C82\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '16px' }}
                                >
                                    {uniqueMonths.map(m => (
                                        <option key={m.value} value={m.value} className="bg-[var(--bg-card)]">{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinanceHeader;

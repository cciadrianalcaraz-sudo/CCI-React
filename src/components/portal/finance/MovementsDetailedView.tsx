import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { FinanceRecord } from '../../../types/finance';
import { formatDate } from '../../../utils/financeUtils';
import { useDragScroll } from '../../../hooks/useDragScroll';

interface MovementsDetailedViewProps {
    records: FinanceRecord[];
    onEdit: (record: FinanceRecord) => void;
    onDelete: (id: string) => void;
}

const SortIcon: React.FC<{ 
    column: keyof FinanceRecord | 'index'; 
    sortConfig: { key: keyof FinanceRecord | 'index'; direction: 'asc' | 'desc' } | null 
}> = ({ column, sortConfig }) => {
    if (!sortConfig || sortConfig.key !== column) return <ChevronsUpDown size={12} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-accent dark:text-amber-500" /> : <ChevronDown size={12} className="text-accent dark:text-amber-500" />;
};

const MovementsDetailedView: React.FC<MovementsDetailedViewProps> = ({
    records,
    onEdit,
    onDelete
}) => {
    const dragScrollRef = useDragScroll();
    const [sortConfig, setSortConfig] = useState<{ key: keyof FinanceRecord | 'index'; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });

    const handleSort = (key: keyof FinanceRecord | 'index') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    const sortedRecords = useMemo(() => {
        // Separamos SALDO INICIAL para dejarlos siempre abajo
        const initialBalanceRecords = records.filter(r => (r.concept || '').toUpperCase().trim() === 'SALDO INICIAL');
        const normalRecords = records.filter(r => (r.concept || '').toUpperCase().trim() !== 'SALDO INICIAL');

        if (sortConfig !== null) {
            normalRecords.sort((a, b) => {
                let aValue: string | number;
                let bValue: string | number;

                if (sortConfig.key === 'index') {
                    // Si es index, usamos la posición original en el array records
                    aValue = records.indexOf(a);
                    bValue = records.indexOf(b);
                } else {
                    const key = sortConfig.key as keyof FinanceRecord;
                    aValue = a[key] ?? '';
                    bValue = b[key] ?? '';
                }

                // Manejo de tipos numéricos para que el sort sea correcto
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                }

                // Manejo de strings
                const aStr = String(aValue).toLowerCase();
                const bStr = String(bValue).toLowerCase();

                if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return [...normalRecords, ...initialBalanceRecords];
    }, [records, sortConfig]);

    const [isMobileVisible, setIsMobileVisible] = useState(false);

    if (records.length === 0) {
        return (
            <div className="p-12 text-center text-neutral-400">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary/30">
                        <Search size={24} />
                    </div>
                </div>
                <p className="font-bold text-primary-dark mb-1">Sin registros financieros</p>
                <p className="text-sm">Comienza agregando tu primer movimiento o ajusta los filtros.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Mobile Toggle Button */}
            <div className="md:hidden px-2">
                <button 
                    onClick={() => setIsMobileVisible(!isMobileVisible)}
                    className="w-full flex items-center justify-between p-6 bg-white dark:bg-white/5 border border-[var(--border-color)] dark:border-white/10 rounded-[2rem] shadow-sm active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                            <ChevronsUpDown size={20} />
                        </div>
                        <div className="text-left">
                            <span className="block text-sm font-black text-primary-dark dark:text-white uppercase tracking-wider">Historial de Movimientos</span>
                            <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{records.length} registros en total</span>
                        </div>
                    </div>
                    <div className={`p-2 rounded-full bg-neutral-50 dark:bg-white/5 transition-transform duration-300 ${isMobileVisible ? 'rotate-180' : ''}`}>
                        <ChevronDown size={18} />
                    </div>
                </button>
            </div>

            {/* Content Wrapper */}
            <div className={`${!isMobileVisible ? 'hidden md:block' : 'block animate-fade-in'}`}>
                <div className="bg-[var(--bg-card)]/50 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-[var(--border-color)] dark:border-white/10 shadow-sm overflow-hidden">
                    <div ref={dragScrollRef} className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black/5 dark:border-white/5">
                                    {[
                                        { key: 'index', label: 'ID' },
                                        { key: 'concept', label: 'Concepto' },
                                        { key: 'date', label: 'Fecha' },
                                        { key: 'payment_method', label: 'Pago' },
                                        { key: 'provider', label: 'Proveedor' },
                                        { key: 'income', label: 'Ingreso', align: 'right' },
                                        { key: 'expense', label: 'Gasto', align: 'right' },
                                        { key: 'balance', label: 'Saldo', align: 'right' },
                                        { key: 'description', label: 'Descripción' }
                                    ].map((col) => (
                                        <th 
                                            key={col.key}
                                            className={`sticky top-0 z-10 p-5 whitespace-nowrap bg-white/90 dark:bg-black/60 backdrop-blur-xl text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors group ${col.align === 'right' ? 'text-right' : ''}`}
                                            onClick={() => handleSort(col.key as any)}
                                        >
                                            <div className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' : ''}`}>
                                                {col.label} <SortIcon column={col.key as any} sortConfig={sortConfig} />
                                            </div>
                                        </th>
                                    ))}
                                    <th className="sticky top-0 z-10 p-5 text-center whitespace-nowrap bg-white/90 dark:bg-black/60 backdrop-blur-xl text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                {sortedRecords.map((record) => {
                                    const originalIndex = records.indexOf(record);
                                    const isInitialBalance = record.concept.toUpperCase() === 'SALDO INICIAL';
                                    const isTransfer = (record.concept || '').toUpperCase().includes('TRASPASO') || (record.expense_type || '').toUpperCase() === 'TRASPASO';
                                    return (
                                        <tr key={record.id} className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors group ${isInitialBalance ? 'bg-amber-500/5' : isTransfer ? 'bg-sky-500/5' : ''}`}>
                                            <td className="p-4 px-5 whitespace-nowrap opacity-40 font-mono text-[11px] font-semibold">{originalIndex + 1}</td>
                                            <td className="p-4 px-5 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[13px] uppercase tracking-wide group-hover:text-accent transition-colors">{record.concept}</span>
                                                    {isInitialBalance && <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-amber-500/20">Ajuste</span>}
                                                    {isTransfer && <span className="text-[9px] bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-sky-500/20">Traspaso</span>}
                                                </div>
                                                <div className="mt-1.5 flex gap-2">
                                                    <span className={`text-[9px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                                                        record.expense_type === 'Fijo' ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20' :
                                                        record.expense_type === 'Ahorro' ? 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20' :
                                                        record.expense_type === 'Deuda' ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20' :
                                                        record.expense_type === 'Ingreso' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' :
                                                        record.expense_type === 'Traspaso' ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20' :
                                                        'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20'
                                                    }`}>
                                                        {record.expense_type || 'Variable'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 px-5 whitespace-nowrap text-[12px] opacity-70 font-mono">
                                                {formatDate(record.date)}
                                            </td>
                                            <td className="p-4 px-5 whitespace-nowrap">
                                                <span className="bg-black/5 dark:bg-white/10 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-black/5 dark:border-white/5 shadow-sm">{record.payment_method}</span>
                                            </td>
                                            <td className="p-4 px-5 whitespace-nowrap text-[13px] font-medium opacity-70">{record.provider}</td>
                                            <td className="p-4 px-5 text-right whitespace-nowrap">
                                                <span className={`font-mono tabular-nums font-semibold tracking-tight text-[15px] ${Number(record.income) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-30'}`}>
                                                    {(isInitialBalance || isTransfer) ? (record.income > 0 ? `+$${Number(record.income).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-') : (Number(record.income) !== 0 ? `+$${Number(record.income).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-')}
                                                </span>
                                            </td>
                                            <td className="p-4 px-5 text-right whitespace-nowrap">
                                                <span className={`font-mono tabular-nums font-semibold tracking-tight text-[15px] ${Number(record.expense) > 0 ? 'text-rose-600 dark:text-rose-400' : 'opacity-30'}`}>
                                                    {(isInitialBalance || isTransfer) ? (record.expense > 0 ? `-$${Number(record.expense).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-') : (Number(record.expense) !== 0 ? `-$${Number(record.expense).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-')}
                                                </span>
                                            </td>
                                            <td className="p-4 px-5 text-right whitespace-nowrap">
                                                <span className={`font-mono tabular-nums font-bold tracking-tight text-[15px] ${Number(record.balance) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-white'}`}>
                                                    ${Number(record.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="p-4 px-5 text-[12px] opacity-60 max-w-xs truncate">{record.description}</td>
                                            <td className="p-4 px-5">
                                                <div className="flex justify-center gap-2 opacity-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onEdit(record); }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-white hover:bg-accent hover:text-white hover:scale-105 active:scale-95 transition-all shadow-sm"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-white/10 text-rose-500 hover:bg-rose-500 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-sm"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovementsDetailedView;

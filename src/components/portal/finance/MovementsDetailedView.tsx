import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { FinanceRecord } from '../../../types/finance';
import { formatDate } from '../../../utils/financeUtils';

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
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-white" /> : <ChevronDown size={12} className="text-white" />;
};

const MovementsDetailedView: React.FC<MovementsDetailedViewProps> = ({
    records,
    onEdit,
    onDelete
}) => {
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
        <div className="bg-[var(--bg-card)]/50 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-[var(--border-color)] dark:border-white/10 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse animate-fade-in delay-100">
                <thead>
                    <tr className="border-b border-[var(--border-color)] dark:border-white/10">
                        <th 
                            className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                            onClick={() => handleSort('index')}
                        >
                            <div className="flex items-center gap-2">ID <SortIcon column="index" sortConfig={sortConfig} /></div>
                        </th>
                        <th 
                            className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                            onClick={() => handleSort('concept')}
                        >
                            <div className="flex items-center gap-2">Concepto <SortIcon column="concept" sortConfig={sortConfig} /></div>
                        </th>
                        <th 
                            className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                            onClick={() => handleSort('date')}
                        >
                            <div className="flex items-center gap-2">Fecha <SortIcon column="date" sortConfig={sortConfig} /></div>
                        </th>
                        <th 
                            className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                            onClick={() => handleSort('payment_method')}
                        >
                            <div className="flex items-center gap-2">Pago <SortIcon column="payment_method" sortConfig={sortConfig} /></div>
                        </th>
                        <th 
                            className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                            onClick={() => handleSort('provider')}
                        >
                            <div className="flex items-center gap-2">Proveedor <SortIcon column="provider" sortConfig={sortConfig} /></div>
                        </th>
                        <th 
                            className="sticky top-0 z-10 p-5 text-right whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                            onClick={() => handleSort('income')}
                        >
                            <div className="flex items-center justify-end gap-2">Ingreso <SortIcon column="income" sortConfig={sortConfig} /></div>
                        </th>
                        <th 
                            className="sticky top-0 z-10 p-5 text-right whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                            onClick={() => handleSort('expense')}
                        >
                            <div className="flex items-center justify-end gap-2">Gasto <SortIcon column="expense" sortConfig={sortConfig} /></div>
                        </th>
                        <th 
                            className="sticky top-0 z-10 p-5 text-right whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                            onClick={() => handleSort('balance')}
                        >
                            <div className="flex items-center justify-end gap-2">Saldo <SortIcon column="balance" sortConfig={sortConfig} /></div>
                        </th>
                        <th 
                            className="sticky top-0 z-10 p-5 whitespace-nowrap max-w-xs bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black/10 transition-colors group"
                            onClick={() => handleSort('description')}
                        >
                            <div className="flex items-center gap-2">Descripción <SortIcon column="description" sortConfig={sortConfig} /></div>
                        </th>
                        <th className="sticky top-0 z-10 p-5 text-center whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em]">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] dark:divide-white/5">
                    {sortedRecords.map((record) => {
                        const originalIndex = records.indexOf(record);
                        const isInitialBalance = record.concept.toUpperCase() === 'SALDO INICIAL';
                        return (
                            <tr key={record.id} className={`hover:bg-[var(--bg-main)] dark:hover:bg-white/5 transition-colors group ${isInitialBalance ? 'bg-amber-500/10' : ''}`}>
                                <td className="p-4 px-5 whitespace-nowrap opacity-40 font-bold text-[10px]">{originalIndex + 1}</td>
                                <td className="p-4 px-5 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-xs uppercase tracking-wider">{record.concept}</span>
                                        {isInitialBalance && <span className="text-[8px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Ajuste</span>}
                                    </div>
                                    <div className="mt-1">
                                        <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest ${
                                            record.expense_type === 'Fijo' ? 'bg-indigo-100 text-indigo-700' :
                                            record.expense_type === 'Ahorro' ? 'bg-teal-100 text-teal-700' :
                                            record.expense_type === 'Deuda' ? 'bg-orange-100 text-orange-700' :
                                            record.expense_type === 'Ingreso' ? 'bg-green-100 text-green-700' :
                                            'bg-neutral-100 text-neutral-500'
                                        }`}>
                                            {record.expense_type || 'Variable'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 px-5 whitespace-nowrap text-xs opacity-60 font-medium">
                                    {formatDate(record.date)}
                                </td>
                                <td className="p-4 px-5 whitespace-nowrap">
                                    <span className="bg-[var(--bg-main)] dark:bg-white/10 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">{record.payment_method}</span>
                                </td>
                                <td className="p-4 px-5 whitespace-nowrap text-xs font-medium opacity-60">{record.provider}</td>
                                <td className="p-4 px-5 text-right whitespace-nowrap text-green-600 font-bold text-sm">
                                    {isInitialBalance ? '-' : (Number(record.income) !== 0 ? `$${Number(record.income).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-')}
                                </td>
                                <td className="p-4 px-5 text-right whitespace-nowrap text-red-500 font-bold text-sm">
                                    {isInitialBalance ? '-' : (Number(record.expense) !== 0 ? `$${Number(record.expense).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-')}
                                </td>
                                <td className={`p-4 px-5 text-right whitespace-nowrap font-black text-sm ${Number(record.balance) < 0 ? 'text-red-500' : ''}`}>
                                    ${Number(record.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-4 px-5 text-xs opacity-40 max-w-xs truncate italic">{record.description}</td>
                                <td className="p-4 px-5">
                                    <div className="flex justify-center gap-3">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onEdit(record); }}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl text-primary-dark/60 hover:text-white hover:bg-accent hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl text-red-500/60 hover:text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default MovementsDetailedView;

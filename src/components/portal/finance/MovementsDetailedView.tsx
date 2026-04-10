import React from 'react';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { FinanceRecord } from '../../../types/finance';
import { formatDate } from '../../../utils/financeUtils';

interface MovementsDetailedViewProps {
    records: FinanceRecord[];
    onEdit: (record: FinanceRecord) => void;
    onDelete: (id: string) => void;
}

const MovementsDetailedView: React.FC<MovementsDetailedViewProps> = ({
    records,
    onEdit,
    onDelete
}) => {
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
                        <th className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em]">ID</th>
                        <th className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em]">Concepto</th>
                        <th className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em]">Fecha</th>
                        <th className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em]">Pago</th>
                        <th className="sticky top-0 z-10 p-5 whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em]">Proveedor</th>
                        <th className="sticky top-0 z-10 p-5 text-right whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em]">Ingreso</th>
                        <th className="sticky top-0 z-10 p-5 text-right whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em]">Gasto</th>
                        <th className="sticky top-0 z-10 p-5 text-right whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em]">Saldo</th>
                        <th className="sticky top-0 z-10 p-5 whitespace-nowrap max-w-xs bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em]">Descripción</th>
                        <th className="sticky top-0 z-10 p-5 text-center whitespace-nowrap bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em]">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] dark:divide-white/5">
                    {records.map((record, index) => {
                        const isInitialBalance = record.concept.toUpperCase() === 'SALDO INICIAL';
                        return (
                            <tr key={record.id} className={`hover:bg-[var(--bg-main)] dark:hover:bg-white/5 transition-colors group ${isInitialBalance ? 'bg-amber-500/10' : ''}`}>
                                <td className="p-4 px-5 whitespace-nowrap opacity-40 font-bold text-[10px]">{index + 1}</td>
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
                                    <div className="flex justify-center gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onEdit(record); }}
                                            className="p-2 hover:bg-primary-dark/10 rounded-xl text-primary-dark transition-all hover:scale-110 active:scale-95"
                                            title="Editar"
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                                            className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-all hover:scale-110 active:scale-95"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={15} />
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

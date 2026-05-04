import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

import { toast } from '../../lib/toast';
import { Toaster } from '../ui/Toaster';
import { useConfirm } from '../../hooks/useConfirm';

import { useFinance } from '../../hooks/useFinance';
import { useFinanceCalculations } from '../../hooks/useFinanceCalculations';
import { importFromExcel, exportToExcel, exportToPDF } from '../../utils/financeImportExport';

import FinanceHeader from './finance/FinanceHeader';
import RecordForm from './finance/RecordForm';
import MovementsDetailedView from './finance/MovementsDetailedView';
import BudgetTracker from './finance/BudgetTracker';
import CreditsManager from './finance/CreditsManager';
import BalancesManager from './finance/BalancesManager';
import SnapshotModal from './finance/SnapshotModal';

import type { FinanceRecord } from '../../types/finance';

interface FinanceTrackerProps {
    user: { id: string; [key: string]: unknown };
    records?: FinanceRecord[];
    onRefresh?: () => void;
}

export default function FinanceTracker({ user, records: propsRecords, onRefresh }: FinanceTrackerProps) {
    const { 
        records, 
        loading, 
        paymentMethods: savedPaymentMethods, 
        credits, 
        goals,
        companyIds,
        refreshRecords: loadRecords,
        refreshPaymentMethods: loadPaymentMethods
    } = useFinance(user, propsRecords);

    const {
        selectedMonth,
        setSelectedMonth,
        uniqueMonths,
        summaryData,
        uniqueConcepts,
        paymentBalancesData,
        budgetData,
        getDisplayRecords,
        loadManualBudgets
    } = useFinanceCalculations(records, companyIds);

    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const [viewMode, setViewMode] = useState<'detailed' | 'balances' | 'budget' | 'credits'>(() => {
        const saved = localStorage.getItem(`finance_view_mode_${user.id}`);
        const validModes = ['detailed', 'balances', 'budget', 'credits'];
        return (saved && validModes.includes(saved)) ? (saved as any) : 'detailed';
    });

    useEffect(() => {
        if (user?.id) {
            localStorage.setItem(`finance_view_mode_${user.id}`, viewMode);
        }
    }, [viewMode, user?.id]);

    const [concept, setConcept] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [provider, setProvider] = useState('');
    const [income, setIncome] = useState<number | ''>('');
    const [expense, setExpense] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [expenseType, setExpenseType] = useState('Variable');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSnapshot, setShowSnapshot] = useState(false);
    const [isProcessingOCR, setIsProcessingOCR] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { confirm, ConfirmModal } = useConfirm();

    // Smart Categorization Logic
    useEffect(() => {
        if (editingId) return; 
        
        const conceptUpper = (concept || '').toUpperCase();
        const providerUpper = (provider || '').toUpperCase();
        const combined = `${conceptUpper} ${providerUpper}`;

        const SMART_MAP = {
            'Variable': ['AMAZON', 'UBER', 'DIDI', 'NETFLIX', 'SPOTIFY', 'RESTAURANTE', 'CINE', 'STARBUCKS', 'RAPPI', 'MERCADO LIBRE', 'APPLE', 'VAPE', 'TIENDA'],
            'Fijo': ['CFE', 'RENTA', 'INTERNET', 'TELCEL', 'IZZI', 'TOTALPLAY', 'AGUA', 'GAS', 'HIPOTECA', 'SEGURO', 'PPR', 'MANTENIMIENTO'],
            'Ingreso': ['SUELDO', 'HONORARIOS', 'PAGO', 'VENTA', 'DIVIDENDO', 'CASHBACK', 'NOMINA', 'TRANSFERENCIA RECIBIDA'],
            'Ahorro': ['CETES', 'GBM', 'INVERSION', 'AHORRO', 'NU', 'BONOS'],
            'Deuda': ['TARJETA', 'PRESTAMO', 'CREDITO', 'PAGO A DEUDA']
        };

        for (const [type, keywords] of Object.entries(SMART_MAP)) {
            if (keywords.some(kw => combined.includes(kw))) {
                setExpenseType(type);
                break;
            }
        }
    }, [concept, provider, editingId]);

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const numIncome = Number(income) || 0;
            const numExpense = Number(expense) || 0;

            if (editingId) {
                const { error, data } = await supabase
                    .from('finance_records')
                    .update({
                        concept,
                        date,
                        payment_method: paymentMethod,
                        provider,
                        income: numIncome,
                        expense: numExpense,
                        description,
                        expense_type: expenseType
                    })
                    .eq('id', editingId)
                    .select();

                if (error) throw error;
                if (data && data.length > 0) {
                    loadRecords();
                    resetForm();
                    setIsFormOpen(false);
                    toast.success('Registro actualizado correctamente.');
                }
            } else {
                const { data, error } = await supabase
                    .from('finance_records')
                    .insert([{
                        user_id: user.id,
                        concept,
                        date,
                        payment_method: paymentMethod,
                        provider,
                        income: numIncome,
                        expense: numExpense,
                        description,
                        expense_type: expenseType
                    }])
                    .select();

                if (error) throw error;
                if (data && data.length > 0) {
                    loadRecords();
                    resetForm();
                    setIsFormOpen(false);
                    toast.success('Registro guardado correctamente.');
                }
            }
        } catch (error) {
            console.error('Error adding/updating record:', error);
            toast.error(`Hubo un error al guardar el registro: ${(error as Error).message}`);
        }
    };

    const handleDelete = async (id: string) => {
        const ok = await confirm({
            title: 'Eliminar Registro',
            message: '¿Seguro que deseas eliminar este movimiento? Esta acción no se puede deshacer.',
            confirmLabel: 'Eliminar',
            danger: true,
        });
        if (!ok) return;
        try {
            const { error } = await supabase
                .from('finance_records')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Registro eliminado.');
            if (onRefresh) {
                onRefresh();
            } else {
                loadRecords();
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error(`No se pudo eliminar el registro: ${(error as any).message}`);
        }
    };

    const resetForm = () => {
        setConcept('');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('');
        setProvider('');
        setIncome('');
        setExpense('');
        setDescription('');
        setExpenseType('Variable');
        setEditingId(null);
    };

    const handleEditClick = (record: FinanceRecord) => {
        setConcept(record.concept);
        setDate(record.date.split('T')[0]);
        setPaymentMethod(record.payment_method || '');
        setProvider(record.provider || '');
        setIncome((record.income && Number(record.income) !== 0) ? Number(record.income) : '');
        setExpense((record.expense && Number(record.expense) !== 0) ? Number(record.expense) : '');
        setDescription(record.description || '');
        setExpenseType(record.expense_type || 'Variable');
        setEditingId(record.id);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFileUploadWrapper = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        await importFromExcel(file, user.id, loadRecords, setIsUploading);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const displayRecords = getDisplayRecords(searchTerm);

    const renderPaymentOptions = () => (
        <>
            <option value="" disabled>Seleccione pago...</option>
            {savedPaymentMethods.length > 0 ? (
                savedPaymentMethods.map(pm => (
                    <option key={pm.id} value={pm.name}>{pm.name}</option>
                ))
            ) : (
                <>
                    <option value="EFECTIVO">EFECTIVO</option>
                    <option value="TARJETA DÉBITO">TARJETA DÉBITO</option>
                    <option value="TARJETA CRÉDITO">TARJETA CRÉDITO</option>
                </>
            )}
        </>
    );

    return (
        <div className="bg-[var(--bg-card)] dark:bg-white/5 rounded-[2rem] border border-[var(--border-color)] dark:border-white/10 shadow-sm overflow-hidden animate-fade-in backdrop-blur-md">
            <FinanceHeader 
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                uniqueMonths={uniqueMonths}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isUploading={isUploading}
                onImportExcel={() => fileInputRef.current?.click()}
                onExportExcel={() => exportToExcel(displayRecords, selectedMonth)}
                onRefresh={loadRecords}
                onExportPDF={() => exportToPDF('finance-dashboard-content', selectedMonth)}
                onShowSnapshot={() => setShowSnapshot(true)}
                onToggleForm={() => setIsFormOpen(!isFormOpen)}
                isFormOpen={isFormOpen}
                kpis={{
                    income: summaryData.reduce((acc, row) => acc + row.income, 0),
                    expense: summaryData.reduce((acc, row) => acc + row.expense, 0),
                    balance: summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)
                }}
            />

            <SnapshotModal 
                showSnapshot={showSnapshot}
                setShowSnapshot={setShowSnapshot}
                summaryData={summaryData}
                uniqueMonths={uniqueMonths}
                selectedMonth={selectedMonth}
            />

            <RecordForm 
                isOpen={isFormOpen}
                isEditing={!!editingId}
                isProcessingOCR={isProcessingOCR}
                setIsProcessingOCR={setIsProcessingOCR}
                onClose={() => { setIsFormOpen(false); resetForm(); }}
                onSubmit={handleAddRecord}
                concept={concept} setConcept={setConcept}
                date={date} setDate={setDate}
                paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                provider={provider} setProvider={setProvider}
                income={income} setIncome={setIncome}
                expense={expense} setExpense={setExpense}
                description={description} setDescription={setDescription}
                expenseType={expenseType} setExpenseType={setExpenseType}
                renderPaymentOptions={renderPaymentOptions}
                concepts={uniqueConcepts}
            />
        
            <div className="overflow-x-auto" id="finance-dashboard-content">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                    </div>
                ) : viewMode === 'credits' ? (
                    <CreditsManager 
                        user={user} 
                        credits={credits} 
                        records={records} 
                        paymentMethods={savedPaymentMethods} 
                        onRefresh={loadRecords} 
                    />
                ) : viewMode === 'detailed' ? (
                    <MovementsDetailedView 
                        records={displayRecords}
                        onEdit={handleEditClick}
                        onDelete={handleDelete}
                    />
                ) : viewMode === 'budget' ? (
                    <BudgetTracker 
                        userId={user.id}
                        selectedMonth={selectedMonth}
                        budgetData={budgetData}
                        onBudgetUpdated={() => loadManualBudgets(selectedMonth)}
                    />
                ) : viewMode === 'balances' ? (
                    <BalancesManager 
                        user={user}
                        companyIds={companyIds}
                        records={records}
                        goals={goals}
                        savedPaymentMethods={savedPaymentMethods}
                        paymentBalancesData={paymentBalancesData}
                        selectedMonth={selectedMonth}
                        uniqueMonths={uniqueMonths}
                        onRefresh={() => {
                            loadRecords();
                            loadPaymentMethods();
                        }}
                    />
                ) : null}
            </div>

            {/* FLOATING TOTALS BAR - Only visible in Registro mode */}
            {viewMode === 'detailed' && displayRecords.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-3xl animate-slide-up">
                    <div className="bg-primary-dark/80 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-2 pr-6 flex items-center justify-between gap-4">
                        <div className="flex bg-white/10 rounded-full p-1">
                            <div className="px-6 py-2 rounded-full flex flex-col items-center">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Ingresos</span>
                                <span className="text-sm font-black text-green-400">
                                    ${summaryData.reduce((acc: number, row) => acc + row.income, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="w-px h-6 bg-white/10 self-center"></div>
                            <div className="px-6 py-2 rounded-full flex flex-col items-center">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Gastos</span>
                                <span className="text-sm font-black text-red-400">
                                    ${summaryData.reduce((acc: number, row) => acc + row.expense, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Utilidad Neta</span>
                            <span className={`text-lg font-heading font-black ${(summaryData.reduce((acc: number, row: {income: number}) => acc + row.income, 0) - summaryData.reduce((acc: number, row: {expense: number}) => acc + row.expense, 0)) >= 0 ? 'text-white' : 'text-red-400'}`}>
                                ${(summaryData.reduce((acc: number, row: {income: number}) => acc + row.income, 0) - summaryData.reduce((acc: number, row: {expense: number}) => acc + row.expense, 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOATING TOTALS BAR - Budget mode */}
            {viewMode === 'budget' && budgetData.length > 0 && (() => {
                const totalBudget = budgetData.reduce((acc: number, row: {avgBudget: number}) => acc + row.avgBudget, 0);
                const totalSpent = budgetData.reduce((acc: number, row: {currentExpense: number}) => acc + row.currentExpense, 0);
                const diff = totalBudget - totalSpent;
                const isOver = diff < 0;
                return (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-3xl animate-slide-up">
                        <div className="bg-primary-dark/80 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-2 pr-6 flex items-center justify-between gap-4">
                            <div className="flex bg-white/10 rounded-full p-1">
                                <div className="px-5 py-2 rounded-full flex flex-col items-center">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Presupuestado</span>
                                    <span className="text-sm font-black text-white">
                                        ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="w-px h-6 bg-white/10 self-center"></div>
                                <div className="px-5 py-2 rounded-full flex flex-col items-center">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Gastado</span>
                                    <span className="text-sm font-black text-red-400">
                                        ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/50">{isOver ? 'Exceso' : 'Margen'}</span>
                                <span className={`text-lg font-heading font-black ${isOver ? 'text-red-400' : 'text-green-400'}`}>
                                    {isOver ? '-' : '+'}${Math.abs(diff).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUploadWrapper}
                accept=".xlsx, .xls"
                className="hidden"
            />
            
            <Toaster />
            {ConfirmModal}
        </div>
    );
}
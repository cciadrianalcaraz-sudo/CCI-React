import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Search } from 'lucide-react';

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
        planningAnalysis,
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
        <div className="bg-white/40 dark:bg-slate-900/40 rounded-[3rem] border border-slate-200/60 dark:border-white/10 shadow-xl overflow-hidden animate-fade-in backdrop-blur-2xl">
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
        
            <div className="overflow-x-auto min-h-[500px]" id="finance-dashboard-content">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sincronizando Datos...</p>
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
                    <div className="space-y-6 p-8 md:p-10 pb-32">
                        {searchTerm && (
                            <div className="flex flex-col lg:flex-row gap-6 p-8 bg-sky-500/[0.03] dark:bg-white/[0.02] rounded-[2.5rem] border border-sky-500/10 animate-scale-in shadow-sm">
                                <div className="flex-1 flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 shadow-inner">
                                        <Search size={20} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Auditoría en Tiempo Real</h4>
                                        <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5 italic">"{searchTerm}" • {displayRecords.length} hallazgos</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-8 px-4">
                                    {[
                                        { label: 'Ingresos', val: displayRecords.reduce((acc, r) => acc + Number(r.income || 0), 0), color: 'text-emerald-500' },
                                        { label: 'Gastos', val: displayRecords.reduce((acc, r) => acc + Number(r.expense || 0), 0), color: 'text-rose-500' },
                                        { label: 'Neto', val: displayRecords.reduce((acc, r) => acc + Number(r.income || 0) - Number(r.expense || 0), 0), color: 'text-sky-500', bold: true }
                                    ].map((s, i) => (
                                        <div key={i} className="flex flex-col items-end">
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">{s.label}</span>
                                            <span className={`text-base font-black ${s.color}`}>
                                                ${s.val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <MovementsDetailedView 
                            records={displayRecords}
                            onEdit={handleEditClick}
                            onDelete={handleDelete}
                        />
                    </div>
                ) : viewMode === 'budget' ? (
                    <div className="pb-32">
                        <BudgetTracker 
                            userId={user.id}
                            selectedMonth={selectedMonth}
                            budgetData={budgetData}
                            planningAnalysis={planningAnalysis}
                            records={records}
                            onBudgetUpdated={() => loadManualBudgets(selectedMonth)}
                        />
                    </div>
                ) : viewMode === 'balances' ? (
                    <div className="pb-32">
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
                    </div>
                ) : null}
            </div>

            {/* FLOATING TOTALS BAR - Refined Premium Look */}
            {viewMode === 'detailed' && displayRecords.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[95vw] max-w-2xl animate-slide-up">
                    <div className="bg-slate-900/90 dark:bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-2.5 pr-8 flex items-center justify-between gap-6 transition-all hover:scale-[1.02]">
                        <div className="flex bg-white/5 dark:bg-black/20 rounded-[2rem] p-1 border border-white/5">
                            {[
                                { label: 'Entradas', val: summaryData.reduce((acc, row) => acc + row.income, 0), color: 'text-emerald-400' },
                                { label: 'Salidas', val: summaryData.reduce((acc, row) => acc + row.expense, 0), color: 'text-rose-400' }
                            ].map((item, i) => (
                                <React.Fragment key={i}>
                                    <div className="px-8 py-2.5 flex flex-col items-center">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">{item.label}</span>
                                        <span className={`text-sm font-black ${item.color}`}>
                                            ${item.val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    {i === 0 && <div className="w-px h-8 bg-white/10 self-center"></div>}
                                </React.Fragment>
                            ))}
                        </div>
                        
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Utilidad Neta</span>
                            <span className={`text-xl font-black tracking-tighter ${(summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)) >= 0 ? 'text-white' : 'text-rose-400'}`}>
                                ${(summaryData.reduce((acc, row) => acc + row.income, 0) - summaryData.reduce((acc, row) => acc + row.expense, 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* FLOATING TOTALS BAR - Budget mode - Refined */}
            {viewMode === 'budget' && budgetData.length > 0 && (() => {
                const incomeData = budgetData.filter(b => b.category === 'income');
                const expenseData = budgetData.filter(b => b.category === 'expense');
                const totalIncomeTarget = incomeData.reduce((acc, row) => acc + row.avgBudget, 0);
                const totalIncomeReal = incomeData.reduce((acc, row) => acc + row.currentAmount, 0);
                const totalExpenseTarget = expenseData.reduce((acc, row) => acc + row.avgBudget, 0);
                const totalExpenseReal = expenseData.reduce((acc, row) => acc + row.currentAmount, 0);
                
                return (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[95vw] max-w-4xl animate-slide-up">
                        <div className="bg-slate-900/90 dark:bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-2.5 pr-8 flex items-center justify-between gap-6">
                            <div className="flex bg-white/5 dark:bg-black/20 rounded-[2rem] p-1 border border-white/5">
                                <div className="px-7 py-2.5 flex flex-col items-center">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Real vs Meta (Ingresos)</span>
                                    <span className="text-sm font-black text-emerald-400">
                                        ${totalIncomeReal.toLocaleString()} <span className="text-[10px] opacity-30 font-bold ml-1">/ ${totalIncomeTarget.toLocaleString()}</span>
                                    </span>
                                </div>
                                <div className="w-px h-8 bg-white/10 self-center"></div>
                                <div className="px-7 py-2.5 flex flex-col items-center">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Real vs Límite (Gastos)</span>
                                    <span className="text-sm font-black text-rose-400">
                                        ${totalExpenseReal.toLocaleString()} <span className="text-[10px] opacity-30 font-bold ml-1">/ ${totalExpenseTarget.toLocaleString()}</span>
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Remanente Real</span>
                                <span className={`text-2xl font-black tracking-tighter ${(totalIncomeReal - totalExpenseReal) >= 0 ? 'text-white' : 'text-rose-400'}`}>
                                    ${(totalIncomeReal - totalExpenseReal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
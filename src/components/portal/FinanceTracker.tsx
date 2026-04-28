import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';

import { toast } from '../../lib/toast';
import { Toaster } from '../ui/Toaster';
import { useConfirm } from '../../hooks/useConfirm';

import { useFinance } from '../../hooks/useFinance';
import FinanceHeader from './finance/FinanceHeader';
import RecordForm from './finance/RecordForm';
import MovementsDetailedView from './finance/MovementsDetailedView';
import BudgetTracker from './finance/BudgetTracker';
import CreditsManager from './finance/CreditsManager';
import BalancesManager from './finance/BalancesManager';
import SnapshotModal from './finance/SnapshotModal';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // View modes
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

    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [uniqueMonths, setUniqueMonths] = useState<{label: string, value: string}[]>([]);
    const [summaryData, setSummaryData] = useState<{concept: string, income: number, expense: number}[]>([]);
    const [uniqueConcepts, setUniqueConcepts] = useState<string[]>([]);
    const [paymentBalancesData, setPaymentBalancesData] = useState<{method: string, initialBalance: number, income: number, expense: number, finalBalance: number}[]>([]);
    
    const [budgetData, setBudgetData] = useState<any[]>([]);
    const [manualBudgets, setManualBudgets] = useState<Record<string, number>>({});
    
    // Form state
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

    const loadManualBudgets = async (month: string) => {
        if (!month || month === 'all') return;
        try {
            const { data, error } = await supabase
                .from('finance_budgets')
                .select('concept, amount')
                .eq('month', month)
                .in('user_id', companyIds);
            
            if (error) throw error;
            
            const budgetMap: Record<string, number> = {};
            if (data) {
                data.forEach((b: any) => {
                    budgetMap[b.concept] = Number(b.amount);
                });
            }
            setManualBudgets(budgetMap);
        } catch (error) {
            console.error("Error loading budgets:", error);
        }
    };

    useEffect(() => {
        if (selectedMonth) {
            loadManualBudgets(selectedMonth);
        }
    }, [selectedMonth, user.id]);

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

    useEffect(() => {
        const recordMonths = Array.from(new Set(records.map(r => {
            if (r.date.includes('/')) return r.date.split('/').reverse().join('-').substring(0, 7);
            return r.date.substring(0, 7);
        })));
        
        const futureMonths: string[] = [];
        const today = new Date();
        for (let i = 0; i <= 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            futureMonths.push(`${yyyy}-${mm}`);
        }

        const allMonths = Array.from(new Set([...recordMonths, ...futureMonths])).sort().reverse();
        
        const formattedMonths = allMonths.map(m => {
            const [year, month] = m.split('-');
            const date = new Date(Number(year), Number(month) - 1, 1);
            return {
                value: m,
                label: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
            };
        });
        
        setUniqueMonths([{label: 'Todos los meses', value: 'all'}, ...formattedMonths]);
        
        if (!selectedMonth && formattedMonths.length > 0) {
            const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            const hasCurrentMonth = formattedMonths.some(m => m.value === currentMonthStr);
            setSelectedMonth(hasCurrentMonth ? currentMonthStr : formattedMonths[0].value);
        }
    }, [records, selectedMonth]);

    useEffect(() => {
        if (!selectedMonth) return;
        
        const filteredRecords = selectedMonth === 'all' 
            ? records 
            : records.filter(r => {
                const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
                return rDate.startsWith(selectedMonth);
            });
        
        const grouped = filteredRecords
            .filter(r => {
                const c = (r.concept || '').toUpperCase().trim();
                return c !== 'SALDO INICIAL' && !c.includes('TRASPASO');
            })
            .reduce((acc: Record<string, {concept: string, income: number, expense: number}>, curr: FinanceRecord) => {
                const c = curr.concept || 'SIN CONCEPTO';
                if (!acc[c]) {
                    acc[c] = { concept: c, income: 0, expense: 0 };
                }
                acc[c].income += Number(curr.income) || 0;
                acc[c].expense += Number(curr.expense) || 0;
                return acc;
            }, {});
        
        const sortedSummary = Object.values(grouped).sort((a, b) => a.concept.localeCompare(b.concept));
        setSummaryData(sortedSummary);
        
        const historicalRecords = selectedMonth === 'all' 
            ? records 
            : records.filter((r: FinanceRecord) => {
                const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
                return rDate.substring(0, 7) < selectedMonth;
            });
            
        const historicalMonthsCount = new Set(historicalRecords.map(r => {
                const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
                return rDate.substring(0, 7);
            })).size || 1;
        
        const historicalExpenses = historicalRecords
            .filter(r => {
                const c = (r.concept || '').toUpperCase().trim();
                return c !== 'SALDO INICIAL' && !c.includes('TRASPASO') && Number(r.expense) > 0;
            })
            .reduce((acc: Record<string, number>, curr: FinanceRecord) => {
                const c = curr.concept || 'SIN CONCEPTO';
                if (!acc[c]) acc[c] = 0;
                acc[c] += Number(curr.expense);
                return acc;
            }, {});
            
        const allEverConcepts = Array.from(new Set(records.map(r => (r.concept || '').toUpperCase().trim())))
            .filter(c => c !== '' && c !== 'SALDO INICIAL' && !c.includes('TRASPASO'));

        const allConcepts = new Set([
            ...allEverConcepts,
            ...Object.keys(manualBudgets)
        ]);
        
        const budgetArr = Array.from(allConcepts)
            .filter(c => c && c.trim() !== '')
            .map(concept => {
                const totalHistorical = historicalExpenses[concept] || 0;
                const histAvg = totalHistorical / historicalMonthsCount;
                const currentExp = grouped[concept]?.expense || 0;
                const definedBudget = manualBudgets[concept] !== undefined ? manualBudgets[concept] : histAvg;
                
                return {
                    concept,
                    avgBudget: definedBudget,
                    currentExpense: currentExp,
                    difference: definedBudget - currentExp
                };
            })
            .sort((a,b) => b.avgBudget - a.avgBudget);
          
        setBudgetData(budgetArr);
        setUniqueConcepts(allEverConcepts);

        const paymentMap: Record<string, { initial: number, income: number, expense: number, finalBalance: number }> = {};
        const cutoffMonth = selectedMonth === 'all' ? '9999-12' : selectedMonth;

        [...records]
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .filter(r => {
            const rDate = r.date.includes('/') ? r.date.split('/').reverse().join('-') : r.date;
            return rDate.substring(0, 7) <= cutoffMonth;
          })
          .forEach(r => {
            const pm = r.payment_method || 'SIN ESPECIFICAR';
            if (!paymentMap[pm]) {
                paymentMap[pm] = { initial: 0, income: 0, expense: 0, finalBalance: 0 };
            }
            
            const recordMonth = r.date.substring(0, 7);
            const isInitialBalance = (r.concept || '').toUpperCase().trim() === 'SALDO INICIAL';
            const recordIncome = Number(r.income) || 0;
            const recordExpense = Number(r.expense) || 0;

            if (selectedMonth !== 'all' && recordMonth < selectedMonth) {
                if (isInitialBalance) {
                    paymentMap[pm].finalBalance = recordIncome - recordExpense;
                } else {
                    paymentMap[pm].finalBalance += recordIncome - recordExpense;
                }
                paymentMap[pm].initial = paymentMap[pm].finalBalance;

            } else {
                if (isInitialBalance) {
                    const resetValue = recordIncome - recordExpense;
                    paymentMap[pm].initial = resetValue;
                    paymentMap[pm].finalBalance = resetValue;
                    paymentMap[pm].income = 0;
                    paymentMap[pm].expense = 0;
                } else {
                    paymentMap[pm].income += recordIncome;
                    paymentMap[pm].expense += recordExpense;
                    paymentMap[pm].finalBalance += recordIncome - recordExpense;
                }
            }
        });
        
        const balances = Object.entries(paymentMap)
            .map(([method, data]) => ({
                method,
                initialBalance: data.initial,
                income: data.income,
                expense: data.expense,
                finalBalance: data.finalBalance 
            }))
            .sort((a,b) => b.finalBalance - a.finalBalance);
            
        setPaymentBalancesData(balances);
        
    }, [records, selectedMonth]);

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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

            if (jsonData.length === 0) {
                throw new Error('El archivo está vacío o no tiene el formato correcto.');
            }

            const normalizeKey = (k: string) => k.toUpperCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^A-Z0-9]/g, ""); 

            const recordsToInsert = jsonData.map((row) => {
                const getValue = (keywords: string[]) => {
                    const normalizedKeywords = keywords.map(kw => normalizeKey(kw));
                    const keys = Object.keys(row);
                    
                    let foundKey = keys.find(k => {
                        const normK = normalizeKey(k);
                        return normalizedKeywords.some(kw => normK === kw);
                    });
                    
                    if (!foundKey) {
                        foundKey = keys.find(k => {
                            const normK = normalizeKey(k);
                            return normalizedKeywords.some(kw => normK.includes(kw));
                        });
                    }

                    return foundKey ? row[foundKey] : undefined;
                };

                const parseNumber = (val: unknown) => {
                    if (typeof val === 'number') return val;
                    if (!val) return 0;
                    
                    let str = String(val).replace(/[^\d.,-]/g, '').trim();
                    if (!str) return 0;

                    const lastComma = str.lastIndexOf(',');
                    const lastDot = str.lastIndexOf('.');
                    
                    if (lastComma > lastDot) {
                        str = str.replace(/\./g, '').replace(',', '.');
                    } else if (lastDot > lastComma) {
                        str = str.replace(/,/g, '');
                    } else if (lastComma !== -1) {
                        str = str.replace(',', '.');
                    }
                    
                    const parsed = Number(str);
                    return isNaN(parsed) ? 0 : parsed; 
                };

                const rawDate = getValue(['FECHA', 'DATE', 'DIA', 'MOMENTO', 'FEC', 'VALOR']);
                let dateStr = "";

                if (rawDate instanceof Date) {
                    dateStr = rawDate.toISOString().split('T')[0];
                } else if (typeof rawDate === 'number') {
                    const jsDate = new Date((rawDate - 25569) * 86400 * 1000);
                    dateStr = jsDate.toISOString().split('T')[0];
                } else if (rawDate) {
                    const sDate = String(rawDate).trim();
                    const parts = sDate.split(/[/.-]/);
                    if (parts.length === 3) {
                        if (parts[2].length === 4) {
                            dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        } else if (parts[0].length === 4) {
                            dateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                        }
                    }
                }

                if (!dateStr) {
                    dateStr = new Date().toISOString().split('T')[0];
                }

                const conceptValue = String(getValue(['CONCEPTO', 'CONCEPT', 'NOMBRE', 'TITULO', 'SERVICIO', 'MOVIMIENTO', 'DESCRIPCION', 'DETALLE', 'MOTIVO']) || '').trim().toUpperCase();
                const incomeValue = parseNumber(getValue(['INGRESO', 'ENTRADA', 'POSITIVO', 'DEPOSITO', 'ABONO', 'CREDITO', 'INPUT', 'CASHIN']));
                const expenseValue = parseNumber(getValue(['GASTO', 'SALIDA', 'NEGATIVO', 'EGRESO', 'CARGO', 'RETIRO', 'DEBITO', 'OUTPUT', 'CASHOUT']));

                const validTypes = ['Variable', 'Fijo', 'Ahorro', 'Deuda', 'Ingreso', 'Traspaso'];
                const rawType = String(getValue(['TIPO', 'TIPOGASTO', 'TIPOMOVIMIENTO', 'CATEGORIA', 'CATEGORY', 'TYPE']) || '').trim();
                const normalizedType = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
                const expenseTypeValue = validTypes.includes(normalizedType) ? normalizedType : 'Variable';

                if (!conceptValue && incomeValue === 0 && expenseValue === 0) {
                    return null;
                }

                return {
                    user_id: user.id,
                    concept: conceptValue || 'MOVIMIENTO SIN NOMBRE',
                    date: dateStr,
                    payment_method: String(getValue(['FORMADEPAGO', 'PAGO', 'CUENTA', 'METODO', 'VIA', 'BANCO', 'ORIGEN']) || 'SIN ESPECIFICAR').trim().toUpperCase(),
                    provider: String(getValue(['PROVEEDOR', 'PROVIDER', 'LUGAR', 'ESTABLECIMIENTO', 'DESTINO', 'COMERCIO']) || '').trim().toUpperCase(),
                    income: incomeValue,
                    expense: expenseValue,
                    expense_type: expenseTypeValue,
                    description: String(getValue(['DESCRIPCION', 'DETALLE', 'MOTIVO', 'COMENTARIO', 'OBSERVACION', 'REFERENCIA', 'NOTAS']) || '').trim()
                };
            }).filter(record => record !== null);

            if (recordsToInsert.length === 0) {
                throw new Error(`No se encontraron columnas de Concepto ni de Importes válidas.`);
            }

            const { error } = await supabase
                .from('finance_records')
                .insert(recordsToInsert);

            if (error) throw error;
            
            toast.success(`¡Importación exitosa! Se añadieron ${recordsToInsert.length} registros.`);
            loadRecords();

        } catch (error) {
            toast.error(`Error al importar: ${(error as Error).message || 'Verifica el formato'}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleExportPDF = async () => {
        const element = document.getElementById('finance-dashboard-content');
        if (!element) {
            toast.error("No se encontró el contenido del reporte.");
            return;
        }

        toast.info("Generando PDF... por favor espera.");
        
        try {
            const isDarkMode = document.documentElement.classList.contains('dark');
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: isDarkMode ? '#151515' : '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Reporte_Mensual_${selectedMonth || 'Global'}.pdf`);
            toast.success("PDF generado con éxito.");
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Error al generar el PDF.");
        }
    };
    
    const handleExportExcel = () => {
        if (displayRecords.length === 0) {
            toast.warning('No hay registros para exportar en el mes seleccionado.');
            return;
        }

        try {
            const dataToExport = displayRecords.map((r, index) => ({
                'NO.': index + 1,
                'CONCEPTO': r.concept,
                'FECHA': r.date.split('-').reverse().join('/'),
                'FORMA DE PAGO': r.payment_method || 'SIN ESPECIFICAR',
                'PROVEEDOR': r.provider || '',
                'INGRESO': Number(r.income) || 0,
                'GASTO': Number(r.expense) || 0,
                'SALDO': Number(r.balance) || 0,
                'DESCRIPCION': r.description || ''
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Finanzas");
            
            const wscols = [
                {wch: 5}, {wch: 25}, {wch: 12}, {wch: 20}, 
                {wch: 20}, {wch: 10}, {wch: 10}, {wch: 12}, {wch: 40}
            ];
            ws['!cols'] = wscols;

            const fileName = `Finanzas_${selectedMonth === 'all' ? 'Completo' : selectedMonth}.xlsx`;
            XLSX.writeFile(wb, fileName);
            toast.success(`Archivo "${fileName}" exportado correctamente.`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            toast.error('No se pudo generar el archivo Excel.');
        }
    };

    const filteredRecords = selectedMonth === 'all' 
        ? records 
        : records.filter(r => r.date.startsWith(selectedMonth));

    let runningBalanceFlow = 0;
    const displayRecords = filteredRecords
        .filter(record => {
            const c = (record.concept || '').toUpperCase().trim();
            const isInternal = c === 'SALDO INICIAL' || c.includes('TRASPASO');
            if (isInternal) return false;
            
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                (record.concept || '').toLowerCase().includes(search) ||
                (record.provider || '').toLowerCase().includes(search) ||
                (record.payment_method || '').toLowerCase().includes(search) ||
                (record.description || '').toLowerCase().includes(search)
            );
        })
        .map(record => {
            const isAdjustment = (record.concept || '').toUpperCase().trim() === 'SALDO INICIAL';
            if (!isAdjustment) {
                runningBalanceFlow = runningBalanceFlow + Number(record.income) - Number(record.expense);
            }
            return {
                ...record,
                balance: runningBalanceFlow
            };
        });

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
                onExportExcel={handleExportExcel}
                onRefresh={loadRecords}
                onExportPDF={handleExportPDF}
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
                        records={records}
                        selectedMonth={selectedMonth}
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
                onChange={handleFileUpload}
                accept=".xlsx, .xls"
                className="hidden"
            />
            
            <Toaster />
            {ConfirmModal}
        </div>
    );
}
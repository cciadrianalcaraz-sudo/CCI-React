import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { FinanceRecord } from '../types/finance';

export const useFinanceCalculations = (
    records: FinanceRecord[],
    companyIds: string[]
) => {
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [uniqueMonths, setUniqueMonths] = useState<{label: string, value: string}[]>([]);
    
    const [summaryData, setSummaryData] = useState<{concept: string, income: number, expense: number}[]>([]);
    const [uniqueConcepts, setUniqueConcepts] = useState<string[]>([]);
    const [paymentBalancesData, setPaymentBalancesData] = useState<{method: string, initialBalance: number, income: number, expense: number, finalBalance: number}[]>([]);
    
    const [budgetData, setBudgetData] = useState<any[]>([]);
    const [manualBudgets, setManualBudgets] = useState<Record<string, {amount: number, category: string}>>({});

    const loadManualBudgets = useCallback(async (month: string) => {
        if (!month || month === 'all' || companyIds.length === 0) return;
        try {
            const { data, error } = await supabase
                .from('finance_budgets')
                .select('concept, amount, budget_category')
                .eq('month', month)
                .in('user_id', companyIds);
            
            if (error) throw error;
            
            const budgetMap: Record<string, {amount: number, category: string}> = {};
            if (data) {
                data.forEach((b: any) => {
                    budgetMap[b.concept] = { 
                        amount: Number(b.amount), 
                        category: b.budget_category || 'expense' 
                    };
                });
            }
            setManualBudgets(budgetMap);
        } catch (error) {
            console.error("Error loading budgets:", error);
        }
    }, [companyIds]);

    // Unique Months Logic
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

    // Load budgets when month changes
    useEffect(() => {
        if (selectedMonth) {
            loadManualBudgets(selectedMonth);
        }
    }, [selectedMonth, loadManualBudgets]);

    // Calculate Summary, Budgets, and Payment Balances
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

        const historicalIncomes = historicalRecords
            .filter(r => {
                const c = (r.concept || '').toUpperCase().trim();
                return c !== 'SALDO INICIAL' && !c.includes('TRASPASO') && Number(r.income) > 0;
            })
            .reduce((acc: Record<string, number>, curr: FinanceRecord) => {
                const c = curr.concept || 'SIN CONCEPTO';
                if (!acc[c]) acc[c] = 0;
                acc[c] += Number(curr.income);
                return acc;
            }, {});
            
        const allEverConcepts = Array.from(new Set(records.map(r => (r.concept || '').toUpperCase().trim())))
            .filter(c => c !== '' && c !== 'SALDO INICIAL' && !c.includes('TRASPASO'));

        const allConcepts = new Set([
            ...allEverConcepts,
            ...Object.keys(manualBudgets)
        ]);
        
        // Smart Categorization Logic based on keywords
        const SMART_KEYWORDS: Record<string, string[]> = {
            'Fijo': ['CFE', 'RENTA', 'INTERNET', 'TELCEL', 'IZZI', 'TOTALPLAY', 'AGUA', 'GAS', 'HIPOTECA', 'SEGURO', 'PPR', 'MANTENIMIENTO', 'COLEGIO', 'ESCUELA', 'GIMNASIO', 'GYM'],
            'Variable': ['AMAZON', 'UBER', 'DIDI', 'NETFLIX', 'SPOTIFY', 'RESTAURANTE', 'CINE', 'STARBUCKS', 'RAPPI', 'MERCADO LIBRE', 'APPLE', 'VAPE', 'TIENDA', 'OXXO', 'SUPER', 'DESPENSA', 'SALUD', 'FARMACIA'],
            'Ingreso': ['SUELDO', 'HONORARIOS', 'PAGO', 'VENTA', 'DIVIDENDO', 'CASHBACK', 'NOMINA', 'TRANSFERENCIA RECIBIDA', 'INGRESO'],
            'Ahorro': ['CETES', 'GBM', 'INVERSION', 'AHORRO', 'NU', 'BONOS', 'DINERO CRECIENTE'],
            'Deuda': ['TARJETA', 'PRESTAMO', 'CREDITO', 'PAGO A DEUDA', 'SANTANDER', 'BBVA', 'AMEX', 'HSBC', 'BANAMEX']
        };

        const conceptTypeMap: Record<string, string> = {};
        const conceptFrequencies: Record<string, Record<string, number>> = {};

        // 1. Analyze historical frequencies
        records.forEach(r => {
            if (r.concept && r.expense_type) {
                const c = r.concept.toUpperCase().trim();
                if (!conceptFrequencies[c]) conceptFrequencies[c] = {};
                conceptFrequencies[c][r.expense_type] = (conceptFrequencies[c][r.expense_type] || 0) + 1;
            }
        });

        // 2. Build map based on highest frequency or keywords
        allConcepts.forEach(concept => {
            const c = concept.toUpperCase().trim();
            
            // Priority 1: Most frequent type in history
            if (conceptFrequencies[c]) {
                const types = Object.entries(conceptFrequencies[c]);
                types.sort((a, b) => b[1] - a[1]);
                conceptTypeMap[c] = types[0][0];
            } 
            
            // Priority 2: Keyword matching if no history or generic
            if (!conceptTypeMap[c] || conceptTypeMap[c] === 'Variable') {
                for (const [type, keywords] of Object.entries(SMART_KEYWORDS)) {
                    if (keywords.some(kw => c.includes(kw))) {
                        conceptTypeMap[c] = type;
                        break;
                    }
                }
            }

            // Default
            if (!conceptTypeMap[c]) conceptTypeMap[c] = 'Variable';
        });
        
        // Identify all concepts that have ever had an income amount
        const incomeConcepts = new Set(records.filter(r => Number(r.income) > 0).map(r => (r.concept || '').toUpperCase().trim()));

        const budgetArr = Array.from(allConcepts)
            .filter(c => c && c.trim() !== '')
            .map(concept => {
                const manual = manualBudgets[concept];
                // Auto-detect category based on historical data if not manually defined
                const hasHistIncome = (historicalIncomes[concept] || 0) > (historicalExpenses[concept] || 0);
                const hasCurrentIncome = (grouped[concept]?.income || 0) > (grouped[concept]?.expense || 0);
                
                const isIngresoType = conceptTypeMap[concept] === 'Ingreso';
                const category = manual?.category || ((hasHistIncome || hasCurrentIncome || isIngresoType || incomeConcepts.has(concept)) ? 'income' : 'expense');
                
                let histAvg = 0;
                let currentAmount = 0;
                
                if (category === 'income') {
                    histAvg = (historicalIncomes[concept] || 0) / historicalMonthsCount;
                    currentAmount = grouped[concept]?.income || 0;
                } else {
                    histAvg = (historicalExpenses[concept] || 0) / historicalMonthsCount;
                    currentAmount = grouped[concept]?.expense || 0;
                }

                const definedBudget = manual !== undefined ? manual.amount : histAvg;
                
                return {
                    concept,
                    avgBudget: definedBudget,
                    currentAmount: currentAmount,
                    difference: category === 'income' ? currentAmount - definedBudget : definedBudget - currentAmount,
                    type: conceptTypeMap[concept] || (category === 'income' ? 'Ingreso' : 'Variable'),
                    category
                };
            })
            .filter(row => row.avgBudget > 0 || row.currentAmount > 0 || row.category === 'income')
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
        
    }, [records, selectedMonth, manualBudgets]);

    // getDisplayRecords returns the filtered and sorted records for the detailed view
    const getDisplayRecords = useCallback((searchTerm: string) => {
        const filteredRecords = selectedMonth === 'all' 
            ? records 
            : records.filter(r => r.date.startsWith(selectedMonth));

        let runningBalanceFlow = 0;
        return filteredRecords
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
    }, [records, selectedMonth]);

    return {
        selectedMonth,
        setSelectedMonth,
        uniqueMonths,
        summaryData,
        uniqueConcepts,
        paymentBalancesData,
        budgetData,
        manualBudgets,
        getDisplayRecords,
        loadManualBudgets
    };
};

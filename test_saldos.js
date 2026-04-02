const records = [
    { date: '2026-03-01', concept: 'INCOME', income: 100, expense: 0, payment_method: 'BBVA' },
    { date: '2026-03-15', concept: 'Gastos', income: 0, expense: 50, payment_method: 'BBVA' },
    { date: '2026-03-31', concept: 'SALDO INICIAL', income: 500, expense: 0, payment_method: 'BBVA' }
];

const selectedMonth = '2026-03';
const paymentMap = {};

records.forEach(r => {
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

    } else if (selectedMonth === 'all' || recordMonth === selectedMonth) {
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

console.log(paymentMap);

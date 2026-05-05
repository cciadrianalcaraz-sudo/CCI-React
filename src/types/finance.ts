export interface FinanceRecord {
    id: string;
    user_id: string;
    concept: string;
    date: string;
    payment_method: string;
    provider: string;
    income: number;
    expense: number;
    description: string;
    created_at: string;
    expense_type: string;
    balance?: number;
}

export interface PaymentMethod {
    id: string;
    user_id: string;
    name: string;
}

export interface FinanceCredit {
    id: string;
    user_id: string;
    name: string;
    initial_balance: number;
    annual_rate: number;
    start_date: string;
    created_at: string;
}

export interface FinanceGoal {
    id: string;
    user_id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline?: string;
    icon?: string;
    color?: string;
}

export interface BudgetData {
    concept: string;
    avgBudget: number;
    currentAmount: number;
    difference: number;
    type: string; // 'Fijo', 'Variable', etc.
    category: 'income' | 'expense';
    expense_type?: string;
}

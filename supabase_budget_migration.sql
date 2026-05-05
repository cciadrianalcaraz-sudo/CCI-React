-- Migration to add budget_category to finance_budgets
ALTER TABLE finance_budgets ADD COLUMN budget_category TEXT DEFAULT 'expense' CHECK (budget_category IN ('income', 'expense'));

-- Update existing budgets to 'expense'
UPDATE finance_budgets SET budget_category = 'expense' WHERE budget_category IS NULL;

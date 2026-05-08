-- MIGRACIÓN PARA EL CALENDARIO DE COMPROMISOS (CASHFLOW FORECAST)

-- 1. Añadir campos de programación a la tabla de presupuestos
-- Esto permite saber qué día del mes se espera un ingreso o gasto fijo
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finance_budgets' AND column_name = 'due_day') THEN
        ALTER TABLE finance_budgets ADD COLUMN due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31);
    END IF;
END $$;

-- 2. Añadir fechas de corte y pago a los créditos/tarjetas
-- cutoff_day: Día en que cierra la tarjeta
-- payment_day: Día límite de pago
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finance_credits' AND column_name = 'cutoff_day') THEN
        ALTER TABLE finance_credits ADD COLUMN cutoff_day INTEGER CHECK (cutoff_day >= 1 AND cutoff_day <= 31);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finance_credits' AND column_name = 'payment_day') THEN
        ALTER TABLE finance_credits ADD COLUMN payment_day INTEGER CHECK (payment_day >= 1 AND payment_day <= 31);
    END IF;
END $$;

-- 3. Comentarios descriptivos para mejor mantenimiento
COMMENT ON COLUMN finance_budgets.due_day IS 'Día del mes programado para el movimiento (1-31)';
COMMENT ON COLUMN finance_credits.cutoff_day IS 'Día del mes en que corta la tarjeta (1-31)';
COMMENT ON COLUMN finance_credits.payment_day IS 'Día del mes límite para realizar el pago (1-31)';

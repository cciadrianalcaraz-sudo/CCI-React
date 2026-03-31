-- 1. TABLA DE FORMAS DE PAGO (CUENTAS)
CREATE TABLE IF NOT EXISTS finance_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, name)
);

-- 2. POLÍTICAS DE SEGURIDAD (RLS) PARA FORMAS DE PAGO
ALTER TABLE finance_payment_methods ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finance_payment_methods' AND policyname = 'Users can view own payment methods') THEN
        CREATE POLICY "Users can view own payment methods" ON finance_payment_methods FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finance_payment_methods' AND policyname = 'Users can insert own payment methods') THEN
        CREATE POLICY "Users can insert own payment methods" ON finance_payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finance_payment_methods' AND policyname = 'Users can update own payment methods') THEN
        CREATE POLICY "Users can update own payment methods" ON finance_payment_methods FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finance_payment_methods' AND policyname = 'Users can delete own payment methods') THEN
        CREATE POLICY "Users can delete own payment methods" ON finance_payment_methods FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. AÑADIR COLUMNA `is_fixed` A LOS REGISTROS
-- Primero verificamos si ya existe para evitar errores
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finance_records' AND column_name = 'is_fixed') THEN
        ALTER TABLE finance_records ADD COLUMN is_fixed BOOLEAN DEFAULT FALSE NOT NULL;
    END IF;
END $$;

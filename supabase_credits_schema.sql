-- TABLA DE CRÉDITOS Y DEUDAS
DROP TABLE IF EXISTS finance_credits;

CREATE TABLE IF NOT EXISTS finance_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  initial_balance NUMERIC DEFAULT 0 NOT NULL, -- Monto original del préstamo
  annual_rate NUMERIC DEFAULT 0 NOT NULL,      -- Tasa de interés anual (ej: 21)
  start_date DATE NOT NULL,                   -- Fecha de inicio del crédito
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- HABILITAR SEGURIDAD (RLS)
ALTER TABLE finance_credits ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACCESO
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finance_credits' AND policyname = 'Users can view own credits') THEN
        CREATE POLICY "Users can view own credits" ON finance_credits FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finance_credits' AND policyname = 'Users can insert own credits') THEN
        CREATE POLICY "Users can insert own credits" ON finance_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finance_credits' AND policyname = 'Users can update own credits') THEN
        CREATE POLICY "Users can update own credits" ON finance_credits FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finance_credits' AND policyname = 'Users can delete own credits') THEN
        CREATE POLICY "Users can delete own credits" ON finance_credits FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

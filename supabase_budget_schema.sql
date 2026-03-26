-- TABLA DE PRESUPUESTOS
-- NOTA: Si ya habías creado la tabla anterior, ejecútalo para actualizar a presupuestos mensuales:
DROP TABLE IF EXISTS finance_budgets;

CREATE TABLE IF NOT EXISTS finance_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  concept TEXT NOT NULL,
  month TEXT NOT NULL, -- Formato YYYY-MM
  amount NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, concept, month)
);

-- HABILITAR SEGURIDAD (RLS)
ALTER TABLE finance_budgets ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACCESO PARA LOS PRESUPUESTOS
-- Aseguramos que el usuario solo pueda ver, insertar, actualizar y borrar sus propios presupuestos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finance_budgets' AND policyname = 'Users can view own budgets') THEN
        CREATE POLICY "Users can view own budgets" ON finance_budgets FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finance_budgets' AND policyname = 'Users can insert own budgets') THEN
        CREATE POLICY "Users can insert own budgets" ON finance_budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finance_budgets' AND policyname = 'Users can update own budgets') THEN
        CREATE POLICY "Users can update own budgets" ON finance_budgets FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finance_budgets' AND policyname = 'Users can delete own budgets') THEN
        CREATE POLICY "Users can delete own budgets" ON finance_budgets FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

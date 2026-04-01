-- 1. AGREGAR COLUMNA "Tipo de Gasto" A REGISTROS (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finance_records' AND column_name = 'expense_type') THEN
        ALTER TABLE finance_records ADD COLUMN expense_type TEXT DEFAULT 'Variable' NOT NULL;
    END IF;
END $$;


-- 2. TABLA DE FORMAS DE PAGO (CUENTAS)
CREATE TABLE IF NOT EXISTS finance_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, name)
);

ALTER TABLE finance_payment_methods ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE ACCESO PARA CUENTAS (Empresa completa)
-- Eliminar políticas anteriores si existían
DROP POLICY IF EXISTS "Users can view own payment methods" ON finance_payment_methods;
DROP POLICY IF EXISTS "Users can insert own payment methods" ON finance_payment_methods;
DROP POLICY IF EXISTS "Users can update own payment methods" ON finance_payment_methods;
DROP POLICY IF EXISTS "Users can delete own payment methods" ON finance_payment_methods;
DROP POLICY IF EXISTS "Company can access payment methods" ON finance_payment_methods;

-- Crear Política Global para toda la empresa:
-- Todo usuario puede ver/insertar/borrar registros si es su propio user_id, 
-- O si pertenece a la misma "Empresa" (full_name en la tabla profiles) del creador del método de pago.
CREATE POLICY "Company can access payment methods" 
ON finance_payment_methods 
FOR ALL 
USING (
  auth.uid() = user_id 
  OR 
  (
    SELECT full_name FROM profiles WHERE id = auth.uid()
  ) = (
    SELECT full_name FROM profiles WHERE id = finance_payment_methods.user_id
  )
)
WITH CHECK (
  auth.uid() = user_id 
  OR 
  (
    SELECT full_name FROM profiles WHERE id = auth.uid()
  ) = (
    SELECT full_name FROM profiles WHERE id = finance_payment_methods.user_id
  )
);

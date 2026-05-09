-- MIGRACIÓN PARA SOPORTE DE DÍAS MÚLTIPLES EN PRESUPUESTOS
-- Cambia due_day de INTEGER a TEXT para permitir formatos como "15, 30"

DO $$ 
BEGIN
    -- 1. Eliminar la restricción de tipo INTEGER si existe (dependiendo de cómo se creó)
    -- En PostgreSQL, cambiar el tipo suele requerir una conversión explícita
    
    ALTER TABLE finance_budgets 
    ALTER COLUMN due_day TYPE TEXT USING due_day::TEXT;

    -- 2. Actualizar el comentario
    COMMENT ON COLUMN finance_budgets.due_day IS 'Día o días del mes (ej: "15" o "15, 30")';
END $$;

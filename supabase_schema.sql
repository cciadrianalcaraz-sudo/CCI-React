-- LIMPIEZA: Elimina las tablas si ya existen para evitar errores de "already exists"
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS profiles;

-- 1. TABLA DE PERFILES (Con la columna de status incluida)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  rfc TEXT,
  advisor_name TEXT DEFAULT 'Adrián Alcaraz',
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'suspendido', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABLA DE DOCUMENTOS
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'descargado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. HABILITAR SEGURIDAD (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACCESO
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);

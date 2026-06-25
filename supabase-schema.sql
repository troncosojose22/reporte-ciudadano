-- Ejecutar esto en el SQL Editor de tu proyecto Supabase

-- Extensión para búsqueda difusa por nombre (opcional pero recomendada)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tabla principal
CREATE TABLE personas_desaparecidas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  edad INTEGER,
  foto_url TEXT,
  ultima_ubicacion TEXT,
  ultima_fecha DATE,
  descripcion TEXT,
  contacto_nombre TEXT NOT NULL,
  contacto_telefono TEXT,
  contacto_email TEXT,
  estado TEXT DEFAULT 'desaparecido' CHECK (estado IN ('desaparecido', 'encontrado', 'removido')),
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX idx_personas_nombre_trgm ON personas_desaparecidas USING gin(nombre gin_trgm_ops);
CREATE INDEX idx_personas_estado ON personas_desaparecidas(estado);
CREATE INDEX idx_personas_creado_en ON personas_desaparecidas(creado_en DESC);

-- Seguridad a nivel de fila (RLS)
ALTER TABLE personas_desaparecidas ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer los casos no removidos
CREATE POLICY "lectura_publica" ON personas_desaparecidas
  FOR SELECT USING (estado != 'removido');

-- Cualquiera puede insertar nuevos reportes
CREATE POLICY "insercion_publica" ON personas_desaparecidas
  FOR INSERT WITH CHECK (true);

-- Las actualizaciones solo las hace el servidor (service role bypasses RLS)

-- Bucket de almacenamiento para fotos
-- Ir a Storage > New bucket > nombre: "fotos" > Public bucket: activado
-- Luego ejecutar estas políticas de Storage:

-- Permitir subida pública de fotos
CREATE POLICY "subida_publica_fotos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'fotos');

-- Permitir lectura pública de fotos
CREATE POLICY "lectura_publica_fotos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fotos');

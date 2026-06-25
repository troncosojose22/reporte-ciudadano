# Cómo poner esto en vivo (15-20 minutos)

## Paso 1 — Crea la base de datos en Supabase (gratis)

1. Ve a https://supabase.com → "Start your project" → crea una cuenta
2. Crea un nuevo proyecto (elige una región cercana a EE.UU. o Latinoamérica)
3. Espera ~2 minutos a que termine de configurarse
4. Ve a **SQL Editor** (menú izquierdo) → pega todo el contenido de `supabase-schema.sql` → ejecuta

## Paso 2 — Crea el bucket de fotos

1. En Supabase, ve a **Storage** → **New bucket**
2. Nombre: `fotos`
3. Activa **Public bucket** → Save
4. Ve a **Policies** → asegúrate de que las políticas del schema se aplicaron
   (Si no, ve al SQL Editor y ejecuta solo las líneas de `storage.objects`)

## Paso 3 — Copia las credenciales de Supabase

1. En Supabase, ve a **Settings → API**
2. Copia:
   - **Project URL** → es tu `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → es tu `SUPABASE_SERVICE_ROLE_KEY` (⚠️ nunca la expongas en el frontend)

## Paso 4 — Configura el archivo de variables locales

```bash
cp .env.local.example .env.local
```

Abre `.env.local` y rellena los tres valores de Supabase + pon una contraseña para el admin.

## Paso 5 — Prueba localmente

```bash
npm run dev
```

Abre http://localhost:3000 y verifica que:
- [ ] La página principal carga (puede estar vacía, sin casos)
- [ ] Puedes crear un reporte en /reportar
- [ ] El reporte aparece en la homepage
- [ ] /admin pide contraseña

## Paso 6 — Despliega en Vercel (gratis)

### Opción A: desde la terminal
```bash
npm install -g vercel
vercel
# Sigue las instrucciones, acepta los defaults
```

### Opción B: desde GitHub (recomendado para actualizaciones futuras)
1. Sube el código a un repo en GitHub
2. Ve a https://vercel.com → "Add New Project" → importa el repo
3. En "Environment Variables", añade las mismas 4 variables de .env.local
4. Deploy

### Agrega las variables de entorno en Vercel
Ve a tu proyecto en Vercel → **Settings → Environment Variables** y añade:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

Luego haz un nuevo deploy (o Vercel lo hace automático).

## Tu sitio estará en: https://[nombre-proyecto].vercel.app

---

## Panel de administración

Accede en: `https://tu-sitio.vercel.app/admin`

Desde ahí puedes:
- Ver todos los casos
- Marcar personas como encontradas
- Remover casos incorrectos o duplicados
- Restaurar casos removidos por error

## Notas importantes

- Los reportes se publican **inmediatamente** sin moderación previa
- Cada reporte genera un enlace privado que permite al familiar marcar a la persona como encontrada
- El panel admin está protegido por la contraseña que configuraste en `ADMIN_PASSWORD`
- Supabase gratis soporta hasta 500MB de datos y 1GB de storage (suficiente para miles de reportes)
- Vercel gratis soporta tráfico alto sin problema

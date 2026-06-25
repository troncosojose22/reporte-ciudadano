import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '../lib/supabase'
import { PersonaDesaparecida } from '../lib/types'
import { adminLogin, adminLogout, adminCambiarEstado } from '../actions'
import Image from 'next/image'
import Link from 'next/link'

async function estaAutenticado() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === process.env.ADMIN_PASSWORD
}

async function getTodosCasos(): Promise<PersonaDesaparecida[]> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('personas_desaparecidas')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(500)
  return (data as PersonaDesaparecida[]) ?? []
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; error?: string }>
}) {
  const autenticado = await estaAutenticado()
  const { error: loginError, estado: filtroEstado } = await searchParams

  if (!autenticado) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Panel de administración</h1>
        {loginError === '1' && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            Contraseña incorrecta. Intenta de nuevo.
          </div>
        )}
        <form action={adminLogin} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 rounded-lg transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    )
  }

  const todos = await getTodosCasos()
  const casos = filtroEstado ? todos.filter(p => p.estado === filtroEstado) : todos

  const stats = {
    desaparecido: todos.filter(p => p.estado === 'desaparecido').length,
    encontrado: todos.filter(p => p.estado === 'encontrado').length,
    removido: todos.filter(p => p.estado === 'removido').length,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>
        <form action={adminLogout}>
          <button type="submit" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.desaparecido}</div>
          <div className="text-sm text-gray-600">Desaparecidos</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.encontrado}</div>
          <div className="text-sm text-gray-600">Encontrados</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-500">{stats.removido}</div>
          <div className="text-sm text-gray-600">Removidos</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { label: 'Todos', value: '' },
          { label: 'Desaparecidos', value: 'desaparecido' },
          { label: 'Encontrados', value: 'encontrado' },
          { label: 'Removidos', value: 'removido' },
        ].map(({ label, value }) => (
          <Link
            key={value}
            href={value ? `/admin?estado=${value}` : '/admin'}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              (filtroEstado ?? '') === value
                ? 'bg-red-700 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-red-400'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Lista de casos */}
      <div className="space-y-3">
        {casos.map((persona) => (
          <div key={persona.id} className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4 items-start">
            {/* Foto miniatura */}
            <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded overflow-hidden">
              {persona.foto_url ? (
                <Image src={persona.foto_url} alt={persona.nombre} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">?</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <Link href={`/caso/${persona.id}`} className="font-bold text-gray-900 hover:text-red-700 transition-colors">
                  {persona.nombre}
                </Link>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  persona.estado === 'encontrado' ? 'bg-green-100 text-green-800'
                  : persona.estado === 'removido' ? 'bg-gray-100 text-gray-600'
                  : 'bg-red-100 text-red-800'
                }`}>
                  {persona.estado.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {persona.edad ? `${persona.edad} años · ` : ''}
                {persona.ultima_ubicacion ?? 'Ubicación no indicada'} ·{' '}
                {persona.contacto_nombre} · {persona.contacto_telefono ?? persona.contacto_email ?? 'Sin contacto'}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-1.5 shrink-0">
              {persona.estado !== 'encontrado' && (
                <form action={adminCambiarEstado.bind(null, persona.id, 'encontrado')}>
                  <button type="submit" className="text-xs text-green-700 hover:text-green-900 font-medium whitespace-nowrap">
                    ✅ Encontrado
                  </button>
                </form>
              )}
              {persona.estado !== 'desaparecido' && (
                <form action={adminCambiarEstado.bind(null, persona.id, 'desaparecido')}>
                  <button type="submit" className="text-xs text-orange-600 hover:text-orange-800 font-medium whitespace-nowrap">
                    🔁 Desaparecido
                  </button>
                </form>
              )}
              {persona.estado !== 'removido' && (
                <form action={adminCambiarEstado.bind(null, persona.id, 'removido')}>
                  <button type="submit" className="text-xs text-red-600 hover:text-red-800 font-medium whitespace-nowrap">
                    🗑 Remover
                  </button>
                </form>
              )}
              {persona.estado === 'removido' && (
                <form action={adminCambiarEstado.bind(null, persona.id, 'desaparecido')}>
                  <button type="submit" className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
                    ↩ Restaurar
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}

        {casos.length === 0 && (
          <p className="text-center text-gray-500 py-12">No hay casos en esta categoría.</p>
        )}
      </div>
    </div>
  )
}

import { getSupabaseAdmin } from './lib/supabase'
import { Suspense } from 'react'
import CasoCard from './components/CasoCard'
import Buscador from './components/Buscador'
import { PersonaDesaparecida } from './lib/types'
import Link from 'next/link'

async function getCasos(q: string, estado: string): Promise<PersonaDesaparecida[]> {
  const supabase = getSupabaseAdmin()

  let query = supabase
    .from('personas_desaparecidas')
    .select('*')
    .neq('estado', 'removido')
    .order('creado_en', { ascending: false })
    .limit(200)

  if (q) query = query.ilike('nombre', `%${q}%`)
  if (estado && estado !== 'todos') query = query.eq('estado', estado)

  const { data } = await query
  return (data as PersonaDesaparecida[]) ?? []
}

async function getStats() {
  const supabase = getSupabaseAdmin()
  const [{ count: desaparecidos }, { count: encontrados }] = await Promise.all([
    supabase.from('personas_desaparecidas').select('*', { count: 'exact', head: true }).eq('estado', 'desaparecido'),
    supabase.from('personas_desaparecidas').select('*', { count: 'exact', head: true }).eq('estado', 'encontrado'),
  ])
  return { desaparecidos: desaparecidos ?? 0, encontrados: encontrados ?? 0 }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>
}) {
  const params = await searchParams
  const q = params.q ?? ''
  const estado = params.estado ?? 'todos'

  const [casos, stats] = await Promise.all([getCasos(q, estado), getStats()])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="mb-12 max-w-2xl">
        <h1 className="text-3xl font-semibold text-gray-900 leading-snug mb-3">
          Ayúdanos a encontrarlos
        </h1>
        <p className="text-gray-600 text-base leading-relaxed mb-2">
          Tras el terremoto que sacudió a nuestro país, miles de personas quedaron desaparecidas. Sus familias las buscan desesperadamente.
        </p>
        <p className="text-gray-600 text-base leading-relaxed mb-6">
          Si conoces a alguien desaparecido, repórtalo aquí. Si sabes que alguien fue encontrado, déjanos saber.
        </p>
        <Link
          href="/reportar"
          className="inline-block bg-red-700 hover:bg-red-800 text-white text-sm font-medium px-5 py-2.5 rounded transition-colors"
        >
          Reportar persona desaparecida
        </Link>
      </div>

      {/* Stats */}
      <div className="flex items-baseline gap-8 mb-8 flex-wrap">
        <div>
          <span className="text-3xl font-bold text-gray-900">{(stats.desaparecidos + stats.encontrados).toLocaleString('es-VE')}</span>
          <span className="ml-2 text-sm text-gray-500">reportados</span>
        </div>
        <div>
          <span className="text-3xl font-bold text-red-700">{stats.desaparecidos.toLocaleString('es-VE')}</span>
          <span className="ml-2 text-sm text-gray-500">desaparecidos</span>
        </div>
        <div>
          <span className="text-3xl font-bold text-green-700">{stats.encontrados.toLocaleString('es-VE')}</span>
          <span className="ml-2 text-sm text-gray-500">encontrados</span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Suspense fallback={null}>
          <Buscador />
        </Suspense>
      </div>

      {/* Results */}
      {casos.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p className="text-base">No se encontraron casos{q ? ` para "${q}"` : ''}.</p>
          <Link href="/reportar" className="mt-4 inline-block text-sm text-red-700 hover:underline">
            Crear un reporte
          </Link>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">
            {casos.length} {casos.length === 1 ? 'caso' : 'casos'}{q ? ` · "${q}"` : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {casos.map(persona => (
              <CasoCard key={persona.id} persona={persona} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

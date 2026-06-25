export const revalidate = 30

import { getSupabaseAdmin } from '../../lib/supabase'
import { PersonaDesaparecida } from '../../lib/types'
import { marcarEncontrado } from '../../actions'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CopiarEnlace from '../../components/CopiarEnlace'

function formatFecha(fecha: string | null) {
  if (!fecha) return null
  const [year, month, day] = fecha.split('-')
  return `${day}/${month}/${year}`
}

function formatFechaLarga(iso: string) {
  return new Date(iso).toLocaleDateString('es-VE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function CasoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ nuevo?: string }>
}) {
  const { id } = await params
  const { nuevo } = await searchParams

  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('personas_desaparecidas')
    .select('*')
    .eq('id', id)
    .neq('estado', 'removido')
    .single()

  if (!data) notFound()

  const persona = data as PersonaDesaparecida
  const encontrado = persona.estado === 'encontrado'

  return (
    <div className="max-w-xl mx-auto px-4 py-10">

      {nuevo === '1' && (
        <div className="border border-gray-300 text-sm text-gray-700 px-4 py-3 rounded mb-8">
          Reporte publicado. Comparte el enlace de esta página para que más personas puedan ayudar.
        </div>
      )}

      {/* Foto */}
      {persona.foto_url && (
        <div className="relative aspect-[3/4] bg-gray-100 rounded overflow-hidden mb-6">
          <Image
            src={persona.foto_url}
            alt={persona.nombre}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 100vw, 560px"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{persona.nombre}</h1>
          {persona.edad && <p className="text-gray-500 text-sm mt-0.5">{persona.edad} años</p>}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded shrink-0 ${encontrado ? 'bg-gray-100 text-gray-600' : 'text-red-700 border border-red-300'}`}>
          {encontrado ? 'Encontrado/a' : 'Desaparecido/a'}
        </span>
      </div>

      {/* Detalles */}
      <dl className="divide-y divide-gray-100 text-sm mb-8">
        {persona.ultima_ubicacion && (
          <Row label="Último lugar visto/a" value={persona.ultima_ubicacion} />
        )}
        {persona.ultima_fecha && (
          <Row label="Último avistamiento" value={formatFecha(persona.ultima_fecha)!} />
        )}
        <Row label="Reporte publicado" value={formatFechaLarga(persona.creado_en)} />
      </dl>

      {persona.descripcion && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Descripción</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{persona.descripcion}</p>
        </div>
      )}

      {/* Contacto */}
      <div className="border border-gray-200 rounded p-4 mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contacto</p>
        <p className="text-sm font-medium text-gray-900">{persona.contacto_nombre}</p>
        {persona.contacto_telefono && (
          <a href={`tel:${persona.contacto_telefono}`} className="block text-sm text-red-700 hover:underline mt-1">
            {persona.contacto_telefono}
          </a>
        )}
        {persona.contacto_email && (
          <a href={`mailto:${persona.contacto_email}`} className="block text-sm text-red-700 hover:underline mt-1">
            {persona.contacto_email}
          </a>
        )}
      </div>

      {/* Marcar como encontrado */}
      {!encontrado && (
        <form
          action={async () => {
            'use server'
            await marcarEncontrado(id)
          }}
          className="mb-8"
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">¿Esta persona fue encontrada?</p>
          <p className="text-sm text-gray-600 mb-3">Si sabes que ya fue localizada, márcala aquí para que la familia y otros lo sepan.</p>
          <button
            type="submit"
            className="border border-gray-300 hover:border-gray-900 text-sm text-gray-700 hover:text-gray-900 px-4 py-2 rounded transition-colors"
          >
            Marcar como encontrado/a
          </button>
        </form>
      )}

      {/* Compartir */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-6">
        <CopiarEnlace />
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          Volver
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-gray-900 text-right">{value}</dd>
    </div>
  )
}

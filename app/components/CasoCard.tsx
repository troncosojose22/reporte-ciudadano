import Link from 'next/link'
import Image from 'next/image'
import { PersonaDesaparecida } from '../lib/types'

export default function CasoCard({ persona }: { persona: PersonaDesaparecida }) {
  const encontrado = persona.estado === 'encontrado'

  return (
    <Link href={`/caso/${persona.id}`} className="group block">
      <div className="border border-gray-200 rounded overflow-hidden hover:border-gray-400 transition-colors">
        <div className="relative aspect-square bg-gray-100">
          {persona.foto_url ? (
            <Image
              src={persona.foto_url}
              alt={persona.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <p className="text-sm font-medium text-gray-900 leading-snug truncate">{persona.nombre}</p>
          <p className="text-xs text-gray-400">{persona.edad ? `${persona.edad} años` : 'Edad desconocida'}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5">{persona.ultima_ubicacion ?? 'Ubicación desconocida'}</p>
          <span className={`inline-block mt-1.5 text-xs font-medium ${encontrado ? 'text-green-700' : 'text-red-700'}`}>
            {encontrado ? 'Encontrado/a' : 'Desaparecido/a'}
          </span>
        </div>
      </div>
    </Link>
  )
}

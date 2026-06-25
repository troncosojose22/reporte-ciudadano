'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import Link from 'next/link'
import { PersonaDesaparecida } from '../lib/types'
import CasoCard from './CasoCard'
import { buscarPersonas } from '../actions'
import { PAGE_SIZE } from '../lib/constants'

export default function ListaCasos({ initialCasos }: { initialCasos: PersonaDesaparecida[] }) {
  const [casos, setCasos] = useState(initialCasos)
  const [query, setQuery] = useState('')
  const [estado, setEstado] = useState('todos')
  const [hasMore, setHasMore] = useState(initialCasos.length === PAGE_SIZE)
  const [isPending, startTransition] = useTransition()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const results = await buscarPersonas(query, estado, 0) as PersonaDesaparecida[]
        setCasos(results)
        setHasMore(results.length === PAGE_SIZE)
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [query, estado])

  function loadMore() {
    startTransition(async () => {
      const more = await buscarPersonas(query, estado, casos.length) as PersonaDesaparecida[]
      setCasos(prev => [...prev, ...more])
      setHasMore(more.length === PAGE_SIZE)
    })
  }

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900"
        />
        <select
          value={estado}
          onChange={e => setEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:border-gray-900"
        >
          <option value="todos">Todos</option>
          <option value="desaparecido">Desaparecidos</option>
          <option value="encontrado">Encontrados</option>
        </select>
      </div>

      {isPending && casos.length === 0 ? null : casos.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p className="text-base">No se encontraron casos{query ? ` para "${query}"` : ''}.</p>
          <Link href="/reportar" className="mt-4 inline-block text-sm text-red-700 hover:underline">
            Crear un reporte
          </Link>
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
            {casos.map(persona => (
              <CasoCard key={persona.id} persona={persona} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={isPending}
                className="border border-gray-300 hover:border-gray-900 text-sm text-gray-700 hover:text-gray-900 disabled:opacity-40 px-6 py-2 rounded transition-colors"
              >
                {isPending ? 'Cargando...' : 'Mostrar más'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}

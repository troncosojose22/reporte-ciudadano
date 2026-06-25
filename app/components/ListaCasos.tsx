'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PersonaDesaparecida } from '../lib/types'
import CasoCard from './CasoCard'

export default function ListaCasos({ casos }: { casos: PersonaDesaparecida[] }) {
  const [query, setQuery] = useState('')
  const [estado, setEstado] = useState('todos')

  const filtrados = useMemo(() => {
    return casos.filter(p => {
      const matchQ = query.trim() === '' || p.nombre.toLowerCase().includes(query.trim().toLowerCase())
      const matchEstado = estado === 'todos' || p.estado === estado
      return matchQ && matchEstado
    })
  }, [casos, query, estado])

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

      {filtrados.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p className="text-base">No se encontraron casos{query ? ` para "${query}"` : ''}.</p>
          <Link href="/reportar" className="mt-4 inline-block text-sm text-red-700 hover:underline">
            Crear un reporte
          </Link>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">
            {filtrados.length} {filtrados.length === 1 ? 'caso' : 'casos'}{query ? ` · "${query}"` : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtrados.map(persona => (
              <CasoCard key={persona.id} persona={persona} />
            ))}
          </div>
        </>
      )}
    </>
  )
}

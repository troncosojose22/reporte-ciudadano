'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'

export default function Buscador() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [estado, setEstado] = useState(searchParams.get('estado') ?? 'todos')

  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    params.set('estado', estado)

    const timer = setTimeout(() => {
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [query, estado, pathname, router])

  return (
    <div className="flex flex-col sm:flex-row gap-2">
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
  )
}

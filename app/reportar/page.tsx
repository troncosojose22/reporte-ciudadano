'use client'

import { useState, useRef, useTransition } from 'react'
import { useActionState } from 'react'
import { reportarPersona } from '../actions'
import Image from 'next/image'

const initialState = { error: undefined as string | undefined }

export default function ReportarPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await reportarPersona(formData)
      return result ?? initialState
    },
    initialState
  )

  const [, startTransition] = useTransition()
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [errorFoto, setErrorFoto] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrorFoto('La foto debe pesar menos de 5MB.')
      return
    }

    setErrorFoto('')
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (fotoFile) {
      const fd = new FormData()
      fd.append('file', fotoFile)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (res.ok) {
        formData.set('foto_url', json.url)
      }
    }

    startTransition(() => formAction(formData))
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Reportar persona desaparecida</h1>
      <p className="text-sm text-gray-500 mb-8">El reporte se publica inmediatamente. Completa la mayor cantidad de información posible.</p>

      {state?.error && (
        <div className="border border-red-300 text-red-700 text-sm px-4 py-3 rounded mb-6">
          {state.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Foto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto <span className="text-gray-400 font-normal">(opcional, máx. 5MB)</span>
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-500 transition-colors"
          >
            {fotoPreview ? (
              <div className="relative h-48">
                <Image src={fotoPreview} alt="Vista previa" fill className="object-contain rounded" />
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-gray-400 text-sm gap-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                Agregar foto
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
          {errorFoto && <p className="text-xs text-red-600 mt-1">{errorFoto}</p>}
          {fotoFile && <p className="text-xs text-gray-500 mt-1">{fotoFile.name}</p>}
        </div>

        {/* Persona */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Información de la persona</p>

          <Field label="Nombre completo" required>
            <input name="nombre" type="text" required placeholder="Ej: María González Pérez" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Edad">
              <input name="edad" type="number" min="0" max="120" placeholder="Ej: 32" className={inputCls} />
            </Field>
            <Field label="Último avistamiento">
              <input name="ultima_fecha" type="date" className={inputCls} />
            </Field>
          </div>

          <Field label="Último lugar visto/a">
            <input name="ultima_ubicacion" type="text" placeholder="Ej: Caracas, Parroquia El Recreo" className={inputCls} />
          </Field>

          <Field label="Descripción">
            <textarea
              name="descripcion"
              rows={4}
              placeholder="Características físicas, ropa que llevaba, circunstancias..."
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>

        {/* Contacto */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tu información de contacto</p>

          <Field label="Tu nombre" required>
            <input name="contacto_nombre" type="text" required placeholder="Ej: Carlos González (hermano)" className={inputCls} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Teléfono">
              <input name="contacto_telefono" type="tel" placeholder="+58 412 000 0000" className={inputCls} />
            </Field>
            <Field label="Correo electrónico">
              <input name="contacto_email" type="email" placeholder="correo@ejemplo.com" className={inputCls} />
            </Field>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-red-700 hover:bg-red-800 disabled:bg-gray-300 text-white font-medium py-2.5 rounded transition-colors text-sm"
        >
          {pending ? 'Publicando...' : 'Publicar reporte'}
        </button>
      </form>
    </div>
  )
}

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900"

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
    </div>
  )
}

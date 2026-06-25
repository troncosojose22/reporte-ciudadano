'use client'

export default function CopiarEnlace() {
  return (
    <button
      onClick={() => {
        const url = window.location.href.split('?')[0]
        navigator.clipboard.writeText(url)
      }}
      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
    >
      Copiar enlace
    </button>
  )
}

export type EstadoPersona = 'desaparecido' | 'encontrado' | 'removido'

export interface PersonaDesaparecida {
  id: string
  nombre: string
  edad: number | null
  foto_url: string | null
  ultima_ubicacion: string | null
  ultima_fecha: string | null
  descripcion: string | null
  contacto_nombre: string
  contacto_telefono: string | null
  contacto_email: string | null
  estado: EstadoPersona
  creado_en: string
}

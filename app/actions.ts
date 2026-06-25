'use server'

import { getSupabaseAdmin } from './lib/supabase'
import { PAGE_SIZE } from './lib/constants'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function buscarPersonas(q: string, estado: string, offset: number) {
  const supabase = getSupabaseAdmin()

  let query = supabase
    .from('personas_desaparecidas')
    .select('*')
    .neq('estado', 'removido')
    .order('creado_en', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (q.trim()) query = query.ilike('nombre', `%${q.trim()}%`)
  if (estado !== 'todos') query = query.eq('estado', estado)

  const { data } = await query
  return data ?? []
}

export async function reportarPersona(formData: FormData) {
  const nombre = (formData.get('nombre') as string)?.trim()
  const contacto_nombre = (formData.get('contacto_nombre') as string)?.trim()

  if (!nombre || !contacto_nombre) {
    return { error: 'El nombre y el contacto son obligatorios.' }
  }

  const edadRaw = formData.get('edad') as string
  const edad = edadRaw ? parseInt(edadRaw) : null
  const foto_url = (formData.get('foto_url') as string) || null
  const ultima_ubicacion = (formData.get('ultima_ubicacion') as string)?.trim() || null
  const ultima_fecha = (formData.get('ultima_fecha') as string) || null
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const contacto_telefono = (formData.get('contacto_telefono') as string)?.trim() || null
  const contacto_email = (formData.get('contacto_email') as string)?.trim() || null

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('personas_desaparecidas')
    .insert({
      nombre,
      edad,
      foto_url,
      ultima_ubicacion,
      ultima_fecha,
      descripcion,
      contacto_nombre,
      contacto_telefono,
      contacto_email,
    })
    .select('id')
    .single()

  if (error) {
    console.error(error)
    return { error: 'Error al guardar el reporte. Intenta de nuevo.' }
  }

  revalidatePath('/')
  redirect(`/caso/${data.id}?nuevo=1`)
}

export async function marcarEncontrado(id: string) {
  const supabase = getSupabaseAdmin()

  await supabase
    .from('personas_desaparecidas')
    .update({ estado: 'encontrado' })
    .eq('id', id)
    .eq('estado', 'desaparecido')

  revalidatePath('/')
  revalidatePath(`/caso/${id}`)
}

export async function adminLogin(formData: FormData) {
  const password = formData.get('password') as string
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    redirect('/admin?error=1')
  }
  const cookieStore = await cookies()
  cookieStore.set('admin_session', process.env.ADMIN_PASSWORD!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
  })
  redirect('/admin')
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin')
}

async function verificarAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return session?.value === process.env.ADMIN_PASSWORD
}

export async function adminCambiarEstado(id: string, estado: 'desaparecido' | 'encontrado' | 'removido') {
  if (!(await verificarAdmin())) return

  const supabase = getSupabaseAdmin()
  await supabase
    .from('personas_desaparecidas')
    .update({ estado })
    .eq('id', id)

  revalidatePath('/admin')
  revalidatePath('/')
}

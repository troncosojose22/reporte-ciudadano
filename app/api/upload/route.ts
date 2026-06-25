import { getSupabaseAdmin } from '../../lib/supabase'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'File too large' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${crypto.randomUUID()}.${ext}`
  const buffer = await file.arrayBuffer()

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage
    .from('fotos')
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error('Storage error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(filename)

  return Response.json({ url: publicUrl })
}
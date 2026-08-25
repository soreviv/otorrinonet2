import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  const file = formData.get('imagen')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido (JPG, PNG, WebP, GIF)' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'El archivo supera el límite de 5 MB' }, { status: 400 })
  }

  const ext = extname(file.name).toLowerCase() || '.jpg'
  const filename = `${randomUUID()}${ext}`
  const dir = join(process.cwd(), 'public', 'assets', 'tienda')

  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/assets/tienda/${filename}` })
}

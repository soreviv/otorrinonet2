import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

const HEADERS = [
  'nombre',
  'slug',
  'descripcion',
  'categoria',
  'modo_entrega',
  'precio_pesos',
  'stock',
  'stock_ilimitado',
  'activo',
  'imagen_url',
  'clave_sat',
  'clave_unidad_sat',
  'meta_title',
  'meta_desc',
]

const EJEMPLOS = [
  [
    'Irrigador Nasal Eléctrico',
    '',
    'Irrigador para higiene nasal diaria con presión ajustable',
    'dispositivo_medico',
    'ambos',
    '350',
    '50',
    'no',
    'si',
    '',
    '42271803',
    'H87',
    '',
    '',
  ],
  [
    'Pilas Zinc-Aire 312 (pack 6)',
    '',
    'Pilas para audífonos tipo 312',
    'otro',
    'ambos',
    '120',
    '200',
    'no',
    'si',
    '',
    '26111701',
    'H87',
    '',
    '',
  ],
  [
    'Paquete Consulta + Audiometría',
    '',
    'Consulta de primera vez más audiometría tonal',
    'paquete_consulta',
    'solo_recoger',
    '1500',
    '0',
    'si',
    'si',
    '',
    '85101601',
    'E48',
    '',
    '',
  ],
]

function csvRow(fields: string[]): string {
  return fields.map(f => `"${f.replace(/"/g, '""')}"`).join(',')
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const lines = [
    csvRow(HEADERS),
    ...EJEMPLOS.map(csvRow),
  ]

  const csv = lines.join('\r\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="plantilla-productos.csv"',
    },
  })
}

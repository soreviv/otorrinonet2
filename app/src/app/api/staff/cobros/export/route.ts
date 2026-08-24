import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/dal'
import { listarCobros } from '@/app/actions/cobros'
import { TIPOS_CONSULTA, type MetodoPago, type TipoConsulta } from '@/lib/cobros-data'

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export async function GET(req: NextRequest) {
  try {
    await verifySession()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const periodo = (req.nextUrl.searchParams.get('periodo') as 'hoy' | 'semana' | 'mes') || 'mes'
  const metodoPago = req.nextUrl.searchParams.get('metodoPago') as MetodoPago | undefined
  const tipoConsulta = req.nextUrl.searchParams.get('tipoConsulta') as TipoConsulta | undefined

  const cobros = await listarCobros({ periodo, metodoPago: metodoPago || undefined, tipoConsulta: tipoConsulta || undefined })

  const tipoLabel = (v: string) => TIPOS_CONSULTA.find(t => t.value === v)?.label || v

  const header = ['Fecha', 'Paciente', 'Tipo de consulta', 'Monto (MXN)', 'Método de pago', 'Facturado']
  const rows = cobros.map(c => [
    new Date(c.fecha).toLocaleDateString('es-MX'),
    c.paciente,
    tipoLabel(c.tipoConsulta),
    (c.montoTotal / 100).toFixed(2),
    c.metodoPago,
    c.facturado ? 'Sí' : 'No',
  ])

  const csv = [header, ...rows].map(r => r.map(csvEscape).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="cobros-${periodo}.csv"`,
    },
  })
}

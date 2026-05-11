'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { revalidatePath } from 'next/cache'

export const TIPOS_CONSULTA = [
  { value: 'primera_vez',  label: 'Primera vez',    monto: 110000 },
  { value: 'subsecuente',  label: 'Subsecuente',     monto: 100000 },
  { value: 'lavado_oidos', label: 'Lavado de oídos', monto:  60000 },
  { value: 'otro',         label: 'Otro',            monto:       0 },
] as const

export type TipoConsulta = typeof TIPOS_CONSULTA[number]['value']
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'

export async function registrarCobro(
  appointmentId: string,
  data: {
    tipoConsulta: TipoConsulta
    montoTotal: number
    notasExtra?: string
    metodoPago: MetodoPago
  }
): Promise<{ ok: boolean; error?: string }> {
  const session = await verifySession()

  if (!appointmentId || !data.tipoConsulta || !data.metodoPago || data.montoTotal <= 0) {
    return { ok: false, error: 'Datos incompletos' }
  }

  try {
    await prisma.cobro.upsert({
      where: { appointmentId },
      update: {
        tipoConsulta: data.tipoConsulta,
        montoTotal: data.montoTotal,
        notasExtra: data.notasExtra?.trim() || null,
        metodoPago: data.metodoPago,
        registradoPor: session.userId,
        cobradoAt: new Date(),
      },
      create: {
        appointmentId,
        tipoConsulta: data.tipoConsulta,
        montoTotal: data.montoTotal,
        notasExtra: data.notasExtra?.trim() || null,
        metodoPago: data.metodoPago,
        registradoPor: session.userId,
      },
    })
    revalidatePath('/staff/agenda')
    revalidatePath('/staff')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al guardar el cobro' }
  }
}

export async function getResumenFinanciero(periodo: 'hoy' | 'semana' | 'mes') {
  await verifySession()

  const now = new Date()
  let desde: Date

  if (periodo === 'hoy') {
    desde = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (periodo === 'semana') {
    desde = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
  } else {
    desde = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const cobros = await prisma.cobro.findMany({
    where: { cobradoAt: { gte: desde } },
    select: { montoTotal: true, tipoConsulta: true, metodoPago: true },
  })

  const total = cobros.reduce((s, c) => s + c.montoTotal, 0)
  const porMetodo = {
    efectivo:      cobros.filter(c => c.metodoPago === 'efectivo').reduce((s, c) => s + c.montoTotal, 0),
    tarjeta:       cobros.filter(c => c.metodoPago === 'tarjeta').reduce((s, c) => s + c.montoTotal, 0),
    transferencia: cobros.filter(c => c.metodoPago === 'transferencia').reduce((s, c) => s + c.montoTotal, 0),
  }

  return { total, porMetodo, numCobros: cobros.length }
}

'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { revalidatePath } from 'next/cache'
import { type TipoConsulta, type MetodoPago } from '@/lib/cobros-data'

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

function desdePeriodo(periodo: 'hoy' | 'semana' | 'mes'): Date {
  const now = new Date()
  if (periodo === 'hoy') return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (periodo === 'semana') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export async function getResumenFinanciero(periodo: 'hoy' | 'semana' | 'mes') {
  await verifySession()

  const desde = desdePeriodo(periodo)

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

export async function listarCobros(filtros: {
  periodo: 'hoy' | 'semana' | 'mes'
  metodoPago?: MetodoPago
  tipoConsulta?: TipoConsulta
}) {
  await verifySession()

  const desde = desdePeriodo(filtros.periodo)

  const cobros = await prisma.cobro.findMany({
    where: {
      cobradoAt: { gte: desde },
      ...(filtros.metodoPago ? { metodoPago: filtros.metodoPago } : {}),
      ...(filtros.tipoConsulta ? { tipoConsulta: filtros.tipoConsulta } : {}),
    },
    include: {
      appointment: {
        select: { patientName: true, patient: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } } },
      },
    },
    orderBy: { cobradoAt: 'desc' },
  })

  return cobros.map(c => ({
    id: c.id,
    fecha: c.cobradoAt.toISOString(),
    paciente: c.appointment.patient
      ? [c.appointment.patient.nombre, c.appointment.patient.apellidoPaterno, c.appointment.patient.apellidoMaterno].filter(Boolean).join(' ')
      : c.appointment.patientName || 'Sin nombre',
    tipoConsulta: c.tipoConsulta,
    montoTotal: c.montoTotal,
    metodoPago: c.metodoPago,
    facturado: c.facturado,
  }))
}

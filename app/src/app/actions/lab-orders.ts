'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { logAction } from '@/lib/audit'

export interface LabOrderInput {
  estudios: string[]
  diagnosticoPresuntivo?: string
  indicacionesClinicas?: string
  urgente?: boolean
  ayuno?: boolean
}

export interface LabOrderRecord {
  id: string
  patientId: string
  requestedById: string
  estudios: string[]
  diagnosticoPresuntivo: string | null
  indicacionesClinicas: string | null
  urgente: boolean
  ayuno: boolean
  status: string
  resultados: string | null
  fechaResultados: string | null
  createdAt: string
}

function mapOrder(o: {
  id: string
  patientId: string
  requestedById: string
  estudios: string[]
  diagnosticoPresuntivo: string | null
  indicacionesClinicas: string | null
  urgente: boolean
  ayuno: boolean
  status: string
  resultados: string | null
  fechaResultados: Date | null
  createdAt: Date
}): LabOrderRecord {
  return {
    id: o.id,
    patientId: o.patientId,
    requestedById: o.requestedById,
    estudios: o.estudios,
    diagnosticoPresuntivo: o.diagnosticoPresuntivo,
    indicacionesClinicas: o.indicacionesClinicas,
    urgente: o.urgente,
    ayuno: o.ayuno,
    status: o.status,
    resultados: o.resultados,
    fechaResultados: o.fechaResultados?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
  }
}

export async function getPatientLabOrders(patientId: string): Promise<LabOrderRecord[]> {
  await verifySession()
  const orders = await prisma.labOrder.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  })
  return orders.map(mapOrder)
}

export async function createLabOrder(patientId: string, input: LabOrderInput): Promise<LabOrderRecord> {
  const session = await verifySession()

  const order = await prisma.labOrder.create({
    data: {
      patientId,
      requestedById: session.userId,
      estudios: input.estudios,
      diagnosticoPresuntivo: input.diagnosticoPresuntivo || null,
      indicacionesClinicas: input.indicacionesClinicas || null,
      urgente: input.urgente ?? false,
      ayuno: input.ayuno ?? false,
    },
  })

  await logAction({ action: 'creacion', resource: 'lab_order', resourceId: order.id, userId: session.userId })
  return mapOrder(order)
}

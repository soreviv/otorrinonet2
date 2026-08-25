'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { logAction } from '@/lib/audit'
import { getClinicConfigFromDB } from '@/lib/clinic-config'

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
  medicoId: string
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
  medicoId: string
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
    medicoId: o.medicoId,
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

export async function getLabOrderWithClinicData(orderId: string): Promise<{
  order: LabOrderRecord
  patientName: string
  clinic: Awaited<ReturnType<typeof getClinicConfigFromDB>>
}> {
  await verifySession()
  const [raw, clinic] = await Promise.all([
    prisma.labOrder.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        patient: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } },
      },
    }),
    getClinicConfigFromDB(),
  ])
  const p = raw.patient
  const patientName = [p.nombre, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ')
  return { order: mapOrder(raw), patientName, clinic }
}

export async function createLabOrder(patientId: string, input: LabOrderInput): Promise<LabOrderRecord> {
  const session = await verifySession()

  const order = await prisma.labOrder.create({
    data: {
      patientId,
      medicoId: session.userId,
      estudios: input.estudios,
      diagnosticoPresuntivo: input.diagnosticoPresuntivo || null,
      indicacionesClinicas: input.indicacionesClinicas || null,
      urgente: input.urgente ?? false,
      ayuno: input.ayuno ?? false,
    },
  })

  void logAction({ action: 'creacion', resource: 'lab_order', resourceId: order.id, userId: session.userId })
  return mapOrder(order)
}

export async function updateLabOrderStatus(id: string, status: string): Promise<void> {
  await verifySession()
  await prisma.labOrder.update({ where: { id }, data: { status } })
}

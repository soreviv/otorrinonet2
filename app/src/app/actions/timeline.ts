'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

export type TimelineEventType = 'nota_medica' | 'vitales' | 'receta' | 'cita' | 'orden_laboratorio'

export interface TimelineEvent {
  id: string
  tipo: TimelineEventType
  fecha: string
  titulo: string
  descripcion?: string
  detalles?: Record<string, unknown>
}

export async function getPatientTimeline(patientId: string): Promise<TimelineEvent[]> {
  await verifySession()

  const [notes, vitalsRecords, prescriptionRows, appointments, labOrders] = await Promise.all([
    prisma.medicalNote.findMany({
      where: { patientId },
      select: {
        id: true, tipo: true, motivoConsulta: true, subjetivo: true,
        analisis: true, firmada: true, fecha: true,
      },
      orderBy: { fecha: 'desc' },
    }),
    prisma.vitals.findMany({
      where: { patientId },
      select: {
        id: true, fecha: true, presionSistolica: true, presionDiastolica: true,
        frecuenciaCardiaca: true, temperatura: true, peso: true,
      },
      orderBy: { fecha: 'desc' },
    }),
    prisma.prescription.findMany({
      where: { patientId },
      select: { id: true, recetaId: true, medicamento: true, firmada: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.appointment.findMany({
      where: { patientId },
      select: { id: true, scheduledAt: true, notes: true, status: true },
      orderBy: { scheduledAt: 'desc' },
    }),
    prisma.labOrder.findMany({
      where: { patientId },
      select: { id: true, createdAt: true, estudios: true, status: true, urgente: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const events: TimelineEvent[] = []

  for (const n of notes) {
    const descripcion = (n.motivoConsulta ?? n.subjetivo ?? '')?.slice(0, 120) || undefined
    events.push({
      id: n.id,
      tipo: 'nota_medica',
      fecha: n.fecha.toISOString(),
      titulo: n.tipo === 'nota_quirurgica' ? 'Nota quirúrgica' : 'Nota de evolución',
      descripcion,
      detalles: { assessment: n.analisis, firmada: n.firmada },
    })
  }

  for (const v of vitalsRecords) {
    const parts: string[] = []
    if (v.presionSistolica && v.presionDiastolica) parts.push(`TA ${v.presionSistolica}/${v.presionDiastolica} mmHg`)
    if (v.frecuenciaCardiaca) parts.push(`FC ${v.frecuenciaCardiaca} lpm`)
    if (v.temperatura) parts.push(`Temp ${v.temperatura} °C`)
    if (v.peso) parts.push(`Peso ${v.peso} kg`)
    events.push({
      id: v.id,
      tipo: 'vitales',
      fecha: v.fecha.toISOString(),
      titulo: 'Signos vitales',
      descripcion: parts.join(' · ') || undefined,
      detalles: { presionSistolica: v.presionSistolica, presionDiastolica: v.presionDiastolica, frecuenciaCardiaca: v.frecuenciaCardiaca, temperatura: v.temperatura, peso: v.peso },
    })
  }

  // Una entrada por recetaId (no por renglón de medicamento)
  const recetasSeen = new Set<string>()
  for (const rx of prescriptionRows) {
    if (recetasSeen.has(rx.recetaId)) continue
    recetasSeen.add(rx.recetaId)
    events.push({
      id: rx.recetaId,
      tipo: 'receta',
      fecha: rx.createdAt.toISOString(),
      titulo: 'Receta médica',
      descripcion: rx.medicamento?.slice(0, 120) || undefined,
      detalles: { firmada: rx.firmada },
    })
  }

  for (const appt of appointments) {
    const statusLabel: Record<string, string> = {
      pendiente: 'Pendiente', confirmada: 'Confirmada', cancelada: 'Cancelada', completada: 'Completada',
    }
    events.push({
      id: appt.id,
      tipo: 'cita',
      fecha: appt.scheduledAt.toISOString(),
      titulo: `Cita — ${statusLabel[appt.status] ?? appt.status}`,
      descripcion: appt.notes?.slice(0, 120) || undefined,
      detalles: { status: appt.status },
    })
  }

  for (const order of labOrders) {
    events.push({
      id: order.id,
      tipo: 'orden_laboratorio',
      fecha: order.createdAt.toISOString(),
      titulo: `Orden de ${order.urgente ? '(urgente) ' : ''}laboratorio`,
      descripcion: order.estudios.slice(0, 3).join(', ') + (order.estudios.length > 3 ? '…' : ''),
      detalles: { estudios: order.estudios, status: order.status, urgente: order.urgente },
    })
  }

  events.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  return events
}

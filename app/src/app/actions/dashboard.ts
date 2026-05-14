'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'

export interface DashboardMetrics {
  totalPacientes: number
  citasHoy: number
  citasPendientes: number
  notasMedicasHoy: number
  prescripcionesActivas: number
  citasPorDia: { fecha: string; total: number }[]
  citasPorEstado: { estado: string; total: number }[]
  tiendaHoy: { pedidos: number; ingresos: number }
  tiendaMes: { pedidos: number; ingresos: number }
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  await verifySession()

  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const sevenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)

  const [
    totalPacientes,
    citasHoy,
    citasPendientes,
    notasMedicasHoy,
    prescripcionesActivas,
    citasUltimos7Dias,
    citasPorEstadoRaw,
    tiendaHoyRaw,
    tiendaMesRaw,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.count({ where: { scheduledAt: { gte: startOfDay, lt: endOfDay } } }),
    prisma.appointment.count({ where: { status: 'pendiente' } }),
    prisma.medicalNote.count({ where: { fecha: { gte: startOfDay, lt: endOfDay } } }),
    prisma.prescription.count({ where: { firmada: false } }),
    prisma.appointment.findMany({
      where: { scheduledAt: { gte: sevenDaysAgo } },
      select: { scheduledAt: true },
    }),
    prisma.appointment.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
        status: { notIn: ['cancelado', 'reembolsado'] }
      },
      select: { total: true, status: true }
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: startOfMonth, lt: endOfDay },
        status: { notIn: ['cancelado', 'reembolsado'] }
      },
      select: { total: true, status: true }
    }),
  ])

  // Agrupar citas por día
  const dayMap = new Map<string, number>()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - i))
    dayMap.set(d.toISOString().split('T')[0], 0)
  }
  for (const apt of citasUltimos7Dias) {
    const key = apt.scheduledAt.toISOString().split('T')[0]
    if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1)
  }

  const tiendaHoy = {
    pedidos: tiendaHoyRaw.length,
    ingresos: tiendaHoyRaw.filter(o => o.status !== 'pendiente_pago').reduce((acc, o) => acc + o.total, 0)
  }

  const tiendaMes = {
    pedidos: tiendaMesRaw.length,
    ingresos: tiendaMesRaw.filter(o => o.status !== 'pendiente_pago').reduce((acc, o) => acc + o.total, 0)
  }

  return {
    totalPacientes,
    citasHoy,
    citasPendientes,
    notasMedicasHoy,
    prescripcionesActivas,
    citasPorDia: Array.from(dayMap.entries()).map(([fecha, total]) => ({ fecha, total })),
    citasPorEstado: citasPorEstadoRaw.map(r => ({ estado: r.status, total: r._count.id })),
    tiendaHoy,
    tiendaMes
  }
}

export interface CitaHoy {
  id: string
  patientName: string
  time: string
  status: string
  reason: string
  patientId: string | null
}

export async function getCitasHoy(): Promise<CitaHoy[]> {
  await verifySession()

  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

  const apts = await prisma.appointment.findMany({
    where: { scheduledAt: { gte: startOfDay, lt: endOfDay } },
    include: { patient: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } } },
    orderBy: { scheduledAt: 'asc' },
  })

  return apts.map(apt => ({
    id: apt.id,
    patientName: apt.patient
      ? [apt.patient.nombre, apt.patient.apellidoPaterno, apt.patient.apellidoMaterno].filter(Boolean).join(' ')
      : apt.patientName ?? 'Paciente portal',
    time: apt.scheduledAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' }),
    status: apt.status,
    reason: apt.notes ?? '',
    patientId: apt.patientId,
  }))
}

export interface PacienteReciente {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string | null
  createdAt: string
}

export async function getPacientesRecientes(): Promise<PacienteReciente[]> {
  await verifySession()

  const patients = await prisma.patient.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true, createdAt: true },
  })

  return patients.map(p => ({
    id: p.id,
    nombre: p.nombre,
    apellidoPaterno: p.apellidoPaterno,
    apellidoMaterno: p.apellidoMaterno,
    createdAt: p.createdAt.toISOString(),
  }))
}

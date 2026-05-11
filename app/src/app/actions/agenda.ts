'use server'

import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/crypto'
import type { Appointment, Service } from '@/lib/agenda-types'

export async function getAppointments(): Promise<Appointment[]> {
  const apts = await prisma.appointment.findMany({
    include: { patient: true, service: true, cobro: true },
    orderBy: { scheduledAt: 'asc' },
  })

  return apts.map(apt => {
    const patientName = apt.patient
      ? [apt.patient.nombre, apt.patient.apellidoPaterno, apt.patient.apellidoMaterno].filter(Boolean).join(' ')
      : apt.patientName ?? 'Paciente portal'

    const phone = apt.patient
      ? (apt.patient.telefono ? decrypt(apt.patient.telefono) : '')
      : apt.patientPhone ?? ''

    const email = apt.patient
      ? (apt.patient.email ? decrypt(apt.patient.email) : '')
      : apt.patientEmail ?? ''

    return {
      id: apt.id,
      patientName,
      phone,
      email,
      serviceId: apt.serviceId ?? null,
      serviceName: apt.service?.name ?? '—',
      date: apt.scheduledAt.toISOString().split('T')[0],
      time: apt.scheduledAt.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Mexico_City',
      }),
      reason: apt.notes ?? '',
      status: apt.status as Appointment['status'],
      privacyAccepted: true,
      bookingSource: apt.bookingSource,
      patientConfirmed: apt.patientConfirmed,
      createdAt: apt.createdAt.toISOString(),
      cobro: apt.cobro ? {
        id: apt.cobro.id,
        tipoConsulta: apt.cobro.tipoConsulta,
        montoTotal: apt.cobro.montoTotal,
        metodoPago: apt.cobro.metodoPago,
        notasExtra: apt.cobro.notasExtra,
        facturado: apt.cobro.facturado,
        cobradoAt: apt.cobro.cobradoAt.toISOString(),
      } : null,
    }
  })
}

export async function getServices(): Promise<Service[]> {
  const services = await prisma.service.findMany({ where: { active: true }, orderBy: { name: 'asc' } })
  return services.map(s => ({
    id: s.id,
    name: s.name,
    duration: s.durationMins,
    description: s.description ?? '',
  }))
}

export async function updateAppointmentStatus(
  id: string,
  status: 'confirmada' | 'cancelada' | 'completada',
): Promise<void> {
  await prisma.appointment.update({ where: { id }, data: { status } })
}

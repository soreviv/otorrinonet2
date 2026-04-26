'use server'

import { prisma } from '@/lib/prisma'
import type { Appointment, Service } from '@/lib/agenda-types'

export async function getAppointments(): Promise<Appointment[]> {
  const apts = await prisma.appointment.findMany({
    include: { patient: true, service: true },
    orderBy: { scheduledAt: 'asc' },
  })

  return apts.map(apt => ({
    id: apt.id,
    patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
    phone: apt.patient.phone ?? '',
    email: apt.patient.email ?? '',
    serviceId: apt.serviceId,
    serviceName: apt.service.name,
    date: apt.scheduledAt.toISOString().split('T')[0],
    time: apt.scheduledAt.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Mexico_City',
    }),
    reason: apt.notes ?? '',
    status: apt.status as Appointment['status'],
    privacyAccepted: true,
    createdAt: apt.createdAt.toISOString(),
  }))
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

'use server'

import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { prisma } from '@/lib/prisma'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import {
  sendAppointmentConfirmationToPatient,
  sendAppointmentNotificationToDoctor,
  type AppointmentEmailData,
} from '@/lib/mailer'

const AppointmentPayloadSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida'),
  patientName: z.string().min(2, 'Nombre muy corto').max(120),
  phone: z.string().min(8).max(20),
  email: z.string().email('Correo inválido'),
  reason: z.string().min(5, 'Describa su motivo').max(1000),
  appointmentType: z.string().optional(),
  captchaToken: z.string().min(1),
})

export type AppointmentRequestPayload = z.infer<typeof AppointmentPayloadSchema>

export async function submitAppointmentRequest(
  payload: AppointmentRequestPayload
): Promise<{ ok: boolean; error?: string }> {
  // 1. Validación Zod
  const parsed = AppointmentPayloadSchema.safeParse(payload)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }
  const data = parsed.data

  // 2. Captcha
  const valid = await verifyTurnstileToken(data.captchaToken)
  if (!valid) return { ok: false, error: 'Verificación de seguridad fallida. Intenta de nuevo.' }

  // 3. Fecha no en el pasado (zona horaria CDMX, margen de 30 min)
  const scheduledAt = new Date(`${data.date}T${data.time}:00-06:00`)
  const now = new Date()
  if (scheduledAt.getTime() < now.getTime() - 30 * 60 * 1000) {
    return { ok: false, error: 'No es posible agendar citas en el pasado.' }
  }

  // 4. Días feriados — consultamos directamente para obtener campo Json
  const clinicRow = await prisma.clinicConfig.findUnique({ where: { id: 'singleton' } })
  const feriados: string[] = Array.isArray(clinicRow?.diasFeriados) ? clinicRow.diasFeriados as string[] : []
  if (feriados.includes(data.date)) {
    return { ok: false, error: 'El consultorio no tiene disponibilidad ese día.' }
  }

  const cfg = await getClinicConfigFromDB()

  // 5. Slot no tomado (estado activo = pendiente | confirmada)
  const slotTaken = await prisma.appointment.findFirst({
    where: {
      scheduledAt,
      status: { in: ['pendiente', 'confirmada'] },
    },
  })
  if (slotTaken) {
    return { ok: false, error: 'Ese horario ya no está disponible. Por favor elige otro.' }
  }

  // 6. Crear cita
  const actionToken = randomUUID()
  await prisma.appointment.create({
    data: {
      scheduledAt,
      status: 'pendiente',
      notes: data.reason || null,
      bookingSource: 'portal',
      patientName: data.patientName,
      patientEmail: data.email,
      patientPhone: data.phone,
      appointmentType: data.appointmentType ?? 'primera_vez',
      actionToken,
    },
  })

  // Fire-and-forget — los errores de email no bloquean la respuesta al paciente
  const emailData: AppointmentEmailData = {
    patientName: data.patientName,
    patientEmail: data.email,
    fecha: data.date,
    hora: data.time,
    appointmentType: data.appointmentType ?? 'primera_vez',
    actionToken,
    motivo: data.reason || null,
  }
  Promise.all([
    sendAppointmentConfirmationToPatient(emailData, cfg),
    sendAppointmentNotificationToDoctor(emailData, cfg),
  ]).catch(err => console.error('[mailer] Error enviando emails de cita:', err))

  return { ok: true }
}

export async function confirmAppointmentByToken(
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!token) return { ok: false, error: 'Token inválido.' }

  const appointment = await prisma.appointment.findUnique({ where: { actionToken: token } })
  if (!appointment) return { ok: false, error: 'Enlace inválido o expirado.' }
  if (appointment.status === 'cancelada') return { ok: false, error: 'Esta cita ya fue cancelada.' }

  if (!appointment.patientConfirmed) {
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { patientConfirmed: true },
    })
  }
  return { ok: true }
}

export async function cancelAppointmentByToken(
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!token) return { ok: false, error: 'Token inválido.' }

  const appointment = await prisma.appointment.findUnique({ where: { actionToken: token } })
  if (!appointment) return { ok: false, error: 'Enlace inválido o expirado.' }
  if (appointment.status === 'cancelada') return { ok: true }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: 'cancelada' },
  })
  return { ok: true }
}

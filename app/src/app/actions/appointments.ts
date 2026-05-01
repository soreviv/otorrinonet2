'use server'

import { randomUUID } from 'node:crypto'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { prisma } from '@/lib/prisma'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import {
  sendAppointmentConfirmationToPatient,
  sendAppointmentNotificationToDoctor,
  type AppointmentEmailData,
} from '@/lib/mailer'

export interface AppointmentRequestPayload {
  date: string
  time: string
  patientName: string
  phone: string
  email: string
  reason: string
  appointmentType?: string
  captchaToken: string
}

export async function submitAppointmentRequest(
  payload: AppointmentRequestPayload
): Promise<{ ok: boolean; error?: string }> {
  const valid = await verifyTurnstileToken(payload.captchaToken)
  if (!valid) return { ok: false, error: 'Verificación de seguridad fallida. Intenta de nuevo.' }

  const actionToken = randomUUID()
  const scheduledAt = new Date(`${payload.date}T${payload.time}:00`)

  await prisma.appointment.create({
    data: {
      scheduledAt,
      status: 'pendiente',
      notes: payload.reason || null,
      bookingSource: 'portal',
      patientName: payload.patientName,
      patientEmail: payload.email,
      patientPhone: payload.phone,
      appointmentType: payload.appointmentType ?? 'primera_vez',
      actionToken,
    },
  })

  // Fire-and-forget — los errores de email no bloquean la respuesta al paciente
  getClinicConfigFromDB().then(cfg => {
    const emailData: AppointmentEmailData = {
      patientName: payload.patientName,
      patientEmail: payload.email,
      fecha: payload.date,
      hora: payload.time,
      appointmentType: payload.appointmentType ?? 'primera_vez',
      actionToken,
      motivo: payload.reason || null,
    }
    Promise.all([
      sendAppointmentConfirmationToPatient(emailData, cfg),
      sendAppointmentNotificationToDoctor(emailData, cfg),
    ]).catch(err => console.error('[mailer] Error enviando emails de cita:', err))
  })

  return { ok: true }
}

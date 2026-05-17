'use server'

import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { fromZonedTime } from 'date-fns-tz'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { prisma } from '@/lib/prisma'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import { encrypt } from '@/lib/crypto'
import {
  sendAppointmentConfirmationToPatient,
  sendAppointmentNotificationToDoctor,
  sendAppointmentReschedule,
  type AppointmentEmailData,
} from '@/lib/mailer'

const CDMX = 'America/Mexico_City'

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
  const scheduledAt = fromZonedTime(`${data.date}T${data.time}`, CDMX)
  const now = new Date()
  if (scheduledAt.getTime() < now.getTime() - 30 * 60 * 1000) {
    return { ok: false, error: 'No es posible agendar citas en el pasado.' }
  }

  // 4. Días bloqueados (feriados + bloqueos dinámicos)
  const [clinicRow, blockedDates] = await Promise.all([
    prisma.clinicConfig.findUnique({ where: { id: 'singleton' } }),
    import('./configuracion').then(m => m.getPublicBlockedDates())
  ])
  if (blockedDates.includes(data.date)) {
    return { ok: false, error: 'El consultorio no tiene disponibilidad ese día.' }
  }

  const cfg = await getClinicConfigFromDB()

  // 5. Sin solapamiento — una cita ocupa appointmentDurationMin minutos
  const durationMs = (clinicRow?.appointmentDurationMin ?? 30) * 60 * 1000
  const windowStart = new Date(scheduledAt.getTime() - durationMs + 1)
  const windowEnd   = new Date(scheduledAt.getTime() + durationMs - 1)
  const slotTaken = await prisma.appointment.findFirst({
    where: {
      scheduledAt: { gte: windowStart, lte: windowEnd },
      status: { in: ['pendiente', 'confirmada'] },
    },
  })
  if (slotTaken) {
    return { ok: false, error: 'Ese horario ya no está disponible. Por favor elige otro.' }
  }

  // 6. Crear o reutilizar expediente del paciente
  const patientId = await findOrCreatePortalPatient(data.patientName, data.email, data.phone)

  // 7. Crear cita
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
      patientId,
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

export async function rescheduleAppointmentByToken(
  token: string,
  newDate: string,
  newTime: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!token) return { ok: false, error: 'Token inválido.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return { ok: false, error: 'Fecha inválida.' }
  if (!/^\d{2}:\d{2}$/.test(newTime)) return { ok: false, error: 'Hora inválida.' }

  const appointment = await prisma.appointment.findUnique({ where: { actionToken: token } })
  if (!appointment) return { ok: false, error: 'Enlace inválido o expirado.' }
  if (appointment.status === 'cancelada') return { ok: false, error: 'Esta cita ya fue cancelada.' }

  const newScheduledAt = fromZonedTime(`${newDate}T${newTime}`, CDMX)
  if (newScheduledAt.getTime() < Date.now() - 30 * 60 * 1000) {
    return { ok: false, error: 'No es posible agendar citas en el pasado.' }
  }

  const [clinicRow, blockedDates] = await Promise.all([
    prisma.clinicConfig.findUnique({ where: { id: 'singleton' } }),
    import('./configuracion').then(m => m.getPublicBlockedDates())
  ])
  if (blockedDates.includes(newDate)) {
    return { ok: false, error: 'El consultorio no tiene disponibilidad ese día.' }
  }

  const durationMs   = (clinicRow?.appointmentDurationMin ?? 30) * 60 * 1000
  const windowStart  = new Date(newScheduledAt.getTime() - durationMs + 1)
  const windowEnd    = new Date(newScheduledAt.getTime() + durationMs - 1)
  const slotTaken = await prisma.appointment.findFirst({
    where: {
      scheduledAt: { gte: windowStart, lte: windowEnd },
      status: { in: ['pendiente', 'confirmada'] },
      id: { not: appointment.id },
    },
  })
  if (slotTaken) {
    return { ok: false, error: 'Ese horario ya no está disponible. Por favor elige otro.' }
  }

  const cfg = await getClinicConfigFromDB()

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { scheduledAt: newScheduledAt, status: 'pendiente', patientConfirmed: false },
  })

  if (appointment.patientEmail && appointment.patientName) {
    const emailData: AppointmentEmailData = {
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      fecha: newDate,
      hora: newTime,
      appointmentType: appointment.appointmentType ?? 'primera_vez',
      actionToken: token,
    }
    sendAppointmentReschedule(emailData, cfg).catch(err =>
      console.error('[mailer] Error enviando email de reagendamiento:', err),
    )
  }

  return { ok: true }
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

function parseName(fullName: string): { nombre: string; apellidoPaterno: string; apellidoMaterno: string | null } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { nombre: parts[0], apellidoPaterno: parts[0], apellidoMaterno: null }
  if (parts.length === 2) return { nombre: parts[0], apellidoPaterno: parts[1], apellidoMaterno: null }
  // 3+ palabras: primer token = nombre, segundo = apellido paterno, resto = apellido materno
  return {
    nombre: parts[0],
    apellidoPaterno: parts[1],
    apellidoMaterno: parts.slice(2).join(' '),
  }
}

async function findOrCreatePortalPatient(fullName: string, email: string, phone: string): Promise<string | null> {
  try {
    const { nombre, apellidoPaterno, apellidoMaterno } = parseName(fullName)
    const year = new Date().getFullYear()
    const count = await prisma.patient.count()
    const expedienteNumber = `VIV-${year}-${String(count + 1).padStart(4, '0')}`

    const patient = await prisma.patient.create({
      data: {
        expedienteNumber,
        nombre,
        apellidoPaterno,
        apellidoMaterno: apellidoMaterno ?? null,
        fechaNacimiento: new Date('2000-01-01'),
        sexo: 'otro',
        telefono: phone ? encrypt(phone) : null,
        email: email ? encrypt(email) : null,
        status: 'activo',
      },
    })
    return patient.id
  } catch (err) {
    // No bloquear la cita si la creación del expediente falla
    console.error('[appointments] Error creando expediente desde portal:', err)
    return null
  }
}

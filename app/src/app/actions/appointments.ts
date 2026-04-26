'use server'

import { verifyTurnstileToken } from '@/lib/turnstile'

export interface AppointmentRequestPayload {
  date: string
  time: string
  patientName: string
  phone: string
  email: string
  reason: string
  captchaToken: string
}

export async function submitAppointmentRequest(
  payload: AppointmentRequestPayload
): Promise<{ ok: boolean; error?: string }> {
  const valid = await verifyTurnstileToken(payload.captchaToken)
  if (!valid) return { ok: false, error: 'Verificación de seguridad fallida. Intenta de nuevo.' }

  // TODO: guardar solicitud en DB y notificar al consultorio
  // console.log('Solicitud de cita recibida:', payload)

  return { ok: true }
}

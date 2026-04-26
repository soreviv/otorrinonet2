'use server'

import { verifyTurnstileToken } from '@/lib/turnstile'

export interface ContactFormPayload {
  name: string
  phone: string
  email: string
  message: string
  captchaToken: string
}

export async function submitContactForm(payload: ContactFormPayload): Promise<{ ok: boolean; error?: string }> {
  const valid = await verifyTurnstileToken(payload.captchaToken)
  if (!valid) return { ok: false, error: 'Verificación de seguridad fallida. Intenta de nuevo.' }

  // TODO: guardar en DB o enviar email con los datos del contacto
  // console.log('Contacto recibido:', payload)

  return { ok: true }
}

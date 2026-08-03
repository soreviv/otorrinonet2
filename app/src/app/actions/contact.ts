'use server'

import { prisma } from '@/lib/prisma'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import { sendContactNotification } from '@/lib/mailer'
import { sendStaffPush } from '@/lib/ntfy'

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

  // Guardar en BD
  await prisma.contactMessage.create({
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      subject: 'Mensaje de contacto desde el portal',
      message: payload.message,
    },
  })

  // Enviar email de notificación (fire-and-forget)
  getClinicConfigFromDB().then(cfg => {
    sendContactNotification({
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      subject: 'Mensaje de contacto desde el portal',
      message: payload.message,
    }, cfg).catch(err => console.error('[mailer] Error enviando email de contacto:', err))
  })

  sendStaffPush({
    title: 'Nuevo mensaje de contacto',
    message: `${payload.name}: ${payload.message.slice(0, 200)}`,
    tags: ['email'],
    click: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/staff`,
  })

  return { ok: true }
}

'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import { sendContactNotification } from '@/lib/mailer'
import { sendStaffPush } from '@/lib/ntfy'

const ContactFormSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  email: z.string().trim().email('Correo electrónico inválido').max(200),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'El mensaje debe tener al menos 10 caracteres').max(2000),
  captchaToken: z.string().min(1, 'Token de seguridad requerido'),
})

export type ContactFormPayload = z.infer<typeof ContactFormSchema>

export async function submitContactForm(payload: ContactFormPayload): Promise<{ ok: boolean; error?: string }> {
  // 1. Validación de esquema
  const parsed = ContactFormSchema.safeParse(payload)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos de contacto inválidos.' }
  }
  const data = parsed.data

  // 2. Verificación de seguridad Turnstile
  const valid = await verifyTurnstileToken(data.captchaToken, { action: 'contacto' })
  if (!valid) return { ok: false, error: 'Verificación de seguridad fallida. Intenta de nuevo.' }

  // 3. Persistencia en base de datos
  await prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: 'Mensaje de contacto desde el portal',
      message: data.message,
    },
  })

  // 4. Notificaciones
  getClinicConfigFromDB().then(cfg => {
    sendContactNotification({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: 'Mensaje de contacto desde el portal',
      message: data.message,
    }, cfg).catch(err => console.error('[mailer] Error enviando email de contacto:', err))
  })

  sendStaffPush({
    title: 'Nuevo mensaje de contacto',
    message: `${data.name}: ${data.message.slice(0, 200)}`,
    tags: ['email'],
    click: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/staff`,
  })

  return { ok: true }
}

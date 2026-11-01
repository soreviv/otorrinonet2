import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitContactForm } from '@/app/actions/contact'
import { verifyTurnstileToken } from '@/lib/turnstile'

vi.mock('@/lib/turnstile', () => ({
  verifyTurnstileToken: vi.fn(),
}))

vi.mock('@/lib/clinic-config', () => ({
  getClinicConfigFromDB: vi.fn().mockResolvedValue({
    notificationEmail: 'doctor@test.com',
  }),
}))

vi.mock('@/lib/mailer', () => ({
  sendContactNotification: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/ntfy', () => ({
  sendStaffPush: vi.fn(),
}))

const mockPrisma = vi.hoisted(() => ({
  contactMessage: {
    create: vi.fn().mockResolvedValue({ id: 'msg-1' }),
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

describe('submitContactForm action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true)
  })

  it('guarda el mensaje y retorna ok cuando los datos son válidos', async () => {
    const payload = {
      name: 'Dr. Roberto Mendoza',
      email: 'roberto@example.com',
      phone: '5512345678',
      message: 'Buenas tardes, quisiera consultar sobre el procedimiento de rinoplastia funcional.',
      captchaToken: 'token-valido',
    }

    const res = await submitContactForm(payload)
    expect(res.ok).toBe(true)
    expect(mockPrisma.contactMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Dr. Roberto Mendoza',
        email: 'roberto@example.com',
        phone: '5512345678',
      }),
    })
  })

  it('rechaza cuando el token de captcha es inválido', async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false)
    const res = await submitContactForm({
      name: 'Roberto',
      email: 'roberto@example.com',
      phone: '',
      message: 'Mensaje de prueba con más de diez caracteres.',
      captchaToken: 'token-invalido',
    })

    expect(res.ok).toBe(false)
    expect(res.error).toMatch(/seguridad/i)
    expect(mockPrisma.contactMessage.create).not.toHaveBeenCalled()
  })

  it('rechaza correos electrónicos malformados', async () => {
    const res = await submitContactForm({
      name: 'Roberto',
      email: 'no-es-correo',
      phone: '',
      message: 'Mensaje de prueba con más de diez caracteres.',
      captchaToken: 'token-valido',
    })

    expect(res.ok).toBe(false)
    expect(res.error).toBeDefined()
    expect(mockPrisma.contactMessage.create).not.toHaveBeenCalled()
  })

  it('rechaza mensajes vacíos o excesivamente cortos', async () => {
    const res = await submitContactForm({
      name: 'Roberto',
      email: 'roberto@example.com',
      phone: '',
      message: 'Hola',
      captchaToken: 'token-valido',
    })

    expect(res.ok).toBe(false)
    expect(res.error).toBeDefined()
    expect(mockPrisma.contactMessage.create).not.toHaveBeenCalled()
  })
})

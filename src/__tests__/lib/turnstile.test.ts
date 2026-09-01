import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { verifyTurnstileToken } from '@/lib/turnstile'

describe('verifyTurnstileToken', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    process.env.TURNSTILE_SECRET = '0x4AAAAAAATestSecretKey'
    delete process.env.TURNSTILE_SECRET_KEY
    delete process.env.TURNSTILE_HOSTNAMES
    vi.restoreAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('retorna false si no hay secret configurado', async () => {
    delete process.env.TURNSTILE_SECRET
    delete process.env.TURNSTILE_SECRET_KEY

    const result = await verifyTurnstileToken('valid-token')
    expect(result).toBe(false)
  })

  it('retorna false si el token es inválido, vacío o excede 2048 caracteres', async () => {
    expect(await verifyTurnstileToken('')).toBe(false)
    expect(await verifyTurnstileToken(null as unknown as string)).toBe(false)
    expect(await verifyTurnstileToken(undefined as unknown as string)).toBe(false)
    expect(await verifyTurnstileToken('a'.repeat(2049))).toBe(false)
  })

  it('retorna true cuando Cloudflare valida exitosamente el token', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })

    const result = await verifyTurnstileToken('token-123')
    expect(result).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    )
  })

  it('soporta TURNSTILE_SECRET_KEY como fallback', async () => {
    delete process.env.TURNSTILE_SECRET
    process.env.TURNSTILE_SECRET_KEY = '0x4AAAAAAALegacySecret'

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })

    const result = await verifyTurnstileToken('token-123')
    expect(result).toBe(true)
  })

  it('valida que el action coincida con el esperado', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, action: 'agendar_cita' }),
    })

    const validResult = await verifyTurnstileToken('token-123', { action: 'agendar_cita' })
    expect(validResult).toBe(true)

    const invalidResult = await verifyTurnstileToken('token-123', { action: 'contacto' })
    expect(invalidResult).toBe(false)
  })

  it('valida el hostname contra TURNSTILE_HOSTNAMES cuando está configurado', async () => {
    process.env.TURNSTILE_HOSTNAMES = 'otorrinonet.com, www.otorrinonet.com'

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, hostname: 'otorrinonet.com' }),
    })

    const validResult = await verifyTurnstileToken('token-123')
    expect(validResult).toBe(true)

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, hostname: 'malicious-domain.com' }),
    })

    const invalidResult = await verifyTurnstileToken('token-123')
    expect(invalidResult).toBe(false)
  })

  it('retorna false si Cloudflare responde success: false', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    })

    const result = await verifyTurnstileToken('bad-token')
    expect(result).toBe(false)
  })

  it('retorna false (fail-closed) si fetch falla o lanza timeout', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network timeout'))

    const result = await verifyTurnstileToken('token-123')
    expect(result).toBe(false)
  })
})

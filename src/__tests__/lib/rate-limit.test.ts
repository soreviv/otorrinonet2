import { describe, it, expect, beforeEach } from 'vitest'
import {
  checkRateLimit,
  recordFailure,
  clearRateLimit,
  resetRateLimitStore,
  getRateLimitStoreSize,
} from '@/lib/rate-limit'

describe('rate-limit module', () => {
  beforeEach(() => {
    resetRateLimitStore()
  })

  it('permite accesos cuando no hay intentos previos', () => {
    const res = checkRateLimit('user@example.com')
    expect(res.blocked).toBe(false)
  })

  it('bloquea después de 5 intentos fallidos consecutivos', () => {
    const key = 'test-ip-1'
    for (let i = 0; i < 4; i++) {
      recordFailure(key)
      expect(checkRateLimit(key).blocked).toBe(false)
    }

    // 5to intento
    recordFailure(key)
    expect(checkRateLimit(key).blocked).toBe(true)
  })

  it('limpia el bloqueo con clearRateLimit tras éxito', () => {
    const key = 'test-ip-2'
    for (let i = 0; i < 5; i++) {
      recordFailure(key)
    }
    expect(checkRateLimit(key).blocked).toBe(true)

    clearRateLimit(key)
    expect(checkRateLimit(key).blocked).toBe(false)
  })

  it('expira el bloqueo una vez superado el LOCKOUT_MS con timestamp personalizado', () => {
    const key = 'test-ip-3'
    const t0 = 1000000
    for (let i = 0; i < 5; i++) {
      recordFailure(key, t0)
    }
    expect(checkRateLimit(key, t0).blocked).toBe(true)

    // Después de 31 minutos (LOCKOUT_MS = 30 min)
    const tFuture = t0 + 31 * 60 * 1000
    expect(checkRateLimit(key, tFuture).blocked).toBe(false)
  })

  it('evita fugas de memoria realizando limpieza o podado de entradas viejas', () => {
    const t0 = 1000000
    for (let i = 0; i < 100; i++) {
      recordFailure(`ip-${i}`, t0)
    }
    expect(getRateLimitStoreSize()).toBe(100)

    // Consultar una entrada después de 20 minutos (WINDOW_MS = 15 min)
    const tAfterWindow = t0 + 20 * 60 * 1000
    checkRateLimit('ip-0', tAfterWindow)
    // ip-0 debe haberse limpiado
    expect(checkRateLimit('ip-0', tAfterWindow).blocked).toBe(false)
  })
})

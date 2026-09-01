'use server'

export interface VerifyTurnstileOptions {
  action?: string
  remoteip?: string
}

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
  action?: string
  cdata?: string
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  options?: VerifyTurnstileOptions,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET || process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.error('[turnstile] Error: Ni TURNSTILE_SECRET ni TURNSTILE_SECRET_KEY configurados')
    return false
  }

  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    return false
  }

  // Lista blanca de hostnames permitidos si está configurada en TURNSTILE_HOSTNAMES
  const rawHostnames = process.env.TURNSTILE_HOSTNAMES ?? ''
  const expectedHostnames = new Set(
    rawHostnames
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean),
  )

  try {
    const params = new URLSearchParams({
      secret,
      response: token,
    })

    if (options?.remoteip) {
      params.append('remoteip', options.remoteip)
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      console.error(`[turnstile] Error HTTP en siteverify: ${res.status}`)
      return false
    }

    const data = (await res.json()) as TurnstileVerifyResponse

    if (!data.success) {
      return false
    }

    // Validar acción esperada si fue proporcionada
    if (options?.action && data.action && data.action !== options.action) {
      console.warn(`[turnstile] Action mismatch: esperado "${options.action}", recibido "${data.action}"`)
      return false
    }

    // Validar hostname si TURNSTILE_HOSTNAMES está configurado
    if (expectedHostnames.size > 0 && data.hostname && !expectedHostnames.has(data.hostname)) {
      console.warn(`[turnstile] Hostname no autorizado: "${data.hostname}"`)
      return false
    }

    return true
  } catch (error) {
    console.error('[turnstile] Excepción durante siteverify:', error)
    return false
  }
}

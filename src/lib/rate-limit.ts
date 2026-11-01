const MAX_ATTEMPTS = 5
const WINDOW_MS   = 15 * 60 * 1000   // 15 min
const LOCKOUT_MS  = 30 * 60 * 1000   // 30 min
const MAX_ENTRIES = 5000

type Entry = { attempts: number; firstAt: number; lockedUntil?: number }

const store = new Map<string, Entry>()

/**
 * Elimina entradas caducadas del almacén para evitar fugas de memoria por acumulación de claves únicas.
 */
function pruneExpired(now: number): void {
  for (const [key, entry] of store.entries()) {
    const isLocked = entry.lockedUntil ? now < entry.lockedUntil : false
    const isWithinWindow = now - entry.firstAt <= WINDOW_MS
    if (!isLocked && !isWithinWindow) {
      store.delete(key)
    }
  }
}

export function checkRateLimit(key: string, now: number = Date.now()): { blocked: boolean } {
  const entry = store.get(key)
  if (!entry) return { blocked: false }

  if (entry.lockedUntil) {
    if (now < entry.lockedUntil) return { blocked: true }
    store.delete(key)
    return { blocked: false }
  }

  if (now - entry.firstAt > WINDOW_MS) {
    store.delete(key)
    return { blocked: false }
  }

  return { blocked: false }
}

export function recordFailure(key: string, now: number = Date.now()): void {
  // Limpieza preventiva si el almacén supera la capacidad máxima
  if (store.size >= MAX_ENTRIES) {
    pruneExpired(now)
  }

  const entry = store.get(key)

  if (!entry || now - entry.firstAt > WINDOW_MS) {
    store.set(key, { attempts: 1, firstAt: now })
    return
  }

  const next = entry.attempts + 1
  store.set(key, {
    ...entry,
    attempts: next,
    ...(next >= MAX_ATTEMPTS ? { lockedUntil: now + LOCKOUT_MS } : {}),
  })
}

export function clearRateLimit(key: string): void {
  store.delete(key)
}

/**
 * Funciones de diagnóstico y testing
 */
export function resetRateLimitStore(): void {
  store.clear()
}

export function getRateLimitStoreSize(): number {
  return store.size
}

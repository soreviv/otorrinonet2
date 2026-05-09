const MAX_ATTEMPTS = 5
const WINDOW_MS   = 15 * 60 * 1000   // 15 min
const LOCKOUT_MS  = 30 * 60 * 1000   // 30 min

type Entry = { attempts: number; firstAt: number; lockedUntil?: number }

const store = new Map<string, Entry>()

export function checkRateLimit(key: string): { blocked: boolean } {
  const now   = Date.now()
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

export function recordFailure(key: string): void {
  const now   = Date.now()
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

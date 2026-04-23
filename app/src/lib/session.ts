import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'session'
const PENDING_COOKIE = 'session-pending'
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000 // 8 h
const PENDING_DURATION_MS = 5 * 60 * 1000       // 5 min

function signingKey() {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET no configurado')
  return new TextEncoder().encode(secret)
}

export type SessionPayload = {
  userId: string
  email: string
  name: string
  role: 'medico' | 'enfermera' | 'recepcionista'
}

export type PendingPayload = {
  userId: string
  pending: true
}

async function sign(payload: Record<string, unknown>, expiresInMs: number): Promise<string> {
  const expiresAt = new Date(Date.now() + expiresInMs)
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(signingKey())
}

async function verify<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, signingKey(), { algorithms: ['HS256'] })
    return payload as T
  } catch {
    return null
  }
}

// Public decrypt for use in proxy.ts (reads raw token, no cookies() dependency)
export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  return verify<SessionPayload>(token)
}

// ─── Full session (post-2FA) ───────────────────────────────────────────────────

export async function createSession(payload: SessionPayload) {
  const token = await sign(payload as unknown as Record<string, unknown>, SESSION_DURATION_MS)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  return verify<SessionPayload>(token)
}

export async function deleteSession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

// ─── Pending session (between password ok → 2FA) ──────────────────────────────

export async function createPendingSession(userId: string) {
  const token = await sign({ userId, pending: true }, PENDING_DURATION_MS)
  const store = await cookies()
  store.set(PENDING_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: PENDING_DURATION_MS / 1000,
  })
}

export async function getPendingSession(): Promise<PendingPayload | null> {
  const store = await cookies()
  const token = store.get(PENDING_COOKIE)?.value
  return verify<PendingPayload>(token)
}

export async function deletePendingSession() {
  const store = await cookies()
  store.delete(PENDING_COOKIE)
}

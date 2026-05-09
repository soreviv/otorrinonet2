'use server'

import { redirect } from 'next/navigation'
import { randomBytes, createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { generateSecret, generateURI, verifySync } from 'otplib'
import { prisma } from '@/lib/prisma'
import {
  createSession,
  createPendingSession,
  getPendingSession,
  deletePendingSession,
  deleteSession,
} from '@/lib/session'
import { logAction } from '@/lib/audit'
import { sendPasswordResetEmail } from '@/lib/mailer'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import { checkRateLimit, recordFailure, clearRateLimit } from '@/lib/rate-limit'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionResult = { error: string } | { ok: true }

// ─── Login (step 1) ───────────────────────────────────────────────────────────

export async function loginAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = formData.get('email')?.toString().toLowerCase().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  if (!email || !password) return { error: 'Completa todos los campos.' }

  const rlKey = `login:${email}`
  if (checkRateLimit(rlKey).blocked) {
    return { error: 'Demasiados intentos fallidos. Espere 30 minutos e intente de nuevo.' }
  }

  const user = await prisma.staffUser.findUnique({ where: { email } })

  if (!user || user.activo === false) {
    recordFailure(rlKey)
    await logAction({ action: 'login_fallido', resource: 'auth', details: { email, reason: 'user_not_found' } })
    return { error: 'Credenciales incorrectas.' }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    recordFailure(rlKey)
    await logAction({ action: 'login_fallido', resource: 'auth', userId: user.id, details: { reason: 'invalid_password' } })
    return { error: 'Credenciales incorrectas.' }
  }

  clearRateLimit(rlKey)
  await createPendingSession(user.id)

  redirect(user.totpEnabled ? '/login/verify-2fa' : '/login/setup-2fa')
}

// ─── Setup 2FA (step 2a — first time) ────────────────────────────────────────

export async function getSetup2faData(): Promise<{ secret: string; otpauth: string; email: string } | null> {
  const pending = await getPendingSession()
  if (!pending) return null

  const user = await prisma.staffUser.findUnique({ where: { id: pending.userId } })
  if (!user) return null

  // Reuse stored secret if exists (user may refresh page)
  const secret = user.totpSecret ?? generateSecret()

  if (!user.totpSecret) {
    await prisma.staffUser.update({
      where: { id: user.id },
      data: { totpSecret: secret },
    })
  }

  const otpauth = generateURI({ label: user.email, issuer: 'ORL Viveros', secret })
  return { secret, otpauth, email: user.email }
}

export async function confirmSetup2faAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const code = formData.get('code')?.toString().trim() ?? ''
  const pending = await getPendingSession()
  if (!pending) return { error: 'Sesión expirada. Inicia sesión de nuevo.' }

  const user = await prisma.staffUser.findUnique({ where: { id: pending.userId } })
  if (!user?.totpSecret) return { error: 'Error de configuración. Intenta de nuevo.' }

  const valid = verifySync({ token: code, secret: user.totpSecret })
  if (!valid) return { error: 'Código incorrecto. Intenta de nuevo.' }

  const updated = await prisma.staffUser.update({
    where: { id: user.id },
    data: { totpEnabled: true, lastAccess: new Date() },
    select: { sessionVersion: true },
  })

  await deletePendingSession()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role as any, sessionVersion: updated.sessionVersion })
  await logAction({ action: 'login_ok', resource: 'auth', userId: user.id, details: { method: '2fa_setup' } })

  return { ok: true }
}

// ─── Verify 2FA (step 2b — returning user) ────────────────────────────────────

export async function verify2faAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const code = formData.get('code')?.toString().trim() ?? ''
  const pending = await getPendingSession()
  if (!pending) return { error: 'Sesión expirada. Inicia sesión de nuevo.' }

  const user = await prisma.staffUser.findUnique({ where: { id: pending.userId } })
  if (!user?.totpSecret) return { error: 'Error de autenticación. Contacta al administrador.' }

  const valid = verifySync({ token: code, secret: user.totpSecret })
  if (!valid) {
    await logAction({ action: 'login_fallido', resource: 'auth', userId: user.id, details: { reason: 'invalid_totp' } })
    return { error: 'Código incorrecto. Intenta de nuevo.' }
  }

  const updated = await prisma.staffUser.update({
    where: { id: user.id },
    data: { lastAccess: new Date() },
    select: { sessionVersion: true },
  })

  await deletePendingSession()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role as any, sessionVersion: updated.sessionVersion })
  await logAction({ action: 'login_ok', resource: 'auth', userId: user.id, details: { method: 'totp' } })

  return { ok: true }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction() {
  await deleteSession()
  redirect('/login')
}

// ─── Recuperación de contraseña ───────────────────────────────────────────────

export async function requestPasswordResetAction(email: string): Promise<ActionResult> {
  const normalizedEmail = email.toLowerCase().trim()
  const rlKey = `reset:${normalizedEmail}`

  if (checkRateLimit(rlKey).blocked) {
    return { ok: true }
  }
  recordFailure(rlKey)

  const user = await prisma.staffUser.findUnique({ where: { email: normalizedEmail } })
  if (user && user.activo) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })
    const plain = randomBytes(32).toString('hex')
    const hash  = createHash('sha256').update(plain).digest('hex')
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token: hash, expiresAt: new Date(Date.now() + 3_600_000) },
    })
    const cfg = await getClinicConfigFromDB()
    await sendPasswordResetEmail(user.email, user.name, plain, cfg).catch(() => {})
  }
  return { ok: true }
}

export async function resetPasswordAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const token    = formData.get('token')?.toString() ?? ''
  const password = formData.get('password')?.toString() ?? ''
  const confirm  = formData.get('confirm')?.toString() ?? ''

  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  if (password !== confirm)  return { error: 'Las contraseñas no coinciden.' }

  const tokenHash  = createHash('sha256').update(token).digest('hex')
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token: tokenHash } })
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: 'El enlace ha expirado o ya fue utilizado. Solicita uno nuevo.' }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.$transaction([
    prisma.staffUser.update({
      where: { id: resetToken.userId },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ])
  return { ok: true }
}

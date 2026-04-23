'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { authenticator } from 'otplib'
import { prisma } from '@/lib/prisma'
import {
  createSession,
  createPendingSession,
  getPendingSession,
  deletePendingSession,
  deleteSession,
} from '@/lib/session'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionResult = { error: string } | { ok: true }

// ─── Login (step 1) ───────────────────────────────────────────────────────────

export async function loginAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = formData.get('email')?.toString().toLowerCase().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  if (!email || !password) return { error: 'Completa todos los campos.' }

  const user = await prisma.staffUser.findUnique({ where: { email } })

  if (!user || user.status === 'inactivo') {
    return { error: 'Credenciales incorrectas.' }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return { error: 'Credenciales incorrectas.' }

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
  const secret = user.totpSecret ?? authenticator.generateSecret()

  if (!user.totpSecret) {
    await prisma.staffUser.update({
      where: { id: user.id },
      data: { totpSecret: secret },
    })
  }

  const otpauth = authenticator.keyuri(user.email, 'ORL Viveros', secret)
  return { secret, otpauth, email: user.email }
}

export async function confirmSetup2faAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const code = formData.get('code')?.toString().trim() ?? ''
  const pending = await getPendingSession()
  if (!pending) return { error: 'Sesión expirada. Inicia sesión de nuevo.' }

  const user = await prisma.staffUser.findUnique({ where: { id: pending.userId } })
  if (!user?.totpSecret) return { error: 'Error de configuración. Intenta de nuevo.' }

  const valid = authenticator.verify({ token: code, secret: user.totpSecret })
  if (!valid) return { error: 'Código incorrecto. Intenta de nuevo.' }

  await prisma.staffUser.update({
    where: { id: user.id },
    data: {
      totpEnabled: true,
      lastAccess: new Date(),
    },
  })

  await deletePendingSession()
  await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role })

  redirect('/staff')
}

// ─── Verify 2FA (step 2b — returning user) ────────────────────────────────────

export async function verify2faAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const code = formData.get('code')?.toString().trim() ?? ''
  const pending = await getPendingSession()
  if (!pending) return { error: 'Sesión expirada. Inicia sesión de nuevo.' }

  const user = await prisma.staffUser.findUnique({ where: { id: pending.userId } })
  if (!user?.totpSecret) return { error: 'Error de autenticación. Contacta al administrador.' }

  const valid = authenticator.verify({ token: code, secret: user.totpSecret })
  if (!valid) return { error: 'Código incorrecto. Intenta de nuevo.' }

  await prisma.staffUser.update({
    where: { id: user.id },
    data: { lastAccess: new Date() },
  })

  await deletePendingSession()
  await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role })

  redirect('/staff')
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction() {
  await deleteSession()
  redirect('/login')
}

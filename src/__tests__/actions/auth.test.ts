import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loginAction, resetPasswordAction, requestPasswordResetAction } from '@/app/actions/auth'
import { checkRateLimit, recordFailure, clearRateLimit } from '@/lib/rate-limit'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

vi.mock('@/lib/mailer', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/clinic-config', () => ({
  getClinicConfigFromDB: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/lib/audit', () => ({
  logAction: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/session', () => ({
  createSession: vi.fn().mockResolvedValue(undefined),
  createPendingSession: vi.fn().mockResolvedValue(undefined),
  getPendingSession: vi.fn(),
  deletePendingSession: vi.fn().mockResolvedValue(undefined),
  deleteSession: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ blocked: false }),
  recordFailure: vi.fn(),
  clearRateLimit: vi.fn(),
}))

// bcryptjs — el hash real tarda ~300 ms por operación; mock predecible para tests unitarios
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn().mockResolvedValue('$hashed$nueva_contraseña'),
  },
}))

const mockPrisma = vi.hoisted(() => ({
  staffUser: {
    findUnique: vi.fn(),
    update: vi.fn().mockResolvedValue({ sessionVersion: 1 }),
  },
  passwordResetToken: {
    findUnique: vi.fn(),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    deleteMany: vi.fn().mockResolvedValue({}),
  },
  $transaction: vi.fn().mockResolvedValue([{}, {}]),
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return fd
}

const activeUser = {
  id: 'user-1',
  email: 'doctor@viverosorl.com',
  name: 'Dr. Viveros',
  passwordHash: '$2a$12$hashed',
  role: 'medico',
  activo: true,
  totpEnabled: false,
  totpSecret: null,
  sessionVersion: 0,
}

// ─── loginAction ──────────────────────────────────────────────────────────────

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockReturnValue({ blocked: false })
  })

  it('rechaza cuando faltan campos', async () => {
    const result = await loginAction(null, makeFormData({ email: '', password: '' }))
    expect(result).toMatchObject({ error: expect.any(String) })
  })

  it('rechaza usuario inexistente con error genérico (no revela si el email existe)', async () => {
    mockPrisma.staffUser.findUnique.mockResolvedValue(null)

    const result = await loginAction(
      null,
      makeFormData({ email: 'nadie@example.com', password: 'Cualquiera1!' }),
    )
    expect(result).toMatchObject({ error: 'Credenciales incorrectas.' })
  })

  it('rechaza contraseña incorrecta con el mismo error genérico', async () => {
    mockPrisma.staffUser.findUnique.mockResolvedValue(activeUser)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

    const result = await loginAction(
      null,
      makeFormData({ email: activeUser.email, password: 'wrong' }),
    )
    expect(result).toMatchObject({ error: 'Credenciales incorrectas.' })
  })

  it('registra fallo en rate-limit al equivocarse la contraseña', async () => {
    mockPrisma.staffUser.findUnique.mockResolvedValue(activeUser)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

    await loginAction(null, makeFormData({ email: activeUser.email, password: 'wrong' }))

    expect(vi.mocked(recordFailure)).toHaveBeenCalledWith(`login:${activeUser.email}`)
  })

  it('rechaza inmediatamente cuando la clave está bloqueada por rate-limit', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ blocked: true })

    const result = await loginAction(
      null,
      makeFormData({ email: activeUser.email, password: 'cualquiera' }),
    )
    expect(result).toMatchObject({ error: expect.stringMatching(/intentos/i) })
    expect(mockPrisma.staffUser.findUnique).not.toHaveBeenCalled()
  })

  it('redirige a /login/setup-2fa cuando login es correcto y 2FA no está configurado', async () => {
    mockPrisma.staffUser.findUnique.mockResolvedValue({ ...activeUser, totpEnabled: false })
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

    await loginAction(null, makeFormData({ email: activeUser.email, password: 'Correcto1!' }))

    expect(vi.mocked(redirect)).toHaveBeenCalledWith('/login/setup-2fa')
  })

  it('redirige a /login/verify-2fa cuando login es correcto y 2FA está activo', async () => {
    mockPrisma.staffUser.findUnique.mockResolvedValue({ ...activeUser, totpEnabled: true })
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

    await loginAction(null, makeFormData({ email: activeUser.email, password: 'Correcto1!' }))

    expect(vi.mocked(redirect)).toHaveBeenCalledWith('/login/verify-2fa')
  })

  it('limpia el rate-limit tras login exitoso', async () => {
    mockPrisma.staffUser.findUnique.mockResolvedValue({ ...activeUser, totpEnabled: false })
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

    await loginAction(null, makeFormData({ email: activeUser.email, password: 'Correcto1!' }))

    expect(vi.mocked(clearRateLimit)).toHaveBeenCalledWith(`login:${activeUser.email}`)
  })
})

// ─── resetPasswordAction ──────────────────────────────────────────────────────

describe('resetPasswordAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.$transaction.mockResolvedValue([{}, {}])
  })

  it('rechaza contraseña menor a 8 caracteres', async () => {
    const result = await resetPasswordAction(
      null,
      makeFormData({ token: 'abc', password: 'corta', confirm: 'corta' }),
    )
    expect(result).toMatchObject({ error: expect.stringMatching(/8 caracteres/i) })
  })

  it('rechaza contraseñas que no coinciden', async () => {
    const result = await resetPasswordAction(
      null,
      makeFormData({ token: 'abc', password: 'Contraseña1!', confirm: 'Contraseña2!' }),
    )
    expect(result).toMatchObject({ error: expect.stringMatching(/no coinciden/i) })
  })

  it('rechaza token expirado', async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 'tok-1',
      userId: 'user-1',
      usedAt: null,
      expiresAt: new Date(Date.now() - 1_000), // expirado hace 1 segundo
    })

    const result = await resetPasswordAction(
      null,
      makeFormData({ token: 'tok-real', password: 'NuevaPass1!', confirm: 'NuevaPass1!' }),
    )
    expect(result).toMatchObject({ error: expect.stringMatching(/expirado|utilizado/i) })
  })

  it('rechaza token ya utilizado', async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 'tok-1',
      userId: 'user-1',
      usedAt: new Date(), // ya fue usado
      expiresAt: new Date(Date.now() + 3_600_000),
    })

    const result = await resetPasswordAction(
      null,
      makeFormData({ token: 'tok-real', password: 'NuevaPass1!', confirm: 'NuevaPass1!' }),
    )
    expect(result).toMatchObject({ error: expect.stringMatching(/expirado|utilizado/i) })
  })

  it('rechaza token inexistente', async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue(null)

    const result = await resetPasswordAction(
      null,
      makeFormData({ token: 'falso', password: 'NuevaPass1!', confirm: 'NuevaPass1!' }),
    )
    expect(result).toMatchObject({ error: expect.stringMatching(/expirado|utilizado/i) })
  })

  it('reset válido devuelve ok:true y ejecuta la transacción', async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 'tok-1',
      userId: 'user-1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 3_600_000),
    })

    const result = await resetPasswordAction(
      null,
      makeFormData({ token: 'tok-real', password: 'NuevaPass1!', confirm: 'NuevaPass1!' }),
    )
    expect(result).toMatchObject({ ok: true })
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()
  })

  it('reset válido incrementa sessionVersion en la transacción', async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 'tok-1',
      userId: 'user-1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 3_600_000),
    })

    await resetPasswordAction(
      null,
      makeFormData({ token: 'tok-real', password: 'NuevaPass1!', confirm: 'NuevaPass1!' }),
    )

    expect(mockPrisma.staffUser.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sessionVersion: { increment: 1 } }),
      }),
    )
  })
})

// ─── requestPasswordResetAction ───────────────────────────────────────────────

describe('requestPasswordResetAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockReturnValue({ blocked: false })
  })

  it('siempre devuelve ok:true aunque el email no exista (evita enumeración de usuarios)', async () => {
    mockPrisma.staffUser.findUnique.mockResolvedValue(null)

    const result = await requestPasswordResetAction('noexiste@example.com')
    expect(result).toMatchObject({ ok: true })
  })

  it('crea el token de reset cuando el usuario existe y está activo', async () => {
    mockPrisma.staffUser.findUnique.mockResolvedValue({ ...activeUser, activo: true })

    await requestPasswordResetAction(activeUser.email)
    expect(mockPrisma.passwordResetToken.create).toHaveBeenCalledOnce()
  })

  it('no crea token si el rate-limit está activo (silencioso)', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ blocked: true })

    const result = await requestPasswordResetAction(activeUser.email)
    expect(result).toMatchObject({ ok: true })
    expect(mockPrisma.passwordResetToken.create).not.toHaveBeenCalled()
  })
})

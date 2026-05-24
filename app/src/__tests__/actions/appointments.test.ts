import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  submitAppointmentRequest,
  rescheduleAppointmentByToken,
  cancelAppointmentByToken,
} from '@/app/actions/appointments'
import { verifyTurnstileToken } from '@/lib/turnstile'
import * as configuracion from '@/app/actions/configuracion'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/lib/turnstile', () => ({
  verifyTurnstileToken: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/lib/clinic-config', () => ({
  getClinicConfigFromDB: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/lib/crypto', () => ({
  encrypt: vi.fn((v: string) => `enc(${v})`),
}))

vi.mock('@/lib/mailer', () => ({
  sendAppointmentConfirmationToPatient: vi.fn().mockResolvedValue(undefined),
  sendAppointmentNotificationToDoctor: vi.fn().mockResolvedValue(undefined),
  sendAppointmentReschedule: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/app/actions/configuracion', () => ({
  getPublicBlockedDates: vi.fn().mockResolvedValue([]),
}))

const mockPrisma = {
  clinicConfig: {
    findUnique: vi.fn().mockResolvedValue({ appointmentDurationMin: 30 }),
  },
  appointment: {
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: 'appt-1' }),
    update: vi.fn().mockResolvedValue({}),
  },
  patient: {
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockResolvedValue({ id: 'patient-1' }),
  },
}

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function futureDateStr(daysFromNow = 7): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

function pastDateStr(daysAgo = 2): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

const validPayload = () => ({
  date: futureDateStr(),
  time: '10:00',
  patientName: 'Ana García López',
  phone: '5512345678',
  email: 'ana@example.com',
  reason: 'Dolor de oído hace tres días',
  captchaToken: 'token-valido',
})

// ─── submitAppointmentRequest ─────────────────────────────────────────────────

describe('submitAppointmentRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true)
    vi.mocked(configuracion.getPublicBlockedDates).mockResolvedValue([])
    mockPrisma.clinicConfig.findUnique.mockResolvedValue({ appointmentDurationMin: 30 })
    mockPrisma.appointment.findFirst.mockResolvedValue(null)
    mockPrisma.appointment.create.mockResolvedValue({ id: 'appt-1' })
    mockPrisma.patient.count.mockResolvedValue(0)
    mockPrisma.patient.create.mockResolvedValue({ id: 'patient-1' })
  })

  it('acepta una cita válida en slot libre', async () => {
    const result = await submitAppointmentRequest(validPayload())
    expect(result.ok).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('rechaza captcha inválido', async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false)

    const result = await submitAppointmentRequest(validPayload())
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/verificación/i)
  })

  it('rechaza fecha en el pasado', async () => {
    const result = await submitAppointmentRequest({
      ...validPayload(),
      date: pastDateStr(),
      time: '09:00',
    })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/pasado/i)
  })

  it('rechaza fecha en día bloqueado', async () => {
    const fecha = futureDateStr()
    vi.mocked(configuracion.getPublicBlockedDates).mockResolvedValue([fecha])

    const result = await submitAppointmentRequest({ ...validPayload(), date: fecha })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/disponibilidad/i)
  })

  it('rechaza slot ocupado (solapamiento)', async () => {
    mockPrisma.appointment.findFirst.mockResolvedValue({ id: 'appt-existente' })

    const result = await submitAppointmentRequest(validPayload())
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/horario/i)
  })

  it('rechaza datos inválidos (email malformado)', async () => {
    const result = await submitAppointmentRequest({
      ...validPayload(),
      email: 'no-es-un-email',
    })
    expect(result.ok).toBe(false)
  })

  it('crea la cita cuando el slot está libre', async () => {
    await submitAppointmentRequest(validPayload())
    expect(mockPrisma.appointment.create).toHaveBeenCalledOnce()
  })
})

// ─── cancelAppointmentByToken ─────────────────────────────────────────────────

describe('cancelAppointmentByToken', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rechaza token vacío', async () => {
    const result = await cancelAppointmentByToken('')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/token/i)
  })

  it('rechaza token inexistente', async () => {
    mockPrisma.appointment.findUnique.mockResolvedValue(null)

    const result = await cancelAppointmentByToken('token-falso')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/inválido/i)
  })

  it('cancela una cita pendiente', async () => {
    mockPrisma.appointment.findUnique.mockResolvedValue({
      id: 'appt-1',
      status: 'pendiente',
      actionToken: 'token-valido',
    })

    const result = await cancelAppointmentByToken('token-valido')
    expect(result.ok).toBe(true)
    expect(mockPrisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'cancelada' } }),
    )
  })

  it('devuelve ok:true si la cita ya estaba cancelada (idempotente)', async () => {
    mockPrisma.appointment.findUnique.mockResolvedValue({
      id: 'appt-1',
      status: 'cancelada',
      actionToken: 'token-valido',
    })

    const result = await cancelAppointmentByToken('token-valido')
    expect(result.ok).toBe(true)
    expect(mockPrisma.appointment.update).not.toHaveBeenCalled()
  })
})

// ─── rescheduleAppointmentByToken ─────────────────────────────────────────────

describe('rescheduleAppointmentByToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(configuracion.getPublicBlockedDates).mockResolvedValue([])
    mockPrisma.clinicConfig.findUnique.mockResolvedValue({ appointmentDurationMin: 30 })
    mockPrisma.appointment.findFirst.mockResolvedValue(null)
    mockPrisma.appointment.update.mockResolvedValue({})
  })

  it('rechaza token inválido', async () => {
    mockPrisma.appointment.findUnique.mockResolvedValue(null)

    const result = await rescheduleAppointmentByToken('token-falso', futureDateStr(), '11:00')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/inválido/i)
  })

  it('rechaza formato de fecha incorrecto', async () => {
    const result = await rescheduleAppointmentByToken('token', '01-01-2027', '10:00')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/fecha/i)
  })

  it('rechaza reagendamiento de cita cancelada', async () => {
    mockPrisma.appointment.findUnique.mockResolvedValue({
      id: 'appt-1',
      status: 'cancelada',
      actionToken: 'token',
    })

    const result = await rescheduleAppointmentByToken('token', futureDateStr(), '10:00')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/cancelada/i)
  })

  it('rechaza nuevo horario con solapamiento', async () => {
    mockPrisma.appointment.findUnique.mockResolvedValue({
      id: 'appt-1',
      status: 'pendiente',
      actionToken: 'token',
      patientEmail: 'ana@example.com',
      patientName: 'Ana García',
      appointmentType: 'primera_vez',
    })
    mockPrisma.appointment.findFirst.mockResolvedValue({ id: 'appt-otro' })

    const result = await rescheduleAppointmentByToken('token', futureDateStr(), '10:00')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/horario/i)
  })

  it('acepta reagendamiento válido en slot libre', async () => {
    mockPrisma.appointment.findUnique.mockResolvedValue({
      id: 'appt-1',
      status: 'pendiente',
      actionToken: 'token',
      patientEmail: 'ana@example.com',
      patientName: 'Ana García',
      appointmentType: 'primera_vez',
    })

    const result = await rescheduleAppointmentByToken('token', futureDateStr(14), '11:00')
    expect(result.ok).toBe(true)
    expect(mockPrisma.appointment.update).toHaveBeenCalledOnce()
  })
})

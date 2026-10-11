import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  normalizeEmail,
  normalizePhone,
  emailsMatch,
  phonesMatch,
  findExistingPatient,
} from '@/lib/patient-matching'

const mockPrisma = vi.hoisted(() => ({
  patient: {
    findMany: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

vi.mock('@/lib/crypto', () => ({
  decrypt: vi.fn((val: string) => {
    if (val.startsWith('enc(') && val.endsWith(')')) {
      return val.slice(4, -1)
    }
    return val
  }),
}))

describe('patient-matching helper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('normalizeEmail', () => {
    it('normaliza a minúsculas y remueve espacios', () => {
      expect(normalizeEmail('  Paciente.Test@GMAIL.com  ')).toBe('paciente.test@gmail.com')
    })

    it('devuelve null si está vacío o undefined', () => {
      expect(normalizeEmail('')).toBeNull()
      expect(normalizeEmail('   ')).toBeNull()
      expect(normalizeEmail(null)).toBeNull()
      expect(normalizeEmail(undefined)).toBeNull()
    })
  })

  describe('normalizePhone', () => {
    it('remueve caracteres no numéricos y obtiene 10 dígitos nacionales', () => {
      expect(normalizePhone('55 1234 5678')).toBe('5512345678')
      expect(normalizePhone('+52 55 1234 5678')).toBe('5512345678')
      expect(normalizePhone('(55)-1234-5678')).toBe('5512345678')
    })

    it('devuelve null si el teléfono tiene menos de 7 dígitos', () => {
      expect(normalizePhone('12345')).toBeNull()
      expect(normalizePhone('')).toBeNull()
      expect(normalizePhone(null)).toBeNull()
    })
  })

  describe('emailsMatch & phonesMatch', () => {
    it('compara correos ignorando mayúsculas y espacios', () => {
      expect(emailsMatch('Juan@example.com', 'juan@example.com')).toBe(true)
      expect(emailsMatch('Juan@example.com', 'otro@example.com')).toBe(false)
      expect(emailsMatch('', 'juan@example.com')).toBe(false)
    })

    it('compara teléfonos en distintos formatos', () => {
      expect(phonesMatch('+52 55 1234 5678', '5512345678')).toBe(true)
      expect(phonesMatch('55-1234-5678', '55 1234 5678')).toBe(true)
      expect(phonesMatch('5511112222', '5599998888')).toBe(false)
    })
  })

  describe('findExistingPatient', () => {
    it('devuelve null si no se proporciona correo ni celular', async () => {
      const result = await findExistingPatient({})
      expect(result).toBeNull()
      expect(mockPrisma.patient.findMany).not.toHaveBeenCalled()
    })

    it('encuentra paciente por correo descifrado', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([
        {
          id: 'patient-1',
          expedienteNumber: 'VIV-2026-0001',
          nombre: 'María',
          apellidoPaterno: 'López',
          apellidoMaterno: null,
          email: 'enc(maria@gmail.com)',
          telefono: 'enc(5500000000)',
          status: 'activo',
        },
      ])

      const result = await findExistingPatient({ email: 'MARIA@GMAIL.COM' })
      expect(result).not.toBeNull()
      expect(result?.patient.id).toBe('patient-1')
      expect(result?.matchedBy).toBe('email')
    })

    it('encuentra paciente por teléfono descifrado en formato distinto', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([
        {
          id: 'patient-2',
          expedienteNumber: 'VIV-2026-0002',
          nombre: 'Carlos',
          apellidoPaterno: 'Ruiz',
          apellidoMaterno: null,
          email: null,
          telefono: 'enc(5512345678)',
          status: 'activo',
        },
      ])

      const result = await findExistingPatient({ phone: '+52 (55) 1234-5678' })
      expect(result).not.toBeNull()
      expect(result?.patient.id).toBe('patient-2')
      expect(result?.matchedBy).toBe('phone')
    })

    it('reconoce cuando coinciden tanto correo como teléfono', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([
        {
          id: 'patient-3',
          expedienteNumber: 'VIV-2026-0003',
          nombre: 'Ana',
          apellidoPaterno: 'Gómez',
          apellidoMaterno: null,
          email: 'enc(ana@example.com)',
          telefono: 'enc(5588889999)',
          status: 'activo',
        },
      ])

      const result = await findExistingPatient({ email: 'ana@example.com', phone: '5588889999' })
      expect(result?.matchedBy).toBe('both')
      expect(result?.patient.id).toBe('patient-3')
    })

    it('excluye el id del paciente actual si excludePatientId se proporciona', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([])

      const result = await findExistingPatient({
        email: 'test@example.com',
        excludePatientId: 'current-patient-id',
      })

      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: 'current-patient-id' },
          }),
        }),
      )
      expect(result).toBeNull()
    })
  })
})

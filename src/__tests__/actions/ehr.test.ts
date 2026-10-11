import { describe, it, expect, vi, beforeEach } from 'vitest'
import { savePatient } from '@/app/actions/ehr'

vi.mock('@/lib/dal', () => ({
  verifySession: vi.fn().mockResolvedValue({ userId: 'doctor-1', rol: 'medico' }),
  requireMedico: vi.fn().mockResolvedValue({ userId: 'doctor-1', rol: 'medico' }),
}))

vi.mock('@/lib/audit', () => ({
  logAction: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/crypto', () => ({
  encrypt: vi.fn((v: string) => `enc(${v})`),
  decrypt: vi.fn((v: string) => (v.startsWith('enc(') && v.endsWith(')') ? v.slice(4, -1) : v)),
}))

const mockPrisma = vi.hoisted(() => ({
  patient: {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn(),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const basePatientData = () => ({
  generalData: {
    nombre: 'Carlos',
    apellidoPaterno: 'Mendoza',
    apellidoMaterno: 'Pérez',
    fullName: 'Carlos Mendoza Pérez',
    birthDate: '1990-05-15',
    sex: 'masculino' as const,
    curp: '',
    phone: '5511223344',
    email: 'carlos@example.com',
    address: 'Av Insurgentes 123',
  },
  familyHistory: {
    notes: '',
    relevantConditions: [],
  },
  personalHistory: {
    pathological: '',
    nonPathological: '',
    allergies: [],
    currentMedications: [],
  },
  nom024Data: {
    paisNacimiento: 142,
    entidadNacimiento: '09',
    sexoCurp: 1,
    sexoBiologico: 1,
    genero: 1,
    derechohabiencia: null,
    seConsideraIndigena: 0,
    seAutodenominaAfromexicano: 0,
    migrante: 0,
    paisProcedencia: null,
  },
})

describe('savePatient - Detección y prevención de duplicados', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.patient.count.mockResolvedValue(5)
    mockPrisma.patient.findMany.mockResolvedValue([])
    mockPrisma.patient.create.mockImplementation(({ data }) =>
      Promise.resolve({
        id: 'patient-new-1',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    )
    mockPrisma.patient.update.mockImplementation(({ where, data }) =>
      Promise.resolve({
        id: where.id,
        expedienteNumber: 'VIV-2026-0001',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    )
  })

  it('permite crear un expediente nuevo si no existe conflicto de correo ni celular', async () => {
    const result = await savePatient(basePatientData())
    expect(result).toBeDefined()
    expect(result.id).toBe('patient-new-1')
    expect(mockPrisma.patient.create).toHaveBeenCalledOnce()
  })

  it('rechaza la creación de un nuevo expediente si ya existe uno activo con el mismo correo', async () => {
    mockPrisma.patient.findMany.mockResolvedValue([
      {
        id: 'patient-existente',
        expedienteNumber: 'VIV-2026-0001',
        nombre: 'Carlos',
        apellidoPaterno: 'Mendoza',
        apellidoMaterno: null,
        email: 'enc(carlos@example.com)',
        telefono: 'enc(5599999999)',
        status: 'activo',
      },
    ])

    await expect(savePatient(basePatientData())).rejects.toThrow(
      /Ya existe un expediente activo con este correo electrónico \(VIV-2026-0001\)/,
    )
    expect(mockPrisma.patient.create).not.toHaveBeenCalled()
  })

  it('rechaza la creación de un nuevo expediente si ya existe uno activo con el mismo celular', async () => {
    mockPrisma.patient.findMany.mockResolvedValue([
      {
        id: 'patient-existente',
        expedienteNumber: 'VIV-2026-0002',
        nombre: 'Otro',
        apellidoPaterno: 'Paciente',
        apellidoMaterno: null,
        email: 'enc(otro@example.com)',
        telefono: 'enc(5511223344)',
        status: 'activo',
      },
    ])

    await expect(
      savePatient({
        ...basePatientData(),
        generalData: {
          ...basePatientData().generalData,
          email: 'diferente@example.com',
          phone: '+52 55 1122 3344',
        },
      }),
    ).rejects.toThrow(
      /Ya existe un expediente activo con este teléfono celular \(VIV-2026-0002\)/,
    )
    expect(mockPrisma.patient.create).not.toHaveBeenCalled()
  })

  it('permite actualizar un expediente existente manteniendo sus mismos datos (no colisiona consigo mismo)', async () => {
    mockPrisma.patient.findMany.mockResolvedValue([])

    const result = await savePatient(basePatientData(), 'patient-123')
    expect(result).toBeDefined()
    expect(mockPrisma.patient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'patient-123' },
      }),
    )
  })

  it('rechaza la actualización de un expediente si el nuevo correo pertenece a otro paciente', async () => {
    mockPrisma.patient.findMany.mockResolvedValue([
      {
        id: 'patient-456',
        expedienteNumber: 'VIV-2026-0099',
        nombre: 'Pedro',
        apellidoPaterno: 'Sánchez',
        apellidoMaterno: null,
        email: 'enc(carlos@example.com)',
        telefono: null,
        status: 'activo',
      },
    ])

    await expect(savePatient(basePatientData(), 'patient-123')).rejects.toThrow(
      /Ya existe un expediente activo con este correo electrónico \(VIV-2026-0099\)/,
    )
    expect(mockPrisma.patient.update).not.toHaveBeenCalled()
  })
})

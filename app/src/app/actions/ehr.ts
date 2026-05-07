'use server'

import { prisma } from '@/lib/prisma'
import { verifySession, requireMedico } from '@/lib/dal'
import { encrypt, decrypt } from '@/lib/crypto'
import { logAction } from '@/lib/audit'
import type {
  Patient, PatientSex, FamilyHistory, PersonalHistory,
} from '@/lib/ehr-types'

const EMPTY_FAMILY: FamilyHistory = { notes: '', relevantConditions: [] }
const EMPTY_PERSONAL: Omit<PersonalHistory, 'allergies'> = { pathological: '', nonPathological: '', currentMedications: [] }

function encryptPatient(p: {
  curp?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  contactoEmergencia?: string | null
  telefonoEmergencia?: string | null
}) {
  return {
    curp: p.curp ? encrypt(p.curp) : null,
    telefono: p.telefono ? encrypt(p.telefono) : null,
    email: p.email ? encrypt(p.email) : null,
    direccion: p.direccion ? encrypt(p.direccion) : null,
    contactoEmergencia: p.contactoEmergencia ? encrypt(p.contactoEmergencia) : null,
    telefonoEmergencia: p.telefonoEmergencia ? encrypt(p.telefonoEmergencia) : null,
  }
}

function decryptPatient<T extends {
  curp: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  contactoEmergencia: string | null
  telefonoEmergencia: string | null
}>(p: T): T {
  return {
    ...p,
    curp: p.curp ? decrypt(p.curp) : null,
    telefono: p.telefono ? decrypt(p.telefono) : null,
    email: p.email ? decrypt(p.email) : null,
    direccion: p.direccion ? decrypt(p.direccion) : null,
    contactoEmergencia: p.contactoEmergencia ? decrypt(p.contactoEmergencia) : null,
    telefonoEmergencia: p.telefonoEmergencia ? decrypt(p.telefonoEmergencia) : null,
  }
}

function mapToFrontend(p: {
  id: string
  expedienteNumber: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string | null
  curp: string | null
  fechaNacimiento: Date
  sexo: string
  telefono: string | null
  email: string | null
  direccion: string | null
  alergias: string[]
  antecedentesHeredoFamiliares: string | null
  antecedentesPersonalesPatologicos: string | null
  antecedentesPersonalesNoPatologicos: string | null
  createdAt: Date
  updatedAt: Date
}): Patient {
  const decrypted = decryptPatient({
    curp: p.curp,
    telefono: p.telefono,
    email: p.email,
    direccion: p.direccion,
    contactoEmergencia: null,
    telefonoEmergencia: null,
  })

  const fullName = [p.nombre, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ')

  return {
    id: p.id,
    expedienteNumber: p.expedienteNumber,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    generalData: {
      nombre: p.nombre,
      apellidoPaterno: p.apellidoPaterno,
      apellidoMaterno: p.apellidoMaterno ?? '',
      fullName,
      birthDate: p.fechaNacimiento.toISOString().split('T')[0],
      sex: p.sexo as PatientSex,
      curp: decrypted.curp ?? '',
      phone: decrypted.telefono ?? '',
      email: decrypted.email ?? '',
      address: decrypted.direccion ?? '',
    },
    familyHistory: {
      notes: p.antecedentesHeredoFamiliares ?? '',
      relevantConditions: [],
    } satisfies FamilyHistory,
    personalHistory: {
      pathological: p.antecedentesPersonalesPatologicos ?? '',
      nonPathological: p.antecedentesPersonalesNoPatologicos ?? '',
      allergies: p.alergias,
      currentMedications: [],
    } satisfies PersonalHistory,
  }
}

export interface PatientSearchFilters {
  query?: string
  sexo?: string
  fechaDesde?: string
  fechaHasta?: string
}

export async function getPatients(): Promise<Patient[]> {
  const session = await verifySession()
  const rows = await prisma.patient.findMany({ where: { status: 'activo' }, orderBy: { createdAt: 'desc' } })
  void logAction({ action: 'acceso', resource: 'patients', userId: session.userId })
  return rows.map(mapToFrontend)
}

export async function getPatient(id: string): Promise<Patient | null> {
  const session = await verifySession()
  const row = await prisma.patient.findUnique({ where: { id } })
  if (!row) return null
  void logAction({ action: 'vista', resource: 'patient', resourceId: id, userId: session.userId })
  return mapToFrontend(row)
}

export async function searchPatientsAdvanced(filters: PatientSearchFilters): Promise<Patient[]> {
  await verifySession()

  const rows = await prisma.patient.findMany({
    where: {
      AND: [
        { status: 'activo' },
        filters.query?.trim() ? {
          OR: [
            { nombre: { contains: filters.query.trim(), mode: 'insensitive' } },
            { apellidoPaterno: { contains: filters.query.trim(), mode: 'insensitive' } },
            { expedienteNumber: { contains: filters.query.trim(), mode: 'insensitive' } },
          ],
        } : {},
        filters.sexo ? { sexo: filters.sexo } : {},
        filters.fechaDesde ? { createdAt: { gte: new Date(filters.fechaDesde) } } : {},
        filters.fechaHasta ? { createdAt: { lte: new Date(filters.fechaHasta) } } : {},
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return rows.map(mapToFrontend)
}

export async function savePatient(
  data: Omit<Patient, 'id' | 'expedienteNumber' | 'createdAt' | 'updatedAt'>,
  id?: string,
): Promise<Patient> {
  const session = await requireMedico()

  const nombre = data.generalData.nombre.trim()
  const apellidoPaterno = data.generalData.apellidoPaterno.trim()
  const apellidoMaterno = data.generalData.apellidoMaterno.trim() || null

  const encrypted = encryptPatient({
    curp: data.generalData.curp || null,
    telefono: data.generalData.phone || null,
    email: data.generalData.email || null,
    direccion: data.generalData.address || null,
    contactoEmergencia: null,
    telefonoEmergencia: null,
  })

  const fields = {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    fechaNacimiento: new Date(data.generalData.birthDate),
    sexo: data.generalData.sex,
    curp: encrypted.curp,
    telefono: encrypted.telefono,
    email: encrypted.email,
    direccion: encrypted.direccion,
    alergias: data.personalHistory.allergies,
    antecedentesHeredoFamiliares: data.familyHistory.notes || null,
    antecedentesPersonalesPatologicos: data.personalHistory.pathological || null,
    antecedentesPersonalesNoPatologicos: data.personalHistory.nonPathological || null,
  }

  if (id) {
    const updated = await prisma.patient.update({ where: { id }, data: fields })
    void logAction({ action: 'modificacion', resource: 'patient', resourceId: id, userId: session.userId })
    return mapToFrontend(updated)
  }

  const year = new Date().getFullYear()
  const count = await prisma.patient.count()
  const expedienteNumber = `VIV-${year}-${String(count + 1).padStart(4, '0')}`

  const created = await prisma.patient.create({ data: { expedienteNumber, ...fields } })
  void logAction({ action: 'creacion', resource: 'patient', resourceId: created.id, userId: session.userId })
  return mapToFrontend(created)
}

export async function deletePatient(id: string): Promise<void> {
  const session = await requireMedico()
  // Borrado lógico — NOM-004 exige retención mínima de 5 años
  await prisma.patient.update({ where: { id }, data: { status: 'inactivo' } })
  void logAction({ action: 'eliminacion', resource: 'patient', resourceId: id, userId: session.userId })
}

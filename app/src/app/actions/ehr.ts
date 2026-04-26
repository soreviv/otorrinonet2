'use server'

import { prisma } from '@/lib/prisma'
import type {
  Patient, PatientSex, FamilyHistory, PersonalHistory,
  CurrentCondition, PhysicalExam, Diagnosis,
} from '@/lib/ehr-types'

const EMPTY_FAMILY: FamilyHistory = { notes: '', relevantConditions: [] }
const EMPTY_PERSONAL: PersonalHistory = { pathological: '', allergies: [], currentMedications: [], nonPathological: '' }
const EMPTY_CONDITION: CurrentCondition = { chiefComplaint: '', onset: '', description: '', evolution: '' }
const EMPTY_EXAM: PhysicalExam = {
  vitalSigns: { bloodPressure: '', heartRate: '', temperature: '', weight: '', height: '', bmi: '' },
  ears: '', noseAndSinuses: '', pharynxAndNeck: '',
}

function mapToFrontend(p: {
  id: string
  expedienteNumber: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: string
  curp: string | null
  phone: string | null
  email: string | null
  address: string | null
  allergies: string[]
  familyHistoryJson: unknown
  personalHistoryJson: unknown
  currentConditionJson: unknown
  physicalExamJson: unknown
  diagnosesJson: unknown
  createdAt: Date
  updatedAt: Date
}): Patient {
  const familyHistory = (p.familyHistoryJson as FamilyHistory | null) ?? EMPTY_FAMILY
  const personalHistoryStored = (p.personalHistoryJson as Omit<PersonalHistory, 'allergies'> | null)
  const personalHistory: PersonalHistory = {
    pathological: personalHistoryStored?.pathological ?? '',
    nonPathological: personalHistoryStored?.nonPathological ?? '',
    currentMedications: personalHistoryStored?.currentMedications ?? [],
    allergies: p.allergies,
  }
  const currentCondition = (p.currentConditionJson as CurrentCondition | null) ?? EMPTY_CONDITION
  const physicalExam = (p.physicalExamJson as PhysicalExam | null) ?? EMPTY_EXAM
  const diagnoses = Array.isArray(p.diagnosesJson) ? (p.diagnosesJson as Diagnosis[]) : []

  return {
    id: p.id,
    expedienteNumber: p.expedienteNumber,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    generalData: {
      fullName: `${p.firstName} ${p.lastName}`,
      birthDate: p.dateOfBirth.toISOString().split('T')[0],
      sex: p.gender as PatientSex,
      curp: p.curp ?? '',
      phone: p.phone ?? '',
      email: p.email ?? '',
      address: p.address ?? '',
    },
    familyHistory,
    personalHistory,
    currentCondition,
    physicalExam,
    diagnoses,
  }
}

export async function getPatients(): Promise<Patient[]> {
  const patients = await prisma.patient.findMany({ orderBy: { createdAt: 'desc' } })
  return patients.map(mapToFrontend)
}

export async function savePatient(
  data: Omit<Patient, 'id' | 'expedienteNumber' | 'createdAt' | 'updatedAt'>,
  id?: string,
): Promise<Patient> {
  const nameParts = data.generalData.fullName.trim().split(/\s+/)
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || '-'

  const { allergies, currentMedications, pathological, nonPathological } = data.personalHistory

  const fields = {
    firstName,
    lastName,
    dateOfBirth: new Date(data.generalData.birthDate),
    gender: data.generalData.sex,
    curp: data.generalData.curp || null,
    phone: data.generalData.phone || null,
    email: data.generalData.email || null,
    address: data.generalData.address || null,
    allergies,
    familyHistoryJson: data.familyHistory as any,
    personalHistoryJson: { pathological, nonPathological, currentMedications } as any,
    currentConditionJson: data.currentCondition as any,
    physicalExamJson: data.physicalExam as any,
    diagnosesJson: data.diagnoses as any,
  }

  if (id) {
    const updated = await prisma.patient.update({ where: { id }, data: fields })
    return mapToFrontend(updated)
  }

  const year = new Date().getFullYear()
  const count = await prisma.patient.count()
  const expedienteNumber = `VIV-${year}-${String(count + 1).padStart(3, '0')}`

  const created = await prisma.patient.create({ data: { expedienteNumber, ...fields } })
  return mapToFrontend(created)
}

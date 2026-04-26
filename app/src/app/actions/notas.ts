'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { CLINIC_CONFIG } from '@/lib/clinic-config'
import type { EvolutionNote, SurgicalNote, Prescription, ConsentForm } from '@/lib/notas-types'

// ─── Map helpers ─────────────────────────────────────────────────────────────

function mapEvolution(n: {
  id: string; patientId: string; subjective: string; objective: string;
  assessment: string; plan: string; createdAt: Date
}, patientName: string, authorName: string): EvolutionNote {
  return {
    id: n.id,
    patientId: n.patientId,
    patientName,
    date: n.createdAt.toISOString().split('T')[0],
    time: n.createdAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' }),
    consultationReason: n.subjective,
    findings: n.objective,
    updatedDiagnosis: n.assessment,
    plan: n.plan,
    authorName,
    createdAt: n.createdAt.toISOString(),
  }
}

function mapSurgical(n: {
  id: string; patientId: string; type: string; procedure: string;
  findings: string | null; instructions: string | null; createdAt: Date
}, patientName: string, authorName: string): SurgicalNote {
  return {
    id: n.id,
    patientId: n.patientId,
    patientName,
    type: (n.type === 'preoperatoria' || n.type === 'postoperatoria' ? n.type : 'preoperatoria') as SurgicalNote['type'],
    procedure: n.procedure,
    scheduledDate: n.createdAt.toISOString().split('T')[0],
    anesthesia: '',
    instructions: n.instructions ?? '',
    observations: n.findings ?? '',
    authorName,
    createdAt: n.createdAt.toISOString(),
  }
}

function mapPrescription(p: {
  id: string; patientId: string; medications: unknown; signedAt: Date | null; createdAt: Date
}, patientName: string): Prescription {
  return {
    id: p.id,
    patientId: p.patientId,
    patientName,
    date: p.createdAt.toISOString().split('T')[0],
    status: p.signedAt ? 'firmada' : 'borrador',
    medications: Array.isArray(p.medications) ? (p.medications as any[]) : [],
    ...CLINIC_CONFIG,
    signatureData: null,
    signedAt: p.signedAt?.toISOString() ?? null,
    signatureTimestamp: p.signedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }
}

function mapConsent(c: {
  id: string; patientId: string; type: string; content: string;
  patientSignedAt: Date | null; createdAt: Date
}, patientName: string, authorName: string): ConsentForm {
  return {
    id: c.id,
    patientId: c.patientId,
    patientName,
    procedure: c.type,
    consentText: c.content,
    status: c.patientSignedAt ? 'firmado-presencial' : 'pendiente',
    patientSignatureData: null,
    signedAt: c.patientSignedAt?.toISOString() ?? null,
    signatureMethod: c.patientSignedAt ? 'presencial' : null,
    emailSentAt: null,
    authorName,
    createdAt: c.createdAt.toISOString(),
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getNotasData(patientId: string) {
  const session = await verifySession()
  const [patient, evolutionNotes, surgicalNotes, prescriptions, consentForms] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.evolutionNote.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } }),
    prisma.surgicalNote.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } }),
    prisma.prescription.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } }),
    prisma.consentForm.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } }),
  ])

  if (!patient) return null

  const patientName = `${patient.firstName} ${patient.lastName}`

  return {
    patient: { id: patient.id, name: patientName, expedienteNumber: patient.expedienteNumber },
    evolutionNotes: evolutionNotes.map(n => mapEvolution(n, patientName, session.name)),
    surgicalNotes: surgicalNotes.map(n => mapSurgical(n, patientName, session.name)),
    prescriptions: prescriptions.map(p => mapPrescription(p, patientName)),
    consentForms: consentForms.map(c => mapConsent(c, patientName, session.name)),
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createEvolutionNote(
  patientId: string,
  data: {
    subjective: string
    objective: string
    assessment: string
    plan: string
    diagnosticos?: { codigo: string; descripcion: string }[]
    vitals?: {
      presionSistolica?: number
      presionDiastolica?: number
      frecuenciaCardiaca?: number
      temperatura?: number
      saturacionOxigeno?: number
      peso?: number
      talla?: number
    }
  },
): Promise<EvolutionNote> {
  const session = await verifySession()

  const diagnosisCodes = (data.diagnosticos ?? []).map(d => d.codigo)
  const diagnosisText = (data.diagnosticos ?? []).map(d => `${d.codigo} ${d.descripcion}`).join('; ')

  const [patient, note] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId }, select: { firstName: true, lastName: true } }),
    prisma.evolutionNote.create({
      data: {
        patientId,
        subjective: data.subjective,
        objective: data.objective,
        assessment: data.assessment || diagnosisText,
        plan: data.plan,
        diagnosis: diagnosisCodes,
        signedById: session.userId,
      },
    }),
  ])

  // Save vitals if any value is present
  const v = data.vitals
  if (v && Object.values(v).some(x => x != null && x !== undefined)) {
    await prisma.vitals.create({
      data: {
        patientId,
        presionSistolica: v.presionSistolica ?? null,
        presionDiastolica: v.presionDiastolica ?? null,
        frecuenciaCardiaca: v.frecuenciaCardiaca ?? null,
        temperatura: v.temperatura ?? null,
        saturacionOxigeno: v.saturacionOxigeno ?? null,
        peso: v.peso ?? null,
        talla: v.talla ?? null,
        recordedById: session.userId,
      },
    })
  }

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : ''
  return mapEvolution(note, patientName, session.name)
}

export async function createSurgicalNote(
  patientId: string,
  data: { type: string; procedure: string; findings?: string; instructions?: string },
): Promise<SurgicalNote> {
  const session = await verifySession()
  const [patient, note] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId }, select: { firstName: true, lastName: true } }),
    prisma.surgicalNote.create({
      data: { patientId, ...data, signedById: session.userId },
    }),
  ])
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : ''
  return mapSurgical(note, patientName, session.name)
}

export async function createPrescription(
  patientId: string,
  medications: import('@/lib/notas-types').PrescriptionMedication[],
  diagnosis: string,
): Promise<Prescription> {
  await verifySession()
  const [patient, rx] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId }, select: { firstName: true, lastName: true } }),
    prisma.prescription.create({
      data: { patientId, medications: medications as any, diagnosis, notes: null },
    }),
  ])
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : ''
  return mapPrescription(rx, patientName)
}

export async function createConsentForm(
  patientId: string,
  data: { type: string; content: string },
): Promise<ConsentForm> {
  const session = await verifySession()
  const [patient, form] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId }, select: { firstName: true, lastName: true } }),
    prisma.consentForm.create({ data: { patientId, ...data } }),
  ])
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : ''
  return mapConsent(form, patientName, session.name)
}

// ─── Sign ─────────────────────────────────────────────────────────────────────

export async function signPrescriptionInDB(id: string): Promise<void> {
  await verifySession()
  await prisma.prescription.update({ where: { id }, data: { signedAt: new Date() } })
}

export async function signConsentInDB(id: string): Promise<void> {
  await verifySession()
  await prisma.consentForm.update({ where: { id }, data: { patientSignedAt: new Date() } })
}

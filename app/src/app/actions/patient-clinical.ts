'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { CLINIC_CONFIG } from '@/lib/clinic-config'
import type { EvolutionNote, Prescription } from '@/lib/notas-types'

export interface VitalsRecord {
  id: string
  presionSistolica: number | null
  presionDiastolica: number | null
  frecuenciaCardiaca: number | null
  temperatura: number | null
  saturacionOxigeno: number | null
  peso: number | null
  talla: number | null
  glucosa: number | null
  createdAt: string
}

export async function getPatientVitals(patientId: string): Promise<VitalsRecord[]> {
  await verifySession()
  const records = await prisma.vitals.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return records.map(v => ({
    id: v.id,
    presionSistolica: v.presionSistolica,
    presionDiastolica: v.presionDiastolica,
    frecuenciaCardiaca: v.frecuenciaCardiaca,
    temperatura: v.temperatura,
    saturacionOxigeno: v.saturacionOxigeno,
    peso: v.peso,
    talla: v.talla,
    glucosa: v.glucosa,
    createdAt: v.createdAt.toISOString(),
  }))
}

export async function getPatientEvolutionNotes(patientId: string): Promise<EvolutionNote[]> {
  const session = await verifySession()
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { firstName: true, lastName: true },
  })
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : ''

  const notes = await prisma.evolutionNote.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  })

  return notes.map(n => ({
    id: n.id,
    patientId: n.patientId,
    patientName,
    date: n.createdAt.toISOString().split('T')[0],
    time: n.createdAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' }),
    consultationReason: n.subjective,
    findings: n.objective,
    updatedDiagnosis: n.assessment,
    plan: n.plan,
    authorName: session.name,
    createdAt: n.createdAt.toISOString(),
  }))
}

export async function getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
  await verifySession()
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { firstName: true, lastName: true },
  })
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : ''

  const rxs = await prisma.prescription.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  })

  return rxs.map(p => ({
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
  }))
}

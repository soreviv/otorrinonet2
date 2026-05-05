'use server'

import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import type { EvolutionNote, Prescription, PrescriptionMedication } from '@/lib/notas-types'

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

function patientFullName(p: { nombre: string; apellidoPaterno: string; apellidoMaterno: string | null }): string {
  return [p.nombre, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ')
}

export async function getPatientVitals(patientId: string): Promise<VitalsRecord[]> {
  await verifySession()
  const records = await prisma.vitals.findMany({
    where: { patientId },
    orderBy: { fecha: 'desc' },
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
    select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
  })
  const pName = patient ? patientFullName(patient) : ''

  const notes = await prisma.medicalNote.findMany({
    where: { patientId, tipo: 'nota_evolucion' },
    orderBy: { fecha: 'desc' },
    include: {
      medico: { select: { name: true } },
      addendums: { orderBy: { fecha: 'asc' } },
      diagnoses: {
        include: { cie10: { select: { descripcion: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  // Resolver autores de adendums
  const authorIds = Array.from(new Set(
    notes.flatMap(n => n.addendums.map(a => a.authorId).filter((x): x is string => !!x)),
  ))
  const authors = authorIds.length
    ? await prisma.staffUser.findMany({ where: { id: { in: authorIds } }, select: { id: true, name: true } })
    : []
  const nameById = new Map(authors.map(u => [u.id, u.name]))

  return notes.map(n => ({
    id: n.id,
    patientId: n.patientId,
    patientName: pName,
    date: n.fecha.toISOString().split('T')[0],
    time: n.fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' }),
    consultationReason: n.motivoConsulta ?? n.subjetivo ?? '',
    findings: n.objetivo ?? '',
    updatedDiagnosis: n.analisis ?? '',
    plan: n.plan ?? '',
    diagnosticos: n.diagnoses.map(d => ({
      codigo: d.cie10Codigo,
      descripcion: d.cie10.descripcion,
      tipo: d.tipoDiagnostico,
    })),
    authorName: n.medico?.name ?? session.name,
    authorId: n.medicoId,
    signed: n.firmada,
    signedAt: n.fechaFirma?.toISOString() ?? null,
    firmaHash: n.firmaHash ?? null,
    firmaUserId: n.firmaUserId,
    addendums: n.addendums.map(a => ({
      id: a.id,
      contenido: a.contenido,
      authorName: nameById.get(a.authorId ?? '') ?? 'Sistema',
      fecha: a.fecha.toISOString(),
      firmaHash: a.firmaHash,
    })),
    createdAt: n.fecha.toISOString(),
  }))
}

export async function getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
  await verifySession()
  const [patient, rows, clinicCfg] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: patientId },
      select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
    }),
    prisma.prescription.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } }),
    getClinicConfigFromDB(),
  ])
  const pName = patient ? patientFullName(patient) : ''

  // Agrupar por recetaId
  const recetaMap = new Map<string, typeof rows>()
  for (const row of rows) {
    if (!recetaMap.has(row.recetaId)) recetaMap.set(row.recetaId, [])
    recetaMap.get(row.recetaId)!.push(row)
  }

  return Array.from(recetaMap.values()).map(rxRows => {
    const first = rxRows[0]
    const medications: PrescriptionMedication[] = rxRows.map(r => ({
      name: r.medicamento,
      brandName: r.nombreComercial ?? undefined,
      presentation: r.presentacion ?? '',
      dose: r.dosis,
      frequency: r.frecuencia,
      duration: r.duracion ?? '',
      instructions: r.indicaciones ?? '',
    }))
    return {
      id: first.recetaId,
      patientId: first.patientId,
      patientName: pName,
      date: first.createdAt.toISOString().split('T')[0],
      status: first.firmada ? 'firmada' : 'borrador',
      medications,
      doctorName: clinicCfg.doctorName ?? '',
      doctorLicense: clinicCfg.doctorLicense ?? '',
      doctorSpecialtyLicense: clinicCfg.doctorSpecialtyLicense ?? '',
      doctorUniversity: clinicCfg.doctorUniversity ?? '',
      doctorUniversityLogoUrl: clinicCfg.doctorUniversityLogoUrl ?? null,
      clinicName: clinicCfg.clinicName ?? '',
      clinicAddress: clinicCfg.clinicAddress ?? '',
      clinicPhone: clinicCfg.clinicPhone ?? '',
      clinicEmail: clinicCfg.clinicEmail ?? null,
      clinicLogoUrl: clinicCfg.clinicLogoUrl ?? null,
      clinicCofepris: clinicCfg.clinicCofepris ?? '',
      signatureData: null,
      signedAt: first.fechaFirma?.toISOString() ?? null,
      signatureTimestamp: first.fechaFirma?.toISOString() ?? null,
      firmaHash: first.firmaHash ?? null,
      createdAt: first.createdAt.toISOString(),
    } as Prescription
  })
}

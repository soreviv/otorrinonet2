'use server'

import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import { logAction } from '@/lib/audit'
import { computeNoteSignatureHash } from '@/lib/crypto'
import type { EvolutionNote, Prescription, PrescriptionMedication, ConsentForm } from '@/lib/notas-types'

// ─── Helpers de nombre de paciente ───────────────────────────────────────────

function patientFullName(p: { nombre: string; apellidoPaterno: string; apellidoMaterno: string | null }): string {
  return [p.nombre, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ')
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapEvolution(n: {
  id: string; patientId: string; motivoConsulta: string | null; subjetivo: string | null;
  objetivo: string | null; analisis: string | null; plan: string | null;
  firmada: boolean; firmaHash: string | null; fechaFirma: Date | null; fecha: Date
}, patientName: string, authorName: string): EvolutionNote {
  return {
    id: n.id,
    patientId: n.patientId,
    patientName,
    date: n.fecha.toISOString().split('T')[0],
    time: n.fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' }),
    consultationReason: n.motivoConsulta ?? n.subjetivo ?? '',
    findings: n.objetivo ?? '',
    updatedDiagnosis: n.analisis ?? '',
    plan: n.plan ?? '',
    authorName,
    createdAt: n.fecha.toISOString(),
  }
}


function mapPrescription(
  rows: Array<{
    id: string; recetaId: string; patientId: string;
    medicamento: string; nombreComercial: string | null; presentacion: string | null;
    dosis: string; frecuencia: string; duracion: string | null; indicaciones: string | null;
    instruccionesGenerales: string | null; firmada: boolean; firmaHash: string | null;
    fechaFirma: Date | null; createdAt: Date
  }>,
  patientName: string,
  clinicCfg: Record<string, unknown>,
): Prescription {
  const first = rows[0]
  const medications: PrescriptionMedication[] = rows.map(r => ({
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
    patientName,
    date: first.createdAt.toISOString().split('T')[0],
    status: first.firmada ? 'firmada' : 'borrador',
    medications,
    doctorName: (clinicCfg.doctorName as string) ?? '',
    doctorLicense: (clinicCfg.doctorLicense as string) ?? '',
    doctorSpecialtyLicense: (clinicCfg.doctorSpecialtyLicense as string) ?? '',
    doctorUniversity: (clinicCfg.doctorUniversity as string) ?? '',
    clinicName: (clinicCfg.clinicName as string) ?? '',
    clinicAddress: (clinicCfg.clinicAddress as string) ?? '',
    clinicPhone: (clinicCfg.clinicPhone as string) ?? '',
    clinicCofepris: (clinicCfg.clinicCofepris as string) ?? '',
    signatureData: null,
    signedAt: first.fechaFirma?.toISOString() ?? null,
    signatureTimestamp: first.fechaFirma?.toISOString() ?? null,
    firmaHash: first.firmaHash ?? null,
    createdAt: first.createdAt.toISOString(),
  } as Prescription
}

function mapConsent(c: {
  id: string; patientId: string; tipoConsentimiento: string; consentTexto: string | null;
  aceptado: boolean; fechaAceptacion: Date | null; createdAt: Date
}, patientName: string, authorName: string): ConsentForm {
  return {
    id: c.id,
    patientId: c.patientId,
    patientName,
    procedure: c.tipoConsentimiento,
    consentText: c.consentTexto ?? '',
    status: c.aceptado ? 'firmado-presencial' : 'pendiente',
    patientSignatureData: null,
    signedAt: c.fechaAceptacion?.toISOString() ?? null,
    signatureMethod: c.aceptado ? 'presencial' : null,
    emailSentAt: null,
    authorName,
    createdAt: c.createdAt.toISOString(),
  }
}

// ─── Lectura ──────────────────────────────────────────────────────────────────

export async function getNotasData(patientId: string) {
  const session = await verifySession()

  const [patient, evolutionNotes, prescriptionRows, consents, clinicCfg] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.medicalNote.findMany({
      where: { patientId, tipo: 'nota_evolucion' },
      orderBy: { fecha: 'desc' },
    }),
    prisma.prescription.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.patientConsent.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    }),
    getClinicConfigFromDB(),
  ])

  if (!patient) return null

  const pName = patientFullName(patient)
  void logAction({ action: 'vista', resource: 'patient', resourceId: patientId, userId: session.userId })

  // Agrupar recetas por recetaId
  const recetaMap = new Map<string, typeof prescriptionRows>()
  for (const row of prescriptionRows) {
    if (!recetaMap.has(row.recetaId)) recetaMap.set(row.recetaId, [])
    recetaMap.get(row.recetaId)!.push(row)
  }
  const prescriptions = Array.from(recetaMap.values()).map(rows =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapPrescription(rows, pName, clinicCfg as any)
  )

  return {
    patient: { id: patient.id, name: pName, expedienteNumber: patient.expedienteNumber },
    evolutionNotes: evolutionNotes.map(n => mapEvolution(n, pName, session.name)),
    prescriptions,
    consentForms: consents.map(c => mapConsent(c, pName, session.name)),
  }
}

// ─── Crear notas ──────────────────────────────────────────────────────────────

export async function createEvolutionNote(
  patientId: string,
  data: {
    motivoConsulta?: string
    subjetivo?: string
    objetivo?: string
    analisis?: string
    plan?: string
    diagnosticos?: { codigo: string; descripcion: string; tipo?: string }[]
    vitals?: {
      presionSistolica?: number; presionDiastolica?: number
      frecuenciaCardiaca?: number; temperatura?: number
      saturacionOxigeno?: number; peso?: number; talla?: number
    }
  },
): Promise<EvolutionNote> {
  const session = await verifySession()

  const [patient, note] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.medicalNote.create({
      data: {
        patientId,
        medicoId: session.userId,
        tipo: 'nota_evolucion',
        motivoConsulta: data.motivoConsulta || null,
        subjetivo: data.subjetivo || null,
        objetivo: data.objetivo || null,
        analisis: data.analisis || null,
        plan: data.plan || null,
      },
    }),
  ])

  // Diagnósticos CIE-10
  if (data.diagnosticos?.length) {
    await prisma.medicalNoteDiagnosis.createMany({
      data: data.diagnosticos.map(d => ({
        noteId: note.id,
        cie10Codigo: d.codigo,
        tipoDiagnostico: d.tipo ?? 'presuntivo',
      })),
    })
  }

  // Signos vitales
  const v = data.vitals
  if (v && Object.values(v).some(x => x != null)) {
    await prisma.vitals.create({
      data: {
        patientId,
        registradoPorId: session.userId,
        presionSistolica: v.presionSistolica ?? null,
        presionDiastolica: v.presionDiastolica ?? null,
        frecuenciaCardiaca: v.frecuenciaCardiaca ?? null,
        temperatura: v.temperatura ?? null,
        saturacionOxigeno: v.saturacionOxigeno ?? null,
        peso: v.peso ?? null,
        talla: v.talla ?? null,
      },
    })
  }

  void logAction({ action: 'creacion', resource: 'medical_note', resourceId: note.id, userId: session.userId })
  const pName = patient ? patientFullName(patient) : ''
  return mapEvolution(note, pName, session.name)
}

export async function createSurgicalNote(
  patientId: string,
  data: {
    subtipo?: string
    operacionPlaneada?: string
    diagnosticoPreoperatorio?: string
    hallazgosTransoperatorios?: string
    indicacionTerapeutica?: string
    complicaciones?: string
  },
): Promise<SurgicalNote> {
  const session = await verifySession()

  const [patient, note] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.medicalNote.create({
      data: {
        patientId,
        medicoId: session.userId,
        tipo: 'nota_quirurgica',
        subtipo: data.subtipo ?? 'preoperatoria',
        operacionPlaneada: data.operacionPlaneada || null,
        diagnosticoPreoperatorio: data.diagnosticoPreoperatorio || null,
        hallazgosTransoperatorios: data.hallazgosTransoperatorios || null,
        indicacionTerapeutica: data.indicacionTerapeutica || null,
        complicaciones: data.complicaciones || null,
      },
    }),
  ])

  void logAction({ action: 'creacion', resource: 'medical_note', resourceId: note.id, userId: session.userId })
  const pName = patient ? patientFullName(patient) : ''
  return mapSurgical(note, pName, session.name)
}

export async function createPrescription(
  patientId: string,
  medications: PrescriptionMedication[],
  _diagnosis?: string,
): Promise<Prescription> {
  const session = await verifySession()
  const recetaId = randomUUID()

  const [patient, , clinicCfg] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.prescription.createMany({
      data: medications.map(med => ({
        recetaId,
        patientId,
        medicoId: session.userId,
        medicamento: med.name,
        nombreComercial: med.brandName ?? null,
        presentacion: med.presentation ?? null,
        dosis: med.dose,
        frecuencia: med.frequency,
        duracion: med.duration ?? null,
        indicaciones: med.instructions ?? null,
      })),
    }),
    getClinicConfigFromDB(),
  ])

  const rows = await prisma.prescription.findMany({ where: { recetaId } })
  void logAction({ action: 'creacion', resource: 'prescription', resourceId: recetaId, userId: session.userId })
  const pName = patient ? patientFullName(patient) : ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mapPrescription(rows, pName, clinicCfg as any)
}

export async function createConsentForm(
  patientId: string,
  data: { type: string; content: string },
): Promise<ConsentForm> {
  const session = await verifySession()

  const [patient, consent] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.patientConsent.create({
      data: {
        patientId,
        medicoId: session.userId,
        tipoConsentimiento: data.type,
        consentTexto: data.content,
      },
    }),
  ])

  const pName = patient ? patientFullName(patient) : ''
  return mapConsent(consent, pName, session.name)
}

// ─── Firma electrónica ────────────────────────────────────────────────────────

export async function signEvolutionNoteInDB(id: string): Promise<{ firmaHash: string }> {
  const session = await verifySession()
  const existing = await prisma.medicalNote.findUnique({ where: { id }, select: { firmada: true } })
  if (existing?.firmada) throw new Error('Esta nota ya fue firmada')

  const isoTs = new Date().toISOString()
  const hash = computeNoteSignatureHash(id, session.userId, isoTs)

  await prisma.medicalNote.update({
    where: { id },
    data: { firmada: true, firmaHash: hash, fechaFirma: new Date(isoTs), firmaUserId: session.userId },
  })
  void logAction({ action: 'firma', resource: 'medical_note', resourceId: id, userId: session.userId })
  return { firmaHash: hash }
}

export async function signPrescriptionInDB(recetaId: string): Promise<{ firmaHash: string }> {
  const session = await verifySession()
  const existing = await prisma.prescription.findFirst({ where: { recetaId }, select: { firmada: true } })
  if (existing?.firmada) throw new Error('Esta receta ya fue firmada')

  const isoTs = new Date().toISOString()
  const hash = computeNoteSignatureHash(recetaId, session.userId, isoTs)

  await prisma.prescription.updateMany({
    where: { recetaId },
    data: { firmada: true, firmaHash: hash, fechaFirma: new Date(isoTs), firmaUserId: session.userId },
  })
  void logAction({ action: 'firma', resource: 'prescription', resourceId: recetaId, userId: session.userId })
  return { firmaHash: hash }
}

export async function signConsentInDB(id: string): Promise<void> {
  const session = await verifySession()
  const isoTs = new Date().toISOString()
  const hash = computeNoteSignatureHash(id, session.userId, isoTs)

  await prisma.patientConsent.update({
    where: { id },
    data: { aceptado: true, fechaAceptacion: new Date(isoTs) },
  })
  void logAction({ action: 'firma', resource: 'patient_consent', resourceId: id, userId: session.userId })
}

// ─── Adenda ───────────────────────────────────────────────────────────────────

export async function createAddendum(noteId: string, contenido: string): Promise<void> {
  const session = await verifySession()
  await prisma.medicalNoteAddendum.create({
    data: { noteId, contenido, authorId: session.userId },
  })
  void logAction({ action: 'creacion', resource: 'addendum', resourceId: noteId, userId: session.userId })
}

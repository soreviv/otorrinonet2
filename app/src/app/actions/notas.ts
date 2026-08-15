'use server'

import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { verifySession, requireMedico } from '@/lib/dal'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import { logAction } from '@/lib/audit'
import { computeNoteSignatureHash } from '@/lib/crypto'
import type { EvolutionNote, NoteAddendum, NoteDiagnostico, Prescription, PrescriptionMedication, ConsentForm } from '@/lib/notas-types'

// ─── Helpers de nombre de paciente ───────────────────────────────────────────

function patientFullName(p: { nombre: string; apellidoPaterno: string; apellidoMaterno: string | null }): string {
  return [p.nombre, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ')
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

interface MedicalNoteRow {
  id: string
  patientId: string
  motivoConsulta: string | null
  subjetivo: string | null
  objetivo: string | null
  analisis: string | null
  plan: string | null
  servicioAtencion: number | null
  sintomaticoRespTb: number | null
  primeraVezAnio: number | null
  primeraVezUneme: number | null
  firmada: boolean
  firmaHash: string | null
  fechaFirma: Date | null
  firmaUserId: string | null
  medicoId: string
  fecha: Date
}

function mapAddendum(a: {
  id: string
  contenido: string
  authorId: string | null
  fecha: Date
  firmaHash: string | null
}, authorName: string): NoteAddendum {
  return {
    id: a.id,
    contenido: a.contenido,
    authorName,
    fecha: a.fecha.toISOString(),
    firmaHash: a.firmaHash,
  }
}

function mapEvolution(
  n: MedicalNoteRow,
  patientName: string,
  authorName: string,
  addendums: NoteAddendum[] = [],
  diagnosticos: NoteDiagnostico[] = [],
  vitals: EvolutionNote['vitals'] = null,
): EvolutionNote {
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
    servicioAtencion: n.servicioAtencion,
    sintomaticoRespTb: n.sintomaticoRespTb,
    primeraVezAnio: n.primeraVezAnio,
    primeraVezUneme: n.primeraVezUneme,
    diagnosticos,
    vitals,
    authorName,
    authorId: n.medicoId,
    signed: n.firmada,
    signedAt: n.fechaFirma?.toISOString() ?? null,
    firmaHash: n.firmaHash,
    firmaUserId: n.firmaUserId,
    addendums,
    createdAt: n.fecha.toISOString(),
  }
}


function calcAge(dob: Date, referenceDate: Date): number {
  let age = referenceDate.getFullYear() - dob.getFullYear()
  const m = referenceDate.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && referenceDate.getDate() < dob.getDate())) age--
  return age
}

function mapPrescription(
  rows: Array<{
    id: string; recetaId: string; patientId: string;
    medicamento: string; nombreComercial: string | null; presentacion: string | null;
    dosis: string; frecuencia: string; duracion: string | null; indicaciones: string | null;
    instruccionesGenerales: string | null; via: string | null; firmada: boolean; firmaHash: string | null;
    firmaImagen: string | null; fechaFirma: Date | null; createdAt: Date
  }>,
  patientName: string,
  clinicCfg: Record<string, unknown>,
  patientData?: {
    fechaNacimiento: Date; sexo: string; alergias: string[]
  },
  vitals?: {
    peso: number | null; talla: number | null; temperatura: number | null;
    presionSistolica: number | null; presionDiastolica: number | null;
    frecuenciaCardiaca: number | null; frecuenciaRespiratoria: number | null;
    saturacionOxigeno: number | null; glucosa: number | null;
  } | null,
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
    route: r.via ?? undefined,
  }))

  let patientBMI: number | undefined
  if (vitals?.peso && vitals?.talla) {
    const tallam = vitals.talla / 100
    patientBMI = Math.round((vitals.peso / (tallam * tallam)) * 10) / 10
  }

  const bp =
    vitals?.presionSistolica && vitals?.presionDiastolica
      ? `${vitals.presionSistolica}/${vitals.presionDiastolica} mmHg`
      : undefined

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
    doctorUniversityLogoUrl: (clinicCfg.doctorUniversityLogoUrl as string) ?? null,
    clinicName: (clinicCfg.clinicName as string) ?? '',
    clinicAddress: (clinicCfg.clinicAddress as string) ?? '',
    clinicPhone: (clinicCfg.clinicPhone as string) ?? '',
    clinicEmail: (clinicCfg.clinicEmail as string) ?? null,
    clinicLogoUrl: (clinicCfg.clinicLogoUrl as string) ?? null,
    clinicCofepris: (clinicCfg.clinicCofepris as string) ?? '',
    signatureData: first.firmaImagen ?? null,
    signedAt: first.fechaFirma?.toISOString() ?? null,
    signatureTimestamp: first.fechaFirma?.toISOString() ?? null,
    firmaHash: first.firmaHash ?? null,
    createdAt: first.createdAt.toISOString(),
    diagnosis: first.instruccionesGenerales ?? undefined,
    patientAge: patientData ? calcAge(patientData.fechaNacimiento, first.createdAt) : undefined,
    patientSex: patientData?.sexo,
    patientAllergies: patientData?.alergias?.length ? patientData.alergias : undefined,
    patientWeight: vitals?.peso ?? undefined,
    patientHeight: vitals?.talla ?? undefined,
    patientBMI,
    patientTemperature: vitals?.temperatura ?? undefined,
    patientBloodPressure: bp,
    patientHeartRate: vitals?.frecuenciaCardiaca ?? undefined,
    patientRespiratoryRate: vitals?.frecuenciaRespiratoria ?? undefined,
    patientOxygenSaturation: vitals?.saturacionOxigeno ?? undefined,
    patientGlucose: vitals?.glucosa ?? undefined,
    doctorSignatureImageUrl: (clinicCfg.doctorSignatureImageUrl as string) || undefined,
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

  const [patient, evolutionNotes, prescriptionRows, consents, clinicCfg, latestVitals] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.medicalNote.findMany({
      where: { patientId, tipo: 'nota_evolucion' },
      orderBy: { fecha: 'desc' },
      include: {
        medico: { select: { id: true, name: true } },
        vitals: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        addendums: { orderBy: { fecha: 'asc' } },
        diagnoses: {
          include: { cie10: { select: { descripcion: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
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
    prisma.vitals.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      select: { peso: true, talla: true, temperatura: true, presionSistolica: true, presionDiastolica: true, frecuenciaCardiaca: true, frecuenciaRespiratoria: true, saturacionOxigeno: true, glucosa: true },
    }),
  ])

  if (!patient) return null

  const pName = patientFullName(patient)
  void logAction({ action: 'vista', resource: 'patient', resourceId: patientId, userId: session.userId })

  // Resolver autores de addendums
  const addendumAuthorIds = Array.from(new Set(
    evolutionNotes.flatMap(n => n.addendums.map(a => a.authorId).filter((x): x is string => !!x)),
  ))
  const addendumAuthors = addendumAuthorIds.length
    ? await prisma.staffUser.findMany({
        where: { id: { in: addendumAuthorIds } },
        select: { id: true, name: true },
      })
    : []
  const authorNameById = new Map(addendumAuthors.map(u => [u.id, u.name]))

  // Agrupar recetas por recetaId
  const recetaMap = new Map<string, typeof prescriptionRows>()
  for (const row of prescriptionRows) {
    if (!recetaMap.has(row.recetaId)) recetaMap.set(row.recetaId, [])
    recetaMap.get(row.recetaId)!.push(row)
  }
  const patientClinical = patient
    ? { fechaNacimiento: patient.fechaNacimiento, sexo: patient.sexo, alergias: patient.alergias }
    : undefined
  const prescriptions = Array.from(recetaMap.values()).map(rows =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapPrescription(rows, pName, clinicCfg as any, patientClinical ?? undefined, latestVitals)
  )

  return {
    patient: { id: patient.id, name: pName, expedienteNumber: patient.expedienteNumber },
    clinicConfig: clinicCfg,
    evolutionNotes: evolutionNotes.map(n => {
      const addendums = n.addendums.map(a =>
        mapAddendum(a, authorNameById.get(a.authorId ?? '') ?? 'Sistema'),
      )
      const diagnosticos: NoteDiagnostico[] = n.diagnoses.map(d => ({
        codigo: d.cie10Codigo,
        descripcion: d.cie10.descripcion,
        tipo: d.tipoDiagnostico,
      }))
      const v = n.vitals?.[0] || null
      return mapEvolution(n, pName, n.medico?.name ?? session.name, addendums, diagnosticos, v)
    }),
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
    servicioAtencion?: number
    sintomaticoRespTb?: number
    primeraVezAnio?: number
    primeraVezUneme?: number
    diagnosticos?: { codigo: string; descripcion: string; tipo?: string }[]
    vitals?: {
      presionSistolica?: number; presionDiastolica?: number
      frecuenciaCardiaca?: number; temperatura?: number
      saturacionOxigeno?: number; peso?: number; talla?: number
      circunferenciaCintura?: number
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
        servicioAtencion: data.servicioAtencion ?? null,
        sintomaticoRespTb: data.sintomaticoRespTb ?? null,
        primeraVezAnio: data.primeraVezAnio ?? null,
        primeraVezUneme: data.primeraVezUneme ?? null,
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
  const vitalsData = data.vitals
  if (vitalsData && Object.values(vitalsData).some(x => x != null)) {
    await prisma.vitals.create({
      data: {
        patientId,
        registradoPorId: session.userId,
        presionSistolica: vitalsData.presionSistolica ?? null,
        presionDiastolica: vitalsData.presionDiastolica ?? null,
        frecuenciaCardiaca: vitalsData.frecuenciaCardiaca ?? null,
        temperatura: vitalsData.temperatura ?? null,
        saturacionOxigeno: vitalsData.saturacionOxigeno ?? null,
        peso: vitalsData.peso ?? null,
        talla: vitalsData.talla ?? null,
        circunferenciaCintura: vitalsData.circunferenciaCintura ?? null,
        medicalNoteId: note.id,
      },
    })
  }

  void logAction({ action: 'creacion', resource: 'medical_note', resourceId: note.id, userId: session.userId })
  const pName = patient ? patientFullName(patient) : ''
  const noteWithVitals = await prisma.medicalNote.findUnique({
    where: { id: note.id },
    include: { vitals: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })
  const finalV = noteWithVitals?.vitals?.[0] || null
  return mapEvolution(note, pName, session.name, [], [], finalV)
}

// ─── Edición pre-firma ────────────────────────────────────────────────────────

export async function updateEvolutionNote(
  noteId: string,
  data: {
    motivoConsulta?: string
    subjetivo?: string
    objetivo?: string
    analisis?: string
    plan?: string
    servicioAtencion?: number
    sintomaticoRespTb?: number
    primeraVezAnio?: number
    primeraVezUneme?: number
    vitals?: {
      presionSistolica?: number; presionDiastolica?: number
      frecuenciaCardiaca?: number; temperatura?: number
      saturacionOxigeno?: number; peso?: number; talla?: number
      circunferenciaCintura?: number
    }
  },
): Promise<EvolutionNote> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Solo el médico puede modificar notas.')

  const existing = await prisma.medicalNote.findUnique({
    where: { id: noteId },
    select: { firmada: true, medicoId: true, patientId: true },
  })
  if (!existing) throw new Error('Nota no encontrada.')
  if (existing.firmada) {
    throw new Error('Esta nota ya fue firmada y no se puede modificar. Use un adendum.')
  }

  const [patient, updated] = await Promise.all([
    prisma.patient.findUnique({ where: { id: existing.patientId } }),
    prisma.medicalNote.update({
      where: { id: noteId },
      data: {
        motivoConsulta: data.motivoConsulta ?? null,
        subjetivo: data.subjetivo ?? null,
        objetivo: data.objetivo ?? null,
        analisis: data.analisis ?? null,
        plan: data.plan ?? null,
        servicioAtencion: data.servicioAtencion ?? null,
        sintomaticoRespTb: data.sintomaticoRespTb ?? null,
        primeraVezAnio: data.primeraVezAnio ?? null,
        primeraVezUneme: data.primeraVezUneme ?? null,
      },
      include: {
        medico: { select: { name: true } },
        vitals: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
  ])

  // Actualizar o crear signos vitales vinculados
  let finalV: EvolutionNote['vitals'] = updated.vitals?.[0] || null
  const vitalsData = data.vitals
  if (vitalsData) {
    const existingVitals = updated.vitals?.[0]
    const hasValues = Object.values(vitalsData).some(x => x != null)

    const vFields = {
      presionSistolica: vitalsData.presionSistolica ?? null,
      presionDiastolica: vitalsData.presionDiastolica ?? null,
      frecuenciaCardiaca: vitalsData.frecuenciaCardiaca ?? null,
      temperatura: vitalsData.temperatura ?? null,
      saturacionOxigeno: vitalsData.saturacionOxigeno ?? null,
      peso: vitalsData.peso ?? null,
      talla: vitalsData.talla ?? null,
      circunferenciaCintura: vitalsData.circunferenciaCintura ?? null,
    }

    if (existingVitals) {
      if (hasValues) {
        finalV = await prisma.vitals.update({
          where: { id: existingVitals.id },
          data: vFields,
        })
      } else {
        await prisma.vitals.delete({ where: { id: existingVitals.id } })
        finalV = null
      }
    } else if (hasValues) {
      finalV = await prisma.vitals.create({
        data: {
          patientId: existing.patientId,
          medicalNoteId: noteId,
          registradoPorId: session.userId,
          ...vFields,
        },
      })
    }
  }

  void logAction({ action: 'modificacion', resource: 'medical_note', resourceId: noteId, userId: session.userId })
  const pName = patient ? patientFullName(patient) : ''
  return mapEvolution(updated, pName, updated.medico?.name ?? session.name, [], [], finalV)
}

export async function createPrescription(
  patientId: string,
  medications: PrescriptionMedication[],
  diagnosis?: string,
): Promise<Prescription> {
  const session = await requireMedico()
  const recetaId = randomUUID()

  const [patient, , clinicCfg, latestVitals] = await Promise.all([
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
        via: med.route ?? null,
        frecuencia: med.frequency,
        duracion: med.duration ?? null,
        indicaciones: med.instructions ?? null,
        instruccionesGenerales: diagnosis ?? null,
      })),
    }),
    getClinicConfigFromDB(),
    prisma.vitals.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      select: { peso: true, talla: true, temperatura: true, presionSistolica: true, presionDiastolica: true, frecuenciaCardiaca: true, frecuenciaRespiratoria: true, saturacionOxigeno: true, glucosa: true },
    }),
  ])

  const rows = await prisma.prescription.findMany({ where: { recetaId } })
  void logAction({ action: 'creacion', resource: 'prescription', resourceId: recetaId, userId: session.userId })
  const pName = patient ? patientFullName(patient) : ''
  const patientClinical = patient
    ? { fechaNacimiento: patient.fechaNacimiento, sexo: patient.sexo, alergias: patient.alergias }
    : undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mapPrescription(rows, pName, clinicCfg as any, patientClinical, latestVitals)
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

export async function signEvolutionNoteInDB(id: string): Promise<EvolutionNote> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Solo el médico puede firmar notas.')

  const existing = await prisma.medicalNote.findUnique({
    where: { id },
    select: { firmada: true, patientId: true },
  })
  if (!existing) throw new Error('Nota no encontrada.')
  if (existing.firmada) throw new Error('Esta nota ya fue firmada.')

  const isoTs = new Date().toISOString()
  const hash = computeNoteSignatureHash(id, session.userId, isoTs)

  const [patient, signed] = await Promise.all([
    prisma.patient.findUnique({ where: { id: existing.patientId } }),
    prisma.medicalNote.update({
      where: { id },
      data: { firmada: true, firmaHash: hash, fechaFirma: new Date(isoTs), firmaUserId: session.userId },
      include: {
        medico: { select: { name: true } },
        addendums: { orderBy: { fecha: 'asc' } },
        diagnoses: {
          include: { cie10: { select: { descripcion: true } } },
          orderBy: { createdAt: 'asc' },
        },
        vitals: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
  ])

  void logAction({
    action: 'firma',
    resource: 'medical_note',
    resourceId: id,
    userId: session.userId,
    details: { firmaHash: hash, fechaFirma: isoTs },
  })

  const pName = patient ? patientFullName(patient) : ''
  const addAuthorIds = Array.from(new Set(signed.addendums.map(a => a.authorId).filter((x): x is string => !!x)))
  const addAuthors = addAuthorIds.length
    ? await prisma.staffUser.findMany({ where: { id: { in: addAuthorIds } }, select: { id: true, name: true } })
    : []
  const nameById = new Map(addAuthors.map(u => [u.id, u.name]))
  const addendums = signed.addendums.map(a => mapAddendum(a, nameById.get(a.authorId ?? '') ?? 'Sistema'))
  const diagnosticos: NoteDiagnostico[] = signed.diagnoses.map(d => ({
    codigo: d.cie10Codigo,
    descripcion: d.cie10.descripcion,
    tipo: d.tipoDiagnostico,
  }))
  const v = signed.vitals?.[0] || null

  return mapEvolution(signed, pName, signed.medico?.name ?? session.name, addendums, diagnosticos, v)
}

export async function signPrescriptionInDB(recetaId: string, firmaImagen?: string): Promise<{ firmaHash: string }> {
  const session = await verifySession()
  const existing = await prisma.prescription.findFirst({ where: { recetaId }, select: { firmada: true } })
  if (existing?.firmada) throw new Error('Esta receta ya fue firmada')

  const isoTs = new Date().toISOString()
  const hash = computeNoteSignatureHash(recetaId, session.userId, isoTs)

  await prisma.prescription.updateMany({
    where: { recetaId },
    data: { firmada: true, firmaHash: hash, firmaImagen: firmaImagen ?? null, fechaFirma: new Date(isoTs), firmaUserId: session.userId },
  })
  void logAction({ action: 'firma', resource: 'prescription', resourceId: recetaId, userId: session.userId })
  return { firmaHash: hash }
}

export async function signConsentInDB(id: string): Promise<void> {
  const session = await verifySession()
  const isoTs = new Date().toISOString()

  await prisma.patientConsent.update({
    where: { id },
    data: { aceptado: true, fechaAceptacion: new Date(isoTs) },
  })
  void logAction({ action: 'firma', resource: 'patient_consent', resourceId: id, userId: session.userId })
}

// ─── Adenda ───────────────────────────────────────────────────────────────────

export async function createAddendum(noteId: string, contenido: string): Promise<NoteAddendum> {
  const session = await verifySession()
  if (session.role !== 'medico') throw new Error('Solo el médico puede agregar adendums.')

  const trimmed = contenido.trim()
  if (trimmed.length < 5) throw new Error('El contenido del adendum es demasiado corto.')
  if (trimmed.length > 5000) throw new Error('El adendum excede 5000 caracteres.')

  const note = await prisma.medicalNote.findUnique({
    where: { id: noteId },
    select: { id: true, firmada: true },
  })
  if (!note) throw new Error('Nota no encontrada.')
  if (!note.firmada) {
    throw new Error('Solo se pueden agregar adendums a notas firmadas. Edite la nota directamente.')
  }

  const isoTs = new Date().toISOString()
  const hash = computeNoteSignatureHash(`${noteId}:addendum:${randomUUID()}`, session.userId, isoTs)

  const addendum = await prisma.medicalNoteAddendum.create({
    data: {
      noteId,
      contenido: trimmed,
      authorId: session.userId,
      firmaHash: hash,
      fecha: new Date(isoTs),
    },
  })

  void logAction({
    action: 'creacion',
    resource: 'addendum',
    resourceId: addendum.id,
    userId: session.userId,
    details: { noteId, firmaHash: hash },
  })

  return mapAddendum(addendum, session.name)
}

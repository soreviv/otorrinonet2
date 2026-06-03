'use client'

import { useState } from 'react'
import {
  DocumentList,
  PrescriptionDetail,
  ConsentFormDetail,
  ConsentFormCreate,
  EvolutionNoteDetail,
} from '@/components/notas'
import { EvolutionNoteForm, type EvolutionNoteData } from '@/components/notas/EvolutionNoteForm'
import { PrescriptionForm } from '@/components/notas/PrescriptionForm'
import {
  createEvolutionNote,
  updateEvolutionNote,
  signEvolutionNoteInDB,
  createAddendum,
  createPrescription,
  createConsentForm,
  signPrescriptionInDB,
  signConsentInDB,
} from '@/app/actions/notas'
import { printEvolutionNote } from '@/lib/print-evolution-note'
import { printPrescription } from '@/lib/print-prescription'
import type { CLINIC_CONFIG } from '@/lib/clinic-config'
import type {
  Prescription,
  ConsentForm,
  CurrentPatient,
  EvolutionNote,
  PrescriptionMedication,
} from '@/lib/notas-types'

type View = 'list' | 'note-detail' | 'prescription' | 'consent' | 'new-note' | 'new-prescription' | 'new-consent'

interface Props {
  currentPatient: CurrentPatient
  clinicConfig: typeof CLINIC_CONFIG
  evolutionNotes: EvolutionNote[]
  initialPrescriptions: Prescription[]
  initialConsentForms: ConsentForm[]
  currentUserRole: 'medico' | 'enfermera' | 'recepcionista'
}

function nowCDMX(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Mexico_City' }).replace(' ', 'T') + '-06:00'
}

export function NotasClient({
  currentPatient,
  clinicConfig,
  evolutionNotes: initialNotes,
  initialPrescriptions,
  initialConsentForms,
  currentUserRole,
}: Props) {
  const [view, setView] = useState<View>('list')
  const [selectedRxId, setSelectedRxId] = useState<string | null>(null)
  const [selectedConsentId, setSelectedConsentId] = useState<string | null>(null)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions)
  const [consentForms, setConsentForms] = useState<ConsentForm[]>(initialConsentForms)
  const [evolutionNotes, setEvolutionNotes] = useState<EvolutionNote[]>(initialNotes)

  const isMedico = currentUserRole === 'medico'
  const selectedRx = prescriptions.find(r => r.id === selectedRxId) ?? null
  const selectedConsent = consentForms.find(c => c.id === selectedConsentId) ?? null
  const selectedNote = evolutionNotes.find(n => n.id === selectedNoteId) ?? null

  function replaceNote(updated: EvolutionNote) {
    setEvolutionNotes(prev => prev.map(n => (n.id === updated.id ? updated : n)))
  }

  async function handleCreateNote(data: EvolutionNoteData) {
    const note = await createEvolutionNote(currentPatient.id, {
      motivoConsulta: data.subjective,
      subjetivo: data.subjective,
      objetivo: data.objective,
      analisis: data.assessment,
      plan: data.plan,
      servicioAtencion: data.servicioAtencion,
      sintomaticoRespTb: data.sintomaticoRespTb,
      primeraVezAnio: data.primeraVezAnio,
      primeraVezUneme: data.primeraVezUneme,
      diagnosticos: data.diagnosticos.map(d => ({
        codigo: d.codigo,
        descripcion: d.descripcion,
      })),
      vitals: data.vitals,
    })
    setEvolutionNotes(prev => [note, ...prev])
    setSelectedNoteId(note.id)
    setView('note-detail')
  }

  async function handleCreateAndSignNote(data: EvolutionNoteData) {
    const note = await createEvolutionNote(currentPatient.id, {
      motivoConsulta: data.subjective,
      subjetivo: data.subjective,
      objetivo: data.objective,
      analisis: data.assessment,
      plan: data.plan,
      servicioAtencion: data.servicioAtencion,
      sintomaticoRespTb: data.sintomaticoRespTb,
      primeraVezAnio: data.primeraVezAnio,
      primeraVezUneme: data.primeraVezUneme,
      diagnosticos: data.diagnosticos.map(d => ({
        codigo: d.codigo,
        descripcion: d.descripcion,
      })),
      vitals: data.vitals,
    })
    const signed = await signEvolutionNoteInDB(note.id)
    setEvolutionNotes(prev => [signed, ...prev])
    setSelectedNoteId(signed.id)
    setView('note-detail')
  }

  async function handleSaveNote(noteId: string, data: {
    motivoConsulta: string
    subjetivo: string
    objetivo: string
    analisis: string
    plan: string
    servicioAtencion?: number
    sintomaticoRespTb?: number
    primeraVezAnio?: number
    primeraVezUneme?: number
    vitals?: {
      presionSistolica?: number
      presionDiastolica?: number
      frecuenciaCardiaca?: number
      temperatura?: number
      saturacionOxigeno?: number
      peso?: number
      talla?: number
      circunferenciaCintura?: number
    }
  }): Promise<EvolutionNote> {
    const updated = await updateEvolutionNote(noteId, data)
    replaceNote(updated)
    return updated
  }

  async function handleSignNote(noteId: string): Promise<EvolutionNote> {
    const signed = await signEvolutionNoteInDB(noteId)
    replaceNote(signed)
    return signed
  }

  async function handleAddAddendum(noteId: string, contenido: string) {
    const addendum = await createAddendum(noteId, contenido)
    setEvolutionNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, addendums: [...n.addendums, addendum] } : n)),
    )
  }

  async function handleCreatePrescription(medications: PrescriptionMedication[], diagnosis: string) {
    const rx = await createPrescription(currentPatient.id, medications, diagnosis)
    setPrescriptions(prev => [rx, ...prev])
    setSelectedRxId(rx.id)
    setView('prescription')
  }

  async function handleSignPrescription(id: string, signatureData: string) {
    const signedAt = nowCDMX()
    const { firmaHash } = await signPrescriptionInDB(id, signatureData || undefined)
    setPrescriptions(prev =>
      prev.map(rx =>
        rx.id === id
          ? { ...rx, status: 'firmada', signatureData, signedAt, signatureTimestamp: new Date().toISOString(), firmaHash }
          : rx,
      ),
    )
  }

  async function handleCreateConsent(type: string, content: string) {
    const consent = await createConsentForm(currentPatient.id, { type, content })
    setConsentForms(prev => [consent, ...prev])
    setSelectedConsentId(consent.id)
    setView('consent')
  }

  async function handleSignConsent(id: string, signatureData: string) {
    setConsentForms(prev =>
      prev.map(c =>
        c.id === id ? { ...c, status: 'firmado-presencial', patientSignatureData: signatureData, signedAt: nowCDMX(), signatureMethod: 'presencial' } : c,
      ),
    )
    await signConsentInDB(id)
  }

  function handleSendConsentEmail(id: string) {
    setConsentForms(prev => prev.map(c => (c.id === id ? { ...c, emailSentAt: nowCDMX() } : c)))
  }

  if (view === 'new-note') {
    return (
      <EvolutionNoteForm
        patientName={currentPatient.name}
        onSave={handleCreateNote}
        onSaveAndSign={handleCreateAndSignNote}
        onCancel={() => setView('list')}
      />
    )
  }

  if (view === 'note-detail' && selectedNote) {
    return (
      <EvolutionNoteDetail
        note={selectedNote}
        canEdit={isMedico}
        onBack={() => setView('list')}
        onSave={(data) => handleSaveNote(selectedNote.id, data)}
        onSign={() => handleSignNote(selectedNote.id)}
        onAddAddendum={(c) => handleAddAddendum(selectedNote.id, c)}
        onPrint={selectedNote.signed ? () => printEvolutionNote(selectedNote, clinicConfig) : undefined}
      />
    )
  }

  if (view === 'new-prescription') {
    return (
      <PrescriptionForm
        patientName={currentPatient.name}
        onSave={handleCreatePrescription}
        onCancel={() => setView('list')}
      />
    )
  }

  if (view === 'prescription' && selectedRx) {
    return (
      <PrescriptionDetail
        prescription={selectedRx}
        onSign={handleSignPrescription}
        onPrint={() => { void printPrescription(selectedRx) }}
        onBack={() => setView('list')}
      />
    )
  }

  if (view === 'consent' && selectedConsent) {
    return (
      <ConsentFormDetail
        consent={selectedConsent}
        onSignPresential={handleSignConsent}
        onSendEmail={handleSendConsentEmail}
        onPrint={() => window.print()}
        onBack={() => setView('list')}
      />
    )
  }

  if (view === 'new-consent') {
    return <ConsentFormCreate patientName={currentPatient.name} onSave={handleCreateConsent} onCancel={() => setView('list')} />
  }

  return (
    <DocumentList
      currentPatient={currentPatient}
      evolutionNotes={evolutionNotes}
      prescriptions={prescriptions}
      consentForms={consentForms}
      onViewNote={(id) => { setSelectedNoteId(id); setView('note-detail') }}
      onViewPrescription={id => { setSelectedRxId(id); setView('prescription') }}
      onViewConsent={id => { setSelectedConsentId(id); setView('consent') }}
      onNewNote={isMedico ? () => setView('new-note') : undefined}
      onNewPrescription={isMedico ? () => setView('new-prescription') : undefined}
      onNewConsent={isMedico ? () => setView('new-consent') : undefined}
    />
  )
}

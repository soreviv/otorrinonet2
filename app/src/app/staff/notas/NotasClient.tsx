'use client'

import { useState } from 'react'
import { DocumentList, PrescriptionDetail, ConsentFormDetail } from '@/components/notas'
import { EvolutionNoteForm, type EvolutionNoteData } from '@/components/notas/EvolutionNoteForm'
import { PrescriptionForm } from '@/components/notas/PrescriptionForm'
import {
  createEvolutionNote,
  createPrescription,
  signPrescriptionInDB,
  signConsentInDB,
} from '@/app/actions/notas'
import type { Prescription, ConsentForm, CurrentPatient, EvolutionNote, SurgicalNote, PrescriptionMedication } from '@/lib/notas-types'

type View = 'list' | 'prescription' | 'consent' | 'new-note' | 'new-prescription'

interface Props {
  currentPatient: CurrentPatient
  evolutionNotes: EvolutionNote[]
  surgicalNotes: SurgicalNote[]
  initialPrescriptions: Prescription[]
  initialConsentForms: ConsentForm[]
}

function nowCDMX(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Mexico_City' }).replace(' ', 'T') + '-06:00'
}

export function NotasClient({
  currentPatient,
  evolutionNotes: initialNotes,
  surgicalNotes,
  initialPrescriptions,
  initialConsentForms,
}: Props) {
  const [view, setView] = useState<View>('list')
  const [selectedRxId, setSelectedRxId] = useState<string | null>(null)
  const [selectedConsentId, setSelectedConsentId] = useState<string | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions)
  const [consentForms, setConsentForms] = useState<ConsentForm[]>(initialConsentForms)
  const [evolutionNotes, setEvolutionNotes] = useState<EvolutionNote[]>(initialNotes)

  const selectedRx = prescriptions.find(r => r.id === selectedRxId) ?? null
  const selectedConsent = consentForms.find(c => c.id === selectedConsentId) ?? null

  async function handleCreateNote(data: EvolutionNoteData) {
    const note = await createEvolutionNote(currentPatient.id, data)
    setEvolutionNotes(prev => [note, ...prev])
    setView('list')
  }

  async function handleCreatePrescription(medications: PrescriptionMedication[], diagnosis: string) {
    const rx = await createPrescription(currentPatient.id, medications, diagnosis)
    setPrescriptions(prev => [rx, ...prev])
    setSelectedRxId(rx.id)
    setView('prescription')
  }

  async function handleSignPrescription(id: string, signatureData: string) {
    const signedAt = nowCDMX()
    setPrescriptions(prev =>
      prev.map(rx =>
        rx.id === id ? { ...rx, status: 'firmada', signatureData, signedAt, signatureTimestamp: new Date().toISOString() } : rx,
      ),
    )
    await signPrescriptionInDB(id)
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
        onCancel={() => setView('list')}
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
        onPrint={() => window.print()}
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

  return (
    <DocumentList
      currentPatient={currentPatient}
      evolutionNotes={evolutionNotes}
      surgicalNotes={surgicalNotes}
      prescriptions={prescriptions}
      consentForms={consentForms}
      onViewPrescription={id => { setSelectedRxId(id); setView('prescription') }}
      onViewConsent={id => { setSelectedConsentId(id); setView('consent') }}
      onNewNote={() => setView('new-note')}
      onNewPrescription={() => setView('new-prescription')}
      onNewSurgicalNote={() => {}}
      onNewConsent={() => {}}
    />
  )
}

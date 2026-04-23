'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { DocumentList, PrescriptionDetail, ConsentFormDetail } from '@/components/notas'
import {
  SAMPLE_EVOLUTION_NOTES,
  SAMPLE_SURGICAL_NOTES,
  SAMPLE_PRESCRIPTIONS,
  SAMPLE_CONSENT_FORMS,
} from '@/lib/notas-data'
import { SAMPLE_PATIENTS } from '@/lib/ehr-data'
import type { Prescription, ConsentForm } from '@/lib/notas-types'

type View = 'list' | 'prescription' | 'consent'

function nowCDMX(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Mexico_City' }).replace(' ', 'T') + '-06:00'
}

function NotasPageInner() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('paciente') ?? SAMPLE_PATIENTS[0].id

  const patient = SAMPLE_PATIENTS.find(p => p.id === patientId) ?? SAMPLE_PATIENTS[0]
  const currentPatient = {
    id: patient.id,
    name: patient.generalData.fullName,
    expedienteNumber: patient.expedienteNumber,
  }

  const [view, setView] = useState<View>('list')
  const [selectedRxId, setSelectedRxId] = useState<string | null>(null)
  const [selectedConsentId, setSelectedConsentId] = useState<string | null>(null)

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(SAMPLE_PRESCRIPTIONS)
  const [consentForms, setConsentForms] = useState<ConsentForm[]>(SAMPLE_CONSENT_FORMS)

  const selectedRx = prescriptions.find(r => r.id === selectedRxId) ?? null
  const selectedConsent = consentForms.find(c => c.id === selectedConsentId) ?? null

  function handleViewPrescription(id: string) {
    setSelectedRxId(id)
    setView('prescription')
  }

  function handleViewConsent(id: string) {
    setSelectedConsentId(id)
    setView('consent')
  }

  function handleSignPrescription(id: string, signatureData: string) {
    const now = new Date()
    const signedAt = nowCDMX()
    const signatureTimestamp = now.toISOString()
    setPrescriptions(prev =>
      prev.map(rx =>
        rx.id === id
          ? { ...rx, status: 'firmada', signatureData, signedAt, signatureTimestamp }
          : rx
      )
    )
  }

  function handleSignConsent(id: string, signatureData: string) {
    const signedAt = nowCDMX()
    setConsentForms(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, status: 'firmado-presencial', patientSignatureData: signatureData, signedAt, signatureMethod: 'presencial' }
          : c
      )
    )
  }

  function handleSendConsentEmail(id: string) {
    const emailSentAt = nowCDMX()
    setConsentForms(prev =>
      prev.map(c =>
        c.id === id ? { ...c, emailSentAt } : c
      )
    )
  }

  function handlePrint(id: string) {
    console.log('print/download:', id)
    window.print()
  }

  if (view === 'prescription' && selectedRx) {
    return (
      <PrescriptionDetail
        prescription={selectedRx}
        onSign={handleSignPrescription}
        onPrint={handlePrint}
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
        onPrint={handlePrint}
        onBack={() => setView('list')}
      />
    )
  }

  return (
    <DocumentList
      currentPatient={currentPatient}
      evolutionNotes={SAMPLE_EVOLUTION_NOTES}
      surgicalNotes={SAMPLE_SURGICAL_NOTES}
      prescriptions={prescriptions}
      consentForms={consentForms}
      onViewPrescription={handleViewPrescription}
      onViewConsent={handleViewConsent}
      onNewNote={() => console.log('nueva nota de evolución')}
      onNewSurgicalNote={() => console.log('nueva nota quirúrgica')}
      onNewPrescription={() => console.log('nueva receta')}
      onNewConsent={() => console.log('nuevo consentimiento')}
    />
  )
}

export default function NotasPage() {
  return (
    <Suspense>
      <NotasPageInner />
    </Suspense>
  )
}

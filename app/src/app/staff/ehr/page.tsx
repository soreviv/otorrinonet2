'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PatientList, PatientDetail, PatientForm } from '@/components/ehr'
import { SAMPLE_PATIENTS } from '@/lib/ehr-data'
import type { Patient, UserRole } from '@/lib/ehr-types'

type View = 'list' | 'detail' | 'form'

const CURRENT_ROLE: UserRole = 'medico'

function generateExpedienteNumber(patients: Patient[]): string {
  const year = new Date().getFullYear()
  const yearPatients = patients.filter((p) => p.expedienteNumber.includes(`VIV-${year}-`))
  const next = String(yearPatients.length + 1).padStart(3, '0')
  return `VIV-${year}-${next}`
}

export default function EhrPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>(SAMPLE_PATIENTS)
  const [view, setView] = useState<View>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const selectedPatient = patients.find((p) => p.id === selectedId) ?? null
  const editingPatient = editingId ? patients.find((p) => p.id === editingId) : undefined

  function handleView(id: string) {
    setSelectedId(id)
    setView('detail')
  }

  function handleEdit(id: string) {
    setEditingId(id)
    setView('form')
  }

  function handleCreate() {
    setEditingId(null)
    setView('form')
  }

  function handleBack() {
    setView('list')
    setSelectedId(null)
  }

  function handleCancel() {
    if (editingId) {
      setView('detail')
    } else {
      setView('list')
    }
    setEditingId(null)
  }

  function handleSave(data: Omit<Patient, 'id' | 'expedienteNumber' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()

    if (editingId) {
      setPatients((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, ...data, updatedAt: now }
            : p
        )
      )
      setSelectedId(editingId)
      setEditingId(null)
      setView('detail')
    } else {
      const newPatient: Patient = {
        id: `exp-${Date.now()}`,
        expedienteNumber: generateExpedienteNumber(patients),
        createdAt: now,
        updatedAt: now,
        ...data,
      }
      setPatients((prev) => [newPatient, ...prev])
      setSelectedId(newPatient.id)
      setEditingId(null)
      setView('detail')
    }
  }

  if (view === 'form') {
    return (
      <PatientForm
        patient={editingPatient}
        currentUserRole={CURRENT_ROLE}
        onSubmit={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  if (view === 'detail' && selectedPatient) {
    return (
      <PatientDetail
        patient={selectedPatient}
        currentUserRole={CURRENT_ROLE}
        onEdit={handleEdit}
        onViewDocuments={(id) => router.push(`/staff/notas?paciente=${id}`)}
        onBack={handleBack}
      />
    )
  }

  return (
    <PatientList
      patients={patients}
      currentUserRole={CURRENT_ROLE}
      onView={handleView}
      onCreate={handleCreate}
      onSearch={(q) => console.log('search:', q)}
    />
  )
}

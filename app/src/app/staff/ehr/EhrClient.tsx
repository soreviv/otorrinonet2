'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PatientList, PatientDetail, PatientForm } from '@/components/ehr'
import { savePatient } from '@/app/actions/ehr'
import type { Patient, UserRole } from '@/lib/ehr-types'

type View = 'list' | 'detail' | 'form'

interface Props {
  initialPatients: Patient[]
  currentUserRole: UserRole
}

export function EhrClient({ initialPatients, currentUserRole }: Props) {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [view, setView] = useState<View>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const selectedPatient = patients.find(p => p.id === selectedId) ?? null
  const editingPatient = editingId ? patients.find(p => p.id === editingId) : undefined

  function handleView(id: string) { setSelectedId(id); setView('detail') }
  function handleEdit(id: string) { setEditingId(id); setView('form') }
  function handleCreate() { setEditingId(null); setView('form') }
  function handleBack() { setView('list'); setSelectedId(null) }
  function handleCancel() {
    if (editingId) { setView('detail') } else { setView('list') }
    setEditingId(null)
  }

  async function handleSave(data: Omit<Patient, 'id' | 'expedienteNumber' | 'createdAt' | 'updatedAt'>) {
    const saved = await savePatient(data, editingId ?? undefined)

    if (editingId) {
      setPatients(prev => prev.map(p => (p.id === editingId ? saved : p)))
      setSelectedId(editingId)
    } else {
      setPatients(prev => [saved, ...prev])
      setSelectedId(saved.id)
    }
    setEditingId(null)
    setView('detail')
  }

  if (view === 'form') {
    return (
      <PatientForm
        patient={editingPatient}
        currentUserRole={currentUserRole}
        onSubmit={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  if (view === 'detail' && selectedPatient) {
    return (
      <PatientDetail
        patient={selectedPatient}
        currentUserRole={currentUserRole}
        onEdit={handleEdit}
        onViewDocuments={(id, nueva) => router.push(`/staff/notas?paciente=${id}${nueva ? `&nueva=${nueva}` : ''}`)}
        onBack={handleBack}
      />
    )
  }

  return (
    <PatientList
      patients={patients}
      currentUserRole={currentUserRole}
      onView={handleView}
      onCreate={handleCreate}
      onSearch={() => {}}
    />
  )
}

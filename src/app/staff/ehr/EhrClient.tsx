'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PatientList, PatientDetail, PatientForm } from '@/components/ehr'
import { savePatient, deletePatient } from '@/app/actions/ehr'
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

  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  async function handleDelete(id: string) {
    setDeleteError(null)
    try {
      await deletePatient(id)
      setPatients(prev => prev.filter(p => p.id !== id))
      setSelectedId(null)
      setView('list')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar el expediente')
    }
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
        onDelete={currentUserRole === 'medico' ? handleDelete : undefined}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {deleteError && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            {deleteError}
          </div>
        </div>
      )}
      <PatientList
        patients={patients}
        currentUserRole={currentUserRole}
        onView={handleView}
        onCreate={handleCreate}
        onSearch={() => {}}
        onDelete={currentUserRole === 'medico' ? handleDelete : undefined}
      />
    </div>
  )
}

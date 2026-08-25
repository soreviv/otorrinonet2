import { Suspense } from 'react'
import { verifySession } from '@/lib/dal'
import { getPatients } from '@/app/actions/ehr'
import { getNotasData } from '@/app/actions/notas'
import { NotasClient } from './NotasClient'

interface Props {
  searchParams: Promise<{ paciente?: string; nueva?: string }>
}

async function NotasLoader({ patientId, initialAction }: { patientId: string | undefined; initialAction?: 'nota' | 'receta' }) {
  const session = await verifySession()

  if (!patientId) {
    const patients = await getPatients()
    if (patients.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400 text-sm">No hay pacientes registrados aún.</p>
        </div>
      )
    }
    patientId = patients[0].id
  }

  const data = await getNotasData(patientId)

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">Paciente no encontrado.</p>
      </div>
    )
  }

  return (
    <NotasClient
      currentPatient={data.patient}
      clinicConfig={data.clinicConfig}
      evolutionNotes={data.evolutionNotes}
      initialPrescriptions={data.prescriptions}
      initialConsentForms={data.consentForms}
      currentUserRole={session.role}
      initialAction={initialAction}
    />
  )
}

export default async function NotasPage({ searchParams }: Props) {
  const { paciente, nueva } = await searchParams
  const initialAction = nueva === 'nota' || nueva === 'receta' ? nueva : undefined

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-slate-400 text-sm">Cargando…</p></div>}>
      <NotasLoader patientId={paciente} initialAction={initialAction} />
    </Suspense>
  )
}

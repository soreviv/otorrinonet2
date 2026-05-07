import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ModificarCitaForm from './ModificarCitaForm'

export const metadata = { title: 'Modificar cita — ORL Viveros' }

export default async function ModificarCitaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (!token) redirect('/?error=token-requerido')

  const appointment = await prisma.appointment.findUnique({
    where: { actionToken: token },
    select: { status: true, scheduledAt: true, patientName: true },
  })

  if (!appointment) redirect('/?error=enlace-invalido')
  if (appointment.status === 'cancelada') redirect('/?error=cita-cancelada')

  const currentDateDisplay = appointment.scheduledAt.toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'America/Mexico_City',
  })
  const currentTimeDisplay = appointment.scheduledAt.toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'America/Mexico_City',
  })

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <ModificarCitaForm
        token={token}
        patientName={appointment.patientName ?? ''}
        currentDateDisplay={currentDateDisplay}
        currentTimeDisplay={currentTimeDisplay}
      />
    </main>
  )
}

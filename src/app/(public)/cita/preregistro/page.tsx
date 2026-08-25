import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PreregistroClient } from './PreregistroClient'

export const metadata = { title: 'Completar información — ORL Viveros' }

export default async function PreregistroPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (!token) redirect('/?error=token-requerido')

  const appointment = await prisma.appointment.findUnique({
    where: { actionToken: token },
    select: { status: true, patientName: true, preregistroAt: true, patientId: true },
  })

  if (!appointment) redirect('/?error=enlace-invalido')
  if (appointment.status === 'cancelada') redirect('/?error=cita-cancelada')

  // Ya completó el preregistro — mostrar mensaje
  if (appointment.preregistroAt) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-8 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Información ya registrada</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ya completó su información previamente. El Dr. Viveros la tendrá disponible en su consulta.
          </p>
          <Link href="/" className="inline-block bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors">
            Volver al inicio
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-2">
            Consultorio ORL · Dr. Viveros
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Información previa a su consulta
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Completar este formulario agilizará su atención el día de la cita.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <PreregistroClient token={token} patientName={appointment.patientName ?? 'Paciente'} />
        </div>
      </div>
    </main>
  )
}

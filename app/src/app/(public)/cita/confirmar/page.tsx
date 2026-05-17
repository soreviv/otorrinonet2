import Link from 'next/link'
import { redirect } from 'next/navigation'
import { confirmAppointmentByToken } from '@/app/actions/appointments'

export const metadata = { title: 'Confirmar cita — ORL Viveros' }

async function handleConfirm(formData: FormData) {
  'use server'
  const token = formData.get('token') as string
  const result = await confirmAppointmentByToken(token)
  if (result.ok) {
    redirect('/cita-confirmada')
  } else {
    redirect(`/?error=${encodeURIComponent(result.error ?? 'error')}`)
  }
}

export default async function ConfirmarCitaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) redirect('/?error=token-requerido')

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">¿Confirmar su cita?</h1>
        <p className="text-slate-500 text-sm mb-6">
          Al confirmar le comunicamos al consultorio que asistirá en la fecha y hora acordadas.
        </p>
        <form action={handleConfirm} className="flex flex-col gap-3">
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Sí, confirmar mi cita
          </button>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancelar
          </Link>
        </form>
      </div>
    </main>
  )
}

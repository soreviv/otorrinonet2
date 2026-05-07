import { redirect } from 'next/navigation'
import { cancelAppointmentByToken } from '@/app/actions/appointments'

export const metadata = { title: 'Cancelar cita — ORL Viveros' }

async function handleCancel(formData: FormData) {
  'use server'
  const token = formData.get('token') as string
  const result = await cancelAppointmentByToken(token)
  if (result.ok) {
    redirect('/cita-cancelada')
  } else {
    redirect(`/?error=${encodeURIComponent(result.error ?? 'error')}`)
  }
}

export default async function CancelarCitaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) redirect('/?error=token-requerido')

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">¿Cancelar su cita?</h1>
        <p className="text-slate-500 text-sm mb-6">
          Esta acción no se puede deshacer. Si cambia de opinión podrá agendar una nueva cita en cualquier momento.
        </p>
        <form action={handleCancel} className="flex flex-col gap-3">
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Sí, cancelar mi cita
          </button>
          <a
            href="/"
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Volver sin cancelar
          </a>
        </form>
      </div>
    </main>
  )
}

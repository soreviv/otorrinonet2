import Link from 'next/link'
export const metadata = { title: 'Cita modificada — ORL Viveros' }

export default function CitaModificadaPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Cita reagendada</h1>
        <p className="text-slate-500 text-sm mb-6">
          Su cita ha sido actualizada. Recibirá un correo de confirmación con los nuevos detalles.
        </p>
        <Link
          href="/"
          className="inline-block bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}

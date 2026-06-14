import Link from 'next/link'

export const metadata = { title: 'Cita confirmada — ORL Viveros' }

export default async function CitaConfirmadaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-8 max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">¡Cita confirmada!</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Hemos registrado su confirmación. Le esperamos en el consultorio en la fecha y hora acordadas.
        </p>

        {token && (
          <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">¿Le toma 3 minutos?</p>
            <p className="text-xs text-sky-700 dark:text-sky-400">
              Complete su información previa en línea para que el Dr. Viveros la tenga lista cuando llegue a su consulta.
            </p>
            <Link
              href={`/cita/preregistro?token=${token}`}
              className="block text-center bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors mt-1"
            >
              Completar mi información →
            </Link>
          </div>
        )}

        <Link href="/" className="inline-block text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}

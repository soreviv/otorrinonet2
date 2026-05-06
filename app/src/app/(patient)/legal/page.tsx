import Link from 'next/link'

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Legal</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-10">
        Información legal del consultorio del Dr. Alejandro Viveros Domínguez.
      </p>
      <div className="flex flex-col gap-4">
        <Link
          href="/privacidad"
          className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-sky-300 dark:hover:border-sky-700 transition-colors group"
        >
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
              Aviso de Privacidad
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Tratamiento de datos personales conforme a la LFPDPPP
            </p>
          </div>
          <span className="text-slate-400 group-hover:text-sky-600 transition-colors">→</span>
        </Link>
        <Link
          href="/cookies"
          className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-sky-300 dark:hover:border-sky-700 transition-colors group"
        >
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
              Política de Cookies
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Uso de cookies y tecnologías de rastreo en el sitio web
            </p>
          </div>
          <span className="text-slate-400 group-hover:text-sky-600 transition-colors">→</span>
        </Link>
      </div>
    </div>
  )
}

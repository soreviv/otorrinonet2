import Link from 'next/link'
import { PublicHeader } from '@/components/sitio-publico/PublicHeader'
import { PublicFooter } from '@/components/sitio-publico/PublicFooter'
import { Calendar, Home, Stethoscope } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950 flex flex-col">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <p className="text-8xl font-black text-sky-100 dark:text-slate-800 select-none leading-none">404</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2 mb-3">
            Página no encontrada
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
            La dirección que buscas no existe o ha sido movida. Usa los enlaces de abajo para continuar.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-sky-300 dark:hover:border-sky-600 hover:text-sky-700 dark:hover:text-sky-400 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Home className="w-4 h-4" />
              Inicio
            </Link>
            <Link
              href="/servicios"
              className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-sky-300 dark:hover:border-sky-600 hover:text-sky-700 dark:hover:text-sky-400 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Stethoscope className="w-4 h-4" />
              Servicios
            </Link>
            <Link
              href="/agendar"
              className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Calendar className="w-4 h-4" />
              Agendar Cita
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

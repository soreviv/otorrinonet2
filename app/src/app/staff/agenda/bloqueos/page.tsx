import { getBloqueos } from '@/app/actions/agenda-bloqueos'
import { BloqueosClient } from './BloqueosClient'
import { CalendarOff } from 'lucide-react'

export const metadata = {
  title: 'Bloqueos de Agenda | Panel Staff',
}

export default async function BloqueosPage() {
  const bloqueos = await getBloqueos()

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <CalendarOff className="w-8 h-8 text-sky-600 dark:text-sky-400" strokeWidth={2.5} />
            Bloqueos de Agenda
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gestione periodos de vacaciones, congresos o incapacidades para evitar agendados automáticos.
          </p>
        </div>
      </div>

      <BloqueosClient bloqueosIniciales={bloqueos} />
    </div>
  )
}

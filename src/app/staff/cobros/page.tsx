import { getResumenFinanciero, listarCobros } from '@/app/actions/cobros'
import { CobrosClient } from './CobrosClient'
import { Wallet } from 'lucide-react'
import type { MetodoPago, TipoConsulta } from '@/lib/cobros-data'

export default async function CobrosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const periodo = (params.periodo as 'hoy' | 'semana' | 'mes') || 'mes'
  const metodoPago = params.metodoPago as MetodoPago | undefined
  const tipoConsulta = params.tipoConsulta as TipoConsulta | undefined

  const [resumen, cobros] = await Promise.all([
    getResumenFinanciero(periodo),
    listarCobros({ periodo, metodoPago, tipoConsulta }),
  ])

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-heading">
          <Wallet className="w-7 h-7 text-sky-600 dark:text-sky-400" />
          Cobros
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Resumen financiero e historial de cobros registrados.
        </p>
      </div>

      <CobrosClient
        resumen={resumen}
        cobros={cobros}
        periodo={periodo}
        metodoPago={metodoPago}
        tipoConsulta={tipoConsulta}
      />
    </div>
  )
}

import { getEstadisticasVentas } from '@/app/actions/tienda-admin'
import { EstadisticasTienda } from './EstadisticasTienda'
import { BarChart3 } from 'lucide-react'

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const periodo = (params.periodo as 'semana' | 'mes' | 'trimestre') || 'semana'

  const stats = await getEstadisticasVentas(periodo)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-heading">
          <BarChart3 className="w-7 h-7 text-sky-600 dark:text-sky-400" />
          Estadísticas de la Tienda
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Análisis de ventas, ingresos y productos más populares.
        </p>
      </div>

      <EstadisticasTienda data={stats} periodo={periodo} />
    </div>
  )
}

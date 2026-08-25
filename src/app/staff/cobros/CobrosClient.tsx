'use client'

import { useRouter } from 'next/navigation'
import { DollarSign, Receipt, Wallet, Filter, Download, FileCheck2 } from 'lucide-react'
import { TIPOS_CONSULTA, type MetodoPago, type TipoConsulta } from '@/lib/cobros-data'

interface Cobro {
  id: string
  fecha: string
  paciente: string
  tipoConsulta: string
  montoTotal: number
  metodoPago: string
  facturado: boolean
}

interface Resumen {
  total: number
  porMetodo: { efectivo: number; tarjeta: number; transferencia: number }
  numCobros: number
}

interface Props {
  resumen: Resumen
  cobros: Cobro[]
  periodo: 'hoy' | 'semana' | 'mes'
  metodoPago?: MetodoPago
  tipoConsulta?: TipoConsulta
}

const METODO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
}

function formatCurrency(centavos: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(centavos / 100)
}

function tipoLabel(v: string) {
  return TIPOS_CONSULTA.find(t => t.value === v)?.label || v
}

export function CobrosClient({ resumen, cobros, periodo, metodoPago, tipoConsulta }: Props) {
  const router = useRouter()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams()
    params.set('periodo', key === 'periodo' ? value : periodo)
    if (key === 'metodoPago' ? value : metodoPago) params.set('metodoPago', key === 'metodoPago' ? value : metodoPago!)
    if (key === 'tipoConsulta' ? value : tipoConsulta) params.set('tipoConsulta', key === 'tipoConsulta' ? value : tipoConsulta!)
    router.push(`?${params.toString()}`)
  }

  const exportUrl = (() => {
    const params = new URLSearchParams({ periodo })
    if (metodoPago) params.set('metodoPago', metodoPago)
    if (tipoConsulta) params.set('tipoConsulta', tipoConsulta)
    return `/api/staff/cobros/export?${params.toString()}`
  })()

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4" />
            Periodo:
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(['hoy', 'semana', 'mes'] as const).map(p => (
              <button
                key={p}
                onClick={() => updateParam('periodo', p)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                  periodo === p
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <select
            value={metodoPago || ''}
            onChange={e => updateParam('metodoPago', e.target.value)}
            className="text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="">Todos los métodos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>

          <select
            value={tipoConsulta || ''}
            onChange={e => updateParam('tipoConsulta', e.target.value)}
            className="text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="">Todos los tipos</option>
            {TIPOS_CONSULTA.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <a
          href={exportUrl}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 rounded-lg px-3 py-1.5 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar CSV
        </a>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total recaudado</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(resumen.total)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cobros registrados</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{resumen.numCobros}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-slate-500 dark:text-slate-400">
            <Wallet className="w-5 h-5" />
            <p className="text-sm font-medium">Por método de pago</p>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Efectivo</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(resumen.porMetodo.efectivo)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Tarjeta</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(resumen.porMetodo.tarjeta)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Transferencia</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(resumen.porMetodo.transferencia)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-center">Facturado</th>
              </tr>
            </thead>
            <tbody>
              {cobros.map(c => (
                <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {new Date(c.fecha).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{c.paciente}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{tipoLabel(c.tipoConsulta)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{METODO_LABELS[c.metodoPago] || c.metodoPago}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(c.montoTotal)}</td>
                  <td className="px-4 py-3 text-center">
                    {c.facturado ? (
                      <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 inline" />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cobros.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm italic">
              No hay cobros registrados en este período.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

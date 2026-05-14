'use client'

import { useRouter } from 'next/navigation'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  Calendar,
  Filter
} from 'lucide-react'

interface EstadisticasTiendaProps {
  data: {
    totalPedidos: number
    totalIngresos: number
    ticketPromedio: number
    pedidosPorDia: { fecha: string; total: number }[]
    productosMasVendidos: { nombre: string; cantidad: number }[]
  }
  periodo: 'semana' | 'mes' | 'trimestre'
}

export function EstadisticasTienda({ data, periodo }: EstadisticasTiendaProps) {
  const router = useRouter()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount / 100)
  }

  const handlePeriodoChange = (newPeriodo: string) => {
    router.push(`?periodo=${newPeriodo}`)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4" />
          Filtrar por:
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {(['semana', 'mes', 'trimestre'] as const).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodoChange(p)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                periodo === p
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {p === 'trimestre' ? '3 meses' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pedidos totales</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.totalPedidos}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ingresos totales</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(data.totalIngresos)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ticket promedio</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(data.ticketPromedio)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Ventas por día
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.pedidosPorDia}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="fecha"
                  fontSize={10}
                  tickFormatter={(val) => val.split('-').slice(1).reverse().join('/')}
                  stroke="#94a3b8"
                />
                <YAxis fontSize={10} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#38bdf8' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Pedidos"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0284c7', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#0284c7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Top 5 Productos más vendidos
          </h3>
          <div className="space-y-4">
            {data.productosMasVendidos.map((prod, index) => (
              <div key={index} className="flex items-center justify-between group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{prod.nombre}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{prod.cantidad}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">vendidos</span>
                  </div>
                </div>
              </div>
            ))}
            {data.productosMasVendidos.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm italic">
                No hay ventas registradas en este período.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { OrderStatus, Order } from '@/generated/prisma'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  LucideIcon
} from 'lucide-react'

const statusConfig: Record<OrderStatus, { label: string, color: string, icon: LucideIcon }> = {
  pendiente_pago: { label: 'Pendiente Pago', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  pagado: { label: 'Pagado', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  en_preparacion: { label: 'En Preparación', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Package },
  enviado: { label: 'Enviado', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: Truck },
  entregado: { label: 'Entregado', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', icon: XCircle },
  reembolsado: { label: 'Reembolsado', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: AlertCircle },
}

interface PedidosListProps {
  pedidos: Order[]
  total: number
  page: number
  pageSize: number
  currentStatus?: OrderStatus
}

export function PedidosList({ pedidos, total, page, pageSize, currentStatus }: PedidosListProps) {
  const router = useRouter()
  const searchParams = useSearchParams() || new URLSearchParams()
  const totalPages = Math.ceil(total / pageSize)

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status) params.set('status', status)
    else params.delete('status')
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount / 100)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusChange('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !currentStatus
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Todos
          </button>
          {Object.entries(statusConfig).map(([status, { label }]) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentStatus === status
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Total: <span className="font-semibold text-slate-900 dark:text-slate-100">{total}</span> pedidos
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Comprador</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {pedidos.map((pedido) => {
                const status = statusConfig[pedido.status as OrderStatus]
                const StatusIcon = status.icon
                return (
                  <tr key={pedido.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      #{pedido.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {new Date(pedido.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{pedido.compradorNombre}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{pedido.compradorEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(pedido.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/staff/tienda/pedidos/${pedido.id}`)}
                        className="p-2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {pedidos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No se encontraron pedidos con estos criterios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Página <span className="font-medium text-slate-900 dark:text-slate-100">{page}</span> de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

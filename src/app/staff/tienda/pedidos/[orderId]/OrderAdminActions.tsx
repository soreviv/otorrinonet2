'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrderStatus } from '@/generated/prisma'
import { cambiarStatusPedido, actualizarGuia } from '@/app/actions/tienda-admin'
import {
  Save,
  Truck,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { Order } from '@/generated/prisma'

interface OrderAdminActionsProps {
  order: Order
}

export function OrderAdminActions({ order }: OrderAdminActionsProps) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [notas, setNotas] = useState(order.notasInternas || '')
  const [guia, setGuia] = useState(order.guiaMensajeria || '')
  const [urlRastreo, setUrlRastreo] = useState(order.urlRastreo || '')

  const [loadingStatus, setLoadingStatus] = useState(false)
  const [loadingGuia, setLoadingGuia] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleUpdateStatus = async () => {
    setLoadingStatus(true)
    setMessage(null)
    const res = await cambiarStatusPedido(order.id, status, notas)
    setLoadingStatus(false)
    if (res.ok) {
      setMessage({ type: 'success', text: 'Estatus actualizado correctamente' })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Error al actualizar' })
    }
  }

  const handleUpdateGuia = async () => {
    setLoadingGuia(true)
    setMessage(null)
    const res = await actualizarGuia(order.id, guia, urlRastreo)
    setLoadingGuia(false)
    if (res.ok) {
      setMessage({ type: 'success', text: 'Guía de envío actualizada' })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Error al actualizar' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Status & Internal Notes */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Gestión del Pedido
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Estatus del Pedido
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            >
              <option value="pendiente_pago">Pendiente de Pago</option>
              <option value="pagado">Pagado</option>
              <option value="en_preparacion">En Preparación</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
              <option value="reembolsado">Reembolsado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Notas Internas (No visibles para el cliente)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none"
              placeholder="Ej: El cliente solicitó entrega después de las 3pm..."
            />
          </div>

          <button
            onClick={handleUpdateStatus}
            disabled={loadingStatus}
            className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            {loadingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Actualizar Estatus y Notas
          </button>
        </div>
      </div>

      {/* Shipping Info (only if not pickup) */}
      {order.shippingChoice === 'domicilio' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Información de Envío
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Número de Guía / Paquetería
              </label>
              <input
                type="text"
                value={guia}
                onChange={(e) => setGuia(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="Ej: FedEx 1234567890"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                URL de Rastreo
              </label>
              <input
                type="url"
                value={urlRastreo}
                onChange={(e) => setUrlRastreo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                placeholder="https://www.fedex.com/tracking?..."
              />
            </div>

            <button
              onClick={handleUpdateGuia}
              disabled={loadingGuia}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-slate-400 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              {loadingGuia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
              Guardar Datos de Envío
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium border ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}
    </div>
  )
}

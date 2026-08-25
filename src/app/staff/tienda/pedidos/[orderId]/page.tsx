import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getDetallePedido } from '@/app/actions/tienda-admin'
import { OrderAdminActions } from './OrderAdminActions'
import {
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  Package,
  ExternalLink,
  Calendar,
  Phone,
  Mail,
  Truck
} from 'lucide-react'
import { OrderStatus, Order, OrderItem, Product } from '@/generated/prisma'

const statusConfig: Record<OrderStatus, { label: string, color: string }> = {
  pendiente_pago: { label: 'Pendiente Pago', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  pagado: { label: 'Pagado', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  en_preparacion: { label: 'En Preparación', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  enviado: { label: 'Enviado', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  entregado: { label: 'Entregado', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  cancelado: { label: 'Cancelado', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
  reembolsado: { label: 'Reembolsado', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
}

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const order = await getDetallePedido(orderId)

  if (!order) notFound()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount / 100)
  }

  const currentStatus = statusConfig[order.status as OrderStatus]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/staff/tienda/pedidos"
            className="text-sky-600 dark:text-sky-400 flex items-center gap-1.5 text-sm font-medium hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a pedidos
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">
              Pedido #{order.id.slice(-8).toUpperCase()}
            </h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <Calendar className="w-4 h-4" />
            {new Date(order.createdAt).toLocaleString('es-MX', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Order Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer Info */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Información del Comprador</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Nombre</label>
                  <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">{order.compradorNombre}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${order.compradorEmail}`} className="text-sm text-sky-600 dark:text-sky-400 hover:underline">{order.compradorEmail}</a>
                </div>
                {order.compradorTelefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{order.compradorTelefono}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Método de Entrega</label>
                    <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                      {order.shippingChoice === 'pickup' ? 'Recoger en consultorio' : 'Envío a domicilio'}
                    </p>
                    {order.shippingChoice === 'domicilio' && (
                      <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {order.direccionCalle} {order.direccionNumero}<br />
                        {order.direccionColonia}, {order.direccionMunicipio}<br />
                        {order.direccionEstado}, CP {order.direccionCP}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Artículos del Pedido</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-3">Producto</th>
                    <th className="px-6 py-3 text-center">Cantidad</th>
                    <th className="px-6 py-3 text-right">Precio Unit.</th>
                    <th className="px-6 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(order as (Order & { items: (OrderItem & { product: Product | null })[] })).items.map((item) => (
                    <tr key={item.id} className="text-sm">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                            {item.product && item.product.imagenes && item.product.imagenes[0] ? (
                              <Image src={item.product.imagenes[0]} alt={item.nombreSnapshot} fill sizes="48px" className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{item.nombreSnapshot}</span>
                            {item.product && !item.product.activo && (
                              <span className="text-[10px] text-rose-500 font-medium uppercase tracking-tight">Producto Archivado</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{item.cantidad}</td>
                      <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{formatCurrency(item.precioUnitario)}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-100">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800/30 font-medium">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-slate-500 dark:text-slate-400">Subtotal</td>
                    <td className="px-6 py-3 text-right text-slate-900 dark:text-slate-100">{formatCurrency(order.subtotal)}</td>
                  </tr>
                  {order.costoEnvio > 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-2 text-right text-slate-500 dark:text-slate-400">Costo de Envío</td>
                      <td className="px-6 py-2 text-right text-slate-900 dark:text-slate-100">{formatCurrency(order.costoEnvio)}</td>
                    </tr>
                  )}
                  <tr className="text-lg font-bold">
                    <td colSpan={3} className="px-6 py-4 text-right text-slate-900 dark:text-slate-100">Total</td>
                    <td className="px-6 py-4 text-right text-sky-600 dark:text-sky-400">{formatCurrency(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Admin Actions */}
        <div className="space-y-6">
          <OrderAdminActions order={order} />

          {/* Payment Details */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              Detalles de Pago
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">Stripe Payment Intent</label>
                {order.stripePaymentIntentId ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">{order.stripePaymentIntentId}</span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 italic">No disponible</span>
                )}
              </div>
              {order.stripeChargeId && (
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">Stripe Charge ID</label>
                  <span className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">{order.stripeChargeId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping display if available */}
          {order.guiaMensajeria && (
            <div className="bg-sky-50 dark:bg-sky-900/20 p-6 rounded-xl border border-sky-100 dark:border-sky-800/50 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sky-900 dark:text-sky-100 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Guía de Envío
                </h3>
              </div>
              <p className="text-sm text-sky-800 dark:text-sky-300 font-mono bg-white dark:bg-slate-900 p-2 rounded border border-sky-200 dark:border-sky-800">
                {order.guiaMensajeria}
              </p>
              {order.urlRastreo && (
                <a
                  href={order.urlRastreo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Rastrear Paquete
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

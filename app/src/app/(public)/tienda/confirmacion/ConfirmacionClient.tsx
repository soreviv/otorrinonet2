'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCarrito } from '@/hooks/useCarrito'
import { CheckCircle2, Package, MapPin, Truck, Loader2, AlertTriangle, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Order, OrderItem } from '@/generated/prisma'

type ProductSnap = { nombre: string; imagenes: string[] }

interface OrderWithItems extends Order {
  items: (OrderItem & { product: ProductSnap | null })[]
}

interface ConfirmacionClientProps {
  order: OrderWithItems | null
}

export function ConfirmacionClient({ order }: ConfirmacionClientProps) {
  const { vaciar } = useCarrito()
  const router = useRouter()

  // Vaciar carrito al confirmar orden pagada
  useEffect(() => {
    if (order?.status === 'pagado') {
      vaciar()
    }
  }, [order?.status, vaciar])

  // El webhook puede tardar 1-5 s; si la orden sigue pendiente_pago, refrescar
  useEffect(() => {
    if (order?.status === 'pendiente_pago') {
      const t = setTimeout(() => router.refresh(), 3000)
      return () => clearTimeout(t)
    }
  }, [order?.status, router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount / 100)
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm px-6">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">No encontramos tu pedido</h2>
        <p className="text-slate-500 mb-8">Hubo un problema al recuperar los detalles de tu compra. Si recibiste un correo de confirmación, tu pedido está seguro.</p>
        <Link href="/tienda" className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-bold transition-all">
          Ir a la tienda
        </Link>
      </div>
    )
  }

  if (order.status === 'pendiente_pago') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm px-6">
        <Loader2 className="w-16 h-16 text-sky-600 animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Procesando tu pago...</h2>
        <p className="text-slate-500 mb-4">Estamos esperando la confirmación de Stripe. Esto puede tomar unos segundos.</p>
        <p className="text-sm text-slate-400">Recibirás un correo de confirmación en cuanto el pago sea aprobado.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Éxito */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-3xl p-8 md:p-12 text-center shadow-sm">
        <div className="w-20 h-20 bg-white dark:bg-emerald-800 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">¡Compra confirmada!</h2>
        <p className="text-lg text-emerald-800 dark:text-emerald-300">
          Hola <strong>{order.compradorNombre}</strong>, hemos recibido tu pedido con éxito.
        </p>
        <p className="text-emerald-600 dark:text-emerald-400 mt-2">
          Número de orden: <span className="font-mono font-bold">#{order.id.slice(-8).toUpperCase()}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Resumen */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-sky-600" />
            Resumen del pedido
          </h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700">
                  {item.product?.imagenes?.[0] ? (
                    <Image src={item.product.imagenes[0]} alt={item.nombreSnapshot} fill sizes="48px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{item.nombreSnapshot}</p>
                  <p className="text-xs text-slate-500">Cant: {item.cantidad} × {formatCurrency(item.precioUnitario)}</p>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
            <div className="border-t border-slate-50 dark:border-slate-800 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.costoEnvio > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Envío</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(order.costoEnvio)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg pt-2 border-t border-slate-50 dark:border-slate-800">
                <span className="font-black text-slate-900 dark:text-slate-100">Total</span>
                <span className="font-black text-sky-600 dark:text-sky-400">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Entrega */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            {order.shippingChoice === 'pickup' ? <MapPin className="w-5 h-5 text-sky-600" /> : <Truck className="w-5 h-5 text-sky-600" />}
            Información de entrega
          </h3>

          <div className="flex-1">
            {order.shippingChoice === 'pickup' ? (
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest text-[10px]">Recoger en consultorio</p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Puedes recoger tu pedido en el consultorio del Dr. Viveros en tu próxima visita o llamando previamente para coordinar.
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-xs text-slate-500">
                  <p className="font-bold mb-1">Dirección:</p>
                  <p>Hosp. Ángeles Metropolitano, Torre Diamante, Piso 2, Consultorio 201.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest text-[10px]">Envío a domicilio</p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Nos pondremos en contacto contigo a través de {order.compradorEmail} para coordinar el envío de tus productos.
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-xs text-slate-500">
                  <p className="font-bold mb-1">Enviar a:</p>
                  <p>{order.direccionCalle} {order.direccionNumero}</p>
                  <p>{order.direccionColonia}, {order.direccionMunicipio}</p>
                  <p>{order.direccionEstado}, CP {order.direccionCP}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
            <Link href="/tienda" className="flex items-center justify-center gap-2 text-sky-600 font-bold hover:gap-3 transition-all">
              Seguir comprando <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

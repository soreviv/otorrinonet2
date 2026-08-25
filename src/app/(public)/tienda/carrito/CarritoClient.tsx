'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCarrito } from '@/hooks/useCarrito'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft, Info, AlertTriangle } from 'lucide-react'
import { handleValidarStock } from './actions'

export function CarritoClient() {
  const { items, actualizarCantidad, eliminar, subtotal, permiteEnvio, loading } = useCarrito()
  const [validando, setValidando] = useState(false)
  const [alertas, setAlertas] = useState<{ productId: string; mensaje: string }[]>([])

  useEffect(() => {
    if (items.length > 0) {
      const validar = async () => {
        setValidando(true)
        const resultados = await handleValidarStock(items.map(i => ({ productId: i.productId, cantidad: i.cantidad })))
        const nuevasAlertas = resultados
          .filter(r => !r.disponible)
          .map(r => ({
            productId: r.productId,
            mensaje: r.motivo === 'sin_stock'
              ? `Stock insuficiente (Disponible: ${r.stockActual})`
              : r.motivo === 'inactivo'
                ? 'Producto no disponible actualmente'
                : 'Producto no encontrado'
          }))
        setAlertas(nuevasAlertas)
        setValidando(false)
      }
      validar()
    } else {
      // Usar un microtask o un estado derivado para evitar cascading renders si es posible,
      // pero aquí el linter se queja del setState directo.
      // Como queremos limpiar alertas si el carrito queda vacío:
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (alertas.length > 0) setAlertas([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount / 100)
  }

  if (loading) {
    return <div className="py-20 text-center animate-pulse text-slate-400">Cargando carrito...</div>
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Tu carrito está vacío</h2>
        <p className="text-slate-500 mb-8">Parece que aún no has añadido ningún producto.</p>
        <Link
          href="/tienda"
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Ir a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

      {/* Lista de Items */}
      <div className="lg:col-span-2 space-y-4">
        {!permiteEnvio && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-4 rounded-2xl flex items-start gap-3 mb-6">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Tu carrito contiene productos que solo se entregan en consultorio (ej. vacunas).
              <strong> Solo podrás elegir recoger en consultorio al finalizar tu compra.</strong>
            </p>
          </div>
        )}

        {items.map((item) => {
          const alerta = alertas.find(a => a.productId === item.productId)
          return (
            <div
              key={item.productId}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 md:p-6 flex gap-4 md:gap-6 transition-all ${
                alerta ? 'border-rose-200 bg-rose-50/30 dark:border-rose-900/50' : 'border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700">
                {item.imagen ? (
                  <Image src={item.imagen} alt={item.nombre} fill sizes="96px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate md:text-lg">
                    {item.nombre}
                  </h3>
                  <button
                    onClick={() => eliminar(item.productId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-slate-500 mb-4">{formatCurrency(item.precioUnitario)} c/u</p>

                {alerta && (
                  <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mb-3">
                    <AlertTriangle className="w-3.5 h-3.5" /> {alerta.mensaje}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => actualizarCantidad(item.productId, item.cantidad - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-sky-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-slate-100">{item.cantidad}</span>
                    <button
                      onClick={() => actualizarCantidad(item.productId, item.cantidad + 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-sky-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="font-black text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.precioUnitario * item.cantidad)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Resumen */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm sticky top-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Resumen de compra</h2>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 italic">
              <span>Envío</span>
              <span>Calculado en checkout</span>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-baseline">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Total</span>
              <div className="text-right">
                <span className="text-2xl font-black text-sky-600 dark:text-sky-400 block">{formatCurrency(subtotal)}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">MXN</span>
              </div>
            </div>
          </div>

          <Link
            href="/tienda/checkout"
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98] ${
              alertas.length > 0 || validando
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-200 dark:shadow-none'
            }`}
            onClick={(e) => (alertas.length > 0 || validando) && e.preventDefault()}
          >
            {validando ? 'Validando stock...' : 'Continuar al pago'}
            {!validando && <ArrowRight className="w-5 h-5" />}
          </Link>

          <Link
            href="/tienda"
            className="w-full flex items-center justify-center gap-2 py-4 text-slate-500 hover:text-sky-600 font-semibold transition-colors mt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  )
}

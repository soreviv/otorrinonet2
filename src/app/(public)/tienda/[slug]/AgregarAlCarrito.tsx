'use client'

import { useState } from 'react'
import { useCarrito, CarritoItem } from '@/hooks/useCarrito'
import { ShoppingCart, Check, AlertCircle, Info, Minus, Plus } from 'lucide-react'
import { DeliveryMode } from '@/generated/prisma'

interface AgregarAlCarritoProps {
  producto: {
    id: string
    nombre: string
    precioUnitario: number
    stock: number
    stockIlimitado: boolean
    modoEntrega: DeliveryMode
    imagenes: string[]
  }
}

export function AgregarAlCarrito({ producto }: AgregarAlCarritoProps) {
  const { agregar } = useCarrito()
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  const maxStock = producto.stockIlimitado ? 10 : Math.min(producto.stock, 10)
  const outOfStock = producto.stock === 0 && !producto.stockIlimitado

  const handleAgregar = () => {
    const item: CarritoItem = {
      productId: producto.id,
      nombre: producto.nombre,
      precioUnitario: producto.precioUnitario,
      cantidad: cantidad,
      imagen: producto.imagenes?.[0],
      modoEntrega: producto.modoEntrega
    }
    agregar(item)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  return (
    <div className="space-y-6">
      {producto.modoEntrega === 'pickup_only' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-4 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Solo disponible para recoger en consultorio. No aplica envío a domicilio.
          </p>
        </div>
      )}

      {outOfStock ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <p className="text-sm font-medium text-rose-800 dark:text-rose-300">
            Producto temporalmente agotado.
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shrink-0 h-12">
            <button
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              className="w-10 h-full flex items-center justify-center text-slate-500 hover:text-sky-600 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-bold text-slate-900 dark:text-slate-100">{cantidad}</span>
            <button
              onClick={() => setCantidad(Math.min(maxStock, cantidad + 1))}
              className="w-10 h-full flex items-center justify-center text-slate-500 hover:text-sky-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAgregar}
            disabled={agregado}
            className={`flex-1 flex items-center justify-center gap-2 h-12 px-8 rounded-xl font-bold transition-all active:scale-[0.98] ${
              agregado
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-200 dark:shadow-none'
            }`}
          >
            {agregado ? (
              <>
                <Check className="w-5 h-5" />
                ¡Agregado!
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Agregar al carrito
              </>
            )}
          </button>
        </div>
      )}

      {producto.stock <= 5 && !producto.stockIlimitado && producto.stock > 0 && (
        <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          ¡Últimas {producto.stock} unidades disponibles!
        </p>
      )}
    </div>
  )
}

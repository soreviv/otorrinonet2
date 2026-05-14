'use client'

import { useState, useTransition } from 'react'
import { ProductCategory } from '@/generated/prisma'
import { getProductosCatalogo } from '@/app/actions/tienda'
import { FiltroCategoria } from './FiltroCategoria'
import { ShoppingBag, Box } from 'lucide-react'
import Link from 'next/link'

type ProductoCatalogo = Awaited<ReturnType<typeof getProductosCatalogo>>[number]

interface CatalogoClientProps {
  initialProductos: ProductoCatalogo[]
}

const CATEGORY_LABELS: Record<string, string> = {
  dispositivo_medico: 'Dispositivo',
  suplemento_otc: 'Suplemento',
  paquete_consulta: 'Paquete',
  vacuna: 'Vacuna',
  otro: 'Otro',
}

export function CatalogoClient({ initialProductos }: CatalogoClientProps) {
  const [productos, setProductos] = useState(initialProductos)
  const [currentCategory, setCurrentCategory] = useState<ProductCategory | undefined>()
  const [isPending, startTransition] = useTransition()

  const handleCategoryChange = (category?: ProductCategory) => {
    setCurrentCategory(category)
    startTransition(async () => {
      const filtered = await getProductosCatalogo(category)
      setProductos(filtered)
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount / 100)
  }

  return (
    <div className="space-y-8">
      <FiltroCategoria currentCategory={currentCategory} onChange={handleCategoryChange} />

      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700" />
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <Box className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No hay productos disponibles</h3>
          <p className="text-slate-500">Intenta con otra categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {productos.map((producto) => {
            const outOfStock = producto.stock === 0 && !producto.stockIlimitado
            return (
              <div
                key={producto.id}
                className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
              >
                <Link href={`/tienda/${producto.slug}`} className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800 shrink-0">
                  {producto.imagenes?.[0] ? (
                    <img
                      src={producto.imagenes[0]}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingBag className="w-16 h-12" />
                    </div>
                  )}
                  {outOfStock && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-rose-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                        Sin existencias
                      </span>
                    </div>
                  )}
                </Link>
                <div className="p-5 md:p-6 flex flex-col flex-1">
                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded">
                      {CATEGORY_LABELS[producto.categoria] || producto.categoria}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {producto.nombre}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      {formatCurrency(producto.precioUnitario)}
                    </span>
                    <Link
                      href={`/tienda/${producto.slug}`}
                      className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        outOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-200 dark:shadow-none'
                      }`}
                    >
                      {outOfStock ? 'Ver detalles' : 'Ver producto'}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

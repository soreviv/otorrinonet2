import Link from 'next/link'
import { getProductosAdmin } from '@/app/actions/tienda-admin'
import { ProductosList } from './ProductosList'
import { Package, Plus } from 'lucide-react'

export default async function ProductosPage() {
  const productos = await getProductosAdmin({ incluirInactivos: true })

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-heading">
            <Package className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Catálogo de Productos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Administra los productos, stock y precios de la tienda.
          </p>
        </div>
        <Link
          href="/staff/tienda/productos/nuevo"
          className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm shadow-sky-200 dark:shadow-none"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Link>
      </div>

      <ProductosList productos={productos} />
    </div>
  )
}

import { ProductForm } from '../ProductForm'
import { Package } from 'lucide-react'

export default function NuevoProductoPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-heading">
          <Package className="w-7 h-7 text-sky-600 dark:text-sky-400" />
          Nuevo Producto
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Crea un nuevo producto para el catálogo de la tienda.
        </p>
      </div>

      <ProductForm />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Edit2,
  Archive,
  Box,
  Check,
  X,
  Loader2
} from 'lucide-react'
import { ProductCategory, Product } from '@/generated/prisma'
import { handleArchivar } from './actions'

const categoryLabels: Record<ProductCategory, string> = {
  dispositivo_medico: 'Dispositivo Médico',
  suplemento_otc: 'Suplemento OTC',
  paquete_consulta: 'Paquete de Consulta',
  vacuna: 'Vacuna',
  otro: 'Otro',
}

interface ProductosListProps {
  productos: Product[]
}

export function ProductosList({ productos }: ProductosListProps) {
  const router = useRouter()
  const [archivingId, setArchivingId] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount / 100)
  }

  const onArchivar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas archivar este producto? Dejará de ser visible en el catálogo.')) return

    setArchivingId(id)
    const res = await handleArchivar(id)
    setArchivingId(null)

    if (res.ok) {
      router.refresh()
    } else {
      alert(res.error || 'Error al archivar')
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4 text-right">Precio</th>
              <th className="px-6 py-4 text-center">Stock</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {productos.map((producto) => (
              <tr key={producto.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                      {producto.imagenes?.[0] ? (
                        <Image src={producto.imagenes[0]} alt={producto.nombre} fill sizes="40px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Box className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{producto.nombre}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{producto.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {categoryLabels[producto.categoria as ProductCategory]}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(producto.precioUnitario)}
                </td>
                <td className="px-6 py-4 text-center">
                  {producto.stockIlimitado ? (
                    <span className="text-xs font-medium text-sky-600 dark:text-sky-400">Ilimitado</span>
                  ) : (
                    <span className={`text-sm font-medium ${producto.stock <= 5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {producto.stock}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {producto.activo ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Check className="w-3 h-3" /> Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-500">
                      <X className="w-3 h-3" /> Inactivo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/staff/tienda/productos/${producto.id}/editar`}
                      className="p-2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    {producto.activo && (
                      <button
                        onClick={() => onArchivar(producto.id)}
                        disabled={archivingId === producto.id}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Archivar"
                      >
                        {archivingId === producto.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Archive className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  No hay productos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ProductCategory, DeliveryMode } from '@/generated/prisma'
import { crearProducto, actualizarProducto } from '@/app/actions/tienda-admin'
import {
  Save,
  Trash2,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Info
} from 'lucide-react'
import { ImagenUploader } from '@/components/tienda/ImagenUploader'

import { Product } from '@/generated/prisma'

interface ProductFormProps {
  initialData?: Product
  isEditing?: boolean
}

const categoryOptions = [
  { value: ProductCategory.dispositivo_medico, label: 'Dispositivo Médico' },
  { value: ProductCategory.suplemento_otc, label: 'Suplemento OTC' },
  { value: ProductCategory.paquete_consulta, label: 'Paquete de Consulta' },
  { value: ProductCategory.vacuna, label: 'Vacuna' },
  { value: ProductCategory.otro, label: 'Otro' },
]

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    slug: initialData?.slug || '',
    descripcion: initialData?.descripcion || '',
    categoria: (initialData?.categoria as ProductCategory) || ProductCategory.dispositivo_medico,
    modoEntrega: (initialData?.modoEntrega as DeliveryMode) || DeliveryMode.both,
    precioPesos: initialData ? initialData.precioUnitario / 100 : 0,
    stock: initialData?.stock || 0,
    stockIlimitado: initialData?.stockIlimitado || false,
    activo: initialData?.activo ?? true,
    imagenes: initialData?.imagenes || [],
    metaTitle: initialData?.metaTitle || '',
    metaDesc: initialData?.metaDesc || '',
    claveSat: initialData?.claveSat || '',
    claveUnidadSat: initialData?.claveUnidadSat || '',
  })

  const [slugEditedManually, setSlugEditedManually] = useState(isEditing)

  const handleNombreChange = (nombre: string) => {
    let newSlug = formData.slug
    if (!isEditing && !slugEditedManually) {
      newSlug = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .trim()
        .replace(/\s+/g, '-') // replace spaces with hyphens
    }
    setFormData(prev => ({ ...prev, nombre, slug: newSlug }))
  }

  const handleCategoriaChange = (categoria: ProductCategory) => {
    let modoEntrega = formData.modoEntrega
    if (categoria === ProductCategory.vacuna) {
      modoEntrega = DeliveryMode.pickup_only
    }
    setFormData(prev => ({ ...prev, categoria, modoEntrega }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      ...formData,
      precioUnitario: Math.round(formData.precioPesos * 100),
      claveSat: formData.claveSat || undefined,
      claveUnidadSat: formData.claveUnidadSat || undefined,
    }

    const res = isEditing
      ? await actualizarProducto(initialData!.id, payload)
      : await crearProducto(payload)

    setLoading(false)

    if (res.ok) {
      router.push('/staff/tienda/productos')
      router.refresh()
    } else {
      setError(res.error || 'Ocurrió un error al guardar')
    }
  }

  const addImage = (url: string) => {
    setFormData(prev => ({ ...prev, imagenes: [...prev.imagenes, url] }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 rounded-lg flex items-center gap-3 text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">Información General</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => handleNombreChange(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  placeholder="Ej: Irrigador Nasal Eléctrico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Slug (URL)</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value })
                    setSlugEditedManually(true)
                  }}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono text-sm"
                  placeholder="ej-irrigador-nasal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descripción</label>
                <textarea
                  rows={5}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none"
                  placeholder="Describe los beneficios y características del producto..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">Imágenes</h2>

            <div className="space-y-4">
              <ImagenUploader onUpload={addImage} disabled={loading} />

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.imagenes.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                    <Image src={url} alt={`Imagen ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1.5 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {formData.imagenes.length === 0 && (
                  <div className="col-span-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs">No hay imágenes añadidas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar content */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">Datos Fiscales (SAT)</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Clave Producto/Servicio
                <span className="ml-1 text-xs text-slate-400 font-normal">c_ClaveProdServ</span>
              </label>
              <input
                type="text"
                value={formData.claveSat}
                onChange={(e) => setFormData({ ...formData, claveSat: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono text-sm"
                placeholder="ej. 42271803"
                maxLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Clave Unidad
                <span className="ml-1 text-xs text-slate-400 font-normal">c_ClaveUnidad</span>
              </label>
              <input
                type="text"
                value={formData.claveUnidadSat}
                onChange={(e) => setFormData({ ...formData, claveUnidadSat: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono text-sm"
                placeholder="ej. H87 (pieza) · E48 (servicio)"
                maxLength={3}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">Atributos</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleCategoriaChange(e.target.value as ProductCategory)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Modo de Entrega</label>
                <select
                  value={formData.modoEntrega}
                  disabled={formData.categoria === ProductCategory.vacuna}
                  onChange={(e) => setFormData({ ...formData, modoEntrega: e.target.value as DeliveryMode })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all disabled:opacity-50"
                >
                  <option value={DeliveryMode.both}>Ambos (Envío y Recoger)</option>
                  <option value={DeliveryMode.shipping_only}>Solo Envío</option>
                  <option value={DeliveryMode.pickup_only}>Solo Recoger</option>
                </select>
                {formData.categoria === ProductCategory.vacuna && (
                  <p className="mt-1 text-[10px] text-amber-600 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Las vacunas solo pueden ser para recoger
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Precio (MXN)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.precioPesos}
                    onChange={(e) => setFormData({ ...formData, precioPesos: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.stockIlimitado}
                    onChange={(e) => setFormData({ ...formData, stockIlimitado: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Stock Ilimitado</span>
                </label>
              </div>

              {!formData.stockIlimitado && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Stock Disponible</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Producto Activo</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white py-3 rounded-lg font-bold transition-all shadow-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-semibold transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

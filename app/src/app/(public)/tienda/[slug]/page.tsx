import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicHeader } from '@/components/sitio-publico/PublicHeader'
import { PublicFooter } from '@/components/sitio-publico/PublicFooter'
import { Breadcrumbs } from '@/components/sitio-publico/Breadcrumbs'
import { getProductoPorSlug } from '@/app/actions/tienda'
import { AgregarAlCarrito } from './AgregarAlCarrito'
import { GaleriaProducto } from '@/components/tienda/GaleriaProducto'
import { Package, Truck, ShieldCheck } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductoPorSlug(slug)
  if (!product) return { title: 'Producto no encontrado' }

  return {
    title: product.metaTitle || `${product.nombre} | Tienda Dr. Viveros`,
    description: product.metaDesc || product.descripcion,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductoPorSlug(slug)

  if (!product) notFound()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount / 100)
  }

  const CATEGORY_LABELS: Record<string, string> = {
    dispositivo_medico: 'Dispositivo Médico',
    suplemento_otc: 'Suplemento OTC',
    paquete_consulta: 'Paquete de Consulta',
    vacuna: 'Vacuna',
    otro: 'Otro',
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">
      <PublicHeader />
      <Breadcrumbs items={[
        { label: 'Tienda', href: '/tienda' },
        { label: product.nombre }
      ]} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Columna Izquierda: Galería */}
          <div className="space-y-6">
            <GaleriaProducto
              imagenes={product.imagenes ?? []}
              nombre={product.nombre}
            />

            <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Calidad Garantizada</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Truck className="w-5 h-5 text-sky-600" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {product.modoEntrega === 'pickup_only' ? 'Solo recoger' : 'Envío disponible'}
                </span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Info y Compra */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600 bg-sky-50 dark:bg-sky-900/30 px-3 py-1 rounded-full">
                {CATEGORY_LABELS[product.categoria] || product.categoria}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-6 font-heading">
              {product.nombre}
            </h1>

            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {formatCurrency(product.precioUnitario)}
              </span>
              <span className="text-slate-400 text-sm font-medium">MXN</span>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none mb-10">
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {product.descripcion}
              </p>
            </div>

            <div className="mt-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm">
              <AgregarAlCarrito producto={product} />
            </div>

            {/* Ventajas adicionales mobile */}
            <div className="lg:hidden grid grid-cols-2 gap-4 mt-8">
              <div className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                <span className="text-[10px] font-bold uppercase text-slate-500">Calidad</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <Package className="w-5 h-5 text-sky-600" />
                <span className="text-[10px] font-bold uppercase text-slate-500">Stock</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

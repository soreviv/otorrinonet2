import { PublicHeader } from '@/components/sitio-publico/PublicHeader'
import { PublicFooter } from '@/components/sitio-publico/PublicFooter'
import { Breadcrumbs } from '@/components/sitio-publico/Breadcrumbs'
import { getProductosCatalogo } from '@/app/actions/tienda'
import { CatalogoClient } from './CatalogoClient'

export default async function TiendaPage() {
  const productos = await getProductosCatalogo()

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">
      <PublicHeader />
      <Breadcrumbs items={[{ label: 'Tienda', href: '/tienda' }]} />

      {/* Header de página */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <p className="text-[11px] uppercase tracking-widest text-sky-600 font-bold mb-3">Productos</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 font-heading">
            Tienda en línea
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Dispositivos médicos, suplementos y paquetes de consulta recomendados por el Dr. Viveros.
          </p>
        </div>
      </div>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <CatalogoClient initialProductos={productos} />
      </main>

      <PublicFooter />
    </div>
  )
}

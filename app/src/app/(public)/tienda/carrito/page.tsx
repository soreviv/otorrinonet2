import { PublicHeader } from '@/components/sitio-publico/PublicHeader'
import { PublicFooter } from '@/components/sitio-publico/PublicFooter'
import { Breadcrumbs } from '@/components/sitio-publico/Breadcrumbs'
import { CarritoClient } from './CarritoClient'

export const metadata = {
  title: 'Mi Carrito | Tienda Dr. Viveros',
  description: 'Revisa los productos en tu carrito antes de finalizar tu compra.',
}

export default function CarritoPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">
      <PublicHeader />
      <Breadcrumbs items={[{ label: 'Tienda', href: '/tienda' }, { label: 'Carrito' }]} />

      {/* Header de página */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <p className="text-[11px] uppercase tracking-widest text-sky-600 font-bold mb-3">Tu Compra</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 font-heading">
            Carrito de compras
          </h1>
        </div>
      </div>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CarritoClient />
      </main>

      <PublicFooter />
    </div>
  )
}

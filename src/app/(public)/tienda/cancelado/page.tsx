import { PublicHeader } from '@/components/sitio-publico/PublicHeader'
import { PublicFooter } from '@/components/sitio-publico/PublicFooter'
import { Breadcrumbs } from '@/components/sitio-publico/Breadcrumbs'
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Pago Cancelado | Tienda Dr. Viveros',
  robots: 'noindex, nofollow',
}

export default function CanceladoPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">
      <PublicHeader />
      <Breadcrumbs items={[{ label: 'Tienda', href: '/tienda' }, { label: 'Pago Cancelado' }]} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-xl mx-auto text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 md:p-16 shadow-sm">
          <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-rose-600">
            <XCircle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-4">Pago no completado</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-10">
            No se realizó ningún cargo a tu cuenta. Puedes intentar de nuevo o seguir explorando nuestro catálogo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tienda/carrito"
              className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-sky-200 dark:shadow-none"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al carrito
            </Link>
            <Link
              href="/tienda"
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-8 py-4 rounded-2xl font-bold transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              Ir a la tienda
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

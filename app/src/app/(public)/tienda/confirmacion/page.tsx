import { PublicHeader } from '@/components/sitio-publico/PublicHeader'
import { PublicFooter } from '@/components/sitio-publico/PublicFooter'
import { Breadcrumbs } from '@/components/sitio-publico/Breadcrumbs'
import { getOrdenByPaymentIntent } from '@/app/actions/tienda'
import { ConfirmacionClient } from './ConfirmacionClient'

export const metadata = {
  title: 'Confirmación de Compra | Tienda Dr. Viveros',
  robots: 'noindex, nofollow',
}

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string }>
}) {
  const { payment_intent } = await searchParams
  const order = payment_intent ? await getOrdenByPaymentIntent(payment_intent) : null

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">
      <PublicHeader />
      <Breadcrumbs items={[{ label: 'Tienda', href: '/tienda' }, { label: 'Confirmación' }]} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <ConfirmacionClient order={order} />
      </main>

      <PublicFooter />
    </div>
  )
}

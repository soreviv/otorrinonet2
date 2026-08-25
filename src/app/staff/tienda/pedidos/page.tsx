import { getPedidosAdmin } from '@/app/actions/tienda-admin'
import { PedidosList } from './PedidosList'
import { OrderStatus } from '@/generated/prisma'
import { ShoppingBag } from 'lucide-react'

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const status = params.status as OrderStatus | undefined
  const page = params.page ? parseInt(params.page as string) : 1

  const { pedidos, total } = await getPedidosAdmin({
    status,
    page,
    pageSize: 20
  })

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-heading">
            <ShoppingBag className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Pedidos de la Tienda
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gestiona los pedidos y el estatus de entrega.
          </p>
        </div>
      </div>

      <PedidosList
        pedidos={pedidos}
        total={total}
        page={page}
        pageSize={20}
        currentStatus={status}
      />
    </div>
  )
}

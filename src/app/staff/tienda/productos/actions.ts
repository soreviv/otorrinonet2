'use server'

import { archivarProducto } from '@/app/actions/tienda-admin'
import { revalidatePath } from 'next/cache'

export async function handleArchivar(id: string) {
  const res = await archivarProducto(id)
  if (res.ok) {
    revalidatePath('/staff/tienda/productos')
  }
  return res
}

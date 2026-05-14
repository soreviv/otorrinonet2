'use server'

import { validarStockCarrito } from '@/app/actions/tienda'

export async function handleValidarStock(items: { productId: string; cantidad: number }[]) {
  return await validarStockCarrito(items)
}

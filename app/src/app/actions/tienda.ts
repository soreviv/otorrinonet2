'use server'

import { prisma } from '@/lib/prisma'
import { ProductCategory } from '@/generated/prisma'

export async function getProductosCatalogo(categoria?: ProductCategory) {
  return await prisma.product.findMany({
    where: {
      activo: true,
      ...(categoria ? { categoria } : {})
    },
    select: {
      id: true,
      nombre: true,
      slug: true,
      descripcion: true,
      categoria: true,
      precioUnitario: true,
      imagenes: true,
      modoEntrega: true,
      stock: true,
      stockIlimitado: true,
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getProductoPorSlug(slug: string) {
  return await prisma.product.findUnique({
    where: { slug, activo: true }
  })
}

export async function validarStockCarrito(
  items: { productId: string; cantidad: number }[]
) {
  const resultados = await Promise.all(
    items.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, activo: true, stock: true, stockIlimitado: true }
      })

      if (!product) {
        return {
          productId: item.productId,
          disponible: false,
          stockActual: 0,
          motivo: 'no_encontrado' as const
        }
      }

      if (!product.activo) {
        return {
          productId: item.productId,
          disponible: false,
          stockActual: product.stock,
          motivo: 'inactivo' as const
        }
      }

      const tieneStock = product.stockIlimitado || product.stock >= item.cantidad

      return {
        productId: item.productId,
        disponible: tieneStock,
        stockActual: product.stock,
        motivo: tieneStock ? undefined : ('sin_stock' as const)
      }
    })
  )

  return resultados
}

export async function getOrdenByPaymentIntent(paymentIntentId: string) {
  return await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    include: {
      items: {
        include: {
          product: {
            select: {
              nombre: true,
              imagenes: true
            }
          }
        }
      }
    }
  })
}

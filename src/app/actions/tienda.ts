'use server'

import { prisma } from '@/lib/prisma'
import { ProductCategory, ShippingChoice } from '@/generated/prisma'
import { getStripe } from '@/lib/stripe'
import { CheckoutSchema } from '@/lib/schemas/tienda'

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

export async function crearOrdenYPaymentIntent(rawInput: unknown) {
  const parsed = CheckoutSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message }
  }
  const { items, datosComprador } = parsed.data

  // 1. Validar stock
  const stockCheck = await validarStockCarrito(items)
  const sinStock = stockCheck.find(r => !r.disponible)
  if (sinStock) {
    const motivo = sinStock.motivo === 'sin_stock' ? 'Sin existencias suficientes' : 'Producto no disponible'
    return { ok: false as const, error: motivo }
  }

  // 2. Obtener precios actuales desde BD (nunca confiar en el cliente)
  const productIds = items.map(i => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, activo: true },
    select: { id: true, nombre: true, precioUnitario: true, stock: true, stockIlimitado: true }
  })

  if (products.length !== items.length) {
    return { ok: false as const, error: 'Uno o más productos no están disponibles' }
  }

  const productMap = new Map(products.map(p => [p.id, p]))

  const orderItems = items.map(item => {
    const p = productMap.get(item.productId)!
    return {
      productId: item.productId,
      cantidad: item.cantidad,
      precioUnitario: p.precioUnitario,
      nombreSnapshot: p.nombre,
      subtotal: p.precioUnitario * item.cantidad,
    }
  })

  const subtotal = orderItems.reduce((acc, i) => acc + i.subtotal, 0)

  const costoEnvio =
    datosComprador.shippingChoice === 'domicilio'
      ? (Number(process.env.TIENDA_COSTO_ENVIO_CENTAVOS) || 15000)
      : 0

  const total = subtotal + costoEnvio

  // 3. Crear orden + PaymentIntent en una sola transacción optimista
  const order = await prisma.order.create({
    data: {
      compradorNombre: datosComprador.nombre,
      compradorEmail: datosComprador.email,
      compradorTelefono: datosComprador.telefono ?? null,
      shippingChoice: datosComprador.shippingChoice === 'pickup' ? ShippingChoice.pickup : ShippingChoice.domicilio,
      costoEnvio,
      subtotal,
      total,
      ...(datosComprador.shippingChoice === 'domicilio' && datosComprador.direccion
        ? {
            direccionCalle: datosComprador.direccion.calle,
            direccionNumero: datosComprador.direccion.numero,
            direccionColonia: datosComprador.direccion.colonia,
            direccionMunicipio: datosComprador.direccion.municipio,
            direccionEstado: datosComprador.direccion.estado,
            direccionCP: datosComprador.direccion.cp,
          }
        : {}),
      items: {
        create: orderItems,
      },
    },
  })

  // 4. Crear PaymentIntent en Stripe
  let paymentIntent: { id: string; client_secret: string | null }
  try {
    paymentIntent = await getStripe().paymentIntents.create({
      amount: total,
      currency: 'mxn',
      metadata: { orderId: order.id },
      receipt_email: datosComprador.email,
      description: `Pedido #${order.id.slice(-8).toUpperCase()} — ORL Viveros`,
    })
  } catch (err) {
    // Revertir orden si Stripe falla
    await prisma.order.delete({ where: { id: order.id } })
    console.error('[tienda] stripe.paymentIntents.create error', err)
    return { ok: false as const, error: 'Error al iniciar el pago. Intenta de nuevo.' }
  }

  // 5. Guardar stripePaymentIntentId
  await prisma.order.update({
    where: { id: order.id },
    data: { stripePaymentIntentId: paymentIntent.id },
  })

  return {
    ok: true as const,
    orderId: order.id,
    clientSecret: paymentIntent.client_secret!,
  }
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

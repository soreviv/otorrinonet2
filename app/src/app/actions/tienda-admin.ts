'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/dal'
import { productSchema, updateProductSchema } from '@/lib/schemas/tienda'
import { OrderStatus, ProductCategory, Order } from '@/generated/prisma'
import { startOfDay, endOfDay, subDays } from 'date-fns'

// --- Productos ---

export async function getProductosAdmin(opts?: { incluirInactivos?: boolean }) {
  await verifySession()

  return await prisma.product.findMany({
    where: opts?.incluirInactivos ? {} : { activo: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function crearProducto(data: unknown) {
  await verifySession()

  const validated = productSchema.safeParse(data)
  if (!validated.success) {
    return { ok: false, error: validated.error.issues[0].message }
  }

  const { categoria } = validated.data
  let { modoEntrega } = validated.data

  if (categoria === ProductCategory.vacuna) {
    modoEntrega = 'pickup_only'
  }

  try {
    const producto = await prisma.product.create({
      data: {
        ...validated.data,
        modoEntrega,
      },
    })
    revalidatePath('/staff/tienda/productos')
    return { ok: true, id: producto.id }
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return { ok: false, error: 'El slug ya está en uso. Por favor elige otro.' }
    }
    return { ok: false, error: 'Error al crear el producto' }
  }
}

export async function actualizarProducto(id: string, data: unknown) {
  await verifySession()

  const validated = updateProductSchema.safeParse(data)
  if (!validated.success) {
    return { ok: false, error: validated.error.issues[0].message }
  }

  try {
    await prisma.product.update({
      where: { id },
      data: validated.data,
    })
    revalidatePath('/staff/tienda/productos')
    revalidatePath(`/staff/tienda/productos/${id}/editar`)
    return { ok: true }
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return { ok: false, error: 'El slug ya está en uso. Por favor elige otro.' }
    }
    return { ok: false, error: 'Error al actualizar el producto' }
  }
}

export async function archivarProducto(id: string) {
  await verifySession()

  try {
    await prisma.product.update({
      where: { id },
      data: { activo: false },
    })
    revalidatePath('/staff/tienda/productos')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al archivar el producto' }
  }
}

export async function actualizarImagenesProducto(id: string, imagenes: string[]) {
  await verifySession()

  try {
    await prisma.product.update({
      where: { id },
      data: { imagenes },
    })
    revalidatePath(`/staff/tienda/productos/${id}/editar`)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al actualizar las imágenes' }
  }
}

// --- Pedidos ---

export async function getPedidosAdmin(opts: {
  status?: OrderStatus;
  desde?: Date;
  hasta?: Date;
  page?: number;
  pageSize?: number;
}): Promise<{ pedidos: Order[], total: number }> {
  await verifySession()

  const page = opts.page || 1
  const pageSize = opts.pageSize || 20
  const skip = (page - 1) * pageSize

  const where: { status?: OrderStatus; createdAt?: { gte?: Date; lte?: Date } } = {}
  if (opts.status) where.status = opts.status
  if (opts.desde || opts.hasta) {
    where.createdAt = {}
    if (opts.desde) where.createdAt.gte = startOfDay(opts.desde)
    if (opts.hasta) where.createdAt.lte = endOfDay(opts.hasta)
  }

  const [pedidos, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where })
  ])

  return { pedidos: pedidos as Order[], total }
}

export async function getDetallePedido(orderId: string) {
  await verifySession()

  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              imagenes: true,
              activo: true
            }
          }
        }
      }
    }
  })
}

export async function cambiarStatusPedido(
  orderId: string,
  nuevoStatus: OrderStatus,
  notasInternas?: string
) {
  await verifySession()

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: nuevoStatus,
        ...(notasInternas ? { notasInternas } : {})
      }
    })
    revalidatePath(`/staff/tienda/pedidos/${orderId}`)
    revalidatePath('/staff/tienda/pedidos')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al cambiar el estatus del pedido' }
  }
}

export async function actualizarGuia(
  orderId: string,
  guia: string,
  urlRastreo?: string
) {
  await verifySession()

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        guiaMensajeria: guia,
        urlRastreo: urlRastreo || null
      }
    })
    revalidatePath(`/staff/tienda/pedidos/${orderId}`)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al actualizar la guía de envío' }
  }
}

// --- Importación masiva ---

export type FilaImportacion = {
  nombre: string
  slug: string
  descripcion?: string
  categoria: string
  modoEntrega: string
  precioUnitario: number
  stock: number
  stockIlimitado: boolean
  activo: boolean
  imagenes: string[]
  claveSat?: string
  claveUnidadSat?: string
  metaTitle?: string
  metaDesc?: string
}

export type ResultadoFila = { ok: true; nombre: string } | { ok: false; nombre: string; error: string }

export async function importarProductos(filas: FilaImportacion[]): Promise<ResultadoFila[]> {
  await verifySession()

  const resultados: ResultadoFila[] = []

  for (const fila of filas) {
    const validated = productSchema.safeParse(fila)
    if (!validated.success) {
      resultados.push({ ok: false, nombre: fila.nombre, error: validated.error.issues[0].message })
      continue
    }

    const { categoria } = validated.data
    let { modoEntrega } = validated.data
    if (categoria === ProductCategory.vacuna) modoEntrega = 'pickup_only'

    try {
      await prisma.product.create({ data: { ...validated.data, modoEntrega } })
      resultados.push({ ok: true, nombre: fila.nombre })
    } catch (error: unknown) {
      if ((error as { code?: string }).code === 'P2002') {
        resultados.push({ ok: false, nombre: fila.nombre, error: 'El slug ya existe' })
      } else {
        resultados.push({ ok: false, nombre: fila.nombre, error: 'Error al crear el producto' })
      }
    }
  }

  revalidatePath('/staff/tienda/productos')
  return resultados
}

// --- Estadísticas ---

export async function getEstadisticasVentas(periodo: 'semana' | 'mes' | 'trimestre') {
  await verifySession()

  const dias = periodo === 'semana' ? 7 : periodo === 'mes' ? 30 : 90
  const fechaInicio = startOfDay(subDays(new Date(), dias - 1))

  const pedidos = await prisma.order.findMany({
    where: {
      createdAt: { gte: fechaInicio },
      status: { notIn: [OrderStatus.cancelado] }
    },
    select: {
      total: true,
      createdAt: true,
      items: {
        select: {
          nombreSnapshot: true,
          cantidad: true
        }
      }
    }
  })

  const totalPedidos = pedidos.length
  const totalIngresos = pedidos.reduce((acc, p) => acc + p.total, 0)
  const ticketPromedio = totalPedidos > 0 ? Math.round(totalIngresos / totalPedidos) : 0

  // pedidos por día (incluyendo ceros)
  const pedidosPorDiaMap: Record<string, number> = {}
  for (let i = 0; i < dias; i++) {
    const fecha = subDays(new Date(), i).toISOString().split('T')[0]
    pedidosPorDiaMap[fecha] = 0
  }

  pedidos.forEach(p => {
    const fecha = p.createdAt.toISOString().split('T')[0]
    if (pedidosPorDiaMap[fecha] !== undefined) {
      pedidosPorDiaMap[fecha]++
    }
  })

  const pedidosPorDia = Object.entries(pedidosPorDiaMap)
    .map(([fecha, total]) => ({ fecha, total }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  // productos más vendidos
  const productosMap: Record<string, number> = {}
  pedidos.forEach(p => {
    p.items.forEach(item => {
      productosMap[item.nombreSnapshot] = (productosMap[item.nombreSnapshot] || 0) + item.cantidad
    })
  })

  const productosMasVendidos = Object.entries(productosMap)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

  return {
    totalPedidos,
    totalIngresos,
    ticketPromedio,
    pedidosPorDia,
    productosMasVendidos
  }
}

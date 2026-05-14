import { z } from 'zod'
import { ProductCategory, DeliveryMode, OrderStatus } from '@/generated/prisma'

export const productSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  slug: z.string().min(1, 'El slug es requerido'),
  categoria: z.nativeEnum(ProductCategory),
  modoEntrega: z.nativeEnum(DeliveryMode),
  precioUnitario: z.number().int().min(0),
  stock: z.number().int().min(0),
  stockIlimitado: z.boolean().default(false),
  activo: z.boolean().default(true),
  imagenes: z.array(z.string()).default([]),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
})

export type ProductFormData = z.infer<typeof productSchema>

export const updateProductSchema = productSchema.partial()

export const changeStatusSchema = z.object({
  orderId: z.string(),
  nuevoStatus: z.nativeEnum(OrderStatus),
  notasInternas: z.string().optional(),
})

export const updateGuiaSchema = z.object({
  orderId: z.string(),
  guia: z.string().min(1),
  urlRastreo: z.string().url().optional().or(z.literal('')),
})

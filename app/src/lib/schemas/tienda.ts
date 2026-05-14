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

export const DireccionSchema = z.object({
  calle:      z.string().min(1, 'Ingresa la calle'),
  numero:     z.string().min(1, 'Ingresa el número'),
  colonia:    z.string().min(1, 'Ingresa la colonia'),
  municipio:  z.string().min(1, 'Ingresa el municipio o alcaldía'),
  estado:     z.string().min(1, 'Ingresa el estado'),
  cp:         z.string().regex(/^\d{5}$/, 'El CP debe tener 5 dígitos'),
})

export const DatosCompradorSchema = z.object({
  nombre:    z.string().min(2, 'Ingresa tu nombre completo'),
  email:     z.string().email('Correo electrónico inválido'),
  telefono:  z.string().optional(),
  shippingChoice: z.enum(['pickup', 'domicilio']),
  direccion: DireccionSchema.optional(),
}).refine(
  data => data.shippingChoice === 'pickup' || data.direccion !== undefined,
  { message: 'Se requiere dirección para envío a domicilio', path: ['direccion'] },
)

export const CarritoItemSchema = z.object({
  productId: z.string().cuid(),
  cantidad:  z.number().int().min(1).max(99),
})

export const CheckoutSchema = z.object({
  items:          z.array(CarritoItemSchema).min(1, 'El carrito está vacío'),
  datosComprador: DatosCompradorSchema,
})

export type DatosComprador    = z.infer<typeof DatosCompradorSchema>
export type CarritoItemInput  = z.infer<typeof CarritoItemSchema>
export type CheckoutInput     = z.infer<typeof CheckoutSchema>

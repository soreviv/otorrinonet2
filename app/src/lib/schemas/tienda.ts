import { z } from 'zod'

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

export const ProductoFormSchema = z.object({
  nombre:         z.string().min(1, 'El nombre es requerido'),
  slug:           z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo letras minúsculas, números y guiones').optional(),
  descripcion:    z.string().optional(),
  categoria:      z.enum(['dispositivo_medico', 'suplemento_otc', 'paquete_consulta', 'vacuna', 'otro']),
  modoEntrega:    z.enum(['pickup_only', 'shipping_only', 'both']).optional(),
  precioUnitario: z.number().int().min(1, 'El precio debe ser mayor a cero'),
  stock:          z.number().int().min(0).optional(),
  stockIlimitado: z.boolean().optional(),
  activo:         z.boolean().optional(),
  imagenes:       z.array(z.string().url()).optional(),
  metaTitle:      z.string().max(70).optional(),
  metaDesc:       z.string().max(160).optional(),
})

export type DatosComprador = z.infer<typeof DatosCompradorSchema>
export type CarritoItem    = z.infer<typeof CarritoItemSchema>
export type CheckoutInput  = z.infer<typeof CheckoutSchema>
export type ProductoForm   = z.infer<typeof ProductoFormSchema>

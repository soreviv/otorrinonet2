import { describe, it, expect } from 'vitest'
import { CheckoutSchema, CarritoItemSchema, DireccionSchema } from '@/lib/schemas/tienda'

describe('Zod Schemas - Tienda', () => {

  describe('DireccionSchema', () => {
    it('debe fallar si el CP tiene 4 dígitos', () => {
      const result = DireccionSchema.safeParse({
        calle: 'Av. Siempre Viva',
        numero: '742',
        colonia: 'Springfield',
        municipio: 'Springfield',
        estado: 'Illinois',
        cp: '1234'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El CP debe tener 5 dígitos')
      }
    })
  })

  describe('CarritoItemSchema', () => {
    it('debe fallar si la cantidad es 0', () => {
      const result = CarritoItemSchema.safeParse({
        productId: 'clpxxxxxxxx0000000000000000',
        cantidad: 0
      })
      expect(result.success).toBe(false)
    })

    it('debe fallar si la cantidad es 100 (máximo 99)', () => {
      const result = CarritoItemSchema.safeParse({
        productId: 'clpxxxxxxxx0000000000000000',
        cantidad: 100
      })
      expect(result.success).toBe(false)
    })
  })

  describe('CheckoutSchema', () => {
    const validAddress = {
      calle: 'Av. Siempre Viva',
      numero: '742',
      colonia: 'Springfield',
      municipio: 'Springfield',
      estado: 'Illinois',
      cp: '12345'
    }

    const validItems = [
      { productId: 'clpxxxxxxxx0000000000000000', cantidad: 1 }
    ]

    it('debe ser válido con envío a domicilio y dirección completa', () => {
      const result = CheckoutSchema.safeParse({
        items: validItems,
        datosComprador: {
          nombre: 'Homer Simpson',
          email: 'homer@springfield.com',
          shippingChoice: 'domicilio',
          direccion: validAddress
        }
      })
      expect(result.success).toBe(true)
    })

    it('debe fallar si es envío a domicilio pero no tiene dirección', () => {
      const result = CheckoutSchema.safeParse({
        items: validItems,
        datosComprador: {
          nombre: 'Homer Simpson',
          email: 'homer@springfield.com',
          shippingChoice: 'domicilio'
          // dirección ausente
        }
      })
      expect(result.success).toBe(false)
    })

    it('debe ser válido con pickup sin dirección', () => {
      const result = CheckoutSchema.safeParse({
        items: validItems,
        datosComprador: {
          nombre: 'Homer Simpson',
          email: 'homer@springfield.com',
          shippingChoice: 'pickup'
        }
      })
      expect(result.success).toBe(true)
    })

    it('debe fallar si el email es inválido', () => {
      const result = CheckoutSchema.safeParse({
        items: validItems,
        datosComprador: {
          nombre: 'Homer Simpson',
          email: 'no-es-email',
          shippingChoice: 'pickup'
        }
      })
      expect(result.success).toBe(false)
    })
  })
})

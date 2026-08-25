import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCarrito, type CarritoItem } from '@/hooks/useCarrito'
import { DeliveryMode } from '@/generated/prisma'

describe('useCarrito hook', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  const mockProduct: CarritoItem = {
    productId: 'prod_1',
    nombre: 'Producto Test',
    precioUnitario: 10000, // 100 MXN
    cantidad: 1,
    modoEntrega: DeliveryMode.both
  }

  it('debe agregar un producto nuevo', () => {
    const { result } = renderHook(() => useCarrito())

    act(() => {
      result.current.agregar(mockProduct)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]).toEqual(mockProduct)
  })

  it('debe incrementar la cantidad si el producto ya existe', async () => {
    const { result } = renderHook(() => useCarrito())

    await act(async () => {
      result.current.agregar(mockProduct)
    })

    await act(async () => {
      result.current.agregar(mockProduct)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].cantidad).toBe(2)
  })

  it('debe eliminar el ítem si actualizarCantidad se llama con 0', async () => {
    const { result } = renderHook(() => useCarrito())

    await act(async () => {
      result.current.agregar(mockProduct)
    })

    await act(async () => {
      result.current.actualizarCantidad('prod_1', 0)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('debe eliminar por productId', async () => {
    const { result } = renderHook(() => useCarrito())

    await act(async () => {
      result.current.agregar(mockProduct)
    })

    await act(async () => {
      result.current.eliminar('prod_1')
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('debe vaciar el carrito', async () => {
    const { result } = renderHook(() => useCarrito())

    await act(async () => {
      result.current.agregar(mockProduct)
    })

    await act(async () => {
      result.current.vaciar()
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('debe calcular el subtotal correctamente con 2 ítems', async () => {
    const { result } = renderHook(() => useCarrito())

    await act(async () => {
      result.current.agregar({ ...mockProduct, productId: 'p1', precioUnitario: 100, cantidad: 2 })
    })

    await act(async () => {
      result.current.agregar({ ...mockProduct, productId: 'p2', precioUnitario: 200, cantidad: 1 })
    })

    expect(result.current.subtotal).toBe(400) // (100*2) + (200*1)
  })

  it('debe devolver permiteEnvio=false si hay un ítem pickup_only', async () => {
    const { result } = renderHook(() => useCarrito())

    await act(async () => {
      result.current.agregar({ ...mockProduct, modoEntrega: DeliveryMode.pickup_only })
    })

    expect(result.current.permiteEnvio).toBe(false)
  })

  it('no debe lanzar excepción si localStorage tiene JSON inválido', () => {
    localStorage.setItem('otorrinonet_carrito', 'invalid-json')
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useCarrito())

    expect(result.current.items).toEqual([])
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})

'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'orl-carrito'

export interface ItemCarrito {
  productId:     string
  nombre:        string
  precioUnitario: number  // centavos
  imagen:        string | null
  cantidad:      number
  modoEntrega:   'pickup_only' | 'shipping_only' | 'both'
}

function leerStorage(): ItemCarrito[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function escribirStorage(items: ItemCarrito[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useCarrito() {
  const [items, setItems] = useState<ItemCarrito[]>([])

  useEffect(() => {
    setItems(leerStorage())
  }, [])

  const agregar = useCallback((producto: Omit<ItemCarrito, 'cantidad'>, cantidad = 1) => {
    setItems(prev => {
      const existe = prev.find(i => i.productId === producto.productId)
      const next = existe
        ? prev.map(i => i.productId === producto.productId
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i)
        : [...prev, { ...producto, cantidad }]
      escribirStorage(next)
      return next
    })
  }, [])

  const actualizar = useCallback((productId: string, cantidad: number) => {
    setItems(prev => {
      const next = cantidad <= 0
        ? prev.filter(i => i.productId !== productId)
        : prev.map(i => i.productId === productId ? { ...i, cantidad } : i)
      escribirStorage(next)
      return next
    })
  }, [])

  const eliminar = useCallback((productId: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.productId !== productId)
      escribirStorage(next)
      return next
    })
  }, [])

  const vaciar = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setItems([])
  }, [])

  const subtotal = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)

  // true si todos los items del carrito permiten envío a domicilio
  const permiteEnvio = items.every(i => i.modoEntrega !== 'pickup_only')

  return { items, subtotal, totalItems, permiteEnvio, agregar, actualizar, eliminar, vaciar }
}

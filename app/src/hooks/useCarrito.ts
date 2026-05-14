'use client'

import { useState, useEffect } from 'react'
import { DeliveryMode } from '@/generated/prisma'

export interface CarritoItem {
  productId: string
  nombre: string
  precioUnitario: number
  cantidad: number
  imagen?: string
  modoEntrega: DeliveryMode
}

export function useCarrito() {
  const [items, setItems] = useState<CarritoItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('otorrinonet_carrito')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Solo actualizar si es diferente para evitar cascading renders innecesarios
        // Aunque useEffect corre después del render, setItems directo a veces molesta al linter
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(parsed)
      } catch (e) {
        console.error('Error loading cart', e)
      }
    }
    setLoading(false)
  }, [])

  const save = (newItems: CarritoItem[]) => {
    setItems(newItems)
    localStorage.setItem('otorrinonet_carrito', JSON.stringify(newItems))
  }

  const agregar = (item: CarritoItem) => {
    const existing = items.find(i => i.productId === item.productId)
    if (existing) {
      save(items.map(i => i.productId === item.productId ? { ...i, cantidad: i.cantidad + item.cantidad } : i))
    } else {
      save([...items, item])
    }
  }

  const actualizarCantidad = (productId: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminar(productId)
    } else {
      save(items.map(i => i.productId === productId ? { ...i, cantidad } : i))
    }
  }

  const eliminar = (productId: string) => {
    save(items.filter(i => i.productId !== productId))
  }

  const vaciar = () => {
    save([])
  }

  const subtotal = items.reduce((acc, i) => acc + (i.precioUnitario * i.cantidad), 0)
  const permiteEnvio = !items.some(i => i.modoEntrega === DeliveryMode.pickup_only)

  return {
    items,
    loading,
    agregar,
    actualizarCantidad,
    eliminar,
    vaciar,
    subtotal,
    permiteEnvio
  }
}

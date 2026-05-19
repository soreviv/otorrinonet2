'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'

interface GaleriaProductoProps {
  imagenes: string[]
  nombre: string
}

export function GaleriaProducto({ imagenes, nombre }: GaleriaProductoProps) {
  const [activa, setActiva] = useState(0)

  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="aspect-square rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm flex items-center justify-center text-slate-200">
        <ShoppingBag className="w-32 h-32" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <Image
          src={imagenes[activa]}
          alt={nombre}
          fill
          priority
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {imagenes.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {imagenes.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiva(i)}
              className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                i === activa
                  ? 'border-sky-500 shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <Image
                src={img}
                alt={`${nombre} foto ${i + 1}`}
                fill
                className="object-cover"
                sizes="15vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

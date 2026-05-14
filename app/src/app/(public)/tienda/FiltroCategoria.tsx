'use client'

import { ProductCategory } from '@/generated/prisma'

interface FiltroCategoriaProps {
  currentCategory?: string
  onChange: (category?: ProductCategory) => void
}

const CATEGORIES = [
  { value: undefined, label: 'Todos' },
  { value: ProductCategory.dispositivo_medico, label: 'Dispositivos' },
  { value: ProductCategory.suplemento_otc, label: 'Suplementos' },
  { value: ProductCategory.paquete_consulta, label: 'Paquetes' },
  { value: ProductCategory.vacuna, label: 'Vacunas' },
  { value: ProductCategory.otro, label: 'Otros' },
]

export function FiltroCategoria({ currentCategory, onChange }: FiltroCategoriaProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.label}
          onClick={() => onChange(cat.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            currentCategory === cat.value
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}

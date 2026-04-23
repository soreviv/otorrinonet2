'use client'

import { Stethoscope, Ear, Wind, Flower2, Scissors, Activity } from 'lucide-react'
import type { Service, ServiceIcon } from '@/lib/sitio-publico-types'

const ICON_MAP: Record<ServiceIcon, React.ComponentType<{ className?: string }>> = {
  stethoscope: Stethoscope,
  ear: Ear,
  nose: Wind,
  allergen: Flower2,
  surgery: Scissors,
  balance: Activity,
}

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = ICON_MAP[service.icon] ?? Stethoscope

  return (
    <div className="group flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-800 hover:shadow-lg hover:shadow-sky-50/60 dark:hover:shadow-sky-950/60 transition-all duration-300 cursor-default">
      <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950 group-hover:bg-sky-100 dark:group-hover:bg-sky-900 flex items-center justify-center transition-colors duration-300">
        <Icon className="w-5 h-5 text-sky-600 dark:text-sky-400" />
      </div>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">{service.name}</span>
    </div>
  )
}

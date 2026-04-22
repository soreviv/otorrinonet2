import { Stethoscope, Ear, Wind, Flower2, Scissors, Activity } from 'lucide-react'
import type { Service, ServiceIcon } from '../types'

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
    <div className="group flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-white border border-slate-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50/60 transition-all duration-300 cursor-default">
      <div className="w-12 h-12 rounded-xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors duration-300">
        <Icon className="w-5 h-5 text-teal-600" />
      </div>
      <span className="text-xs font-semibold text-slate-700 leading-tight">{service.name}</span>
    </div>
  )
}

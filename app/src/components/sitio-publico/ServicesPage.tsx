'use client'

import Link from 'next/link'
import { PublicHeader } from './PublicHeader'
import { PublicFooter } from './PublicFooter'
import {
  Stethoscope, Ear, Syringe, Flower2, Scissors, Activity,
  Calendar, ChevronRight,
} from 'lucide-react'
import type { ServicesPageProps, ServiceIcon } from '@/lib/sitio-publico-types'
import { Breadcrumbs } from './Breadcrumbs'

const ICON_MAP: Record<ServiceIcon, React.ComponentType<{ className?: string }>> = {
  stethoscope: Stethoscope,
  ear: Ear,
  syringe: Syringe,
  allergen: Flower2,
  surgery: Scissors,
  balance: Activity,
}

const ACCENTS = [
  'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900',
  'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900',
  'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900',
  'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900',
  'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900',
  'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900',
]

export function ServicesPage({ services, doctorProfile }: ServicesPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">

      <PublicHeader />

      <Breadcrumbs items={[{ label: 'Servicios', href: '/servicios' }]} />

      {/* ── PAGE HEADER ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-3">Especialidades</p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Servicios de {doctorProfile.fullName}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-[15px] leading-relaxed">
              Atención integral en otorrinolaringología para toda la familia, con diagnóstico preciso y tratamiento basado en evidencia.
            </p>
          </div>
        </div>
      </div>

      {/* ── SERVICES GRID ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {services.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service, i) => {
                const Icon = ICON_MAP[service.icon] ?? Stethoscope
                const accent = ACCENTS[i % ACCENTS.length]
                return (
                  <div
                    key={service.id}
                    className="group flex flex-col gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-sky-200 dark:hover:border-sky-800 hover:shadow-lg hover:shadow-sky-50/60 dark:hover:shadow-sky-950/60 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {service.name}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                        {service.shortDescription}
                      </p>
                    </div>

                    {service.id === 'vacunacion' ? (
                      <Link
                        href="/vacunacion"
                        className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors group/btn"
                      >
                        Ver guía de vacunación
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                      </Link>
                    ) : (
                      <Link
                        href="/agendar"
                        className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors group/btn"
                      >
                        Agendar consulta
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-12 relative overflow-hidden bg-sky-600 rounded-2xl p-8 md:p-10 text-center">
              <div className="absolute inset-0 opacity-20 pointer-events-none dots-overlay-24" />
              <div className="relative">
                <p className="text-[11px] font-bold text-sky-100 uppercase tracking-widest mb-3">Primera consulta disponible esta semana</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                  ¿No sabes qué especialidad necesitas?
                </h2>
                <p className="text-sky-100 text-sm leading-relaxed mb-6 max-w-md mx-auto">
                  Agenda una consulta general y el Dr. {doctorProfile.fullName.split(' ')[1]} evaluará tu caso y te orientará hacia el tratamiento adecuado.
                </p>
                <Link
                  href="/agendar"
                  className="inline-flex items-center gap-2 bg-white text-sky-700 font-bold px-7 py-3.5 rounded-xl transition-all hover:bg-sky-50 hover:shadow-xl active:scale-[0.98] text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar Consulta General
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <p className="text-sm">No hay servicios disponibles en este momento.</p>
          </div>
        )}
      </div>

      <PublicFooter />

    </div>
  )
}

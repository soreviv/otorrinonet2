'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Stethoscope, Ear, Syringe, Flower2, Scissors, Activity,
  Calendar, Menu, X, ChevronRight, ArrowLeft,
} from 'lucide-react'
import type { ServicesPageProps, ServiceIcon } from '@/lib/sitio-publico-types'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Perfil', href: '/perfil' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Ubicación', href: '/ubicacion' },
  { label: 'Contacto', href: '/contacto' },
]

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

export function ServicesPage({ services, doctorProfile, onBookAppointment }: ServicesPageProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 dark:bg-slate-900/95 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center group">
              <img src="/assets/logo-consultorio.png" alt="Dr. Alejandro Viveros Domínguez" width={40} height={40} className="h-10 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    href === '/servicios'
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400'
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onBookAppointment}
                className="hidden sm:flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-sky-200 dark:shadow-sky-900"
              >
                <Calendar className="w-3.5 h-3.5" />
                Agendar Cita
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400 dark:hover:text-white"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-4 pt-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-slate-600 dark:text-slate-300 font-medium py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0"
              >
                {label}
              </a>
            ))}
            <button
              onClick={onBookAppointment}
              className="mt-3 flex items-center justify-center gap-2 bg-sky-600 text-white text-sm font-semibold px-4 py-3 rounded-xl"
            >
              <Calendar className="w-4 h-4" />
              Agendar Cita
            </button>
          </div>
        )}
      </nav>

      {/* ── BREADCRUMB ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Inicio
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Servicios</span>
          </div>
        </div>
      </div>

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
                      <button
                        onClick={onBookAppointment}
                        className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors group/btn"
                      >
                        Agendar consulta
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-12 relative overflow-hidden bg-sky-600 rounded-2xl p-8 md:p-10 text-center">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
              />
              <div className="relative">
                <p className="text-[11px] font-bold text-sky-100 uppercase tracking-widest mb-3">Primera consulta disponible esta semana</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                  ¿No sabes qué especialidad necesitas?
                </h2>
                <p className="text-sky-100 text-sm leading-relaxed mb-6 max-w-md mx-auto">
                  Agenda una consulta general y el Dr. {doctorProfile.fullName.split(' ')[1]} evaluará tu caso y te orientará hacia el tratamiento adecuado.
                </p>
                <button
                  onClick={onBookAppointment}
                  className="inline-flex items-center gap-2 bg-white text-sky-700 font-bold px-7 py-3.5 rounded-xl transition-all hover:bg-sky-50 hover:shadow-xl active:scale-[0.98] text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar Consulta General
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <p className="text-sm">No hay servicios disponibles en este momento.</p>
          </div>
        )}
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/" className="flex items-center group">
              <div className="bg-white rounded-xl p-1.5">
                <img src="/assets/logo-consultorio.png" alt="Dr. Alejandro Viveros Domínguez" width={32} height={32} className="h-8 w-auto" />
              </div>
            </Link>
            <p className="text-[11px] text-slate-600">© 2026 Dr. Alejandro Viveros</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

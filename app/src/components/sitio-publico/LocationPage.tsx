'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Calendar, Menu, X, MapPin,
  Phone, MessageCircle, Mail, Clock, Navigation,
  ChevronRight, ArrowLeft, ExternalLink,
} from 'lucide-react'
import type { LocationPageProps } from '@/lib/sitio-publico-types'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Perfil', href: '/perfil' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Ubicación', href: '/ubicacion' },
  { label: 'Contacto', href: '/contacto' },
]

export function LocationPage({ contactInfo, onBookAppointment }: LocationPageProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const isClosed = (hours: string) => hours.toLowerCase() === 'cerrado'

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
                    href === '/ubicacion'
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
            <a href="/" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Inicio
            </a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Ubicación y Horarios</span>
          </div>
        </div>
      </div>

      {/* ── PAGE HEADER ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-2">Consultorio</p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                Ubicación y Horarios
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{contactInfo.clinicName}</p>
            </div>
            <button
              onClick={onBookAppointment}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm flex-shrink-0"
            >
              <Calendar className="w-4 h-4" />
              Agendar Cita
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          <div className="lg:col-span-3 flex flex-col gap-5">
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-200 dark:bg-slate-800 aspect-video lg:aspect-auto lg:h-[420px]">
              <iframe
                src={contactInfo.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación del consultorio"
                className="w-full h-full"
              />
            </div>

            <a
              href={contactInfo.googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Cómo llegar</p>
                  <p className="text-xs text-slate-400">Abrir en Google Maps</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
            </a>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-5">

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Dirección</h2>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{contactInfo.address.street}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{contactInfo.address.neighborhood}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {contactInfo.address.city}, {contactInfo.address.state} {contactInfo.address.postalCode}
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">{contactInfo.address.country}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Horarios de Atención</h2>
              </div>
              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                {contactInfo.schedule.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{entry.days}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isClosed(entry.hours)
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        : 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                    }`}>
                      {entry.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Contacto Directo</h2>
              <div className="flex flex-col gap-3">
                <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-50 dark:group-hover:bg-sky-950 flex items-center justify-center transition-colors flex-shrink-0">
                    <Phone className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors font-medium">
                    {contactInfo.phone}
                  </span>
                </a>
                <a
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-50 dark:group-hover:bg-sky-950 flex items-center justify-center transition-colors flex-shrink-0">
                    <MessageCircle className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors font-medium">
                    WhatsApp
                  </span>
                </a>
                <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-50 dark:group-hover:bg-sky-950 flex items-center justify-center transition-colors flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors font-medium">
                    {contactInfo.email}
                  </span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-8 mt-4">
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

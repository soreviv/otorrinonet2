'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PublicFooter } from './PublicFooter'
import {
  Star, Calendar, ChevronRight,
  ArrowUpRight, MessageCircle, Menu, X,
} from 'lucide-react'
import type { HomePageProps, GoogleRatingSummary } from '@/lib/sitio-publico-types'
import { ServiceCard } from './ServiceCard'
import { ReviewCard } from './ReviewCard'

function RatingSummaryBadge({ summary }: { summary: GoogleRatingSummary }) {
  return (
    <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm dark:bg-slate-800 dark:border-slate-700">
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900 leading-none dark:text-white">{summary.averageRating}</span>
          <span className="text-xs text-slate-400">/5</span>
        </div>
        <span className="text-[11px] text-slate-400 mt-0.5">{summary.totalReviews} reseñas</span>
      </div>
      <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
      <div className="flex flex-col gap-1">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(summary.averageRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
          ))}
        </div>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Google</span>
      </div>
    </div>
  )
}

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Perfil', href: '/perfil' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Ubicación', href: '/ubicacion' },
  { label: 'Contacto', href: '/contacto' },
]

export function HomePage({
  doctorProfile,
  services,
  googleReviews,
  googleRatingSummary,
  contactInfo,
}: HomePageProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">

      {/* ── NAVIGATION ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 dark:bg-slate-900/95 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <Link href="/" className="flex items-center group">
              <Image src="/assets/logo-consultorio.png" alt="Logotipo del consultorio del Dr. Alejandro Viveros Domínguez, otorrinolaringólogo" width={48} height={48} sizes="48px" className="h-12 w-auto" priority />
            </Link>

            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    href === '/'
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400 dark:hover:text-white"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-4 pt-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-slate-600 dark:text-slate-300 font-medium py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/agendar"
              className="mt-3 flex items-center justify-center gap-2 bg-sky-600 text-white text-sm font-semibold px-4 py-3 rounded-xl"
            >
              <Calendar className="w-4 h-4" />
              Agendar Cita
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="absolute top-0 right-0 h-full w-[55%] bg-gradient-to-bl from-sky-600 to-sky-700 hidden md:block hero-clip-diagonal" />
        <div className="absolute top-0 right-0 h-full w-[55%] hidden md:block opacity-20 hero-clip-diagonal hero-grid-overlay" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">

            <div className="flex flex-col gap-5">
              <div className="inline-flex items-center gap-2 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold px-3 py-1.5 rounded-full w-fit border border-sky-100 dark:border-sky-800">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                {doctorProfile.yearsOfExperience}+ años de experiencia
              </div>

              <div>
                <h1 className="font-sans text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-[1.08] tracking-tight">
                  {doctorProfile.fullName}
                </h1>
                <p className="text-lg text-sky-600 dark:text-sky-400 font-semibold mt-2">{doctorProfile.title}</p>
              </div>

              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[15px] max-w-md">
                {doctorProfile.tagline}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-1">
                <Link
                  href="/agendar"
                  className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-sky-200 dark:hover:shadow-sky-900 active:scale-[0.98] text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar Cita
                </Link>
                <Link
                  href="/perfil"
                  className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 font-semibold px-6 py-3 rounded-xl transition-all hover:bg-sky-50/50 dark:hover:bg-sky-950/50 text-sm"
                >
                  Ver perfil completo
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {doctorProfile.certifications.map((cert, i) => (
                  <span key={i} className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full font-medium">
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center md:justify-end">
              <div className="relative w-60 h-72 sm:w-72 sm:h-88 md:w-72 md:h-[360px] lg:w-80 lg:h-[400px]">
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-sky-400 to-sky-700">
                  {!imgError && (
                    <Image
                      src={doctorProfile.photo}
                      alt="Retrato del Dr. Alejandro Viveros Domínguez, médico otorrinolaringólogo especialista en cirugía de cabeza y cuello en Ciudad de México"
                      fill
                      sizes="(max-width: 640px) 240px, (max-width: 768px) 288px, (max-width: 1024px) 288px, 320px"
                      className="object-cover z-10"
                      onError={() => setImgError(true)}
                      priority
                    />
                  )}
                  {imgError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="w-28 h-28 rounded-full bg-white/15 border-4 border-white/30 flex items-center justify-center">
                        <span className="text-5xl font-bold text-white/90">AV</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-3 flex items-center gap-2.5 border border-slate-100 dark:border-slate-700 z-20">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{googleRatingSummary.averageRating} / 5</p>
                    <p className="text-[10px] text-slate-400">{googleRatingSummary.totalReviews} reseñas · Google</p>
                  </div>
                </div>

                <div className="absolute -top-3 -right-2 sm:-right-5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl px-3.5 py-2.5 border border-slate-100 dark:border-slate-700 z-20">
                  <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Cédula Prof.</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{doctorProfile.licenseNumber}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SERVICES ───────────────────────────────────────────────── */}
      {services.length > 0 && (
        <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-3">Especialidades</p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">Nuestros Servicios</h2>
                <p className="text-slate-400 mt-3 max-w-md text-sm leading-relaxed">
                  Atención integral en otorrinolaringología con tecnología de vanguardia para todas las edades.
                </p>
              </div>
              <Link
                href="/servicios"
                className="inline-flex items-center gap-1.5 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold text-sm transition-colors flex-shrink-0"
              >
                Ver todos los servicios
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {services.map(service =>
                service.id === 'vacunacion' ? (
                  <Link key={service.id} href="/vacunacion">
                    <ServiceCard service={service} />
                  </Link>
                ) : (
                  <ServiceCard key={service.id} service={service} />
                )
              )}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/agendar"
                className="inline-flex items-center gap-2 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Agendar una consulta
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── REVIEWS ────────────────────────────────────────────────── */}
      {googleReviews.length > 0 && (
        <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-3">Reseñas verificadas</p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                  Lo que dicen<br />nuestros pacientes
                </h2>
              </div>
              <RatingSummaryBadge summary={googleRatingSummary} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {googleReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            <div className="text-center mt-10">
              <a
                href={googleRatingSummary.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium"
              >
                Ver todas las reseñas en Google
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── BOTTOM CTA ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-sky-600 py-16 md:py-20">
        <div className="absolute inset-0 pointer-events-none cta-radial-glow" />
        <div className="absolute inset-0 pointer-events-none opacity-20 dots-overlay-28" />

        <div className="relative max-w-2xl mx-auto text-center px-4 sm:px-6">
          <p className="text-[11px] font-bold text-sky-200 uppercase tracking-widest mb-4">Agenda tu consulta</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            ¿Listo para sentirte<br />mejor?
          </h2>
          <p className="text-sky-100 text-[15px] leading-relaxed mb-8">
            Primera consulta disponible esta semana. Atención especializada en el corazón de la Ciudad de México.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/agendar"
              className="flex items-center justify-center gap-2 bg-white text-sky-700 font-bold px-7 py-3.5 rounded-xl transition-all hover:bg-sky-50 hover:shadow-2xl active:scale-[0.98] text-sm"
            >
              <Calendar className="w-4 h-4" />
              Agendar Cita Ahora
            </Link>
            {contactInfo.whatsapp && (
              <a
                href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border-2 border-sky-400/60 text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:bg-sky-700/50 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      <PublicFooter />

    </div>
  )
}

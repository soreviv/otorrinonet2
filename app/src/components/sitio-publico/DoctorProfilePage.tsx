'use client'

import { useState } from 'react'
import {
  Stethoscope, Calendar, Menu, X, GraduationCap,
  Award, Building2, ChevronRight, ArrowLeft,
  BadgeCheck, Clock,
} from 'lucide-react'
import type { DoctorProfilePageProps } from '@/lib/sitio-publico-types'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Perfil', href: '/perfil' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Ubicación', href: '/ubicacion' },
  { label: 'Contacto', href: '/contacto' },
]

export function DoctorProfilePage({
  doctorProfile,
  onBookAppointment,
}: DoctorProfilePageProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 dark:bg-slate-900/95 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center shadow-sm group-hover:bg-sky-700 transition-colors">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Dr. Viveros</p>
                <p className="text-[10px] text-sky-600 font-semibold uppercase tracking-widest">ORL · CDMX</p>
              </div>
            </a>

            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    href === '/perfil'
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
            <span className="text-slate-600 dark:text-slate-300 font-medium">Perfil del Doctor</span>
          </div>
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">

            <div className="relative flex-shrink-0">
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-3xl overflow-hidden bg-gradient-to-br from-sky-400 to-sky-700 shadow-xl">
                {!imgError && (
                  <img
                    src={doctorProfile.photo}
                    alt={doctorProfile.fullName}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                )}
                {imgError && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl font-bold text-white/90">AV</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-sky-600 rounded-full p-1.5 shadow-lg">
                <BadgeCheck className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold px-3 py-1.5 rounded-full border border-sky-100 dark:border-sky-800 mb-4">
                <Clock className="w-3 h-3" />
                {doctorProfile.yearsOfExperience}+ años de experiencia
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                {doctorProfile.fullName}
              </h1>
              <p className="text-lg text-sky-600 dark:text-sky-400 font-semibold mt-1">{doctorProfile.title}</p>

              <p className="text-slate-500 dark:text-slate-400 mt-4 leading-relaxed text-[15px] max-w-2xl">
                {doctorProfile.shortBio}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-5">
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full font-medium">
                  Cédula Prof. <span className="font-bold text-slate-900 dark:text-white">{doctorProfile.licenseNumber}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full font-medium">
                  Cédula Esp. <span className="font-bold text-slate-900 dark:text-white">{doctorProfile.specialtyLicense}</span>
                </span>
              </div>

              <button
                onClick={onBookAppointment}
                className="mt-6 inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-sky-200 dark:hover:shadow-sky-900 active:scale-[0.98] text-sm"
              >
                <Calendar className="w-4 h-4" />
                Agendar Consulta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          <div className="lg:col-span-2 flex flex-col gap-10">

            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center">
                  <Stethoscope className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Acerca del doctor</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
                {doctorProfile.fullBio}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Formación Académica</h2>
              </div>

              <div className="relative pl-6">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-sky-300 via-sky-200 to-transparent dark:from-sky-700 dark:via-sky-800" />

                <div className="flex flex-col gap-7">
                  {doctorProfile.education.map((entry, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-sky-600 dark:bg-sky-500 border-2 border-white dark:border-slate-950 shadow-sm" />
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 hover:border-sky-200 dark:hover:border-sky-800 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{entry.degree}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{entry.institution}</p>
                          </div>
                          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-lg flex-shrink-0">
                            {entry.year}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          <div className="flex flex-col gap-6">

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Certificaciones</h2>
              </div>
              <div className="flex flex-col gap-3">
                {doctorProfile.certifications.map((cert, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BadgeCheck className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {doctorProfile.hospitals.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Adscripción Hospitalaria</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {doctorProfile.hospitals.map((hospital, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400 dark:bg-sky-500 flex-shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">{hospital}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative overflow-hidden bg-sky-600 rounded-2xl p-6 text-center">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
              />
              <div className="relative">
                <p className="text-xs font-bold text-sky-100 uppercase tracking-widest mb-2">Agenda tu consulta</p>
                <p className="text-sm text-sky-50 mb-4 leading-relaxed">
                  Atención personalizada para ti y tu familia.
                </p>
                <button
                  onClick={onBookAppointment}
                  className="w-full flex items-center justify-center gap-2 bg-white text-sky-700 font-bold px-5 py-3 rounded-xl text-sm hover:bg-sky-50 transition-colors active:scale-[0.98]"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar Cita
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-8 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center group-hover:bg-sky-500 transition-colors">
                <Stethoscope className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-white">Dr. Alejandro Viveros ORL</p>
                <p className="text-[10px] text-slate-500">Otorrinolaringología · Ciudad de México</p>
              </div>
            </a>
            <p className="text-[11px] text-slate-600">© 2026 Dr. Alejandro Viveros</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

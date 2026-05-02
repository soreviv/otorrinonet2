'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PublicFooter } from './PublicFooter'
import {
  Calendar, Menu, X, MapPin,
  Phone, MessageCircle, Mail, Send, CheckCircle2,
  ChevronRight, ArrowLeft, Clock, Shield,
} from 'lucide-react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import type { ContactPageProps } from '@/lib/sitio-publico-types'
import { submitContactForm } from '@/app/actions/contact'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Perfil', href: '/perfil' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Ubicación', href: '/ubicacion' },
  { label: 'Contacto', href: '/contacto' },
]

interface FormState {
  name: string
  phone: string
  email: string
  message: string
  privacyAccepted: boolean
}

const EMPTY_FORM: FormState = { name: '', phone: '', email: '', message: '', privacyAccepted: false }

export function ContactPage({ contactInfo, onSubmitContactForm, onBookAppointment }: ContactPageProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = 'Ingresa tu nombre'
    if (!form.phone.trim() && !form.email.trim()) {
      next.phone = 'Ingresa tu teléfono o correo'
      next.email = 'Ingresa tu teléfono o correo'
    }
    if (!form.message.trim()) next.message = 'Escribe tu mensaje'
    if (!form.privacyAccepted) next.privacyAccepted = 'Debes aceptar el aviso de privacidad'
    if (!captchaToken) next.name = next.name ?? ' '  // trigger captcha error display
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitError(null)
    setSubmitting(true)
    const result = await submitContactForm({
      name: form.name,
      phone: form.phone,
      email: form.email,
      message: form.message,
      captchaToken: captchaToken!,
    })
    setSubmitting(false)
    if (!result.ok) {
      setSubmitError(result.error ?? 'Error al enviar. Intenta de nuevo.')
      turnstileRef.current?.reset()
      setCaptchaToken(null)
      return
    }
    onSubmitContactForm?.({ name: form.name, phone: form.phone, email: form.email, message: form.message })
    setSubmitted(true)
  }

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased dark:bg-slate-950">

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 dark:bg-slate-900/95 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center group">
              <Image src="/assets/logo-consultorio.png" alt="Logotipo del consultorio del Dr. Alejandro Viveros Domínguez, otorrinolaringólogo" width={40} height={40} className="h-10 w-auto" priority />
            </Link>

            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    href === '/contacto'
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
            <span className="text-slate-600 dark:text-slate-300 font-medium">Contacto</span>
          </div>
        </div>
      </div>

      {/* ── PAGE HEADER ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-2">Estamos para ayudarte</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">Contáctanos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-lg">
            Envíanos un mensaje o contáctanos directamente por teléfono o WhatsApp. Respondemos a la brevedad.
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-8">

              {submitted ? (
                <div className="flex flex-col items-center text-center py-10 gap-4">
                  <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">¡Mensaje enviado!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed max-w-sm">
                      Gracias por contactarnos. Te responderemos a la brevedad al número o correo que proporcionaste.
                    </p>
                  </div>
                  <button
                    onClick={() => { setForm(EMPTY_FORM); setSubmitted(false) }}
                    className="mt-2 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Envíanos un mensaje</h2>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Nombre completo <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Tu nombre"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-colors ${
                        errors.name ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Teléfono</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        placeholder="55 1234 5678"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-colors ${
                          errors.phone ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Correo electrónico</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => handleChange('email', e.target.value)}
                        placeholder="tu@correo.com"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-colors ${
                          errors.email ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                    </div>
                  </div>
                  {(errors.phone || errors.email) && (
                    <p className="text-xs text-red-500 -mt-3">Proporciona al menos tu teléfono o correo</p>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Mensaje <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={e => handleChange('message', e.target.value)}
                      placeholder="¿En qué podemos ayudarte?"
                      rows={5}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-colors resize-none ${
                        errors.message ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                  </div>

                  {/* Aviso de privacidad */}
                  <div className={`flex items-start gap-3 p-4 rounded-2xl border ${errors.privacyAccepted ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
                    <div className="relative shrink-0 mt-0.5">
                      <input
                        id="contact-privacy"
                        type="checkbox"
                        checked={form.privacyAccepted}
                        onChange={e => {
                          setForm(prev => ({ ...prev, privacyAccepted: e.target.checked }))
                          if (errors.privacyAccepted) setErrors(prev => ({ ...prev, privacyAccepted: undefined }))
                        }}
                        className="sr-only peer"
                      />
                      <label
                        htmlFor="contact-privacy"
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          form.privacyAccepted
                            ? 'bg-sky-600 border-sky-600'
                            : errors.privacyAccepted
                            ? 'border-red-400 bg-white dark:bg-slate-900'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {form.privacyAccepted && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </label>
                    </div>
                    <div>
                      <label htmlFor="contact-privacy" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                        He leído y acepto el{' '}
                        <a
                          href="/legal/privacidad"
                          className="text-sky-600 dark:text-sky-400 font-medium underline underline-offset-2 hover:text-sky-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Aviso de Privacidad
                        </a>{' '}
                        del consultorio del Dr. Alejandro Viveros ORL.
                      </label>
                      {errors.privacyAccepted && (
                        <p className="text-xs text-red-500 mt-1">{errors.privacyAccepted}</p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <Shield className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                        Sus datos son confidenciales y están protegidos.
                      </p>
                    </div>
                  </div>

                  {/* Captcha */}
                  <div className="flex flex-col gap-1">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''}
                      onSuccess={setCaptchaToken}
                      onExpire={() => setCaptchaToken(null)}
                      options={{ language: 'es' }}
                    />
                    {!captchaToken && errors.name === ' ' && (
                      <p className="text-xs text-red-500">Completa la verificación de seguridad</p>
                    )}
                  </div>

                  {submitError && (
                    <p className="text-xs text-red-500">{submitError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-sky-200 dark:hover:shadow-sky-900 active:scale-[0.98] text-sm"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Enviando…' : 'Enviar Mensaje'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-5">

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Contacto Directo</h2>
              <div className="flex flex-col gap-4">
                {contactInfo.phone && (
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="flex items-center gap-3 group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors -mx-1"
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Teléfono</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{contactInfo.phone}</p>
                    </div>
                  </a>
                )}
                {contactInfo.whatsapp && (
                  <a
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors -mx-1"
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">WhatsApp</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{contactInfo.whatsapp}</p>
                    </div>
                  </a>
                )}
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-3 group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors -mx-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Correo</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{contactInfo.email}</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Dirección</h2>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{contactInfo.address.street}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{contactInfo.address.neighborhood}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {contactInfo.address.city}, {contactInfo.address.state} {contactInfo.address.postalCode}
              </p>
              <a
                href={contactInfo.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
              >
                Ver en Google Maps →
              </a>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Horarios</h2>
              </div>
              <div className="flex flex-col gap-2">
                {contactInfo.schedule.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{entry.days}</span>
                    <span className={`text-xs font-medium ${
                      entry.hours.toLowerCase() === 'cerrado'
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-sky-700 dark:text-sky-300'
                    }`}>
                      {entry.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onBookAppointment}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-3.5 rounded-xl transition-colors text-sm"
            >
              <Calendar className="w-4 h-4" />
              Agendar Cita Online
            </button>

          </div>
        </div>
      </div>

      <PublicFooter />

    </div>
  )
}

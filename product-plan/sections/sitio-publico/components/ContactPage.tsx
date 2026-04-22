import { useState } from 'react'
import {
  Stethoscope, Calendar, Menu, X, MapPin,
  Phone, MessageCircle, Mail, Send, CheckCircle2,
  ChevronRight, ArrowLeft, Clock,
} from 'lucide-react'
import type { ContactPageProps } from '../types'

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
}

const EMPTY_FORM: FormState = { name: '', phone: '', email: '', message: '' }

export function ContactPage({ contactInfo, onSubmitContactForm, onBookAppointment }: ContactPageProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<FormState>>({})

  const validate = (): boolean => {
    const next: Partial<FormState> = {}
    if (!form.name.trim()) next.name = 'Ingresa tu nombre'
    if (!form.phone.trim() && !form.email.trim()) {
      next.phone = 'Ingresa tu teléfono o correo'
      next.email = 'Ingresa tu teléfono o correo'
    }
    if (!form.message.trim()) next.message = 'Escribe tu mensaje'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
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
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm group-hover:bg-teal-700 transition-colors">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Dr. Viveros</p>
                <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-widest">ORL · CDMX</p>
              </div>
            </a>

            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    href === '/contacto'
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400'
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onBookAppointment}
                className="hidden sm:flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-teal-200 dark:shadow-teal-900"
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
              className="mt-3 flex items-center justify-center gap-2 bg-teal-600 text-white text-sm font-semibold px-4 py-3 rounded-xl"
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
            <a href="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Inicio
            </a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Contacto</span>
          </div>
        </div>
      </div>

      {/* ── PAGE HEADER ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-2">Estamos para ayudarte</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">Contáctanos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-lg">
            Envíanos un mensaje o contáctanos directamente por teléfono o WhatsApp. Respondemos a la brevedad.
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── FORM (wider) ─────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-8">

              {submitted ? (
                /* Success state */
                <div className="flex flex-col items-center text-center py-10 gap-4">
                  <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">¡Mensaje enviado!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed max-w-sm">
                      Gracias por contactarnos. Te responderemos a la brevedad al número o correo que proporcionaste.
                    </p>
                  </div>
                  <button
                    onClick={() => { setForm(EMPTY_FORM); setSubmitted(false) }}
                    className="mt-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Envíanos un mensaje</h2>

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Nombre completo <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Tu nombre"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors ${
                        errors.name ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>

                  {/* Phone + Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Teléfono</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        placeholder="55 1234 5678"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors ${
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
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors ${
                          errors.email ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                    </div>
                  </div>
                  {(errors.phone || errors.email) && (
                    <p className="text-xs text-red-500 -mt-3">Proporciona al menos tu teléfono o correo</p>
                  )}

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Mensaje <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={e => handleChange('message', e.target.value)}
                      placeholder="¿En qué podemos ayudarte?"
                      rows={5}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors resize-none ${
                        errors.message ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-teal-200 dark:hover:shadow-teal-900 active:scale-[0.98] text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Mensaje
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* ── SIDEBAR ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Quick contact */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Contacto Directo</h2>
              <div className="flex flex-col gap-4">
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="flex items-center gap-3 group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors -mx-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Teléfono</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{contactInfo.phone}</p>
                  </div>
                </a>
                <a
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors -mx-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">WhatsApp</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{contactInfo.whatsapp}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-3 group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors -mx-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Correo</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{contactInfo.email}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
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
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Ver en Google Maps →
              </a>
            </div>

            {/* Schedule compact */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Horarios</h2>
              </div>
              <div className="flex flex-col gap-2">
                {contactInfo.schedule.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{entry.days}</span>
                    <span className={`text-xs font-medium ${
                      entry.hours.toLowerCase() === 'cerrado'
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-teal-700 dark:text-teal-300'
                    }`}>
                      {entry.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Book CTA */}
            <button
              onClick={onBookAppointment}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-3.5 rounded-xl transition-colors text-sm"
            >
              <Calendar className="w-4 h-4" />
              Agendar Cita Online
            </button>

          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-8 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center group-hover:bg-teal-500 transition-colors">
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

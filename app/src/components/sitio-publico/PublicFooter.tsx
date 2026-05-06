import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Mail, Phone, X } from 'lucide-react'
import { contactInfo } from '@/lib/sitio-publico-data'

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/drviverosorl',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/drviverosorl',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/drviverosorl',
    icon: <X className="w-4 h-4" aria-hidden="true" />,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/drviverosorl',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@drviverosorl',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
      </svg>
    ),
  },
]

const NAV_LINKS = [
  { label: 'Inicio',       href: '/' },
  { label: 'Perfil',       href: '/perfil' },
  { label: 'Servicios',    href: '/servicios' },
  { label: 'Ubicación',    href: '/ubicacion' },
  { label: 'Contacto',     href: '/contacto' },
  { label: 'Agendar Cita', href: '/agendar' },
]

const LEGAL_LINKS = [
  { label: 'Aviso de Privacidad',        href: '/privacidad' },
  { label: 'Términos y Condiciones',     href: '/terminos' },
  { label: 'Política de Cookies',        href: '/cookies' },
  { label: 'Descargo de Responsabilidad', href: '/descargo' },
]

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 py-10 mt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-800">

          {/* Columna 1 — Logo + redes sociales */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="inline-block">
              <div className="bg-white rounded-xl p-1.5 inline-flex">
                <Image
                  src="/assets/logo-consultorio.png"
                  alt="Logotipo del consultorio del Dr. Alejandro Viveros Domínguez, otorrinolaringólogo"
                  width={36}
                  height={36}
                  sizes="36px"
                  className="h-9 w-auto"
                />
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              {contactInfo.clinicName}
            </p>
            <div className="flex items-center gap-3 mt-1">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-slate-500 hover:text-sky-400 transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Columna 2 — Navegación */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-1">
              Navegación
            </p>
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Columna 3 — Ubicación */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              Ubicación
            </p>
            <p className="text-xs text-slate-400">{contactInfo.address.street}</p>
            <p className="text-xs text-slate-400">{contactInfo.address.neighborhood}</p>
            <p className="text-xs text-slate-400">
              {contactInfo.address.city}, {contactInfo.address.state} {contactInfo.address.postalCode}
            </p>
          </div>

          {/* Columna 4 — Contacto */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Mail className="w-3 h-3 flex-shrink-0" />
              Contacto
            </p>
            {contactInfo.phone && (
              <a
                href={`tel:${contactInfo.phone}`}
                className="text-xs text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3 h-3 flex-shrink-0" />
                {contactInfo.phone}
              </a>
            )}
            <a
              href={`mailto:${contactInfo.email}`}
              className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
            >
              {contactInfo.email}
            </a>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} Dr. Alejandro Viveros Domínguez · Otorrinolaringología
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-[11px] text-slate-500 hover:text-sky-400 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}

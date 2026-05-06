'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Calendar, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Perfil', href: '/perfil' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Ubicación', href: '/ubicacion' },
  { label: 'Contacto', href: '/contacto' },
]

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 dark:bg-slate-900/95 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center group">
            <Image
              src="/assets/logo-consultorio.png"
              alt="Logotipo del consultorio del Dr. Alejandro Viveros Domínguez, otorrinolaringólogo"
              width={48}
              height={48}
              sizes="48px"
              className="h-12 w-auto"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={`text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400'
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/agendar"
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Agendar Cita
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400 dark:hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-4 pt-3 flex flex-col gap-1"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive(href) ? 'page' : undefined}
              className="text-sm text-slate-600 dark:text-slate-300 font-medium py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/agendar"
            onClick={() => setMobileOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 bg-sky-600 text-white text-sm font-semibold px-4 py-3 rounded-xl"
          >
            <Calendar className="w-4 h-4" />
            Agendar Cita
          </Link>
        </div>
      )}
    </nav>
  )
}

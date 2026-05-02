import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Mail, Phone } from 'lucide-react'
import { contactInfo } from '@/lib/sitio-publico-data'

const LEGAL_LINKS = [
  { label: 'Aviso de Privacidad',          href: '/privacidad' },
  { label: 'Términos y Condiciones',        href: '/terminos' },
  { label: 'Política de Cookies',           href: '/cookies' },
  { label: 'Descargo de Responsabilidad',   href: '/descargo' },
]

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 py-10 mt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 border-b border-slate-800">

          <div className="flex flex-col gap-3">
            <Link href="/" className="inline-block">
              <div className="bg-white rounded-xl p-1.5 inline-flex">
                <Image
                  src="/assets/logo-consultorio.png"
                  alt="Logotipo del consultorio del Dr. Alejandro Viveros Domínguez, otorrinolaringólogo"
                  width={36}
                  height={36}
                  className="h-9 w-auto"
                />
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              {contactInfo.clinicName}
            </p>
          </div>

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

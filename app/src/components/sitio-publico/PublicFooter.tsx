import Link from 'next/link'
import Image from 'next/image'

const LEGAL_LINKS = [
  { label: 'Aviso de Privacidad',          href: '/privacidad' },
  { label: 'Términos y Condiciones',        href: '/terminos' },
  { label: 'Política de Cookies',           href: '/cookies' },
  { label: 'Descargo de Responsabilidad',   href: '/descargo' },
]

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 py-8 mt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-5">

        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
          <Link href="/" className="flex items-center group">
            <div className="bg-white rounded-xl p-1.5">
              <Image
                src="/assets/logo-consultorio.png"
                alt="Logotipo del consultorio del Dr. Alejandro Viveros Domínguez, otorrinolaringólogo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
            </div>
          </Link>
          <p className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} Dr. Alejandro Viveros Domínguez · Otorrinolaringología
          </p>
        </div>

        <div className="w-full border-t border-slate-800 pt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
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
    </footer>
  )
}

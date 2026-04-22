import { useState, useRef, useEffect } from 'react'
import { Stethoscope, Menu, X, ChevronDown, User, CalendarCheck, LogOut } from 'lucide-react'

interface PatientNavItem {
  label: string
  href: string
  isActive?: boolean
}

interface LegalItem {
  label: string
  href: string
}

interface PatientUser {
  name: string
  avatarUrl?: string
}

interface PatientShellProps {
  children: React.ReactNode
  navigationItems?: PatientNavItem[]
  legalItems?: LegalItem[]
  user?: PatientUser | null
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

const defaultNavItems: PatientNavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Agendar Cita', href: '/agendar' },
]

const defaultLegalItems: LegalItem[] = [
  { label: 'Aviso de privacidad', href: '/legal/privacidad' },
  { label: 'Términos y condiciones', href: '/legal/terminos' },
  { label: 'Política de cookies', href: '/legal/cookies' },
]

export function PatientShell({
  children,
  navigationItems = defaultNavItems,
  legalItems = defaultLegalItems,
  user = null,
  onNavigate,
  onLogout,
}: PatientShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [legalOpen, setLegalOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const legalRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleNavigate = (href: string) => {
    onNavigate?.(href)
    setMobileOpen(false)
    setLegalOpen(false)
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (legalRef.current && !legalRef.current.contains(e.target as Node)) {
        setLegalOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950" style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">

          {/* Logo */}
          <button
            onClick={() => handleNavigate('/')}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-600 dark:bg-teal-500 flex items-center justify-center shadow-sm group-hover:bg-teal-700 dark:group-hover:bg-teal-400 transition-colors">
              <Stethoscope className="w-4.5 h-4.5 text-white" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                Dr. Viveros
              </span>
              <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400 tracking-wider uppercase">
                ORL · Cirugía C&C
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navigationItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigate(item.href)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.isActive
                    ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Legal dropdown */}
            <div className="relative" ref={legalRef}>
              <button
                onClick={() => setLegalOpen(!legalOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  legalOpen
                    ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Legal
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${legalOpen ? 'rotate-180' : ''}`}
                  strokeWidth={2}
                />
              </button>
              {legalOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-52 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-50">
                  {legalItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleNavigate(item.href)}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right side: CTA + User */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <button
              onClick={() => handleNavigate('/agendar')}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              Agendar Cita
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700"
              >
                <User className="w-4 h-4 text-slate-600 dark:text-slate-400" strokeWidth={1.75} />
              </button>
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Paciente</p>
                      </div>
                      <button
                        onClick={() => handleNavigate('/mis-citas')}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <CalendarCheck className="w-4 h-4" strokeWidth={1.75} />
                        Mis Citas
                      </button>
                      <button
                        onClick={onLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" strokeWidth={1.75} />
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleNavigate('/login')}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-4 h-4" strokeWidth={1.75} />
                        Iniciar sesión
                      </button>
                      <button
                        onClick={() => handleNavigate('/registro')}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors font-medium"
                      >
                        <CalendarCheck className="w-4 h-4" strokeWidth={1.75} />
                        Crear cuenta
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-auto w-9 h-9 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" strokeWidth={1.75} /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigate(item.href)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  item.isActive
                    ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800 mt-1">
              <p className="px-3 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Legal</p>
              {legalItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigate(item.href)}
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="pt-2">
              <button
                onClick={() => handleNavigate('/agendar')}
                className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
              >
                Agendar Cita
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <Stethoscope className="w-4 h-4" strokeWidth={1.75} />
            <span>Dr. Alejandro Viveros Domínguez · ORL</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            {legalItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigate(item.href)}
                className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

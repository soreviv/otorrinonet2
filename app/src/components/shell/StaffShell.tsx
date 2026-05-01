'use client'

import { useState } from 'react'
import {
  Stethoscope,
  CalendarDays,
  ClipboardList,
  ScrollText,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from 'lucide-react'

export type StaffRole = 'medico' | 'enfermera' | 'recepcionista'

interface StaffNavItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
  isActive?: boolean
  roles?: StaffRole[]
}

interface StaffUser {
  name: string
  role: StaffRole
  avatarUrl?: string
}

interface StaffShellProps {
  children: React.ReactNode
  navigationItems?: StaffNavItem[]
  user?: StaffUser
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

const defaultNavItems: StaffNavItem[] = [
  {
    id: 'agenda',
    label: 'Agenda de Citas',
    href: '/staff/agenda',
    icon: CalendarDays,
  },
  {
    id: 'ehr',
    label: 'Expediente Clínico',
    href: '/staff/ehr',
    icon: ClipboardList,
    roles: ['medico', 'enfermera'],
  },
  {
    id: 'notas',
    label: 'Notas y Recetas',
    href: '/staff/notas',
    icon: ScrollText,
    roles: ['medico'],
  },
  {
    id: 'admin',
    label: 'Administración',
    href: '/staff/admin',
    icon: Shield,
    roles: ['medico'],
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    href: '/staff/configuracion',
    icon: Settings,
    roles: ['medico'],
  },
]

const roleLabels: Record<StaffRole, string> = {
  medico: 'Médico',
  enfermera: 'Enfermera',
  recepcionista: 'Recepcionista',
}

const roleBadgeColors: Record<StaffRole, string> = {
  medico: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400',
  enfermera: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400',
  recepcionista: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

export function StaffShell({
  children,
  navigationItems = defaultNavItems,
  user = { name: 'Dr. Alejandro Viveros', role: 'medico' },
  onNavigate,
  onLogout,
}: StaffShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavigate = (href: string) => {
    onNavigate?.(href)
    setMobileOpen(false)
  }

  const visibleItems = navigationItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  )

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed md:static inset-y-0 left-0 z-50 flex flex-col',
          'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
          'transition-all duration-200 ease-in-out shrink-0',
          collapsed ? 'w-16' : 'w-56',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-slate-200 dark:border-slate-800 shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4 gap-2.5'}`}>
          <div className="w-8 h-8 rounded-lg bg-sky-600 dark:bg-sky-500 flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4 text-white" strokeWidth={1.75} />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate font-heading">
                Dr. Viveros · ORL
              </span>
              <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400 tracking-wider uppercase">
                Panel Clínico
              </span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {visibleItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigate(item.href)}
                    title={collapsed ? item.label : undefined}
                    className={[
                      'w-full flex items-center rounded-lg transition-all duration-150',
                      collapsed ? 'justify-center h-10 w-10 mx-auto' : 'gap-3 px-3 py-2.5',
                      item.isActive
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border-l-2 border-sky-600 dark:border-sky-500 rounded-l-none'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                    ].join(' ')}
                  >
                    <Icon
                      className={`shrink-0 ${item.isActive ? 'text-sky-600 dark:text-sky-400' : ''} ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}`}
                      strokeWidth={item.isActive ? 2 : 1.75}
                    />
                    {!collapsed && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User panel at bottom */}
        <div className={`border-t border-slate-200 dark:border-slate-800 p-3 shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <button
              title={`${user.name} · ${roleLabels[user.role]}`}
              className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-700 dark:text-sky-400 text-sm font-bold hover:bg-sky-200 dark:hover:bg-sky-900 transition-colors"
            >
              {initials}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-700 dark:text-sky-400 text-sm font-bold shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                    {user.name}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 ${roleBadgeColors[user.role]}`}
                  >
                    {roleLabels[user.role]}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
          title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
          )}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} />
          </button>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.75} />
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-heading">
              Dr. Viveros · ORL
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-700 dark:text-sky-400 text-xs font-bold">
              {initials}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

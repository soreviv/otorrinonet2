'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  CalendarDays,
  ClipboardList,
  ScrollText,
  Shield,
  Settings,
  ShoppingBag,
  Package,
} from 'lucide-react'
import { StaffShell, type StaffRole } from './StaffShell'
import { logoutAction } from '@/app/actions/auth'

const staffNavItems = [
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
    roles: ['medico', 'enfermera'] as StaffRole[],
  },
  {
    id: 'notas',
    label: 'Notas, Recetas y Consentimientos',
    href: '/staff/notas',
    icon: ScrollText,
    roles: ['medico'] as StaffRole[],
  },
  {
    id: 'admin',
    label: 'Administración',
    href: '/staff/admin',
    icon: Shield,
    roles: ['medico'] as StaffRole[],
  },
  {
    id: 'tienda',
    label: 'Pedidos de Tienda',
    href: '/staff/tienda/pedidos',
    icon: ShoppingBag,
    roles: ['medico', 'recepcionista'] as StaffRole[],
  },
  {
    id: 'productos',
    label: 'Productos de Tienda',
    href: '/staff/tienda/productos',
    icon: Package,
    roles: ['medico', 'recepcionista'] as StaffRole[],
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    href: '/staff/configuracion',
    icon: Settings,
    roles: ['medico'] as StaffRole[],
  },
]

interface ShellWrapperProps {
  children: React.ReactNode
  userName: string
  userRole: StaffRole
}

export function StaffShellWrapper({ children, userName, userRole }: ShellWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = staffNavItems.map((item) => ({
    ...item,
    isActive: pathname.startsWith(item.href),
  }))

  return (
    <StaffShell
      navigationItems={navigationItems}
      user={{ name: userName, role: userRole }}
      onNavigate={(href) => router.push(href)}
      onLogout={() => logoutAction()}
    >
      {children}
    </StaffShell>
  )
}

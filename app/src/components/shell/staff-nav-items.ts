import {
  CalendarDays,
  ClipboardList,
  ScrollText,
  Shield,
  Settings,
  ShoppingBag,
  Package,
  DatabaseZap,
} from 'lucide-react'
import type { StaffRole } from './StaffShell'

export const staffNavItems = [
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
    id: 'dgis',
    label: 'Exportación DGIS',
    href: '/staff/dgis',
    icon: DatabaseZap,
    roles: ['medico'] as StaffRole[],
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    href: '/staff/configuracion',
    icon: Settings,
    roles: ['medico'] as StaffRole[],
  },
]

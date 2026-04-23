'use client'

import { useState } from 'react'
import type {
  AdminDashboardProps,
  SystemUser,
  AuditLog,
  AuditAction,
  ArcoRequest,
  ArcoStatus,
  ArcoType,
  FhirExport,
  UserRole,
  UserStatus,
} from '@/lib/admin-types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function relativeDate(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 60) return `hace ${diff} min`
  if (diff < 1440) return `hace ${Math.floor(diff / 60)}h`
  return `hace ${Math.floor(diff / 1440)}d`
}

// ─── Role / Status labels ──────────────────────────────────────────────────────

const roleLabels: Record<UserRole, string> = {
  medico: 'Médico',
  enfermera: 'Enfermera',
  recepcionista: 'Recepcionista',
}

const roleColors: Record<UserRole, string> = {
  medico: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  enfermera: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  recepcionista: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
}

const actionLabels: Record<AuditAction, string> = {
  acceso: 'Acceso',
  creacion: 'Creación',
  modificacion: 'Modificación',
  eliminacion: 'Eliminación',
  firma: 'Firma electrónica',
  'exportacion-fhir': 'Exportación FHIR',
}

const actionColors: Record<AuditAction, string> = {
  acceso: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  creacion: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
  modificacion: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  eliminacion: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
  firma: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
  'exportacion-fhir': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
}

const arcoTypeLabels: Record<ArcoType, string> = {
  acceso: 'Acceso',
  rectificacion: 'Rectificación',
  cancelacion: 'Cancelación',
  oposicion: 'Oposición',
}

const arcoStatusLabels: Record<ArcoStatus, string> = {
  pendiente: 'Pendiente',
  'en-proceso': 'En proceso',
  resuelta: 'Resuelta',
  rechazada: 'Rechazada',
}

const arcoStatusColors: Record<ArcoStatus, string> = {
  pendiente: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'en-proceso': 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  resuelta: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  rechazada: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'usuarios' | 'bitacora' | 'fhir' | 'privacidad'

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  },
  {
    id: 'usuarios', label: 'Usuarios',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
  {
    id: 'bitacora', label: 'Bitácora',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
  },
  {
    id: 'fhir', label: 'Exportar FHIR',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  },
  {
    id: 'privacidad', label: 'Privacidad & ARCO',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  },
]

// ─── UserEditModal ─────────────────────────────────────────────────────────────

function UserEditModal({
  user,
  onSave,
  onClose,
}: {
  user: SystemUser
  onSave: (role: UserRole, status: UserStatus) => void
  onClose: () => void
}) {
  const [role, setRole] = useState<UserRole>(user.role)
  const [status, setStatus] = useState<UserStatus>(user.status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Editar usuario</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{user.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{user.email}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rol</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {(['medico', 'enfermera', 'recepcionista'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                    role === r
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado</label>
            <div className="mt-1.5 flex gap-2">
              {(['activo', 'inactivo'] as UserStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                    status === s
                      ? s === 'activo'
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400'
                        : 'border-rose-400 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {s === 'activo' ? 'Activo' : 'Inactivo'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { onSave(role, status); onClose() }}
            className="flex-1 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

function DashboardTab({ metrics, complianceBadges }: Pick<AdminDashboardProps, 'metrics' | 'complianceBadges'>) {
  const metricCards = [
    {
      label: 'Usuarios activos',
      value: metrics.activeUsers,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-900/20',
    },
    {
      label: 'Accesos últimas 24h',
      value: metrics.accessesLast24h,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-900/20',
    },
    {
      label: 'Exportaciones FHIR (mes)',
      value: metrics.fhirExportsThisMonth,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
    },
    {
      label: 'Solicitudes ARCO pendientes',
      value: metrics.pendingArcoRequests,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      color: metrics.pendingArcoRequests > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400',
      bg: metrics.pendingArcoRequests > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-sky-50 dark:bg-sky-900/20',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metricCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${metrics.encryptionActive ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-500'}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cifrado AES-256</p>
            <p className={`text-xs ${metrics.encryptionActive ? 'text-sky-600 dark:text-sky-400' : 'text-rose-500'}`}>
              {metrics.encryptionActive ? 'Activo — datos cifrados en reposo' : 'Inactivo — acción requerida'}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Último respaldo</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateTime(metrics.lastBackup)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Estado de cumplimiento normativo</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {complianceBadges.map(badge => (
            <div key={badge.id} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 text-center">
              <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{badge.label}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">e.firma SAT</p>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wide">Próximamente</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Integración con la firma electrónica avanzada del SAT (.cer + .key) para firmar notas de evolución y recetas médicas con valor legal oficial. Disponible en una próxima actualización.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function UsuariosTab({
  users,
  onEditUser,
  onActivateUser,
  onDeactivateUser,
}: {
  users: SystemUser[]
  onEditUser?: AdminDashboardProps['onEditUser']
  onActivateUser?: AdminDashboardProps['onActivateUser']
  onDeactivateUser?: AdminDashboardProps['onDeactivateUser']
}) {
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)

  function initials(name: string) {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div>
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(role, status) => {
            onEditUser?.(editingUser.id, { role, status })
            setEditingUser(null)
          }}
        />
      )}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Usuarios del sistema</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{users.length} usuarios registrados</p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {users.map(user => (
            <div key={user.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {initials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleColors[user.role]}`}>
                    {roleLabels[user.role]}
                  </span>
                  {user.status === 'inactivo' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {user.email} · Último acceso: {relativeDate(user.lastAccess)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setEditingUser(user)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  Editar
                </button>
                {user.status === 'activo' ? (
                  <button
                    onClick={() => onDeactivateUser?.(user.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 transition-colors"
                  >
                    Desactivar
                  </button>
                ) : (
                  <button
                    onClick={() => onActivateUser?.(user.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-sky-600 dark:text-sky-400 transition-colors"
                  >
                    Activar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BitacoraTab({ logs }: { logs: AuditLog[] }) {
  const [filterUser, setFilterUser] = useState('')
  const [filterAction, setFilterAction] = useState<AuditAction | ''>('')

  const unique = [...new Set(logs.map(l => l.userName))]

  const filtered = logs.filter(l => {
    if (filterUser && l.userName !== filterUser) return false
    if (filterAction && l.action !== filterAction) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
        <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Bitácora de auditoría <strong>inmutable</strong> — conforme a LFPDPPP y NOM-024-SSA3. Ningún registro puede editarse ni eliminarse.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select
          value={filterUser}
          onChange={e => setFilterUser(e.target.value)}
          className="text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Todos los usuarios</option>
          {unique.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value as AuditAction | '')}
          className="text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Todas las acciones</option>
          {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {(filterUser || filterAction) && (
          <button onClick={() => { setFilterUser(''); setFilterAction('') }} className="text-xs text-sky-600 dark:text-sky-400 px-2 hover:underline">
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Acción</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Usuario</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Recurso</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Fecha / Hora</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${actionColors[log.action]}`}>
                      {actionLabels[log.action]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-[160px] truncate">{log.userName}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{log.resource}</td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                  <td className="px-4 py-3 font-mono text-slate-400 dark:text-slate-500">{log.ipAddress}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 italic">
                    {logs.length === 0 ? 'Sin registros de auditoría.' : 'No hay registros con los filtros seleccionados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 text-right">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{filtered.length} de {logs.length} registros</p>
        </div>
      </div>
    </div>
  )
}

function FhirTab({
  exports,
  onExportFhirIndividual,
  onExportFhirBulk,
}: {
  exports: FhirExport[]
  onExportFhirIndividual?: AdminDashboardProps['onExportFhirIndividual']
  onExportFhirBulk?: AdminDashboardProps['onExportFhirBulk']
}) {
  const [patientId, setPatientId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const statusColors = {
    completado: 'text-sky-600 dark:text-sky-400',
    'en-proceso': 'text-amber-600 dark:text-amber-400',
    error: 'text-rose-600 dark:text-rose-400',
  }

  const statusLabels = {
    completado: 'Completado',
    'en-proceso': 'En proceso…',
    error: 'Error',
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Exportar paciente individual</h4>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="ID o nombre del paciente"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-400"
            />
            <button
              onClick={() => { if (patientId) onExportFhirIndividual?.(patientId) }}
              disabled={!patientId}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar HL7-FHIR R4
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8M12 3v4"/></svg>
            </div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Exportación masiva</h4>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium">Desde</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="mt-1 w-full text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium">Hasta</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="mt-1 w-full text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <button
              onClick={() => { if (dateFrom && dateTo) onExportFhirBulk?.(dateFrom, dateTo) }}
              disabled={!dateFrom || !dateTo}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar rango seleccionado
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Historial de exportaciones</h4>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {exports.map(exp => (
            <div key={exp.id} className="flex items-center gap-3 px-5 py-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${exp.type === 'individual' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-500' : 'bg-violet-50 dark:bg-violet-900/20 text-violet-500'}`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                  {exp.type === 'individual'
                    ? exp.patientName
                    : `Masiva: ${exp.dateRangeFrom} → ${exp.dateRangeTo} (${exp.totalPatients} pacientes)`}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {exp.requestedBy} · {formatDateTime(exp.requestedAt)}
                  {exp.fileSize && ` · ${exp.fileSize}`}
                </p>
              </div>
              <span className={`text-xs font-medium flex-shrink-0 ${statusColors[exp.status]}`}>
                {exp.status === 'en-proceso' && (
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-1" />
                )}
                {statusLabels[exp.status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PrivacidadArcoTab({
  privacyNotice,
  arcoRequests,
  onDownloadPrivacyNotice,
  onUpdateArcoStatus,
}: {
  privacyNotice: AdminDashboardProps['privacyNotice']
  arcoRequests: ArcoRequest[]
  onDownloadPrivacyNotice?: AdminDashboardProps['onDownloadPrivacyNotice']
  onUpdateArcoStatus?: AdminDashboardProps['onUpdateArcoStatus']
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<ArcoStatus>('pendiente')
  const [notes, setNotes] = useState('')

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Aviso de Privacidad</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Versión {privacyNotice.version} · Vigente desde {privacyNotice.effectiveDate} · Última actualización: {privacyNotice.lastUpdated}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Responsable: {privacyNotice.responsible}<br />
                {privacyNotice.address}
              </p>
            </div>
          </div>
          <button
            onClick={onDownloadPrivacyNotice}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Descargar PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Solicitudes de derechos ARCO</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Acceso · Rectificación · Cancelación · Oposición — LFPDPPP</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${arcoRequests.filter(r => r.status === 'pendiente').length > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400'}`}>
            {arcoRequests.filter(r => r.status === 'pendiente').length} pendiente{arcoRequests.filter(r => r.status === 'pendiente').length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {arcoRequests.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500 italic">Sin solicitudes pendientes.</p>
          ) : arcoRequests.map(req => (
            <div key={req.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {arcoTypeLabels[req.type]}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${arcoStatusColors[req.status]}`}>
                      {arcoStatusLabels[req.status]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{req.patientName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{req.description}</p>
                  {req.notes && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">{req.notes}</p>
                  )}
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Enviada: {formatDateTime(req.submittedAt)}
                    {req.resolvedAt && ` · Resuelta: ${formatDateTime(req.resolvedAt)}`}
                  </p>
                </div>
                {(req.status === 'pendiente' || req.status === 'en-proceso') && (
                  <div className="flex-shrink-0">
                    {updatingId === req.id ? (
                      <div className="flex flex-col gap-2 min-w-[160px]">
                        <select
                          value={selectedStatus}
                          onChange={e => setSelectedStatus(e.target.value as ArcoStatus)}
                          className="text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1.5 focus:outline-none"
                        >
                          {(['pendiente', 'en-proceso', 'resuelta', 'rechazada'] as ArcoStatus[]).map(s => (
                            <option key={s} value={s}>{arcoStatusLabels[s]}</option>
                          ))}
                        </select>
                        <textarea
                          placeholder="Notas (opcional)"
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          rows={2}
                          className="text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1.5 focus:outline-none resize-none"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setUpdatingId(null); setNotes('') }}
                            className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-[10px] font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              onUpdateArcoStatus?.(req.id, selectedStatus, notes || undefined)
                              setUpdatingId(null)
                              setNotes('')
                            }}
                            className="flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-semibold transition-colors"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setUpdatingId(req.id); setSelectedStatus(req.status) }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        Actualizar estado
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function AdminDashboard({
  metrics,
  complianceBadges,
  systemUsers,
  auditLogs,
  arcoRequests,
  fhirExports,
  privacyNotice,
  onEditUser,
  onDeactivateUser,
  onActivateUser,
  onExportFhirIndividual,
  onExportFhirBulk,
  onUpdateArcoStatus,
  onDownloadPrivacyNotice,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  const pendingArco = arcoRequests.filter(r => r.status === 'pendiente').length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="py-4">
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Administración</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">Cumplimiento · Usuarios · Interoperabilidad</p>
          </div>
          <div className="flex gap-0 overflow-x-auto -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-sky-600 text-sky-700 dark:text-sky-400 dark:border-sky-500'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'privacidad' && pendingArco > 0 && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {pendingArco}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5 pb-10">
        {activeTab === 'dashboard' && (
          <DashboardTab metrics={metrics} complianceBadges={complianceBadges} />
        )}
        {activeTab === 'usuarios' && (
          <UsuariosTab
            users={systemUsers}
            onEditUser={onEditUser}
            onActivateUser={onActivateUser}
            onDeactivateUser={onDeactivateUser}
          />
        )}
        {activeTab === 'bitacora' && (
          <BitacoraTab logs={auditLogs} />
        )}
        {activeTab === 'fhir' && (
          <FhirTab
            exports={fhirExports}
            onExportFhirIndividual={onExportFhirIndividual}
            onExportFhirBulk={onExportFhirBulk}
          />
        )}
        {activeTab === 'privacidad' && (
          <PrivacidadArcoTab
            privacyNotice={privacyNotice}
            arcoRequests={arcoRequests}
            onDownloadPrivacyNotice={onDownloadPrivacyNotice}
            onUpdateArcoStatus={onUpdateArcoStatus}
          />
        )}
      </div>
    </div>
  )
}

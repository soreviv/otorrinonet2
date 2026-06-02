'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Building2, Stethoscope, Users, Shield, Plus, UserCheck, UserX,
  Save, RefreshCw, Search, Mail, Phone, MapPin, FileText, GraduationCap,
  CalendarX2, CalendarOff, Trash2, Calendar, Star, ArrowRight,
} from 'lucide-react'
import {
  saveClinicConfig, createStaffUser, toggleStaffUserStatus, saveDiasFeriados,
  type ClinicConfigData, type StaffUserData, type AuditLogRecord, type FechaBloqueo,
} from '@/app/actions/configuracion'
import { LogoUploader } from '@/components/configuracion/LogoUploader'

interface Props {
  clinicConfig: ClinicConfigData
  staffUsers: StaffUserData[]
  auditLogs: AuditLogRecord[]
  currentUserId: string
  diasFeriados: FechaBloqueo[]
}

type Tab = 'establecimiento' | 'medico' | 'usuarios' | 'bitacora' | 'calendario'

const INPUT = 'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500'
const LABEL = 'block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5'
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center text-sky-600 dark:text-sky-400">{icon}</div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ─── Establecimiento tab ──────────────────────────────────────────────────────

function GoogleReviewsCard() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [msg, setMsg] = useState('')

  async function handleRefresh() {
    setStatus('loading')
    setMsg('')
    try {
      const res = await fetch('/api/reviews/refresh', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido')
      setMsg(`${data.count} reseñas importadas · Calificación: ${data.rating} (${data.total} en total)`)
      setStatus('ok')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Error al conectar con Google')
      setStatus('err')
    }
  }

  return (
    <Card title="Reseñas de Google" icon={<Star className="w-4 h-4" strokeWidth={1.75} />}>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Importa las reseñas más recientes desde Google Places y actualiza el sitio público. Requiere que <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">GOOGLE_PLACES_API_KEY</code> esté configurada.
      </p>
      <button
        onClick={handleRefresh}
        disabled={status === 'loading'}
        className={BTN_PRIMARY}
      >
        <RefreshCw className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} strokeWidth={1.75} />
        {status === 'loading' ? 'Importando…' : 'Refrescar reseñas de Google'}
      </button>
      {msg && (
        <p className={`mt-3 text-sm font-medium ${status === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {msg}
        </p>
      )}
    </Card>
  )
}

function EstablecimientoTab({
  form, set, saved, err, isPending, onSave,
}: {
  form: ClinicConfigData
  set: (k: keyof ClinicConfigData, v: string) => void
  saved: boolean; err: string; isPending: boolean; onSave: () => void
}) {
  return (
    <div className="space-y-4" data-testid="establecimiento-tab">
      <Card title="Datos del Establecimiento" icon={<Building2 className="w-4 h-4" strokeWidth={1.75} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre del consultorio">
            <input className={INPUT} value={form.clinicName} onChange={e => set('clinicName', e.target.value)} data-testid="input-clinic-name" />
          </Field>
          <Field label="Autorización COFEPRIS">
            <input className={INPUT} placeholder="Núm. de autorización sanitaria" value={form.clinicCofepris} onChange={e => set('clinicCofepris', e.target.value)} data-testid="input-clinic-cofepris" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Domicilio">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={1.75} />
                <input className={`${INPUT} pl-9`} placeholder="Calle, número, colonia, alcaldía/municipio, ciudad, C.P." value={form.clinicAddress} onChange={e => set('clinicAddress', e.target.value)} data-testid="input-clinic-address" />
              </div>
            </Field>
          </div>
          <Field label="Teléfono">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={1.75} />
              <input className={`${INPUT} pl-9 font-mono`} placeholder="55 1234 5678" value={form.clinicPhone} onChange={e => set('clinicPhone', e.target.value)} data-testid="input-clinic-phone" />
            </div>
          </Field>
          <Field label="Correo de contacto">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={1.75} />
              <input type="email" className={`${INPUT} pl-9`} placeholder="contacto@otorrinonet.com" value={form.clinicEmail} onChange={e => set('clinicEmail', e.target.value)} data-testid="input-clinic-email" />
            </div>
          </Field>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <LogoUploader
            label="Logo del consultorio"
            helper="Aparecerá en el encabezado de las recetas e impresos del consultorio."
            value={form.clinicLogoUrl}
            onChange={(v) => set('clinicLogoUrl', v)}
          />
        </div>
      </Card>

      <GoogleReviewsCard />

      <SaveBar saved={saved} err={err} pending={isPending} onSave={onSave} />
    </div>
  )
}

// ─── Médico tab ───────────────────────────────────────────────────────────────

function MedicoTab({
  form, set, saved, err, isPending, onSave,
}: {
  form: ClinicConfigData
  set: (k: keyof ClinicConfigData, v: string) => void
  saved: boolean; err: string; isPending: boolean; onSave: () => void
}) {
  return (
    <div className="space-y-4" data-testid="medico-tab">
      <Card title="Datos del Médico" icon={<Stethoscope className="w-4 h-4" strokeWidth={1.75} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Nombre completo con título">
              <input className={INPUT} value={form.doctorName} onChange={e => set('doctorName', e.target.value)} data-testid="input-doctor-name" />
            </Field>
          </div>
          <Field label="Cédula profesional (medicina general)">
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={1.75} />
              <input className={`${INPUT} pl-9 font-mono`} placeholder="Núm. cédula profesional" value={form.doctorLicense} onChange={e => set('doctorLicense', e.target.value)} data-testid="input-doctor-license" />
            </div>
          </Field>
          <Field label="Cédula de especialidad">
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={1.75} />
              <input className={`${INPUT} pl-9 font-mono`} placeholder="Núm. cédula de especialidad" value={form.doctorSpecialtyLicense} onChange={e => set('doctorSpecialtyLicense', e.target.value)} data-testid="input-doctor-specialty-license" />
            </div>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Universidad">
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={1.75} />
                <input className={`${INPUT} pl-9`} placeholder="Ej. Universidad Nacional Autónoma de México" value={form.doctorUniversity} onChange={e => set('doctorUniversity', e.target.value)} data-testid="input-doctor-university" />
              </div>
            </Field>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
          <LogoUploader
            label="Escudo de la universidad"
            helper="Se imprimirá junto a las cédulas profesionales en las recetas."
            value={form.doctorUniversityLogoUrl}
            onChange={(v) => set('doctorUniversityLogoUrl', v)}
          />
          <LogoUploader
            label="Firma del médico"
            helper="Se usará automáticamente al firmar recetas. Sube una imagen PNG con fondo transparente o blanco (recomendado: 400 × 150 px)."
            value={form.doctorSignatureImageUrl}
            onChange={(v) => set('doctorSignatureImageUrl', v)}
          />
        </div>
      </Card>

      <SaveBar saved={saved} err={err} pending={isPending} onSave={onSave} />
    </div>
  )
}

function SaveBar({ saved, err, pending, onSave }: { saved: boolean; err: string; pending: boolean; onSave: () => void }) {
  return (
    <div className="flex items-center justify-end gap-3">
      {err && <p className="text-xs text-rose-600 dark:text-rose-400">{err}</p>}
      {saved && !err && <p className="text-xs text-emerald-600 dark:text-emerald-400">Cambios guardados ✓</p>}
      <button className={BTN_PRIMARY} onClick={onSave} disabled={pending} data-testid="save-config-button">
        {pending ? <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2} /> : <Save className="w-4 h-4" strokeWidth={2} />}
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </div>
  )
}

// ─── Usuarios tab ─────────────────────────────────────────────────────────────

function UsuariosTab({ initial, currentUserId }: { initial: StaffUserData[]; currentUserId: string }) {
  const [users, setUsers] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', name: '', role: 'enfermera', password: '' })
  const [err, setErr] = useState('')
  const [isPending, startTransition] = useTransition()

  const setF = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  function handleCreate() {
    if (!form.email || !form.name || !form.password) { setErr('Completa todos los campos.'); return }
    setErr('')
    startTransition(async () => {
      await createStaffUser(form)
      setShowForm(false)
      setForm({ email: '', name: '', role: 'enfermera', password: '' })
      // Refetch not needed — add optimistically
      setUsers(u => [...u, {
        id: Date.now().toString(), email: form.email, name: form.name,
        role: form.role, status: 'activo', totpEnabled: false, lastAccess: null,
        createdAt: new Date().toISOString(),
      }])
    })
  }

  function handleToggle(userId: string) {
    startTransition(async () => {
      await toggleStaffUserStatus(userId)
      setUsers(u => u.map(x => x.id === userId ? { ...x, status: x.status === 'activo' ? 'inactivo' : 'activo' } : x))
    })
  }

  const roleLabel: Record<string, string> = { medico: 'Médico', enfermera: 'Enfermera', recepcionista: 'Recepcionista' }

  return (
    <div className="space-y-4">
      <Card title="Usuarios del sistema" icon={<Users className="w-4 h-4" strokeWidth={1.75} />}>
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className={`flex items-center justify-between gap-3 p-4 rounded-xl border transition-colors ${u.status === 'activo' ? 'border-slate-200 dark:border-slate-700' : 'border-slate-100 dark:border-slate-800 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${u.status === 'activo' ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email} · {roleLabel[u.role] ?? u.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.totpEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                  {u.totpEnabled ? '2FA ✓' : 'Sin 2FA'}
                </span>
                {u.id !== currentUserId && (
                  <button onClick={() => handleToggle(u.id)} className={BTN_OUTLINE} disabled={isPending}>
                    {u.status === 'activo'
                      ? <><UserX className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />Desactivar</>
                      : <><UserCheck className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />Activar</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {showForm ? (
          <div className="mt-4 border border-sky-200 dark:border-sky-900 rounded-2xl p-5 bg-sky-50 dark:bg-sky-950/20 space-y-4">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Nuevo usuario</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nombre completo"><input className={INPUT} value={form.name} onChange={e => setF('name', e.target.value)} /></Field>
              <Field label="Correo electrónico"><input className={INPUT} type="email" value={form.email} onChange={e => setF('email', e.target.value)} /></Field>
              <Field label="Rol">
                <select className={INPUT} value={form.role} onChange={e => setF('role', e.target.value)}>
                  <option value="medico">Médico</option>
                  <option value="enfermera">Enfermera</option>
                  <option value="recepcionista">Recepcionista</option>
                </select>
              </Field>
              <Field label="Contraseña temporal"><input className={INPUT} type="password" value={form.password} onChange={e => setF('password', e.target.value)} /></Field>
            </div>
            {err && <p className="text-xs text-rose-600">{err}</p>}
            <div className="flex gap-2 justify-end">
              <button className={BTN_OUTLINE} onClick={() => { setShowForm(false); setErr('') }}>Cancelar</button>
              <button className={BTN_PRIMARY} onClick={handleCreate} disabled={isPending}>
                {isPending ? <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2} /> : <Plus className="w-4 h-4" strokeWidth={2} />}
                Crear usuario
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <button className={BTN_PRIMARY} onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" strokeWidth={2} />Agregar usuario
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}

// ─── Bitacora tab ─────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  login_ok: { label: 'Login exitoso', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  login_fallido: { label: 'Login fallido', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  logout: { label: 'Cierre de sesión', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  acceso: { label: 'Acceso', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  vista: { label: 'Vista', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  creacion: { label: 'Creación', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  modificacion: { label: 'Modificación', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  eliminacion: { label: 'Eliminación', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  firma: { label: 'Firma electrónica', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  exportacion_fhir: { label: 'Exportación FHIR', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
}

const RESOURCE_LABELS: Record<string, string> = {
  auth: 'Autenticación', patient: 'Paciente', patients: 'Pacientes',
  evolution_note: 'Nota de evolución', prescription: 'Receta', consent_form: 'Consentimiento',
  lab_order: 'Solicitud de estudios',
}

function BitacoraTab({ logs }: { logs: AuditLogRecord[] }) {
  const [search, setSearch] = useState('')

  const filtered = logs.filter(l =>
    !search ||
    l.userName?.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.resource.toLowerCase().includes(search.toLowerCase()) ||
    l.ipAddress?.includes(search)
  )

  function fmt(iso: string) {
    return new Date(iso).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'short', timeStyle: 'short' })
  }

  return (
    <Card title="Bitácora de auditoría" icon={<Shield className="w-4 h-4" strokeWidth={1.75} />}>
      <p className="text-xs text-slate-400 mb-4">Registro inmutable conforme a NOM-024-SSA3-2012 y LFPDPPP. Últimas 100 entradas.</p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
        <input className={`${INPUT} pl-9`} placeholder="Buscar por usuario, acción o IP…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {!filtered.length
        ? <p className="text-sm text-slate-400 italic text-center py-8">Sin registros encontrados.</p>
        : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-y border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-2 text-left font-bold uppercase tracking-widest text-slate-400">Fecha</th>
                  <th className="px-3 py-2 text-left font-bold uppercase tracking-widest text-slate-400">Usuario</th>
                  <th className="px-3 py-2 text-left font-bold uppercase tracking-widest text-slate-400">Acción</th>
                  <th className="px-3 py-2 text-left font-bold uppercase tracking-widest text-slate-400">Recurso</th>
                  <th className="px-6 py-2 text-left font-bold uppercase tracking-widest text-slate-400">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map(l => {
                  const ac = ACTION_LABELS[l.action] ?? { label: l.action, color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' }
                  return (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-2.5 font-mono text-slate-400 whitespace-nowrap">{fmt(l.timestamp)}</td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{l.userName ?? <span className="text-slate-400 italic">Sistema</span>}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-1.5 py-0.5 rounded-full font-semibold ${ac.color}`}>{ac.label}</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{RESOURCE_LABELS[l.resource] ?? l.resource}{l.resourceId ? <span className="text-slate-400 font-mono ml-1">#{l.resourceId.slice(0, 8)}</span> : ''}</td>
                      <td className="px-6 py-2.5 font-mono text-slate-400">{l.ipAddress ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
    </Card>
  )
}

// ─── Calendario tab ───────────────────────────────────────────────────────────

const TIPO_LABELS: Record<FechaBloqueo['tipo'], string> = {
  feriado: 'Feriado oficial',
  vacaciones: 'Vacaciones',
  congreso: 'Congreso / Evento',
}

const TIPO_COLORS: Record<FechaBloqueo['tipo'], string> = {
  feriado: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  vacaciones: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  congreso: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
}

function nthMonday(year: number, month: number, n: number): string {
  const date = new Date(year, month, 1)
  const dow = date.getDay()
  const daysToFirst = dow === 1 ? 0 : dow === 0 ? 1 : 8 - dow
  const day = 1 + daysToFirst + (n - 1) * 7
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getMexicanHolidays(year: number): Omit<FechaBloqueo, 'id'>[] {
  return [
    { date: `${year}-01-01`, tipo: 'feriado', etiqueta: 'Año Nuevo' },
    { date: nthMonday(year, 1, 1), tipo: 'feriado', etiqueta: 'Día de la Constitución' },
    { date: nthMonday(year, 2, 3), tipo: 'feriado', etiqueta: 'Natalicio de Benito Juárez' },
    { date: `${year}-05-01`, tipo: 'feriado', etiqueta: 'Día del Trabajo' },
    { date: `${year}-09-16`, tipo: 'feriado', etiqueta: 'Día de la Independencia' },
    { date: nthMonday(year, 10, 3), tipo: 'feriado', etiqueta: 'Revolución Mexicana' },
    { date: `${year}-12-25`, tipo: 'feriado', etiqueta: 'Navidad' },
  ]
}

function CalendarioTab({ initial }: { initial: FechaBloqueo[] }) {
  const [dates, setDates] = useState<FechaBloqueo[]>(
    [...initial].sort((a, b) => a.date.localeCompare(b.date))
  )
  const [newDate, setNewDate] = useState('')
  const [newTipo, setNewTipo] = useState<FechaBloqueo['tipo']>('vacaciones')
  const [newEtiqueta, setNewEtiqueta] = useState('')
  const [holidayYear, setHolidayYear] = useState(new Date().getFullYear())
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')
  const [isPending, startTransition] = useTransition()

  function addDate() {
    if (!newDate || !newEtiqueta.trim()) return
    if (dates.some(d => d.date === newDate)) return
    const entry: FechaBloqueo = {
      id: `${newDate}-${Date.now()}`,
      date: newDate,
      tipo: newTipo,
      etiqueta: newEtiqueta.trim(),
    }
    setDates(prev => [...prev, entry].sort((a, b) => a.date.localeCompare(b.date)))
    setNewDate('')
    setNewEtiqueta('')
    setSaved(false)
  }

  function removeDate(id: string) {
    setDates(prev => prev.filter(d => d.id !== id))
    setSaved(false)
  }

  function addHolidays() {
    const holidays = getMexicanHolidays(holidayYear)
    setDates(prev => {
      const existing = new Set(prev.map(d => d.date))
      const toAdd = holidays
        .filter(h => !existing.has(h.date))
        .map(h => ({ ...h, id: `${h.date}-official` }))
      return [...prev, ...toAdd].sort((a, b) => a.date.localeCompare(b.date))
    })
    setSaved(false)
  }

  function handleSave() {
    setErr('')
    startTransition(async () => {
      try {
        await saveDiasFeriados(dates)
        setSaved(true)
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Error al guardar.')
      }
    })
  }

  function formatDate(iso: string) {
    return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  const thisYear = new Date().getFullYear()

  return (
    <div className="space-y-4">
      {/* Acceso rápido a bloqueos de rango */}
      <Link
        href="/staff/agenda/bloqueos"
        className="flex items-center justify-between gap-4 px-5 py-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-2xl hover:bg-sky-100 dark:hover:bg-sky-950/50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <CalendarOff className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">Bloquear rango de fechas</p>
            <p className="text-xs text-sky-600 dark:text-sky-400">Vacaciones, congresos, incapacidades — bloquea varios días de una vez</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-sky-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
      </Link>

      <Card title="Días feriados y fechas individuales" icon={<CalendarX2 className="w-4 h-4" strokeWidth={1.75} />}>
        {/* Agregar fecha individual */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Fecha">
            <input
              type="date"
              className={INPUT}
              value={newDate}
              onChange={e => { setNewDate(e.target.value); setSaved(false) }}
            />
          </Field>
          <Field label="Tipo">
            <select className={INPUT} value={newTipo} onChange={e => setNewTipo(e.target.value as FechaBloqueo['tipo'])}>
              <option value="vacaciones">Vacaciones</option>
              <option value="congreso">Congreso / Evento</option>
              <option value="feriado">Feriado oficial</option>
            </select>
          </Field>
          <Field label="Descripción">
            <input
              className={INPUT}
              placeholder="Ej. Congreso AMCORL 2026"
              value={newEtiqueta}
              onChange={e => setNewEtiqueta(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addDate() }}
            />
          </Field>
        </div>
        <div className="mt-3">
          <button
            className={BTN_PRIMARY}
            onClick={addDate}
            disabled={!newDate || !newEtiqueta.trim()}
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Agregar fecha
          </button>
        </div>

        {/* Feriados oficiales */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className={LABEL}>Feriados oficiales de México</p>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={holidayYear}
              onChange={e => setHolidayYear(Number(e.target.value))}
            >
              {[thisYear, thisYear + 1, thisYear + 2].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button className={BTN_OUTLINE} onClick={addHolidays}>
              <Calendar className="w-4 h-4" strokeWidth={1.75} />
              Agregar feriados {holidayYear}
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Año Nuevo · Constitución · Juárez · Día del Trabajo · Independencia · Revolución · Navidad
          </p>
        </div>

        {/* Lista de fechas bloqueadas */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className={LABEL}>Fechas bloqueadas ({dates.length})</p>
          {dates.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-600 italic py-4 text-center">
              No hay fechas bloqueadas. Los pacientes podrán agendar cualquier día hábil.
            </p>
          ) : (
            <div className="space-y-2 mt-2">
              {dates.map(d => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${TIPO_COLORS[d.tipo]}`}>
                      {TIPO_LABELS[d.tipo]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{d.etiqueta}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{formatDate(d.date)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDate(d.id)}
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    aria-label={`Eliminar ${d.etiqueta}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <SaveBar saved={saved} err={err} pending={isPending} onSave={handleSave} />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ConfiguracionClient({ clinicConfig, staffUsers, auditLogs, currentUserId, diasFeriados }: Props) {
  const [tab, setTab] = useState<Tab>('establecimiento')
  const [form, setFormState] = useState<ClinicConfigData>({ ...clinicConfig })
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')
  const [isPending, startTransition] = useTransition()

  const set = (k: keyof ClinicConfigData, v: string) => {
    setFormState(f => ({ ...f, [k]: v }))
    setSaved(false)
    setErr('')
  }

  function handleSave() {
    setErr('')
    startTransition(async () => {
      try {
        await saveClinicConfig(form)
        setSaved(true)
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Error al guardar.')
      }
    })
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'establecimiento', label: 'Establecimiento', icon: <Building2 className="w-4 h-4" strokeWidth={1.75} /> },
    { id: 'medico', label: 'Médico', icon: <Stethoscope className="w-4 h-4" strokeWidth={1.75} /> },
    { id: 'usuarios', label: 'Usuarios', icon: <Users className="w-4 h-4" strokeWidth={1.75} /> },
    { id: 'calendario', label: 'Calendario', icon: <CalendarX2 className="w-4 h-4" strokeWidth={1.75} /> },
    { id: 'bitacora', label: 'Bitácora', icon: <Shield className="w-4 h-4" strokeWidth={1.75} /> },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">Configuración</h1>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${tab === t.id ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'establecimiento' && (
          <EstablecimientoTab form={form} set={set} saved={saved} err={err} isPending={isPending} onSave={handleSave} />
        )}
        {tab === 'medico' && (
          <MedicoTab form={form} set={set} saved={saved} err={err} isPending={isPending} onSave={handleSave} />
        )}
        {tab === 'usuarios' && (
          <UsuariosTab initial={staffUsers} currentUserId={currentUserId} />
        )}
        {tab === 'calendario' && (
          <CalendarioTab initial={diasFeriados} />
        )}
        {tab === 'bitacora' && (
          <BitacoraTab logs={auditLogs} />
        )}
      </div>
    </div>
  )
}

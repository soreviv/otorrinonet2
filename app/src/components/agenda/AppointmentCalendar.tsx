'use client'

// Fonts: DM Sans (headings), Inter (body), IBM Plex Mono (mono)
// Colors: sky (primary), sky (secondary), slate (neutral)

import { useState, useMemo } from 'react'
import type {
  AppointmentCalendarProps,
  Appointment,
  AppointmentStatus,
} from '@/lib/agenda-types'
import {
  Search,
  Plus,
  Phone,
  Mail,
  Clock,
  Calendar,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  User,
} from 'lucide-react'

// ─── Status config ────────────────────────────────────────────────────────────

type StatusCfg = {
  label: string
  bg: string
  text: string
  dot: string
  pillBg: string
  pillText: string
}

const STATUS: Record<AppointmentStatus, StatusCfg> = {
  pendiente: {
    label: 'Pendiente',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-400',
    pillBg: 'bg-amber-100 dark:bg-amber-900/40',
    pillText: 'text-amber-700 dark:text-amber-300',
  },
  confirmada: {
    label: 'Confirmada',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500',
    pillBg: 'bg-sky-100 dark:bg-sky-900/40',
    pillText: 'text-sky-700 dark:text-sky-300',
  },
  cancelada: {
    label: 'Cancelada',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-400',
    pillBg: 'bg-rose-100 dark:bg-rose-900/40',
    pillText: 'text-rose-600 dark:text-rose-400',
  },
  reprogramada: {
    label: 'Reprogramada',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-400',
    pillBg: 'bg-sky-100 dark:bg-sky-900/40',
    pillText: 'text-sky-700 dark:text-sky-300',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().split('T')[0]
}

function formatDateHeading(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)

  const short = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  if (target.getTime() === today.getTime()) return `Hoy · ${short}`
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (target.getTime() === tomorrow.getTime()) return `Mañana · ${short}`
  return d.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatCreatedAt(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function groupByDate(appointments: Appointment[]): [string, Appointment[]][] {
  const map = new Map<string, Appointment[]>()
  for (const apt of appointments) {
    const list = map.get(apt.date) ?? []
    list.push(apt)
    map.set(apt.date, list)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, apts]) => [
      date,
      apts.sort((a, b) => a.time.localeCompare(b.time)),
    ])
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = STATUS[status]
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.pillBg} ${cfg.pillText}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  appointment: Appointment
  onConfirm: () => void
  onReject: () => void
  onCancel: () => void
  onReschedule: () => void
}

function DetailPanel({
  appointment,
  onConfirm,
  onReject,
  onCancel,
  onReschedule,
}: DetailPanelProps) {
  const apt = appointment

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero strip */}
      <div className="bg-sky-600 dark:bg-sky-700 px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white text-lg font-bold tracking-wide shrink-0">
            {getInitials(apt.patientName)}
          </div>
          <div>
            <h2 className="text-white text-xl font-semibold leading-tight">{apt.patientName}</h2>
            <div className="mt-1.5">
              <StatusBadge status={apt.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-lg space-y-4">
        {/* Date / Time / Service */}
        <InfoCard>
          <InfoRow
            icon={<Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />}
            iconBg="bg-sky-50 dark:bg-sky-950/40"
            label="Fecha"
            value={<span className="capitalize">{formatFullDate(apt.date)}</span>}
          />
          <Divider />
          <InfoRow
            icon={<Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />}
            iconBg="bg-sky-50 dark:bg-sky-950/40"
            label="Hora"
            value={<span className="font-mono">{apt.time} hrs</span>}
          />
          <Divider />
          <InfoRow
            icon={<User className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />}
            iconBg="bg-sky-50 dark:bg-sky-950/40"
            label="Servicio"
            value={apt.serviceName}
          />
        </InfoCard>

        {/* Contact */}
        <InfoCard>
          <InfoRow
            icon={<Phone className="w-4 h-4 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />}
            iconBg="bg-slate-100 dark:bg-slate-700"
            label="Teléfono"
            value={<span className="font-mono">{apt.phone}</span>}
          />
          <Divider />
          <InfoRow
            icon={<Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />}
            iconBg="bg-slate-100 dark:bg-slate-700"
            label="Correo"
            value={apt.email}
          />
        </InfoCard>

        {/* Reason */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
            Motivo de consulta
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{apt.reason}</p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          {apt.status === 'pendiente' && (
            <div className="flex gap-2">
              <button
                onClick={onConfirm}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" strokeWidth={2.5} />
                Confirmar
              </button>
              <button
                onClick={onReject}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
                Rechazar
              </button>
            </div>
          )}

          {(apt.status === 'confirmada' || apt.status === 'reprogramada') && (
            <div className="flex gap-2">
              <button
                onClick={onReschedule}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30"
              >
                <RefreshCw className="w-4 h-4" strokeWidth={1.75} />
                Reprogramar
              </button>
              <button
                onClick={onCancel}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
                Cancelar
              </button>
            </div>
          )}

          {apt.status === 'cancelada' && (
            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900">
              <X className="w-4 h-4 text-rose-400" strokeWidth={2} />
              <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">Esta cita fue cancelada</p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-600 text-center pt-2">
          Solicitud recibida: {formatCreatedAt(apt.createdAt)}
        </p>
      </div>
    </div>
  )
}

// ─── Small layout helpers ──────────────────────────────────────────────────────

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3">{children}</div>
  )
}

function Divider() {
  return <div className="h-px bg-slate-200 dark:bg-slate-700" />
}

interface InfoRowProps {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: React.ReactNode
}

function InfoRow({ icon, iconBg, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{value}</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AppointmentCalendar({
  appointments,
  onConfirm,
  onReject,
  onCancel,
  onReschedule,
  onSelect,
  onCreate,
  onSearch,
}: AppointmentCalendarProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    appointments[0]?.id ?? null
  )
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return appointments
    const q = searchQuery.toLowerCase()
    return appointments.filter(
      (apt) =>
        apt.patientName.toLowerCase().includes(q) ||
        apt.phone.includes(q) ||
        apt.serviceName.toLowerCase().includes(q)
    )
  }, [appointments, searchQuery])

  const grouped = useMemo(() => groupByDate(filtered), [filtered])

  const selected = appointments.find((a) => a.id === selectedId) ?? null

  const pendingCount = appointments.filter((a) => a.status === 'pendiente').length
  const todayCount = appointments.filter((a) => isToday(a.date)).length

  function handleSelect(apt: Appointment) {
    setSelectedId(apt.id)
    onSelect?.(apt.id)
  }

  function handleSearch(q: string) {
    setSearchQuery(q)
    onSearch?.(q)
  }

  return (
    <div className="flex h-full min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Left: appointment list ── */}
      <aside className="w-full md:w-[400px] lg:w-[460px] shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Agenda de Citas
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {todayCount > 0
                    ? `${todayCount} cita${todayCount !== 1 ? 's' : ''} hoy`
                    : 'Sin citas hoy'}
                </span>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onCreate}
              className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Nueva
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              strokeWidth={1.5}
            />
            <input
              type="text"
              placeholder="Buscar paciente o teléfono..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-600">
              <Search className="w-8 h-8 mb-2 opacity-30" strokeWidth={1.5} />
              <p className="text-sm">Sin resultados para &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            grouped.map(([date, dayApts]) => (
              <div key={date}>
                {/* Day heading */}
                <div
                  className={`flex items-center gap-3 px-6 py-2 ${
                    isToday(date)
                      ? 'sticky top-0 z-10 bg-sky-50 dark:bg-sky-950/30'
                      : ''
                  }`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-widest capitalize ${
                      isToday(date)
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {formatDateHeading(date)}
                  </span>
                  <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                  <span className="text-xs text-slate-400 font-mono">{dayApts.length}</span>
                </div>

                {/* Appointment rows */}
                {dayApts.map((apt) => {
                  const isSelected = apt.id === selectedId
                  const cfg = STATUS[apt.status]
                  return (
                    <button
                      key={apt.id}
                      onClick={() => handleSelect(apt)}
                      className={`w-full text-left px-6 py-3 flex items-start gap-3 transition-all group relative ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-sky-500 rounded-r" />
                      )}

                      {/* Avatar */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {getInitials(apt.patientName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isSelected
                                ? 'text-sky-900 dark:text-sky-100'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {apt.patientName}
                          </p>
                          <span className="text-xs font-mono text-slate-400 shrink-0 ml-1">
                            {apt.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {apt.serviceName}
                        </p>
                        <div className="mt-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${cfg.pillBg} ${cfg.pillText}`}
                          >
                            <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 mt-2.5 transition-all ${
                          isSelected
                            ? 'text-sky-500 opacity-100'
                            : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                        }`}
                        strokeWidth={2}
                      />
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Right: detail panel ── */}
      <main className="hidden md:flex flex-1 flex-col bg-white dark:bg-slate-900 overflow-hidden">
        {selected ? (
          <DetailPanel
            appointment={selected}
            onConfirm={() => onConfirm?.(selected.id)}
            onReject={() => onReject?.(selected.id)}
            onCancel={() => onCancel?.(selected.id)}
            onReschedule={() => onReschedule?.(selected.id)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-300 dark:text-slate-700">
            <div className="text-center space-y-2">
              <Calendar className="w-12 h-12 mx-auto opacity-30" strokeWidth={1} />
              <p className="text-sm text-slate-400 dark:text-slate-600">
                Selecciona una cita para ver los detalles
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

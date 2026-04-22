// Fonts: DM Sans (headings), Inter (body), IBM Plex Mono (mono)
// Colors: teal (primary), sky (secondary), slate (neutral)

import { useState, useMemo } from 'react'
import type { PatientListProps, Patient, UserRole } from '../types'
import { Search, Plus, ChevronRight, User, X } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

function getActiveDiagnosis(patient: Patient): string | null {
  const active = patient.diagnoses.find((d) => d.status === 'activo' || d.status === 'crónico')
  return active ? active.description : null
}

// ─── Patient row ──────────────────────────────────────────────────────────────

interface PatientRowProps {
  patient: Patient
  onView?: () => void
}

function PatientRow({ patient, onView }: PatientRowProps) {
  const p = patient
  const age = calculateAge(p.generalData.birthDate)
  const activeDx = getActiveDiagnosis(p)

  return (
    <button
      onClick={onView}
      className="w-full text-left flex items-center gap-4 px-4 sm:px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group border-b border-slate-100 dark:border-slate-800 last:border-0"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-sm font-bold text-teal-700 dark:text-teal-300 shrink-0">
        {getInitials(p.generalData.fullName)}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {p.generalData.fullName}
          </p>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 shrink-0">
            {p.expedienteNumber}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {age} años · {p.generalData.sex.charAt(0).toUpperCase() + p.generalData.sex.slice(1)}
          </span>
          {activeDx && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                {activeDx}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Updated date */}
      <div className="hidden sm:block text-right shrink-0">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {formatRelativeDate(p.updatedAt)}
        </p>
        <p className="text-xs text-slate-300 dark:text-slate-700 mt-0.5">
          {p.diagnoses.length} dx
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight
        className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors shrink-0"
        strokeWidth={2}
      />
    </button>
  )
}

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        role === 'medico'
          ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'
          : 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${role === 'medico' ? 'bg-teal-500' : 'bg-sky-400'}`} />
      {role === 'medico' ? 'Médico' : 'Enfermera'}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PatientList({
  patients,
  currentUserRole,
  onView,
  onCreate,
  onSearch,
}: PatientListProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return patients
    const q = query.toLowerCase()
    return patients.filter(
      (p) =>
        p.generalData.fullName.toLowerCase().includes(q) ||
        p.expedienteNumber.toLowerCase().includes(q) ||
        p.diagnoses.some((d) => d.description.toLowerCase().includes(q))
    )
  }, [patients, query])

  function handleSearch(value: string) {
    setQuery(value)
    onSearch?.(value)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              Expedientes
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {patients.length} paciente{patients.length !== 1 ? 's' : ''} registrado{patients.length !== 1 ? 's' : ''}
              </p>
              <RoleBadge role={currentUserRole} />
            </div>
          </div>
          {currentUserRole === 'medico' && (
            <button
              onClick={onCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Nuevo paciente
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, expediente o diagnóstico..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition shadow-sm"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Column headers */}
        <div className="hidden sm:flex items-center gap-4 px-6 py-2 mb-1">
          <div className="w-10 shrink-0" />
          <p className="flex-1 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Paciente
          </p>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 w-24 text-right shrink-0">
            Actualizado
          </p>
          <div className="w-4 shrink-0" />
        </div>

        {/* Patient list */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600">
              {query ? (
                <>
                  <Search className="w-8 h-8 mb-2 opacity-30" strokeWidth={1.5} />
                  <p className="text-sm">Sin resultados para "{query}"</p>
                  <button
                    onClick={() => handleSearch('')}
                    className="mt-2 text-xs text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Limpiar búsqueda
                  </button>
                </>
              ) : (
                <>
                  <User className="w-8 h-8 mb-2 opacity-30" strokeWidth={1.5} />
                  <p className="text-sm">Sin expedientes registrados</p>
                </>
              )}
            </div>
          ) : (
            filtered.map((patient) => (
              <PatientRow
                key={patient.id}
                patient={patient}
                onView={() => onView?.(patient.id)}
              />
            ))
          )}
        </div>

        {/* Results count when searching */}
        {query && filtered.length > 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-600 text-center mt-3">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para "{query}"
          </p>
        )}
      </div>
    </div>
  )
}

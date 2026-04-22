import { useState } from 'react'
import type {
  DocumentListProps,
  EvolutionNote,
  SurgicalNote,
  Prescription,
  ConsentForm,
} from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function relativeDate(iso: string) {
  const now = new Date()
  const d = new Date(iso)
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'hoy'
  if (diff === 1) return 'ayer'
  if (diff < 7) return `hace ${diff} días`
  if (diff < 30) return `hace ${Math.floor(diff / 7)} sem.`
  return formatDate(iso.slice(0, 10))
}

// ─── Status Badges ─────────────────────────────────────────────────────────────

function PrescriptionBadge({ status }: { status: 'borrador' | 'firmada' }) {
  if (status === 'firmada')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Firmada
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
      Borrador
    </span>
  )
}

function ConsentBadge({ status }: { status: ConsentForm['status'] }) {
  const map = {
    'pendiente': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    'firmado-presencial': 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    'firmado-correo': 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    'rechazado': 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  }
  const labels = {
    'pendiente': 'Pendiente',
    'firmado-presencial': 'Firmado presencial',
    'firmado-correo': 'Firmado por correo',
    'rechazado': 'Rechazado',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  )
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  count,
  accentClass,
  open,
  onToggle,
  onNew,
  newLabel,
}: {
  icon: React.ReactNode
  title: string
  count: number
  accentClass: string
  open: boolean
  onToggle: () => void
  onNew?: () => void
  newLabel: string
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button
        onClick={onToggle}
        className="flex items-center gap-3 flex-1 text-left group"
      >
        <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${accentClass} text-white shadow-sm`}>
          {icon}
        </span>
        <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
          {title}
        </span>
        <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          {count}
        </span>
        <svg
          className={`ml-auto w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {onNew && (
        <button
          onClick={onNew}
          className="ml-3 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-sm"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          {newLabel}
        </button>
      )}
    </div>
  )
}

// ─── Row Components ────────────────────────────────────────────────────────────

function EvolutionNoteRow({ note, onView }: { note: EvolutionNote; onView?: () => void }) {
  return (
    <button
      onClick={onView}
      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group border-t border-slate-100 dark:border-slate-700"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-violet-700 dark:text-violet-400 leading-none">
          {new Date(note.date + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit' })}
        </span>
        <span className="text-[9px] uppercase tracking-wide text-violet-500 dark:text-violet-500">
          {new Date(note.date + 'T00:00:00').toLocaleDateString('es-MX', { month: 'short' })}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
          {note.consultationReason}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
          {note.updatedDiagnosis}
        </p>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span className="text-xs text-slate-400 dark:text-slate-500">{note.time}</span>
        <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </button>
  )
}

function SurgicalNoteRow({ note, onView }: { note: SurgicalNote; onView?: () => void }) {
  const typeLabels = { preoperatoria: 'Preop.', postoperatoria: 'Postop.' }
  const typeColors = {
    preoperatoria: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    postoperatoria: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  }
  return (
    <button
      onClick={onView}
      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group border-t border-slate-100 dark:border-slate-700"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
        <svg className="w-5 h-5 text-orange-500 dark:text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
            {note.procedure}
          </p>
          <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeColors[note.type]}`}>
            {typeLabels[note.type]}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Programada: {formatDate(note.scheduledDate)} · {note.anesthesia}
        </p>
      </div>
      <svg className="flex-shrink-0 w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-500 transition-colors self-center" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  )
}

function PrescriptionRow({ rx, onView }: { rx: Prescription; onView?: () => void }) {
  return (
    <button
      onClick={onView}
      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group border-t border-slate-100 dark:border-slate-700"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
        <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
            {rx.medications.map(m => m.name).join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <PrescriptionBadge status={rx.status} />
          <span className="text-xs text-slate-400 dark:text-slate-500">{relativeDate(rx.createdAt)}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">· {rx.medications.length} medicamento{rx.medications.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <svg className="flex-shrink-0 w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-500 transition-colors self-center" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  )
}

function ConsentRow({ consent, onView }: { consent: ConsentForm; onView?: () => void }) {
  return (
    <button
      onClick={onView}
      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group border-t border-slate-100 dark:border-slate-700"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
        <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8M16 17H8M10 9H8" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
          {consent.procedure}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <ConsentBadge status={consent.status} />
          <span className="text-xs text-slate-400 dark:text-slate-500">{relativeDate(consent.createdAt)}</span>
        </div>
      </div>
      <svg className="flex-shrink-0 w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-500 transition-colors self-center" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="px-4 py-6 border-t border-slate-100 dark:border-slate-700 text-center">
      <p className="text-xs text-slate-400 dark:text-slate-500 italic">{label}</p>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DocumentList({
  currentPatient,
  evolutionNotes,
  surgicalNotes,
  prescriptions,
  consentForms,
  onViewNote,
  onViewSurgicalNote,
  onViewPrescription,
  onViewConsent,
  onNewNote,
  onNewSurgicalNote,
  onNewPrescription,
  onNewConsent,
  onBack,
}: DocumentListProps) {
  const [openSections, setOpenSections] = useState({
    evolution: true,
    surgical: true,
    prescriptions: true,
    consents: true,
  })

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections(s => ({ ...s, [key]: !s[key] }))

  const patientNotes = evolutionNotes.filter(n => n.patientId === currentPatient.id)
  const patientSurgical = surgicalNotes.filter(n => n.patientId === currentPatient.id)
  const patientRx = prescriptions.filter(r => r.patientId === currentPatient.id)
  const patientConsents = consentForms.filter(c => c.patientId === currentPatient.id)

  const pendingConsents = patientConsents.filter(c => c.status === 'pendiente').length
  const draftRx = patientRx.filter(r => r.status === 'borrador').length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {currentPatient.name}
            </h1>
            <p className="text-xs font-mono text-slate-400 dark:text-slate-500">
              {currentPatient.expedienteNumber}
            </p>
          </div>
          {/* Alert badges */}
          <div className="flex items-center gap-2">
            {draftRx > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                {draftRx} borrador{draftRx > 1 ? 'es' : ''}
              </span>
            )}
            {pendingConsents > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-xs font-medium text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-700/50">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                </svg>
                {pendingConsents} pendiente{pendingConsents > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3 pb-8">

        {/* Evolution Notes */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <SectionHeader
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
            }
            title="Notas de Evolución"
            count={patientNotes.length}
            accentClass="bg-violet-500"
            open={openSections.evolution}
            onToggle={() => toggle('evolution')}
            onNew={onNewNote}
            newLabel="Nueva nota"
          />
          {openSections.evolution && (
            patientNotes.length === 0
              ? <EmptyState label="Sin notas de evolución registradas" />
              : patientNotes.map(n => (
                <EvolutionNoteRow key={n.id} note={n} onView={() => onViewNote?.(n.id)} />
              ))
          )}
        </div>

        {/* Surgical Notes */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <SectionHeader
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            }
            title="Notas Quirúrgicas"
            count={patientSurgical.length}
            accentClass="bg-orange-500"
            open={openSections.surgical}
            onToggle={() => toggle('surgical')}
            onNew={onNewSurgicalNote}
            newLabel="Nueva nota"
          />
          {openSections.surgical && (
            patientSurgical.length === 0
              ? <EmptyState label="Sin notas quirúrgicas para este paciente" />
              : patientSurgical.map(n => (
                <SurgicalNoteRow key={n.id} note={n} onView={() => onViewSurgicalNote?.(n.id)} />
              ))
          )}
        </div>

        {/* Prescriptions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <SectionHeader
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
            }
            title="Recetas Médicas"
            count={patientRx.length}
            accentClass="bg-teal-600"
            open={openSections.prescriptions}
            onToggle={() => toggle('prescriptions')}
            onNew={onNewPrescription}
            newLabel="Nueva receta"
          />
          {openSections.prescriptions && (
            patientRx.length === 0
              ? <EmptyState label="Sin recetas emitidas para este paciente" />
              : patientRx.map(rx => (
                <PrescriptionRow key={rx.id} rx={rx} onView={() => onViewPrescription?.(rx.id)} />
              ))
          )}
        </div>

        {/* Consent Forms */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <SectionHeader
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8M16 17H8M10 9H8" />
              </svg>
            }
            title="Consentimientos Informados"
            count={patientConsents.length}
            accentClass="bg-sky-600"
            open={openSections.consents}
            onToggle={() => toggle('consents')}
            onNew={onNewConsent}
            newLabel="Nuevo consentimiento"
          />
          {openSections.consents && (
            patientConsents.length === 0
              ? <EmptyState label="Sin consentimientos registrados para este paciente" />
              : patientConsents.map(c => (
                <ConsentRow key={c.id} consent={c} onView={() => onViewConsent?.(c.id)} />
              ))
          )}
        </div>

      </div>
    </div>
  )
}

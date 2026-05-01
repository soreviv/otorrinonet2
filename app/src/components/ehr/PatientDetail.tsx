'use client'

import { useState, useEffect } from 'react'
import type { PatientDetailProps, DiagnosisStatus } from '@/lib/ehr-types'
import type { EvolutionNote, Prescription } from '@/lib/notas-types'
import type { VitalsRecord } from '@/app/actions/patient-clinical'
import { getPatientVitals, getPatientEvolutionNotes, getPatientPrescriptions } from '@/app/actions/patient-clinical'
import { getPatientLabOrders, type LabOrderRecord } from '@/app/actions/lab-orders'
import { printPrescription } from '@/lib/print-prescription'
import {
  ChevronDown, ArrowLeft, Pencil, User, HeartPulse, ClipboardList,
  Stethoscope, Pill, AlertTriangle, Lock, Calendar, Phone, Mail,
  MapPin, FileText, Printer, ScrollText, FlaskConical, AlertCircle,
} from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDateShort(iso: string) {
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const DX_STATUS: Record<DiagnosisStatus, { label: string; bg: string; text: string }> = {
  activo: { label: 'Activo', bg: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-700 dark:text-sky-300' },
  crónico: { label: 'Crónico', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
  resuelto: { label: 'Resuelto', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ icon, title, accentColor, defaultOpen = true, children, locked, lockedMessage }: {
  icon: React.ReactNode; title: string; accentColor: string; defaultOpen?: boolean
  children: React.ReactNode; locked?: boolean; lockedMessage?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accentColor}`}>{icon}</div>
        <span className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">{title}</span>
        {locked && <span className="flex items-center gap-1 text-xs text-slate-400 mr-2"><Lock className="w-3 h-3" />Restringido</span>}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>
      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          {locked
            ? <div className="px-5 py-6 flex items-center gap-3 text-slate-400 dark:text-slate-600"><Lock className="w-5 h-5" /><p className="text-sm">{lockedMessage ?? 'Sin acceso.'}</p></div>
            : <div className="px-5 py-5">{children}</div>}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 sm:w-44 shrink-0 mb-0.5 sm:mb-0 sm:pt-0.5">{label}</dt>
      <dd className={`text-sm text-slate-800 dark:text-slate-200 leading-relaxed ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <dl className="space-y-3">{children}</dl>
}

function TagList({ items, color = 'slate' }: { items: string[]; color?: 'slate' | 'rose' | 'amber' }) {
  if (!items.length) return <span className="text-sm text-slate-400 dark:text-slate-600 italic">Ninguno registrado</span>
  const styles = { slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400', rose: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300', amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => <span key={i} className={`px-2 py-0.5 rounded-md text-xs font-medium ${styles[color]}`}>{item}</span>)}
    </div>
  )
}

// ─── Vitals display ───────────────────────────────────────────────────────────

type VitalStatus = 'normal' | 'warning' | 'critical'

function vitalStatus(key: string, val: number | null): VitalStatus {
  if (val == null) return 'normal'
  if (key === 'presionSistolica' && val > 140) return 'critical'
  if (key === 'presionSistolica' && val > 130) return 'warning'
  if (key === 'presionDiastolica' && val > 90) return 'critical'
  if (key === 'presionDiastolica' && val > 85) return 'warning'
  if (key === 'frecuenciaCardiaca' && (val < 50 || val > 110)) return 'warning'
  if (key === 'temperatura' && val > 38.5) return 'critical'
  if (key === 'temperatura' && val > 37.5) return 'warning'
  if (key === 'saturacionOxigeno' && val < 90) return 'critical'
  if (key === 'saturacionOxigeno' && val < 95) return 'warning'
  return 'normal'
}

const statusColors: Record<VitalStatus, string> = {
  normal: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300',
  warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900 text-amber-700 dark:text-amber-300',
  critical: 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900 text-rose-700 dark:text-rose-300',
}

function VitalChip({ label, value, unit, field }: { label: string; value: number | null; unit: string; field: string }) {
  if (value == null) return null
  const s = vitalStatus(field, value)
  return (
    <div className={`flex flex-col items-center p-3 rounded-xl border ${statusColors[s]}`}>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</span>
      <span className="text-xl font-bold font-mono mt-1">{value}</span>
      <span className="text-[10px] opacity-60">{unit}</span>
    </div>
  )
}

function VitalsGrid({ v }: { v: VitalsRecord }) {
  const bp = v.presionSistolica != null && v.presionDiastolica != null
    ? `${v.presionSistolica}/${v.presionDiastolica}`
    : null
  const bpStatus: VitalStatus = vitalStatus('presionSistolica', v.presionSistolica)

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {bp && (
        <div className={`flex flex-col items-center p-3 rounded-xl border ${statusColors[bpStatus]}`}>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">T/A</span>
          <span className="text-lg font-bold font-mono mt-1">{bp}</span>
          <span className="text-[10px] opacity-60">mmHg</span>
        </div>
      )}
      <VitalChip label="FC" value={v.frecuenciaCardiaca} unit="lpm" field="frecuenciaCardiaca" />
      <VitalChip label="Temp." value={v.temperatura} unit="°C" field="temperatura" />
      <VitalChip label="SpO₂" value={v.saturacionOxigeno} unit="%" field="saturacionOxigeno" />
      <VitalChip label="Peso" value={v.peso} unit="kg" field="peso" />
      <VitalChip label="Talla" value={v.talla} unit="cm" field="talla" />
      {v.glucosa && <VitalChip label="Glucosa" value={v.glucosa} unit="mg/dL" field="glucosa" />}
    </div>
  )
}

// ─── Tab components ───────────────────────────────────────────────────────────

function VitalsTab({ patientId }: { patientId: string }) {
  const [vitals, setVitals] = useState<VitalsRecord[] | null>(null)

  useEffect(() => {
    getPatientVitals(patientId).then(setVitals)
  }, [patientId])

  if (vitals === null) return <div className="flex items-center justify-center h-32 text-slate-400 text-sm">Cargando…</div>
  if (!vitals.length) return <div className="flex items-center justify-center h-32 text-slate-400 text-sm italic">Sin signos vitales registrados.</div>

  const latest = vitals[0]

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Última toma · {formatDateTime(latest.createdAt)}</p>
        <VitalsGrid v={latest} />
      </div>

      {vitals.length > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Historial</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {vitals.slice(1).map(v => (
              <div key={v.id} className="px-5 py-3">
                <p className="text-xs text-slate-400 mb-2">{formatDateTime(v.createdAt)}</p>
                <VitalsGrid v={v} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NotasTab({ patientId, onNewNote }: { patientId: string; onNewNote?: () => void }) {
  const [notes, setNotes] = useState<EvolutionNote[] | null>(null)

  useEffect(() => {
    getPatientEvolutionNotes(patientId).then(setNotes)
  }, [patientId])

  if (notes === null) return <div className="flex items-center justify-center h-32 text-slate-400 text-sm">Cargando…</div>

  return (
    <div className="space-y-3">
      {onNewNote && (
        <div className="flex justify-end">
          <button onClick={onNewNote}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors">
            <FileText className="w-3.5 h-3.5" strokeWidth={2} />
            Nueva nota
          </button>
        </div>
      )}
      {!notes.length && <div className="flex items-center justify-center h-32 text-slate-400 text-sm italic">Sin notas de evolución.</div>}
      {notes.map(note => (
        <div key={note.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-mono text-slate-400">{formatDateShort(note.date)} · {note.time}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{note.authorName}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Nota de evolución</span>
          </div>
          {note.consultationReason && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Subjetivo</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{note.consultationReason}</p>
            </div>
          )}
          {note.findings && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Objetivo</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{note.findings}</p>
            </div>
          )}
          {note.updatedDiagnosis && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Evaluación</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{note.updatedDiagnosis}</p>
            </div>
          )}
          {note.plan && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Plan</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{note.plan}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function RecetasTab({ patientId, onNewPrescription }: { patientId: string; onNewPrescription?: () => void }) {
  const [rxs, setRxs] = useState<Prescription[] | null>(null)

  useEffect(() => {
    getPatientPrescriptions(patientId).then(setRxs)
  }, [patientId])

  if (rxs === null) return <div className="flex items-center justify-center h-32 text-slate-400 text-sm">Cargando…</div>

  return (
    <div className="space-y-3">
      {onNewPrescription && (
        <div className="flex justify-end">
          <button onClick={onNewPrescription}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors">
            <ScrollText className="w-3.5 h-3.5" strokeWidth={2} />
            Nueva receta
          </button>
        </div>
      )}
      {!rxs.length && <div className="flex items-center justify-center h-32 text-slate-400 text-sm italic">Sin recetas registradas.</div>}
      {rxs.map(rx => (
        <div key={rx.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-400">{formatDateShort(rx.date)}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${rx.status === 'firmada' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                {rx.status === 'firmada' ? '🔒 Firmada' : '✏️ Borrador'}
              </span>
            </div>
            <button onClick={() => printPrescription(rx)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
              <Printer className="w-3.5 h-3.5" strokeWidth={1.75} />
              Imprimir
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {rx.medications.map((med, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{med.name}{med.brandName ? ` (${med.brandName})` : ''}</p>
                  {med.presentation && <p className="text-xs text-slate-400 mt-0.5">{med.presentation}</p>}
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">{med.dose} · {med.frequency}{med.duration ? ` · ${med.duration}` : ''}</p>
                  {med.instructions && <p className="text-xs text-slate-400 italic mt-0.5">{med.instructions}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Estudios/Lab tab ─────────────────────────────────────────────────────────

function EstudiosTab({ patientId, onNewOrder }: { patientId: string; onNewOrder?: () => void }) {
  const [orders, setOrders] = useState<LabOrderRecord[] | null>(null)

  useEffect(() => {
    getPatientLabOrders(patientId).then(setOrders)
  }, [patientId])

  if (orders === null) return <div className="flex items-center justify-center h-32 text-slate-400 text-sm">Cargando…</div>

  return (
    <div className="space-y-3">
      {onNewOrder && (
        <div className="flex justify-end">
          <button onClick={onNewOrder}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors">
            <FlaskConical className="w-3.5 h-3.5" strokeWidth={2} />
            Nueva solicitud
          </button>
        </div>
      )}
      {!orders.length && <div className="flex items-center justify-center h-32 text-slate-400 text-sm italic">Sin solicitudes de estudios.</div>}
      {orders.map(order => (
        <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-indigo-600 dark:text-indigo-400" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{formatDateShort(order.createdAt)}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.status === 'completado' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : order.status === 'en_proceso' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {order.status === 'completado' ? 'Completado' : order.status === 'en_proceso' ? 'En proceso' : 'Pendiente'}
                  </span>
                  {order.urgente && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                      <AlertCircle className="w-3 h-3" strokeWidth={2} />Urgente
                    </span>
                  )}
                  {order.ayuno && <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Requiere ayuno</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Estudios solicitados</p>
              <div className="flex flex-wrap gap-1.5">
                {order.estudios.map((e, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                    {e}
                  </span>
                ))}
              </div>
            </div>
            {order.diagnosticoPresuntivo && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Diagnóstico presuntivo</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{order.diagnosticoPresuntivo}</p>
              </div>
            )}
            {order.indicacionesClinicas && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Indicaciones clínicas</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">{order.indicacionesClinicas}</p>
              </div>
            )}
            {order.resultados && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Resultados</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{order.resultados}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

type Tab = 'expediente' | 'vitales' | 'notas' | 'recetas' | 'estudios'

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'expediente', label: 'Expediente', icon: <ClipboardList className="w-3.5 h-3.5" strokeWidth={1.75} /> },
    { id: 'vitales', label: 'Signos Vitales', icon: <HeartPulse className="w-3.5 h-3.5" strokeWidth={1.75} /> },
    { id: 'notas', label: 'Notas', icon: <FileText className="w-3.5 h-3.5" strokeWidth={1.75} /> },
    { id: 'recetas', label: 'Recetas', icon: <ScrollText className="w-3.5 h-3.5" strokeWidth={1.75} /> },
    { id: 'estudios', label: 'Estudios', icon: <FlaskConical className="w-3.5 h-3.5" strokeWidth={1.75} /> },
  ]
  return (
    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto shrink-0">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${active === t.id ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PatientDetail({ patient, currentUserRole, onEdit, onViewDocuments, onBack }: PatientDetailProps) {
  const p = patient
  const age = calculateAge(p.generalData.birthDate)
  const isMedico = currentUserRole === 'medico'
  const [tab, setTab] = useState<Tab>('expediente')

  const initials = p.generalData.fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sticky header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-3">
          <div className="flex items-start gap-4">
            <button onClick={onBack}
              className="mt-1 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight">{p.generalData.fullName}</h1>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{age} años · {p.generalData.sex.charAt(0).toUpperCase() + p.generalData.sex.slice(1)}</span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{p.expedienteNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isMedico && (
                    <button onClick={() => onEdit?.(p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors">
                      <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                      Editar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <TabBar active={tab} onChange={setTab} />
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Expediente ── */}
        {tab === 'expediente' && (
          <div className="space-y-3">
            <Section icon={<User className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />} title="Datos Generales" accentColor="bg-sky-50 dark:bg-sky-950/30">
              <InfoGrid>
                <InfoRow label="Fecha de nacimiento" value={`${formatDate(p.generalData.birthDate)} · ${age} años`} />
                <InfoRow label="CURP" value={p.generalData.curp} mono />
                <InfoRow label="Teléfono" value={<span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.5} /><span className="font-mono">{p.generalData.phone || '—'}</span></span>} />
                <InfoRow label="Correo" value={<span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.5} />{p.generalData.email || '—'}</span>} />
                <InfoRow label="Domicilio" value={<span className="flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" strokeWidth={1.5} />{p.generalData.address || '—'}</span>} />
              </InfoGrid>
            </Section>

            <Section icon={<ClipboardList className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />} title="Antecedentes" accentColor="bg-sky-50 dark:bg-sky-950/30">
              <div className="space-y-5">
                <InfoGrid>
                  <InfoRow label="Heredofamiliares" value={p.familyHistory.notes || <span className="italic text-slate-400">Sin antecedentes</span>} />
                  {p.familyHistory.relevantConditions.length > 0 && <InfoRow label="Condiciones familiares" value={<TagList items={p.familyHistory.relevantConditions} color="amber" />} />}
                  <InfoRow label="Patológicos personales" value={p.personalHistory.pathological || <span className="italic text-slate-400">Ninguno</span>} />
                  <InfoRow label="No patológicos" value={p.personalHistory.nonPathological || <span className="italic text-slate-400">Sin datos</span>} />
                  <InfoRow label="Alergias" value={<TagList items={p.personalHistory.allergies} color="rose" />} />
                </InfoGrid>
                {p.personalHistory.currentMedications.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><Pill className="w-3.5 h-3.5" strokeWidth={2} />Medicamentos actuales</p>
                    <div className="space-y-2">
                      {p.personalHistory.currentMedications.map((med, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-1.5" />
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{med.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{med.dose} — {med.frequency}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">{med.indication}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            <Section icon={<AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />} title="Padecimiento Actual" accentColor="bg-amber-50 dark:bg-amber-950/30">
              <InfoGrid>
                <InfoRow label="Motivo de consulta" value={<span className="font-semibold text-slate-900 dark:text-slate-100">{p.currentCondition.chiefComplaint || <span className="italic font-normal text-slate-400">Sin registrar</span>}</span>} />
                <InfoRow label="Inicio" value={p.currentCondition.onset ? <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.5} />{formatDate(p.currentCondition.onset)}</span> : <span className="italic text-slate-400">—</span>} />
                <InfoRow label="Evolución" value={p.currentCondition.evolution || <span className="italic text-slate-400">—</span>} />
                <InfoRow label="Descripción" value={p.currentCondition.description || <span className="italic text-slate-400">—</span>} />
              </InfoGrid>
            </Section>

            <Section icon={<Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />} title="Exploración Física ORL" accentColor="bg-sky-50 dark:bg-sky-950/30">
              <InfoGrid>
                <InfoRow label="Oídos (otoscopia)" value={p.physicalExam.ears || <span className="italic text-slate-400">—</span>} />
                <InfoRow label="Nariz y senos paranasales" value={p.physicalExam.noseAndSinuses || <span className="italic text-slate-400">—</span>} />
                <InfoRow label="Faringe, laringe y cuello" value={p.physicalExam.pharynxAndNeck || <span className="italic text-slate-400">—</span>} />
              </InfoGrid>
            </Section>

            <Section icon={<Pill className="w-4 h-4 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />} title="Diagnósticos y Plan" accentColor="bg-slate-100 dark:bg-slate-800" locked={!isMedico} lockedMessage="Solo el médico puede ver los diagnósticos.">
              <div className="space-y-4">
                {p.diagnoses.map(dx => {
                  const cfg = DX_STATUS[dx.status]
                  return (
                    <div key={dx.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <div className="flex items-start gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
                        <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/40 px-2 py-1 rounded-md shrink-0">{dx.code}</span>
                        <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">{dx.description}</p></div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                      </div>
                      <div className="px-4 py-3 space-y-2 bg-white dark:bg-slate-900">
                        <div><p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Tratamiento</p><p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{dx.treatment}</p></div>
                        <div><p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Seguimiento</p><p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">{dx.followUp}</p></div>
                      </div>
                    </div>
                  )
                })}
                {p.diagnoses.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-600 italic text-center py-4">Sin diagnósticos registrados</p>}
              </div>
            </Section>

            <p className="text-center text-xs text-slate-400 dark:text-slate-600 pb-4">
              Expediente {p.expedienteNumber} · Última actualización: {formatDateTime(p.updatedAt)}
            </p>
          </div>
        )}

        {tab === 'vitales' && <VitalsTab patientId={p.id} />}

        {tab === 'notas' && (
          <NotasTab patientId={p.id} onNewNote={isMedico ? () => onViewDocuments?.(p.id) : undefined} />
        )}

        {tab === 'recetas' && (
          <RecetasTab patientId={p.id} onNewPrescription={isMedico ? () => onViewDocuments?.(p.id) : undefined} />
        )}

        {tab === 'estudios' && (
          <EstudiosTab patientId={p.id} onNewOrder={isMedico ? () => {} : undefined} />
        )}
      </div>
    </div>
  )
}

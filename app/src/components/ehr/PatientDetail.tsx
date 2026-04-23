'use client'

import { useState } from 'react'
import type { PatientDetailProps, UserRole, DiagnosisStatus } from '@/lib/ehr-types'
import {
  ChevronDown,
  ArrowLeft,
  Pencil,
  User,
  HeartPulse,
  ClipboardList,
  Stethoscope,
  Pill,
  AlertTriangle,
  Lock,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Hash,
  Activity,
  Thermometer,
  Weight,
  Ruler,
} from 'lucide-react'

function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const DX_STATUS: Record<DiagnosisStatus, { label: string; bg: string; text: string }> = {
  activo: { label: 'Activo', bg: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-700 dark:text-sky-300' },
  crónico: { label: 'Crónico', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
  resuelto: { label: 'Resuelto', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400' },
}

interface SectionProps {
  icon: React.ReactNode
  title: string
  accentColor: string
  defaultOpen?: boolean
  children: React.ReactNode
  locked?: boolean
  lockedMessage?: string
}

function Section({ icon, title, accentColor, defaultOpen = true, children, locked, lockedMessage }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accentColor}`}>
          {icon}
        </div>
        <span className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
          {title}
        </span>
        {locked && (
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mr-2">
            <Lock className="w-3 h-3" strokeWidth={2} />
            Restringido
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          {locked ? (
            <div className="px-5 py-6 flex items-center gap-3 text-slate-400 dark:text-slate-600">
              <Lock className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              <p className="text-sm">{lockedMessage ?? 'No tienes permiso para ver esta sección.'}</p>
            </div>
          ) : (
            <div className="px-5 py-5">{children}</div>
          )}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 sm:w-44 shrink-0 mb-0.5 sm:mb-0 sm:pt-0.5">
        {label}
      </dt>
      <dd className={`text-sm text-slate-800 dark:text-slate-200 leading-relaxed ${mono ? 'font-mono' : ''}`}>
        {value}
      </dd>
    </div>
  )
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <dl className="space-y-3">{children}</dl>
}

function VitalCard({ icon, label, value, highlight = false }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl p-3 flex items-start gap-2.5 ${
        highlight
          ? 'bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900'
          : 'bg-slate-50 dark:bg-slate-800/50'
      }`}
    >
      <div className={`shrink-0 mt-0.5 ${highlight ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-bold font-mono mt-0.5 ${highlight ? 'text-sky-700 dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

function TagList({ items, color = 'slate' }: { items: string[]; color?: 'slate' | 'rose' | 'amber' }) {
  if (!items.length) return <span className="text-sm text-slate-400 dark:text-slate-600 italic">Ninguno registrado</span>
  const styles = {
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    rose: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`px-2 py-0.5 rounded-md text-xs font-medium ${styles[color]}`}>
          {item}
        </span>
      ))}
    </div>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        role === 'medico'
          ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300'
          : 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${role === 'medico' ? 'bg-sky-500' : 'bg-sky-400'}`} />
      {role === 'medico' ? 'Médico' : 'Enfermera'}
    </span>
  )
}

export function PatientDetail({ patient, currentUserRole, onEdit, onViewDocuments, onBack }: PatientDetailProps) {
  const p = patient
  const age = calculateAge(p.generalData.birthDate)
  const isMedico = currentUserRole === 'medico'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="mt-1 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {p.generalData.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight">
                    {p.generalData.fullName}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {age} años · {p.generalData.sex.charAt(0).toUpperCase() + p.generalData.sex.slice(1)}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {p.expedienteNumber}
                    </span>
                    <RoleBadge role={currentUserRole} />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onViewDocuments?.(p.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <ClipboardList className="w-3.5 h-3.5" strokeWidth={2} />
                    Documentos
                  </button>
                  {isMedico && (
                    <button
                      onClick={() => onEdit?.(p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                      Editar expediente
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        <Section
          icon={<User className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />}
          title="Datos Generales"
          accentColor="bg-sky-50 dark:bg-sky-950/30"
          defaultOpen={true}
        >
          <InfoGrid>
            <InfoRow label="Fecha de nacimiento" value={`${formatDate(p.generalData.birthDate)} · ${age} años`} />
            <InfoRow label="CURP" value={p.generalData.curp} mono />
            <InfoRow
              label="Teléfono"
              value={
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.5} />
                  <span className="font-mono">{p.generalData.phone}</span>
                </span>
              }
            />
            <InfoRow
              label="Correo"
              value={
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.5} />
                  {p.generalData.email}
                </span>
              }
            />
            <InfoRow
              label="Domicilio"
              value={
                <span className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                  {p.generalData.address}
                </span>
              }
            />
          </InfoGrid>
        </Section>

        <Section
          icon={<ClipboardList className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />}
          title="Antecedentes"
          accentColor="bg-sky-50 dark:bg-sky-950/30"
          defaultOpen={true}
        >
          <div className="space-y-5">
            <InfoGrid>
              <InfoRow label="Heredofamiliares" value={p.familyHistory.notes || 'Sin antecedentes relevantes'} />
              {p.familyHistory.relevantConditions.length > 0 && (
                <InfoRow
                  label="Condiciones familiares"
                  value={<TagList items={p.familyHistory.relevantConditions} color="amber" />}
                />
              )}
              <InfoRow label="Patológicos personales" value={p.personalHistory.pathological || 'Ninguno'} />
              <InfoRow label="No patológicos" value={p.personalHistory.nonPathological || 'Sin datos'} />
              <InfoRow
                label="Alergias"
                value={<TagList items={p.personalHistory.allergies} color="rose" />}
              />
            </InfoGrid>

            {p.personalHistory.currentMedications.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5" strokeWidth={2} />
                  Medicamentos actuales
                </p>
                <div className="space-y-2">
                  {p.personalHistory.currentMedications.map((med, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-1.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{med.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                          {med.dose} — {med.frequency}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">{med.indication}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        <Section
          icon={<AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />}
          title="Padecimiento Actual"
          accentColor="bg-amber-50 dark:bg-amber-950/30"
          defaultOpen={true}
        >
          <InfoGrid>
            <InfoRow
              label="Motivo de consulta"
              value={
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {p.currentCondition.chiefComplaint}
                </span>
              }
            />
            <InfoRow
              label="Inicio"
              value={
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.5} />
                  {formatDate(p.currentCondition.onset)}
                </span>
              }
            />
            <InfoRow label="Evolución" value={p.currentCondition.evolution} />
            <InfoRow label="Descripción" value={p.currentCondition.description} />
          </InfoGrid>
        </Section>

        <Section
          icon={<Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />}
          title="Exploración Física ORL"
          accentColor="bg-sky-50 dark:bg-sky-950/30"
          defaultOpen={true}
        >
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" strokeWidth={2} />
                Signos vitales
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <VitalCard icon={<HeartPulse className="w-4 h-4" strokeWidth={1.5} />} label="T/A" value={p.physicalExam.vitalSigns.bloodPressure} highlight />
                <VitalCard icon={<Activity className="w-4 h-4" strokeWidth={1.5} />} label="Frec. cardíaca" value={p.physicalExam.vitalSigns.heartRate} />
                <VitalCard icon={<Thermometer className="w-4 h-4" strokeWidth={1.5} />} label="Temperatura" value={p.physicalExam.vitalSigns.temperature} />
                <VitalCard icon={<Weight className="w-4 h-4" strokeWidth={1.5} />} label="Peso" value={p.physicalExam.vitalSigns.weight} />
                <VitalCard icon={<Ruler className="w-4 h-4" strokeWidth={1.5} />} label="Talla" value={p.physicalExam.vitalSigns.height} />
                <VitalCard icon={<Hash className="w-4 h-4" strokeWidth={1.5} />} label="IMC" value={p.physicalExam.vitalSigns.bmi} />
              </div>
            </div>

            <InfoGrid>
              <InfoRow label="Oídos (otoscopia)" value={p.physicalExam.ears} />
              <InfoRow label="Nariz y senos paranasales" value={p.physicalExam.noseAndSinuses} />
              <InfoRow label="Faringe, laringe y cuello" value={p.physicalExam.pharynxAndNeck} />
            </InfoGrid>
          </div>
        </Section>

        <Section
          icon={<Pill className="w-4 h-4 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />}
          title="Diagnósticos y Plan de Tratamiento"
          accentColor="bg-slate-100 dark:bg-slate-800"
          defaultOpen={true}
          locked={!isMedico}
          lockedMessage="Solo el médico puede ver los diagnósticos y el plan de tratamiento."
        >
          <div className="space-y-4">
            {p.diagnoses.map((dx) => {
              const cfg = DX_STATUS[dx.status]
              return (
                <div key={dx.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div className="flex items-start gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
                    <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/40 px-2 py-1 rounded-md shrink-0">
                      {dx.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                        {dx.description}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="px-4 py-3 space-y-2 bg-white dark:bg-slate-900">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        Tratamiento
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{dx.treatment}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        Seguimiento
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">{dx.followUp}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            {p.diagnoses.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-600 italic text-center py-4">
                Sin diagnósticos registrados
              </p>
            )}
          </div>
        </Section>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 pb-4">
          Expediente {p.expedienteNumber} · Última actualización: {formatDateTime(p.updatedAt)}
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { PatientFormProps } from '@/lib/ehr-types'
import {
  User,
  ClipboardList,
  ChevronDown,
  Plus,
  X,
  ArrowLeft,
  Save,
} from 'lucide-react'

const inputCls =
  'w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition'

const textareaCls = inputCls + ' resize-none'

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5"
    >
      {children}
    </label>
  )
}

function Field({ id, label, children }: { id?: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

interface SectionProps {
  icon: React.ReactNode
  title: string
  accentColor: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FormSection({ icon, title, accentColor, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accentColor}`}>
          {icon}
        </div>
        <span className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-5 space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

function TagInput({
  label,
  items,
  onAdd,
  onRemove,
  placeholder,
  color = 'slate',
}: {
  label: string
  items: string[]
  onAdd: (v: string) => void
  onRemove: (i: number) => void
  placeholder?: string
  color?: 'slate' | 'rose' | 'amber'
}) {
  const [draft, setDraft] = useState('')
  const styles = {
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    rose: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ',') && draft.trim()) {
              e.preventDefault()
              onAdd(draft.trim())
              setDraft('')
            }
          }}
          placeholder={placeholder ?? 'Escribe y presiona Enter'}
          className={inputCls + ' flex-1'}
        />
        <button
          type="button"
          onClick={() => { if (draft.trim()) { onAdd(draft.trim()); setDraft('') } }}
          className="px-3 py-2 bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 rounded-xl hover:bg-sky-200 dark:hover:bg-sky-900/60 transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {items.map((item, i) => (
            <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${styles[color]}`}>
              {item}
              <button type="button" onClick={() => onRemove(i)} className="ml-0.5 opacity-60 hover:opacity-100">
                <X className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

type FormState = {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  birthDate: string
  sex: string
  curp: string
  phone: string
  email: string
  address: string
  familyNotes: string
  familyConditions: string[]
  pathological: string
  nonPathological: string
  allergies: string[]
}

const EMPTY_FORM: FormState = {
  nombre: '', apellidoPaterno: '', apellidoMaterno: '', birthDate: '', sex: 'femenino', curp: '', phone: '', email: '', address: '',
  familyNotes: '', familyConditions: [],
  pathological: '', nonPathological: '', allergies: [],
}

export function PatientForm({ patient, currentUserRole, onSubmit, onCancel }: PatientFormProps) {
  const isEdit = !!patient
  const isMedico = currentUserRole === 'medico'

  const [form, setForm] = useState<FormState>(() => {
    if (!patient) return EMPTY_FORM
    const p = patient
    return {
      nombre: p.generalData.nombre,
      apellidoPaterno: p.generalData.apellidoPaterno,
      apellidoMaterno: p.generalData.apellidoMaterno,
      birthDate: p.generalData.birthDate,
      sex: p.generalData.sex,
      curp: p.generalData.curp,
      phone: p.generalData.phone,
      email: p.generalData.email,
      address: p.generalData.address,
      familyNotes: p.familyHistory.notes,
      familyConditions: [...p.familyHistory.relevantConditions],
      pathological: p.personalHistory.pathological,
      nonPathological: p.personalHistory.nonPathological,
      allergies: [...p.personalHistory.allergies],
    }
  })

  function set(field: keyof FormState, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.({
      generalData: {
        nombre: form.nombre,
        apellidoPaterno: form.apellidoPaterno,
        apellidoMaterno: form.apellidoMaterno,
        fullName: [form.nombre, form.apellidoPaterno, form.apellidoMaterno].filter(Boolean).join(' '),
        birthDate: form.birthDate,
        sex: form.sex as 'masculino' | 'femenino' | 'otro',
        curp: form.curp,
        phone: form.phone,
        email: form.email,
        address: form.address,
      },
      familyHistory: {
        notes: form.familyNotes,
        relevantConditions: form.familyConditions,
      },
      personalHistory: {
        pathological: form.pathological,
        nonPathological: form.nonPathological,
        allergies: form.allergies,
        currentMedications: patient?.personalHistory.currentMedications ?? [],
      },
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-3">
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              {isEdit ? `Editar expediente · ${patient?.expedienteNumber}` : 'Nuevo expediente'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isEdit ? 'Actualiza los datos del paciente' : 'Completa los datos para crear el expediente'}
            </p>
          </div>
        </div>

        <FormSection
          icon={<User className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />}
          title="Datos Generales"
          accentColor="bg-sky-50 dark:bg-sky-950/30"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <Field id="nombre" label="Nombre(s) *">
              <input id="nombre" type="text" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Ej. María" className={inputCls} required />
            </Field>
            <Field id="apellidoPaterno" label="Primer apellido *">
              <input id="apellidoPaterno" type="text" value={form.apellidoPaterno} onChange={(e) => set('apellidoPaterno', e.target.value)} placeholder="Ej. González" className={inputCls} required />
            </Field>
            <Field id="apellidoMaterno" label="Segundo apellido">
              <input id="apellidoMaterno" type="text" value={form.apellidoMaterno} onChange={(e) => set('apellidoMaterno', e.target.value)} placeholder="Ej. Reyes" className={inputCls} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="birthDate" label="Fecha de nacimiento *">
              <input id="birthDate" type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} className={inputCls} required />
            </Field>
            <Field id="sex" label="Sexo *">
              <select id="sex" value={form.sex} onChange={(e) => set('sex', e.target.value)} className={inputCls}>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="otro">Otro</option>
              </select>
            </Field>
            <Field id="curp" label="CURP">
              <input id="curp" type="text" value={form.curp} onChange={(e) => set('curp', e.target.value.toUpperCase())} placeholder="18 caracteres" maxLength={18} className={inputCls + ' font-mono uppercase'} />
            </Field>
            <Field id="phone" label="Teléfono *">
              <input id="phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="81 1234 5678" className={inputCls + ' font-mono'} required />
            </Field>
            <Field id="email" label="Correo electrónico">
              <input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="correo@ejemplo.com" className={inputCls} />
            </Field>
          </div>
          <Field id="address" label="Domicilio">
            <input id="address" type="text" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Calle, número, colonia, ciudad" className={inputCls} />
          </Field>
        </FormSection>

        <FormSection
          icon={<ClipboardList className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />}
          title="Antecedentes"
          accentColor="bg-sky-50 dark:bg-sky-950/30"
        >
          <Field id="familyNotes" label="Heredofamiliares">
            <textarea id="familyNotes" rows={2} value={form.familyNotes} onChange={(e) => set('familyNotes', e.target.value)} placeholder="Enfermedades relevantes en familiares directos..." className={textareaCls} />
          </Field>
          <TagInput
            label="Condiciones familiares relevantes"
            items={form.familyConditions}
            onAdd={(v) => set('familyConditions', [...form.familyConditions, v])}
            onRemove={(i) => set('familyConditions', form.familyConditions.filter((_, idx) => idx !== i))}
            placeholder="Ej. Diabetes, Hipertensión"
            color="amber"
          />
          <Field id="pathological" label="Antecedentes patológicos personales">
            <textarea id="pathological" rows={2} value={form.pathological} onChange={(e) => set('pathological', e.target.value)} placeholder="Cirugías, hospitalizaciones, enfermedades crónicas..." className={textareaCls} />
          </Field>
          <Field id="nonPathological" label="Antecedentes no patológicos">
            <textarea id="nonPathological" rows={2} value={form.nonPathological} onChange={(e) => set('nonPathological', e.target.value)} placeholder="Tabaquismo, alcoholismo, actividad física..." className={textareaCls} />
          </Field>
          <TagInput
            label="Alergias"
            items={form.allergies}
            onAdd={(v) => set('allergies', [...form.allergies, v])}
            onRemove={(i) => set('allergies', form.allergies.filter((_, idx) => idx !== i))}
            placeholder="Ej. Penicilina, Polen"
            color="rose"
          />
        </FormSection>

        <div className="flex items-center justify-end gap-3 pt-2 pb-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" strokeWidth={2} />
            {isEdit ? 'Guardar cambios' : 'Crear expediente'}
          </button>
        </div>
      </form>
    </div>
  )
}

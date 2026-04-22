// Fonts: DM Sans (headings), Inter (body), IBM Plex Mono (mono)
// Colors: teal (primary), sky (secondary), slate (neutral)
// Multi-step patient booking form: service → date/time → patient data → confirmation

import { useState } from 'react'
import type { AppointmentBookingProps, Service, BookingFormData } from '../types'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  Shield,
  Stethoscope,
} from 'lucide-react'

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = ['Servicio', 'Fecha y hora', 'Tus datos', 'Confirmación']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? 'bg-teal-600 text-white'
                    : active
                    ? 'bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-900/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {done ? <Check className="w-4 h-4" strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  active
                    ? 'text-teal-600 dark:text-teal-400'
                    : done
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 transition-colors ${
                  done ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Service icons ─────────────────────────────────────────────────────────────

const SERVICE_ICONS: Record<string, string> = {
  'orl-general': '👂',
  vacunacion: '💉',
  audiologia: '🔊',
  vertigo: '🌀',
  'cirugia-nariz': '🩺',
  'cirugia-endoscopica': '🔬',
  inmunoterapia: '🌿',
}

// ─── Step 1: Service selection ────────────────────────────────────────────────

function Step1Service({
  services,
  selected,
  onSelect,
}: {
  services: Service[]
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">
        ¿Para qué consulta desea agendar?
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Seleccione el tipo de servicio que necesita.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((svc) => {
          const isSelected = svc.id === selected
          return (
            <button
              key={svc.id}
              onClick={() => onSelect(svc.id)}
              className={`text-left p-4 rounded-2xl border-2 transition-all group ${
                isSelected
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-teal-100 dark:bg-teal-900/50'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {SERVICE_ICONS[svc.id] ?? '🏥'}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold leading-snug ${
                      isSelected
                        ? 'text-teal-800 dark:text-teal-200'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {svc.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {svc.description}
                  </p>
                  <p
                    className={`text-xs font-mono mt-1.5 ${
                      isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'
                    }`}
                  >
                    {svc.duration} min
                  </p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 2: Date & time ──────────────────────────────────────────────────────

const AVAILABLE_TIMES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '16:00', '16:30', '17:00', '17:30',
]

const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]
const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

function Step2DateTime({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: {
  selectedDate: string
  selectedTime: string
  onDateChange: (d: string) => void
  onTimeChange: (t: string) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1)
  // Monday-based week: 0=Mon…6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to full rows
  while (cells.length % 7 !== 0) cells.push(null)

  function toISO(day: number) {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${viewYear}-${mm}-${dd}`
  }

  function isPast(day: number) {
    const d = new Date(viewYear, viewMonth, day)
    return d < today
  }
  function isSunday(day: number) {
    return new Date(viewYear, viewMonth, day).getDay() === 0
  }
  function isDisabled(day: number) {
    return isPast(day) || isSunday(day)
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">
        Seleccione fecha y hora
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Escoja el día y el horario de su preferencia.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            </button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />
              const iso = toISO(day)
              const disabled = isDisabled(day)
              const isSelected = iso === selectedDate
              const isT = iso === today.toISOString().split('T')[0]
              return (
                <button
                  key={iso}
                  disabled={disabled}
                  onClick={() => onDateChange(iso)}
                  className={`h-9 w-full rounded-lg text-sm transition-all font-medium ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-sm'
                      : disabled
                      ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : isT
                      ? 'text-teal-600 dark:text-teal-400 font-bold hover:bg-teal-50 dark:hover:bg-teal-950/30 ring-1 ring-teal-300 dark:ring-teal-700'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600 text-center mt-3">
            Los domingos no hay consulta
          </p>
        </div>

        {/* Time slots */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
            Horarios disponibles
          </p>
          {selectedDate ? (
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_TIMES.map((t) => (
                <button
                  key={t}
                  onClick={() => onTimeChange(t)}
                  className={`py-2 px-2 rounded-xl text-sm font-mono font-medium transition-all ${
                    t === selectedTime
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:text-teal-700 dark:hover:text-teal-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="text-center space-y-1">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                <p className="text-sm text-slate-400 dark:text-slate-600">
                  Seleccione un día primero
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Patient data ─────────────────────────────────────────────────────

interface FormData {
  patientName: string
  phone: string
  email: string
  reason: string
  privacyAccepted: boolean
}

function Step3PatientData({
  data,
  onChange,
}: {
  data: FormData
  onChange: (field: keyof FormData, value: string | boolean) => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">
        Sus datos de contacto
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Todos los campos son obligatorios.
      </p>

      <div className="space-y-4">
        {/* Name */}
        <Field
          icon={<User className="w-4 h-4" strokeWidth={1.5} />}
          label="Nombre completo"
          id="patientName"
        >
          <input
            id="patientName"
            type="text"
            placeholder="Ej. María González Reyes"
            value={data.patientName}
            onChange={(e) => onChange('patientName', e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Phone */}
          <Field
            icon={<Phone className="w-4 h-4" strokeWidth={1.5} />}
            label="Teléfono"
            id="phone"
          >
            <input
              id="phone"
              type="tel"
              placeholder="81 1234 5678"
              value={data.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              className={inputClass + ' font-mono'}
            />
          </Field>

          {/* Email */}
          <Field
            icon={<Mail className="w-4 h-4" strokeWidth={1.5} />}
            label="Correo electrónico"
            id="email"
          >
            <input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={data.email}
              onChange={(e) => onChange('email', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        {/* Reason */}
        <Field
          icon={<FileText className="w-4 h-4" strokeWidth={1.5} />}
          label="Motivo de consulta"
          id="reason"
        >
          <textarea
            id="reason"
            rows={3}
            placeholder="Describa brevemente su padecimiento o motivo de visita..."
            value={data.reason}
            onChange={(e) => onChange('reason', e.target.value)}
            className={inputClass + ' resize-none'}
          />
        </Field>

        {/* Privacy */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="relative shrink-0 mt-0.5">
            <input
              id="privacy"
              type="checkbox"
              checked={data.privacyAccepted}
              onChange={(e) => onChange('privacyAccepted', e.target.checked)}
              className="sr-only peer"
            />
            <label
              htmlFor="privacy"
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${
                data.privacyAccepted
                  ? 'bg-teal-600 border-teal-600'
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
              }`}
            >
              {data.privacyAccepted && (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </label>
          </div>
          <div>
            <label htmlFor="privacy" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              He leído y acepto el{' '}
              <span className="text-teal-600 dark:text-teal-400 font-medium underline underline-offset-2">
                Aviso de Privacidad
              </span>{' '}
              del consultorio del Dr. Alejandro Viveros ORL.
            </label>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
              <Shield className="w-3 h-3" strokeWidth={1.5} />
              Sus datos son confidenciales y están protegidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputClass =
  'w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition'

function Field({
  icon,
  label,
  id,
  children,
}: {
  icon: React.ReactNode
  label: string
  id: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
      >
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  )
}

// ─── Step 4: Confirmation ─────────────────────────────────────────────────────

function formatDateReadable(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function Step4Confirmation({
  data,
  serviceName,
  onNew,
}: {
  data: BookingFormData
  serviceName: string
  onNew: () => void
}) {
  return (
    <div className="text-center py-4">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mx-auto mb-5">
        <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center">
          <Check className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
        ¡Solicitud enviada!
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
        Hemos recibido su solicitud. Le enviaremos un correo a{' '}
        <strong className="text-slate-700 dark:text-slate-300">{data.email}</strong> con los detalles de su cita.
      </p>

      {/* Summary card */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 text-left mb-6 max-w-sm mx-auto space-y-3">
        <SummaryRow icon={<Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />} label="Servicio" value={serviceName} />
        <SummaryRow icon={<Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />} label="Fecha" value={<span className="capitalize">{formatDateReadable(data.date)}</span>} />
        <SummaryRow icon={<Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />} label="Hora" value={<span className="font-mono">{data.time} hrs</span>} />
        <SummaryRow icon={<User className="w-4 h-4 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />} label="Paciente" value={data.patientName} />
      </div>

      <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900 rounded-xl p-4 max-w-sm mx-auto mb-6">
        <p className="text-xs text-sky-700 dark:text-sky-400 text-center leading-relaxed">
          El correo incluirá botones para <strong>confirmar</strong>, <strong>cancelar</strong> o <strong>reprogramar</strong> su cita.
          Estará sujeta a disponibilidad.
        </p>
      </div>

      <button
        onClick={onNew}
        className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
      >
        Agendar otra cita
      </button>
    </div>
  )
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const INITIAL_FORM: FormData = {
  patientName: '',
  phone: '',
  email: '',
  reason: '',
  privacyAccepted: false,
}

export function AppointmentBooking({ services, onSubmit }: AppointmentBookingProps) {
  const [step, setStep] = useState(0)
  const [serviceId, setServiceId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)

  const selectedService = services.find((s) => s.id === serviceId)

  function canProceed() {
    if (step === 0) return !!serviceId
    if (step === 1) return !!selectedDate && !!selectedTime
    if (step === 2)
      return (
        form.patientName.trim() !== '' &&
        form.phone.trim() !== '' &&
        form.email.trim() !== '' &&
        form.reason.trim() !== '' &&
        form.privacyAccepted
      )
    return true
  }

  function handleFormChange(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleNext() {
    if (step === 2) {
      const bookingData: BookingFormData = {
        serviceId,
        date: selectedDate,
        time: selectedTime,
        patientName: form.patientName,
        phone: form.phone,
        email: form.email,
        reason: form.reason,
        privacyAccepted: form.privacyAccepted,
      }
      onSubmit?.(bookingData)
      setSubmitted(true)
      setStep(3)
      return
    }
    setStep((s) => s + 1)
  }

  function handleReset() {
    setStep(0)
    setServiceId('')
    setSelectedDate('')
    setSelectedTime('')
    setForm(INITIAL_FORM)
    setSubmitted(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        {/* Logo / header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600 mb-3">
            <Stethoscope className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Agendar una Cita
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dr. Alejandro Viveros · ORL Especialista
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          {step < 3 && <StepIndicator current={step} />}

          {step === 0 && (
            <Step1Service
              services={services}
              selected={serviceId}
              onSelect={setServiceId}
            />
          )}

          {step === 1 && (
            <Step2DateTime
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={(d) => { setSelectedDate(d); setSelectedTime('') }}
              onTimeChange={setSelectedTime}
            />
          )}

          {step === 2 && (
            <Step3PatientData data={form} onChange={handleFormChange} />
          )}

          {step === 3 && submitted && (
            <Step4Confirmation
              data={{
                serviceId,
                date: selectedDate,
                time: selectedTime,
                patientName: form.patientName,
                phone: form.phone,
                email: form.email,
                reason: form.reason,
                privacyAccepted: form.privacyAccepted,
              }}
              serviceName={selectedService?.name ?? ''}
              onNew={handleReset}
            />
          )}

          {/* Navigation buttons */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  step === 0
                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                Anterior
              </button>

              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step
                        ? 'w-6 bg-teal-600'
                        : i < step
                        ? 'w-1.5 bg-teal-300 dark:bg-teal-700'
                        : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                  canProceed()
                    ? 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                {step === 2 ? 'Enviar solicitud' : 'Siguiente'}
                {step < 2 && <ChevronRight className="w-4 h-4" strokeWidth={2} />}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-4">
          ¿Tiene preguntas? Llámenos al{' '}
          <span className="font-mono text-slate-500 dark:text-slate-500">81 8XXX XXXX</span>
        </p>
      </div>
    </div>
  )
}

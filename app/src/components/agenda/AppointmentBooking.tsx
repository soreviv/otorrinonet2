'use client'

import { useState, useRef } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import type { AppointmentBookingProps, BookingFormData } from '@/lib/agenda-types'
import { submitAppointmentRequest } from '@/app/actions/appointments'
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

const STEPS = ['Fecha y hora', 'Tus datos', 'Confirmación']

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
                    ? 'bg-sky-600 text-white'
                    : active
                    ? 'bg-sky-600 text-white ring-4 ring-sky-100 dark:ring-sky-900/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {done ? <Check className="w-4 h-4" strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  active
                    ? 'text-sky-600 dark:text-sky-400'
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
                  done ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-700'
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

// ─── Step 1: Date & time ─────────────────────────────────────────────────────

// Lu/Ma: 16:00–19:30 · Ju/Vi: 10:00–12:30
const TIMES_AFTERNOON = ['16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30']
const TIMES_MORNING   = ['10:00','10:30','11:00','11:30','12:00','12:30']

function getTimesForDate(isoDate: string): string[] {
  const dow = new Date(isoDate + 'T00:00:00').getDay() // 0=Dom
  if (dow === 1 || dow === 2 || dow === 3) return TIMES_AFTERNOON // Lunes, Martes, Miércoles
  if (dow === 4 || dow === 5) return TIMES_MORNING                // Jueves, Viernes
  return []
}

const CONSULTATION_DAYS = new Set([1, 2, 3, 4, 5]) // Lu Ma Mi Ju Vi

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

  const firstDay = new Date(viewYear, viewMonth, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function toISO(day: number) {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${viewYear}-${mm}-${dd}`
  }

  function isPast(day: number) {
    return new Date(viewYear, viewMonth, day) < today
  }
  function isDisabled(day: number) {
    const dow = new Date(viewYear, viewMonth, day).getDay()
    return isPast(day) || !CONSULTATION_DAYS.has(dow)
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

          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-1">
                {d}
              </div>
            ))}
          </div>

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
                      ? 'bg-sky-600 text-white shadow-sm'
                      : disabled
                      ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : isT
                      ? 'text-sky-600 dark:text-sky-400 font-bold hover:bg-sky-50 dark:hover:bg-sky-950/30 ring-1 ring-sky-300 dark:ring-sky-700'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600 text-center mt-3">
            Lu–Mi 4–8 pm · Ju–Vi 10 am–1 pm · Sáb y Dom sin consulta
          </p>
        </div>

        {/* Time slots */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
            Horarios disponibles
          </p>
          {selectedDate ? (
            <div className="grid grid-cols-3 gap-2">
              {getTimesForDate(selectedDate).map((t) => (
                <button
                  key={t}
                  onClick={() => onTimeChange(t)}
                  className={`py-2 px-2 rounded-xl text-sm font-mono font-medium transition-all ${
                    t === selectedTime
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/30 hover:text-sky-700 dark:hover:text-sky-400'
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
                  ? 'bg-sky-600 border-sky-600'
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
              <a
                href="/legal/privacidad"
                className="text-sky-600 dark:text-sky-400 font-medium underline underline-offset-2 hover:text-sky-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Aviso de Privacidad
              </a>{' '}
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
  'w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition'

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

// ─── Step 3: Confirmation ─────────────────────────────────────────────────────

function formatDateReadable(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function StepConfirmation({
  data,
  onNew,
}: {
  data: BookingFormData
  onNew: () => void
}) {
  return (
    <div className="text-center py-4">
      <div className="w-20 h-20 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center mx-auto mb-5">
        <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center">
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

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 text-left mb-6 max-w-sm mx-auto space-y-3">
        <SummaryRow icon={<Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />} label="Tipo" value="Consulta · 30 min" />
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
        className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors"
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

export function AppointmentBooking({ onSubmit }: AppointmentBookingProps) {
  const [step, setStep] = useState(0)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const turnstileRef = useRef<TurnstileInstance>(null)

  function canProceed() {
    if (step === 0) return !!selectedDate && !!selectedTime
    if (step === 1)
      return (
        form.patientName.trim() !== '' &&
        form.phone.trim() !== '' &&
        form.email.trim() !== '' &&
        form.reason.trim() !== '' &&
        form.privacyAccepted &&
        !!captchaToken
      )
    return true
  }

  function handleFormChange(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleNext() {
    if (step === 1) {
      setSubmitError(null)
      setSubmitting(true)
      const result = await submitAppointmentRequest({
        date: selectedDate,
        time: selectedTime,
        patientName: form.patientName,
        phone: form.phone,
        email: form.email,
        reason: form.reason,
        captchaToken: captchaToken!,
      })
      setSubmitting(false)
      if (!result.ok) {
        setSubmitError(result.error ?? 'Error al enviar. Intenta de nuevo.')
        turnstileRef.current?.reset()
        setCaptchaToken(null)
        return
      }
      const bookingData: BookingFormData = {
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
      setStep(2)
      return
    }
    setStep((s) => s + 1)
  }

  function handleReset() {
    setStep(0)
    setSelectedDate('')
    setSelectedTime('')
    setForm(INITIAL_FORM)
    setSubmitted(false)
    setCaptchaToken(null)
    turnstileRef.current?.reset()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        {/* Page header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-600 mb-3">
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
          {step < 2 && <StepIndicator current={step} />}

          {step === 0 && (
            <Step2DateTime
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={(d) => { setSelectedDate(d); setSelectedTime('') }}
              onTimeChange={setSelectedTime}
            />
          )}

          {step === 1 && (
            <>
              <Step3PatientData data={form} onChange={handleFormChange} />
              <div className="mt-5">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''}
                  onSuccess={setCaptchaToken}
                  onExpire={() => setCaptchaToken(null)}
                  options={{ language: 'es' }}
                />
              </div>
            </>
          )}

          {step === 2 && submitted && (
            <StepConfirmation
              data={{
                date: selectedDate,
                time: selectedTime,
                patientName: form.patientName,
                phone: form.phone,
                email: form.email,
                reason: form.reason,
                privacyAccepted: form.privacyAccepted,
              }}
              onNew={handleReset}
            />
          )}

          {/* Navigation buttons */}
          {step < 2 && (
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
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step
                        ? 'w-6 bg-sky-600'
                        : i < step
                        ? 'w-1.5 bg-sky-300 dark:bg-sky-700'
                        : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <div className="flex flex-col items-end gap-1">
                {submitError && (
                  <p className="text-xs text-red-500">{submitError}</p>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || submitting}
                  className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    canProceed() && !submitting
                      ? 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Enviando…' : step === 2 ? 'Enviar solicitud' : 'Siguiente'}
                  {!submitting && step < 2 && <ChevronRight className="w-4 h-4" strokeWidth={2} />}
                </button>
              </div>
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

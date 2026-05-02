'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react'
import { StepProgressBar } from './steps/StepProgressBar'
import { StepDateTimeSelection } from './steps/StepDateTimeSelection'
import { StepPatientData } from './steps/StepPatientData'
import { StepConfirmation } from './steps/StepConfirmation'
import { PatientFormSchema, type PatientFormData } from '@/lib/schemas/appointment'
import type { AppointmentBookingProps, BookingFormData } from '@/lib/agenda-types'
import { submitAppointmentRequest } from '@/app/actions/appointments'

const STEPS = ['Fecha y hora', 'Tus datos', 'Confirmación'] as const
const DRAFT_KEY = 'appointment-draft'

type DraftData = Omit<PatientFormData, 'privacyAccepted'>

function loadDraft(): Partial<DraftData> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as DraftData) : {}
  } catch {
    return {}
  }
}

const INITIAL_FORM: PatientFormData = {
  patientNombre: '',
  patientApellidoPaterno: '',
  patientApellidoMaterno: '',
  phone: '',
  email: '',
  reason: '',
  privacyAccepted: false,
}

export function AppointmentBookingForm({ onSubmit }: AppointmentBookingProps) {
  const [step, setStep] = useState(0)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  // Restore draft immediately via lazy init — avoids setState inside effect
  const [form, setForm] = useState<PatientFormData>(() => ({ ...INITIAL_FORM, ...loadDraft() }))
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const turnstileRef = useRef<TurnstileInstance>(null)

  // Persist draft (explicit fields to avoid destructuring an unused variable)
  const draftSnapshot = useMemo<DraftData>(
    () => ({ patientNombre: form.patientNombre, patientApellidoPaterno: form.patientApellidoPaterno, patientApellidoMaterno: form.patientApellidoMaterno, phone: form.phone, email: form.email, reason: form.reason }),
    [form.patientNombre, form.patientApellidoPaterno, form.patientApellidoMaterno, form.phone, form.email, form.reason],
  )
  useEffect(() => {
    if (submitted) return
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draftSnapshot)) } catch {}
  }, [draftSnapshot, submitted])

  function canProceed() {
    if (step === 0) return !!selectedDate && !!selectedTime
    if (step === 1) return !!captchaToken
    return true
  }

  const handleDateChange = useCallback((d: string) => {
    setSelectedDate(d)
    setSelectedTime('')
  }, [])

  const handleTimeChange = useCallback((t: string) => setSelectedTime(t), [])

  const handleFormChange = useCallback((field: keyof PatientFormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setFieldErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  async function handleNext() {
    if (step === 0) {
      setStep(1)
      return
    }

    if (step === 1) {
      // Validate all fields with Zod before submitting
      const validation = PatientFormSchema.safeParse(form)
      if (!validation.success) {
        const errors: Partial<Record<keyof PatientFormData, string>> = {}
        for (const issue of validation.error.issues) {
          const key = issue.path[0] as keyof PatientFormData
          if (!errors[key]) errors[key] = issue.message
        }
        setFieldErrors(errors)
        return
      }
      setFieldErrors({})
      setSubmitError(null)
      setSubmitting(true)

      const patientName = [form.patientNombre, form.patientApellidoPaterno, form.patientApellidoMaterno].filter(Boolean).join(' ')
      const result = await submitAppointmentRequest({
        date: selectedDate,
        time: selectedTime,
        patientName,
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
        patientName,
        phone: form.phone,
        email: form.email,
        reason: form.reason,
        privacyAccepted: form.privacyAccepted,
      }
      onSubmit?.(bookingData)
      setSubmitted(true)
      setStep(2)
      try { localStorage.removeItem(DRAFT_KEY) } catch {}
    }
  }

  function handleReset() {
    setStep(0)
    setSelectedDate('')
    setSelectedTime('')
    setForm(INITIAL_FORM)
    setSubmitted(false)
    setCaptchaToken(null)
    setFieldErrors({})
    setSubmitError(null)
    turnstileRef.current?.reset()
    try { localStorage.removeItem(DRAFT_KEY) } catch {}
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
          {step < 2 && <StepProgressBar steps={STEPS} current={step} />}

          {step === 0 && (
            <StepDateTimeSelection
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={handleDateChange}
              onTimeChange={handleTimeChange}
            />
          )}

          {step === 1 && (
            <StepPatientData
              data={form}
              errors={fieldErrors}
              onChange={handleFormChange}
              turnstileRef={turnstileRef}
              onCaptchaSuccess={setCaptchaToken}
              onCaptchaExpire={() => setCaptchaToken(null)}
            />
          )}

          {step === 2 && submitted && (
            <StepConfirmation
              data={{
                date: selectedDate,
                time: selectedTime,
                patientName: [form.patientNombre, form.patientApellidoPaterno, form.patientApellidoMaterno].filter(Boolean).join(' '),
                phone: form.phone,
                email: form.email,
                reason: form.reason,
                privacyAccepted: form.privacyAccepted,
              }}
              onNew={handleReset}
            />
          )}

          {/* Navigation */}
          {step < 2 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setStep(s => s - 1)}
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

              {/* Dot progress */}
              <div className="flex items-center gap-1.5">
                {[0, 1].map(i => (
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
                  <p role="alert" className="text-xs text-red-500 text-right max-w-48">
                    {submitError}
                  </p>
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
                  {submitting
                    ? 'Enviando…'
                    : step === 1
                    ? 'Enviar solicitud'
                    : 'Siguiente'}
                  {!submitting && <ChevronRight className="w-4 h-4" strokeWidth={2} />}
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

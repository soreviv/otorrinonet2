'use client'

import type { RefObject } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Check, User, Phone, Mail, FileText, Shield } from 'lucide-react'
import type { PatientFormData } from '@/lib/schemas/appointment'

interface StepPatientDataProps {
  data: PatientFormData
  errors: Partial<Record<keyof PatientFormData, string>>
  onChange: (field: keyof PatientFormData, value: string | boolean) => void
  turnstileRef: RefObject<TurnstileInstance | null>
  onCaptchaSuccess: (token: string) => void
  onCaptchaExpire: () => void
}

function getInputClass(hasError: boolean) {
  return (
    'w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border rounded-xl ' +
    'text-slate-900 dark:text-slate-100 placeholder:text-slate-400 ' +
    'focus:outline-none focus:ring-2 transition ' +
    (hasError
      ? 'border-red-400 dark:border-red-600 focus:ring-red-500'
      : 'border-slate-200 dark:border-slate-700 focus:ring-sky-500')
  )
}

function Field({
  icon,
  label,
  id,
  error,
  children,
}: {
  icon: React.ReactNode
  label: string
  id: string
  error?: string
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
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

export function StepPatientData({
  data,
  errors,
  onChange,
  turnstileRef,
  onCaptchaSuccess,
  onCaptchaExpire,
}: StepPatientDataProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">
        Sus datos de contacto
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Todos los campos son obligatorios.
      </p>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field
            icon={<User className="w-4 h-4" strokeWidth={1.5} />}
            label="Nombre(s)"
            id="patientNombre"
            error={errors.patientNombre}
          >
            <input
              id="patientNombre"
              type="text"
              autoComplete="given-name"
              placeholder="Ej. María"
              value={data.patientNombre}
              onChange={(e) => onChange('patientNombre', e.target.value)}
              aria-invalid={!!errors.patientNombre}
              aria-describedby={errors.patientNombre ? 'patientNombre-error' : undefined}
              className={getInputClass(!!errors.patientNombre)}
            />
          </Field>
          <Field
            icon={<User className="w-4 h-4" strokeWidth={1.5} />}
            label="Primer apellido"
            id="patientApellidoPaterno"
            error={errors.patientApellidoPaterno}
          >
            <input
              id="patientApellidoPaterno"
              type="text"
              autoComplete="family-name"
              placeholder="Ej. González"
              value={data.patientApellidoPaterno}
              onChange={(e) => onChange('patientApellidoPaterno', e.target.value)}
              aria-invalid={!!errors.patientApellidoPaterno}
              aria-describedby={errors.patientApellidoPaterno ? 'patientApellidoPaterno-error' : undefined}
              className={getInputClass(!!errors.patientApellidoPaterno)}
            />
          </Field>
          <Field
            icon={<User className="w-4 h-4" strokeWidth={1.5} />}
            label="Segundo apellido"
            id="patientApellidoMaterno"
            error={errors.patientApellidoMaterno}
          >
            <input
              id="patientApellidoMaterno"
              type="text"
              autoComplete="additional-name"
              placeholder="Ej. Reyes"
              value={data.patientApellidoMaterno}
              onChange={(e) => onChange('patientApellidoMaterno', e.target.value)}
              aria-invalid={!!errors.patientApellidoMaterno}
              aria-describedby={errors.patientApellidoMaterno ? 'patientApellidoMaterno-error' : undefined}
              className={getInputClass(!!errors.patientApellidoMaterno)}
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            icon={<Phone className="w-4 h-4" strokeWidth={1.5} />}
            label="Teléfono"
            id="phone"
            error={errors.phone}
          >
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="81 1234 5678"
              value={data.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={getInputClass(!!errors.phone) + ' font-mono'}
            />
          </Field>

          <Field
            icon={<Mail className="w-4 h-4" strokeWidth={1.5} />}
            label="Correo electrónico"
            id="email"
            error={errors.email}
          >
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              value={data.email}
              onChange={(e) => onChange('email', e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={getInputClass(!!errors.email)}
            />
          </Field>
        </div>

        <Field
          icon={<FileText className="w-4 h-4" strokeWidth={1.5} />}
          label="Motivo de consulta"
          id="reason"
          error={errors.reason}
        >
          <textarea
            id="reason"
            rows={3}
            placeholder="Describa brevemente su padecimiento o motivo de visita..."
            value={data.reason}
            onChange={(e) => onChange('reason', e.target.value)}
            aria-invalid={!!errors.reason}
            aria-describedby={errors.reason ? 'reason-error' : undefined}
            className={getInputClass(!!errors.reason) + ' resize-none'}
          />
        </Field>

        {/* Privacy consent */}
        <div
          className={`flex items-start gap-3 p-4 rounded-2xl border ${
            errors.privacyAccepted
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="relative shrink-0 mt-0.5">
            <input
              id="privacy"
              type="checkbox"
              checked={data.privacyAccepted}
              onChange={(e) => onChange('privacyAccepted', e.target.checked)}
              aria-invalid={!!errors.privacyAccepted}
              className="sr-only peer"
            />
            <label
              htmlFor="privacy"
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${
                data.privacyAccepted
                  ? 'bg-sky-600 border-sky-600'
                  : errors.privacyAccepted
                  ? 'border-red-400 dark:border-red-600 bg-white dark:bg-slate-900'
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
              }`}
            >
              {data.privacyAccepted && (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </label>
          </div>
          <div className="flex-1">
            <label htmlFor="privacy" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              He leído y acepto el{' '}
              <a
                href="/privacidad"
                className="text-sky-600 dark:text-sky-400 font-medium underline underline-offset-2 hover:text-sky-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Aviso de Privacidad
              </a>{' '}
              del consultorio del Dr. Alejandro Viveros ORL.
            </label>
            {errors.privacyAccepted ? (
              <p role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errors.privacyAccepted}
              </p>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" strokeWidth={1.5} />
                Sus datos son confidenciales y están protegidos.
              </p>
            )}
          </div>
        </div>

        {/* CAPTCHA */}
        <div className="pt-1">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''}
            onSuccess={onCaptchaSuccess}
            onExpire={onCaptchaExpire}
            options={{ action: 'agendar_cita', language: 'es' }}
          />
        </div>
      </div>
    </div>
  )
}

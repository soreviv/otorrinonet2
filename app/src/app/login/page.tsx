'use client'

import { useActionState, useState, useTransition } from 'react'
import { loginAction, requestPasswordResetAction } from '@/app/actions/auth'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, HelpCircle, AlertCircle, CheckCircle2, X } from 'lucide-react'

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null)
  const [showPassword, setShowPassword] = useState(false)

  // Recuperación de contraseña
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoverySent, setRecoverySent] = useState(false)
  const [recoveryError, setRecoveryError] = useState('')
  const [recoveryPending, startRecovery] = useTransition()

  function handleRecovery() {
    setRecoveryError('')
    startRecovery(async () => {
      const result = await requestPasswordResetAction(recoveryEmail.trim())
      if ('ok' in result) setRecoverySent(true)
      else setRecoveryError('error' in result ? result.error : 'Error inesperado')
    })
  }

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-sky-600/10 mx-auto flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-sky-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-dm-sans)]">
          Dr. Viveros ORL
        </h1>
        <p className="text-sm text-slate-500 mt-1">Panel de personal médico</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-5">Iniciar sesión</h2>

        <form action={action} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-600 mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                placeholder="doctor@ejemplo.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-600 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {state && 'error' in state && (
            <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-sm font-semibold py-2.5 transition-colors"
          >
            {pending ? 'Verificando…' : 'Continuar'}
          </button>

          {/* Recuperar contraseña */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => { setShowRecovery(true); setRecoverySent(false); setRecoveryEmail(''); setRecoveryError('') }}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-600 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        Después de verificar tu contraseña se solicitará el código 2FA.
      </p>

      {/* Modal recuperación */}
      {showRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 relative">
            <button
              onClick={() => setShowRecovery(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            {recoverySent ? (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-semibold text-slate-800">Correo enviado</p>
                  <p className="text-xs text-slate-500">
                    Si la cuenta existe, recibirás un enlace para restablecer tu contraseña.
                    El enlace es válido por <strong>1 hora</strong>. Revisa tu carpeta de spam.
                  </p>
                </div>
                <button
                  onClick={() => setShowRecovery(false)}
                  className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold py-2.5 transition-colors"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-semibold text-slate-800 mb-1">Recuperar contraseña</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={e => setRecoveryEmail(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && recoveryEmail.trim()) handleRecovery() }}
                        placeholder="doctor@ejemplo.com"
                        autoFocus
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {recoveryError && (
                    <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                      {recoveryError}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRecovery(false)}
                      className="flex-1 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={!recoveryEmail.trim() || recoveryPending}
                      onClick={handleRecovery}
                      className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-sm font-semibold py-2.5 transition-colors"
                    >
                      {recoveryPending ? 'Enviando…' : 'Enviar enlace'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

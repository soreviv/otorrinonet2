'use client'

import Image from 'next/image'
import { useActionState, useState, useTransition } from 'react'
import { loginAction, requestPasswordResetAction } from '@/app/actions/auth'
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, X } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Panel de marca */}
      <section className="relative overflow-hidden flex flex-col justify-between gap-10 px-8 py-10 md:w-[46%] md:max-w-xl md:px-14 md:py-12 text-white bg-gradient-to-br from-[var(--color-esculapio-900)] via-[var(--color-esculapio-700)] to-[var(--color-brand-nose)]">
        <div className="absolute inset-0 opacity-50 dots-overlay-24 pointer-events-none" aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <span className="w-12 h-12 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center">
            <Image
              src="/assets/esculapio-logo.png"
              alt=""
              width={181}
              height={300}
              className="h-[34px] w-auto"
              priority
            />
          </span>
          <span className="font-heading font-bold text-xl tracking-tight">Esculapio</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-heading font-bold text-3xl md:text-[2.375rem] leading-tight tracking-tight mb-5">
            Expediente clínico, en un solo lugar.
          </h1>
          <p className="text-white/80 leading-relaxed">
            Agendas, notas médicas, recetas y expedientes para el equipo de OtorrinoNet.
          </p>

          <div className="flex items-center gap-2 mt-8 md:mt-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[0.8125rem] tracking-wide text-white/75">
              Sistema operando con normalidad
            </span>
          </div>
        </div>

        <div className="relative font-mono text-[0.8125rem] text-white/55">
          © 2026 Esculapio
        </div>
      </section>

      {/* Panel de formulario */}
      <section className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-sm">
          <header className="mb-8">
            <h2 className="font-heading font-bold text-2xl text-slate-900 tracking-tight mb-1.5">
              Iniciar sesión
            </h2>
            <p className="text-sm text-slate-500">Accede al expediente clínico electrónico</p>
          </header>

          <form action={action} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-nose)] focus:border-transparent transition"
                  placeholder="nombre@otorrinonet.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => { setShowRecovery(true); setRecoverySent(false); setRecoveryEmail(''); setRecoveryError('') }}
                  className="text-xs font-semibold text-[var(--color-brand-nose)] hover:underline"
                >
                  Olvidé mi contraseña
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-nose)] focus:border-transparent transition"
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

            {state && 'error' in state && (
              <div role="alert" className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3.5 py-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-[var(--color-esculapio-700)] hover:bg-[var(--color-brand-nose)] disabled:opacity-60 text-white text-sm font-semibold py-2.5 transition-colors"
            >
              {pending ? 'Verificando…' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-4">
            Después de verificar tu contraseña se solicitará el código 2FA.
          </p>

          <footer className="mt-8 pt-5 border-t border-slate-200 text-xs text-slate-400 leading-relaxed">
            Acceso exclusivo para personal autorizado de OtorrinoNet. El uso de este sistema está
            protegido conforme a la NOM-024-SSA3-2012 y a la Ley Federal de Protección de Datos
            Personales. Toda actividad queda registrada.
          </footer>
        </div>
      </section>

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
                  className="w-full rounded-xl bg-[var(--color-esculapio-700)] hover:bg-[var(--color-brand-nose)] text-white text-sm font-semibold py-2.5 transition-colors"
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
                        placeholder="nombre@otorrinonet.com"
                        autoFocus
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-nose)] focus:border-transparent transition"
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
                      className="flex-1 rounded-xl bg-[var(--color-esculapio-700)] hover:bg-[var(--color-brand-nose)] disabled:opacity-60 text-white text-sm font-semibold py-2.5 transition-colors"
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

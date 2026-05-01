'use client'

import { useActionState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { resetPasswordAction } from '@/app/actions/auth'
import { ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router      = useRouter()
  const params      = useSearchParams()
  const token       = params.get('token') ?? ''
  const [state, action, pending] = useActionState(resetPasswordAction, null)

  useEffect(() => {
    if (state && 'ok' in state) {
      const t = setTimeout(() => router.replace('/login'), 2500)
      return () => clearTimeout(t)
    }
  }, [state, router])

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <p className="text-slate-700 font-medium">Enlace inválido o expirado.</p>
          <button onClick={() => router.replace('/login')} className="text-sky-600 hover:underline text-sm">
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-sky-600/10 mx-auto flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-sky-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-dm-sans)]">
            Dr. Viveros ORL
          </h1>
          <p className="text-sm text-slate-500 mt-1">Restablecer contraseña</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {state && 'ok' in state ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-slate-800">Contraseña actualizada</p>
                <p className="text-xs text-slate-500">Redirigiendo al inicio de sesión…</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-base font-semibold text-slate-800 mb-5">Nueva contraseña</h2>
              <form action={action} className="space-y-4">
                <input type="hidden" name="token" value={token} />

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-slate-600 mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm" className="block text-xs font-medium text-slate-600 mb-1.5">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="confirm"
                      name="confirm"
                      type="password"
                      required
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      placeholder="Repite la contraseña"
                    />
                  </div>
                </div>

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
                  {pending ? 'Guardando…' : 'Guardar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-4">
          <button onClick={() => router.replace('/login')} className="text-xs text-slate-400 hover:text-slate-600 hover:underline">
            ← Volver al inicio de sesión
          </button>
        </p>
      </div>
    </div>
  )
}

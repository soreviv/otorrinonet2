'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null)

  return (
    <div className="w-full max-w-sm">
      {/* Logo / header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-sky-600 mx-auto flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 font-[family-name:var(--font-dm-sans)]">
          Dr. Viveros ORL
        </h1>
        <p className="text-sm text-slate-500 mt-1">Panel de personal médico</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-5">Iniciar sesión</h2>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-600 mb-1.5">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              placeholder="doctor@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-600 mb-1.5">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {state && 'error' in state && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-sm font-semibold py-2.5 transition-colors"
          >
            {pending ? 'Verificando…' : 'Continuar'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        Después de verificar tu contraseña se solicitará el código 2FA.
      </p>
    </div>
  )
}

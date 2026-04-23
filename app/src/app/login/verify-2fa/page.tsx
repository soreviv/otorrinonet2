'use client'

import { useActionState } from 'react'
import { redirect } from 'next/navigation'
import { verify2faAction } from '@/app/actions/auth'

export default function Verify2faPage() {
  const [state, action, pending] = useActionState(verify2faAction, null)

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-sky-600 mx-auto flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 font-[family-name:var(--font-dm-sans)]">
          Verificación 2FA
        </h1>
        <p className="text-sm text-slate-500 mt-1">Ingresa el código de tu app autenticadora</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-xs font-medium text-slate-600 mb-1.5">
              Código de 6 dígitos
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono text-center tracking-widest text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              placeholder="000000"
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
            {pending ? 'Verificando…' : 'Entrar al panel'}
          </button>
        </form>
      </div>

      <p className="text-center mt-4">
        <button
          onClick={() => redirect('/login')}
          className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
        >
          ← Volver al inicio de sesión
        </button>
      </p>
    </div>
  )
}

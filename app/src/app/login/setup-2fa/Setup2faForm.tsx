'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import QRCode from 'qrcode'
import { confirmSetup2faAction } from '@/app/actions/auth'

export function Setup2faForm({ otpauth, secret }: { otpauth: string; secret: string }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(confirmSetup2faAction, null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)

  useEffect(() => {
    QRCode.toDataURL(otpauth, { width: 180, margin: 1 }).then(setQrDataUrl)
  }, [otpauth])

  useEffect(() => {
    if (state && 'ok' in state) router.replace('/staff')
  }, [state, router])

  return (
    <div className="w-full space-y-5">
      {/* QR Code */}
      <div className="flex flex-col items-center gap-3">
        {qrDataUrl ? (
          <Image src={qrDataUrl} alt="QR 2FA" className="rounded-xl border border-slate-200 shadow-sm" width={180} height={180} unoptimized />
        ) : (
          <div className="w-[180px] h-[180px] rounded-xl border border-slate-200 bg-slate-50 animate-pulse" />
        )}
        <button
          type="button"
          onClick={() => setShowSecret(v => !v)}
          className="text-xs text-sky-600 hover:underline"
        >
          {showSecret ? 'Ocultar clave manual' : '¿No puedes escanear? Ingresa manualmente'}
        </button>
        {showSecret && (
          <code className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700 break-all text-center">
            {secret}
          </code>
        )}
      </div>

      {/* Confirm code */}
      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-xs font-medium text-slate-600 mb-1.5">
            Código de verificación
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
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
          {pending ? 'Verificando…' : 'Activar 2FA y entrar'}
        </button>
      </form>
    </div>
  )
}

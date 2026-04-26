import { redirect } from 'next/navigation'
import { getPendingSession } from '@/lib/session'
import { getSetup2faData } from '@/app/actions/auth'
import { Setup2faForm } from './Setup2faForm'

export default async function Setup2faPage() {
  const pending = await getPendingSession()
  if (!pending) redirect('/login')

  const data = await getSetup2faData()
  if (!data) redirect('/login')

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-sky-600 mx-auto flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 font-[family-name:var(--font-dm-sans)]">
          Configurar autenticación
        </h1>
        <p className="text-sm text-slate-500 mt-1">Primer acceso — configura 2FA</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div className="text-sm text-slate-600 space-y-2">
          <p className="font-medium text-slate-800">Sigue estos pasos:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-500">
            <li>Instala Google Authenticator o Authy en tu teléfono</li>
            <li>Escanea el código QR de abajo</li>
            <li>Ingresa el código de 6 dígitos para confirmar</li>
          </ol>
        </div>

        <Setup2faForm otpauth={data.otpauth} secret={data.secret} />
      </div>
    </div>
  )
}

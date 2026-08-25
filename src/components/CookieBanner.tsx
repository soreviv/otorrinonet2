'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X, ChevronDown, ChevronUp } from 'lucide-react'

const STORAGE_KEY = 'cookie-consent'
const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000

type Preferences = {
  analytics: boolean
  marketing: boolean
}

type ConsentRecord = {
  choice: 'accepted' | 'declined' | 'custom'
  preferences: Preferences
  savedAt: number
}

const CATEGORIES = [
  {
    id: 'necessary' as const,
    label: 'Necesarias',
    description: 'Imprescindibles para el funcionamiento básico del sitio. No pueden desactivarse.',
    required: true,
  },
  {
    id: 'analytics' as const,
    label: 'Analíticas',
    description: 'Nos ayudan a entender cómo los visitantes interactúan con el sitio (p. ej. Google Analytics).',
    required: false,
  },
  {
    id: 'marketing' as const,
    label: 'Marketing',
    description: 'Se utilizan para mostrar publicidad relevante y medir la efectividad de campañas.',
    required: false,
  },
]

function updateGtagConsent(prefs: Preferences) {
  if (typeof window === 'undefined') return
  const g = (window as Window & { gtag?: (...a: unknown[]) => void }).gtag
  if (!g) return
  g('consent', 'update', {
    analytics_storage: prefs.analytics ? 'granted' : 'denied',
    ad_storage: prefs.marketing ? 'granted' : 'denied',
    ad_user_data: prefs.marketing ? 'granted' : 'denied',
    ad_personalization: prefs.marketing ? 'granted' : 'denied',
  })
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<Preferences>({ analytics: false, marketing: false })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const record: ConsentRecord = JSON.parse(raw)
        if (record.savedAt && Date.now() - record.savedAt < TWELVE_MONTHS_MS) {
          updateGtagConsent(record.preferences)
          return
        }
      }
    } catch {}
    localStorage.removeItem(STORAGE_KEY)
    // localStorage no existe durante el render en servidor — el banner solo puede
    // decidirse a mostrar tras montar en cliente, así que el setState aquí es necesario.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true)
  }, [])

  function save(record: Omit<ConsentRecord, 'savedAt'>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...record, savedAt: Date.now() }))
    updateGtagConsent(record.preferences)
    setVisible(false)
  }

  function acceptAll() {
    save({ choice: 'accepted', preferences: { analytics: true, marketing: true } })
  }

  function declineAll() {
    save({ choice: 'declined', preferences: { analytics: false, marketing: false } })
  }

  function saveCustom() {
    save({ choice: 'custom', preferences })
  }

  function toggle(key: keyof Preferences) {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">

        <div className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Cookie className="w-5 h-5 text-primary-500 shrink-0 mt-0.5 sm:mt-0" />
          <p className="flex-1 text-sm text-slate-600 leading-relaxed">
            Usamos cookies para mejorar tu experiencia y analizar el tráfico.{' '}
            <Link href="/cookies" className="text-primary-600 underline underline-offset-2 hover:text-primary-700">
              Política de cookies
            </Link>
          </p>
          <button
            onClick={declineAll}
            aria-label="Cerrar sin aceptar"
            className="hidden sm:block p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showDetails && (
          <div className="border-t border-slate-100 px-5 py-4 space-y-3">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="flex items-start gap-3">
                <div className="mt-0.5">
                  {cat.required ? (
                    <div className="w-10 h-5 rounded-full bg-primary-500 flex items-center justify-end px-1 cursor-not-allowed opacity-60">
                      <div className="w-3.5 h-3.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <button
                      role="switch"
                      aria-checked={preferences[cat.id as keyof Preferences]}
                      onClick={() => toggle(cat.id as keyof Preferences)}
                      className={`w-10 h-5 rounded-full transition-colors flex items-center px-1 ${
                        preferences[cat.id as keyof Preferences]
                          ? 'bg-primary-500 justify-end'
                          : 'bg-slate-200 justify-start'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {cat.label}
                    {cat.required && (
                      <span className="ml-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                        Siempre activas
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-slate-100 px-5 py-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowDetails(v => !v)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors mr-auto"
          >
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showDetails ? 'Ocultar opciones' : 'Personalizar'}
          </button>

          {showDetails && (
            <button
              onClick={saveCustom}
              className="px-4 py-2 text-sm font-medium text-primary-700 border border-primary-200 hover:bg-primary-50 rounded-xl transition-colors"
            >
              Guardar preferencias
            </button>
          )}

          <button
            onClick={declineAll}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl transition-colors"
          >
            Rechazar todo
          </button>
          <button
            onClick={acceptAll}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
          >
            Aceptar todo
          </button>
        </div>

      </div>
    </div>
  )
}

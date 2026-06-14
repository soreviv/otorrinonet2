'use client'

import { useState } from 'react'
import { submitPreregistro } from '@/app/actions/appointments'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 'done' | 'error'

interface Props {
  token: string
  patientName: string
}

// ─── Aviso de privacidad ──────────────────────────────────────────────────────

function AvisoPrivacidad() {
  return (
    <div className="text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
      <p>
        El consultorio del <strong>Dr. Alejandro Viveros Domínguez</strong>, con domicilio en Ciudad de
        México, es responsable del tratamiento de sus datos personales conforme a la{' '}
        <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong>.
      </p>

      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          Datos requeridos por la Secretaría de Salud
        </p>
        <p>
          La <strong>NOM-024-SSA3-2012</strong> establece que los sistemas de expediente clínico electrónico
          deben recabar y reportar mensualmente a la DGIS (Secretaría de Salud) los siguientes datos de
          identificación del paciente para el intercambio nacional de información en salud:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
          <li><strong>CURP</strong> — Clave Única de Registro de Población</li>
          <li><strong>Fecha de nacimiento</strong></li>
          <li><strong>Entidad federativa de nacimiento</strong></li>
          <li><strong>Sexo</strong> (CURP, biológico e identidad de género)</li>
          <li><strong>Derechohabiencia</strong> — institución de salud donde tiene derecho a atención (IMSS, ISSSTE, ninguna, etc.)</li>
          <li><strong>Pertenencia a población indígena o afromexicana</strong></li>
          <li><strong>Condición migrante</strong></li>
        </ul>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Estos datos se reportan de forma estadística y agregada. No se comparte su expediente
          individual sin su consentimiento explícito.
        </p>
      </div>

      <p><strong>Finalidades del tratamiento:</strong></p>
      <ul className="list-disc list-inside space-y-1">
        <li>Integración y gestión de su expediente clínico electrónico.</li>
        <li>Prestación de servicios médicos y seguimiento de su atención.</li>
        <li>Comunicación sobre sus citas, recordatorios y resultados.</li>
        <li>Cumplimiento de obligaciones legales ante autoridades sanitarias (DGIS/SSA).</li>
        <li>Generación de estadísticas de salud pública conforme a la NOM-024-SSA3-2012.</li>
      </ul>

      <p>
        Sus datos se tratarán con estricta confidencialidad, almacenados con cifrado AES-256-GCM y
        protegidos con autenticación de doble factor. Solo el personal autorizado del consultorio tiene
        acceso a su expediente individual.
      </p>

      <p>
        <strong>Derechos ARCO:</strong> Puede ejercer sus derechos de Acceso, Rectificación,
        Cancelación u Oposición enviando una solicitud a{' '}
        <a href="mailto:drviverosorl@gmail.com" className="text-sky-600 underline">
          drviverosorl@gmail.com
        </a>
        . Consulte el aviso completo en{' '}
        <a href="/privacidad" target="_blank" className="text-sky-600 underline">
          otorrinonet.mx/privacidad
        </a>
        .
      </p>
    </div>
  )
}

// ─── Componentes de formulario ────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition'

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
      {children}
    </label>
  )
}

function Field({ id, label, children }: { id?: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PreregistroClient({ token, patientName }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Formulario — datos personales
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [sexo, setSexo] = useState<'masculino' | 'femenino' | 'otro'>('otro')
  const [curp, setCurp] = useState('')
  const [domicilio, setDomicilio] = useState('')

  // Formulario — historial rápido
  const [alergiaDraft, setAlergiaDraft] = useState('')
  const [alergias, setAlergias] = useState<string[]>([])
  const [medicamentos, setMedicamentos] = useState('')
  const [antecedentes, setAntecedentes] = useState('')

  async function handleSubmit() {
    setLoading(true)
    const result = await submitPreregistro({
      token,
      fechaNacimiento,
      sexo,
      curp: curp || undefined,
      domicilio: domicilio || undefined,
      alergias: alergias.length ? alergias : undefined,
      medicamentos: medicamentos || undefined,
      antecedentes: antecedentes || undefined,
    })
    setLoading(false)
    setStep(result.ok ? 'done' : 'error')
  }

  // ── Pantalla de éxito ──
  if (step === 'done') {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">¡Información guardada!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sus datos han sido registrados en su expediente. El Dr. Viveros los tendrá disponibles
          cuando llegue a su consulta.
        </p>
        <a href="/" className="inline-block mt-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors">
          Volver al inicio
        </a>
      </div>
    )
  }

  // ── Pantalla de error ──
  if (step === 'error') {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ocurrió un problema</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No pudimos guardar su información. Por favor intente de nuevo o comuníquese con el consultorio.
        </p>
        <button
          onClick={() => setStep(3)}
          className="inline-block bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Indicador de pasos */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as const).map((n) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
              step === n ? 'bg-sky-600 text-white' : step > n ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {step > n ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : n}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step === n ? 'text-sky-700 dark:text-sky-400' : 'text-slate-400'}`}>
              {n === 1 ? 'Aviso de privacidad' : n === 2 ? 'Datos personales' : 'Historial rápido'}
            </span>
            {n < 3 && <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />}
          </div>
        ))}
      </div>

      {/* ── Paso 1: Aviso de privacidad ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Aviso de privacidad</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Hola <strong>{patientName}</strong>, antes de continuar lea el siguiente aviso.
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
            <AvisoPrivacidad />
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-sky-600 shrink-0"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              He leído y acepto el aviso de privacidad, incluyendo el tratamiento de mis datos
              personales conforme a la NOM-024-SSA3-2012.
            </span>
          </label>
          <button
            onClick={() => setStep(2)}
            disabled={!privacyAccepted}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white disabled:text-slate-400 font-semibold py-2.5 rounded-xl transition-colors"
          >
            Aceptar y continuar
          </button>
        </div>
      )}

      {/* ── Paso 2: Datos personales ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Datos personales</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Esta información se integrará a su expediente clínico.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="fechaNacimiento" label="Fecha de nacimiento *">
              <input
                id="fechaNacimiento"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field id="sexo" label="Sexo *">
              <select id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value as typeof sexo)} className={inputCls}>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="otro">Otro / Prefiero no decir</option>
              </select>
            </Field>
            <Field id="curp" label="CURP">
              <input
                id="curp"
                type="text"
                value={curp}
                onChange={(e) => setCurp(e.target.value.toUpperCase())}
                placeholder="18 caracteres"
                maxLength={18}
                className={inputCls + ' font-mono uppercase'}
              />
            </Field>
          </div>
          <Field id="domicilio" label="Domicilio">
            <input
              id="domicilio"
              type="text"
              value={domicilio}
              onChange={(e) => setDomicilio(e.target.value)}
              placeholder="Calle, número, colonia, ciudad"
              className={inputCls}
            />
          </Field>
          <div className="flex gap-3 justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              ← Atrás
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!fechaNacimiento}
              className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white disabled:text-slate-400 font-semibold py-2.5 rounded-xl transition-colors"
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* ── Paso 3: Historial rápido ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Historial rápido</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Opcional. Ayuda al médico a preparar mejor su consulta.
            </p>
          </div>

          <Field label="Alergias conocidas">
            <div className="flex gap-2">
              <input
                type="text"
                value={alergiaDraft}
                onChange={(e) => setAlergiaDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ',') && alergiaDraft.trim()) {
                    e.preventDefault()
                    setAlergias((prev) => [...prev, alergiaDraft.trim()])
                    setAlergiaDraft('')
                  }
                }}
                placeholder="Ej. Penicilina — presione Enter para agregar"
                className={inputCls + ' flex-1'}
              />
              <button
                type="button"
                onClick={() => { if (alergiaDraft.trim()) { setAlergias(p => [...p, alergiaDraft.trim()]); setAlergiaDraft('') } }}
                className="px-3 py-2 bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 rounded-xl hover:bg-sky-200 dark:hover:bg-sky-900/60 transition-colors text-sm font-medium"
              >
                +
              </button>
            </div>
            {alergias.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {alergias.map((a, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                    {a}
                    <button type="button" onClick={() => setAlergias(p => p.filter((_, idx) => idx !== i))} className="opacity-60 hover:opacity-100 ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Field id="medicamentos" label="Medicamentos que toma actualmente">
            <textarea
              id="medicamentos"
              rows={2}
              value={medicamentos}
              onChange={(e) => setMedicamentos(e.target.value)}
              placeholder="Nombre, dosis y frecuencia..."
              className={inputCls + ' resize-none'}
            />
          </Field>

          <Field id="antecedentes" label="Antecedentes relevantes">
            <textarea
              id="antecedentes"
              rows={3}
              value={antecedentes}
              onChange={(e) => setAntecedentes(e.target.value)}
              placeholder="Cirugías previas, enfermedades crónicas, hospitalizaciones..."
              className={inputCls + ' resize-none'}
            />
          </Field>

          <div className="flex gap-3 justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              ← Atrás
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white disabled:text-slate-400 font-semibold py-2.5 rounded-xl transition-colors"
            >
              {loading ? 'Guardando…' : 'Guardar y finalizar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

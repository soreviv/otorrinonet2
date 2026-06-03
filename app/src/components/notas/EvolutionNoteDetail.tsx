'use client'

import { useState } from 'react'
import {
  ArrowLeft, FileSignature, Lock, Pencil, Plus, X, ShieldCheck,
  AlertTriangle, Clock, User as UserIcon, Save, Printer,
} from 'lucide-react'
import type { EvolutionNote, NoteDiagnostico } from '@/lib/notas-types'

interface Props {
  note: EvolutionNote
  canEdit: boolean
  onBack: () => void
  onSave: (data: {
    motivoConsulta: string
    subjetivo: string
    objetivo: string
    analisis: string
    plan: string
    servicioAtencion?: number
    sintomaticoRespTb?: number
    primeraVezAnio?: number
    primeraVezUneme?: number
    vitals?: {
      presionSistolica?: number
      presionDiastolica?: number
      frecuenciaCardiaca?: number
      temperatura?: number
      saturacionOxigeno?: number
      peso?: number
      talla?: number
      circunferenciaCintura?: number
    }
  }) => Promise<EvolutionNote>
  onSign: () => Promise<EvolutionNote>
  onAddAddendum: (contenido: string) => Promise<void>
  onPrint?: () => void
}

const SELECT_LABELS: Record<string, Record<number, string>> = {
  respTB: { [-1]: 'No aplica', [0]: 'No', [1]: 'Sí' },
  primeraAnio: { [0]: 'No', [1]: 'Sí' },
  primeraUneme: { [-1]: 'No aplica', [0]: 'No', [1]: 'Sí' },
}

const textareaCls =
  'w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition resize-none'

const inputCls =
  'w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition'

const readonlyCls =
  'w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 whitespace-pre-wrap min-h-[5rem]'

function formatLegalCDMX(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
      {children}
    </label>
  )
}

export function EvolutionNoteDetail({ note, canEdit, onBack, onSave, onSign, onAddAddendum, onPrint }: Props) {
  const [current, setCurrent] = useState<EvolutionNote>(note)
  const isSigned = current.signed
  const [editing, setEditing] = useState(false)

  // Edit state
  const [motivoConsulta, setMotivoConsulta] = useState(current.consultationReason)
  const [objetivo, setObjetivo] = useState(current.findings)
  const [analisis, setAnalisis] = useState(current.updatedDiagnosis)
  const [plan, setPlan] = useState(current.plan)

  // GIIS-B015 fields
  const [servicioSISCE, setServicioSISCE] = useState(current.servicioAtencion?.toString() ?? '')
  const [respTB, setRespTB] = useState(current.sintomaticoRespTb?.toString() ?? '-1')
  const [primeraAnio, setPrimeraAnio] = useState(current.primeraVezAnio?.toString() ?? '0')
  const [primeraUneme, setPrimeraUneme] = useState(current.primeraVezUneme?.toString() ?? '-1')

  // Vitals
  const [pSis, setPSis] = useState(current.vitals?.presionSistolica?.toString() ?? '')
  const [pDia, setPDia] = useState(current.vitals?.presionDiastolica?.toString() ?? '')
  const [fc, setFc] = useState(current.vitals?.frecuenciaCardiaca?.toString() ?? '')
  const [temp, setTemp] = useState(current.vitals?.temperatura?.toString() ?? '')
  const [spo2, setSpo2] = useState(current.vitals?.saturacionOxigeno?.toString() ?? '')
  const [peso, setPeso] = useState(current.vitals?.peso?.toString() ?? '')
  const [talla, setTalla] = useState(current.vitals?.talla?.toString() ?? '')
  const [cintura, setCintura] = useState(current.vitals?.circunferenciaCintura?.toString() ?? '')

  const [saving, setSaving] = useState(false)
  const [savingError, setSavingError] = useState<string | null>(null)

  // Sign state
  const [confirmSign, setConfirmSign] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signError, setSignError] = useState<string | null>(null)

  // Addendum state
  const [addendumOpen, setAddendumOpen] = useState(false)
  const [addendumText, setAddendumText] = useState('')
  const [addendumSaving, setAddendumSaving] = useState(false)
  const [addendumError, setAddendumError] = useState<string | null>(null)

  function startEdit() {
    setMotivoConsulta(current.consultationReason)
    setObjetivo(current.findings)
    setAnalisis(current.updatedDiagnosis)
    setPlan(current.plan)

    setServicioSISCE(current.servicioAtencion?.toString() ?? '')
    setRespTB(current.sintomaticoRespTb?.toString() ?? '-1')
    setPrimeraAnio(current.primeraVezAnio?.toString() ?? '0')
    setPrimeraUneme(current.primeraVezUneme?.toString() ?? '-1')

    setPSis(current.vitals?.presionSistolica?.toString() ?? '')
    setPDia(current.vitals?.presionDiastolica?.toString() ?? '')
    setFc(current.vitals?.frecuenciaCardiaca?.toString() ?? '')
    setTemp(current.vitals?.temperatura?.toString() ?? '')
    setSpo2(current.vitals?.saturacionOxigeno?.toString() ?? '')
    setPeso(current.vitals?.peso?.toString() ?? '')
    setTalla(current.vitals?.talla?.toString() ?? '')
    setCintura(current.vitals?.circunferenciaCintura?.toString() ?? '')

    setEditing(true)
    setSavingError(null)
  }

  async function handleSave() {
    setSaving(true)
    setSavingError(null)
    try {
      const updated = await onSave({
        motivoConsulta,
        subjetivo: motivoConsulta,
        objetivo,
        analisis,
        plan,
        servicioAtencion: servicioSISCE ? parseInt(servicioSISCE) : undefined,
        sintomaticoRespTb: parseInt(respTB),
        primeraVezAnio: parseInt(primeraAnio),
        primeraVezUneme: parseInt(primeraUneme),
        vitals: {
          presionSistolica: pSis ? parseInt(pSis) : undefined,
          presionDiastolica: pDia ? parseInt(pDia) : undefined,
          frecuenciaCardiaca: fc ? parseInt(fc) : undefined,
          temperatura: temp ? parseFloat(temp) : undefined,
          saturacionOxigeno: spo2 ? parseInt(spo2) : undefined,
          peso: peso ? parseFloat(peso) : undefined,
          talla: talla ? parseFloat(talla) : undefined,
          circunferenciaCintura: cintura ? parseInt(cintura) : undefined,
        },
      })
      setCurrent(updated)
      setEditing(false)
    } catch (e) {
      setSavingError(e instanceof Error ? e.message : 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSign() {
    setSigning(true)
    setSignError(null)
    try {
      const signed = await onSign()
      setCurrent(signed)
      setConfirmSign(false)
    } catch (e) {
      setSignError(e instanceof Error ? e.message : 'Error al firmar.')
    } finally {
      setSigning(false)
    }
  }

  async function handleAddAddendum() {
    if (addendumText.trim().length < 5) {
      setAddendumError('Escribe al menos 5 caracteres.')
      return
    }
    setAddendumSaving(true)
    setAddendumError(null)
    try {
      await onAddAddendum(addendumText.trim())
      // Refrescar nota a partir de lo que el padre devuelva — el padre actualiza el estado
      // y volverá a renderizar este detalle. Para UX inmediata, agregamos optimista.
      setCurrent(c => ({
        ...c,
        addendums: [
          ...c.addendums,
          {
            id: `tmp-${Date.now()}`,
            contenido: addendumText.trim(),
            authorName: 'Usted',
            fecha: new Date().toISOString(),
            firmaHash: null,
          },
        ],
      }))
      setAddendumText('')
      setAddendumOpen(false)
    } catch (e) {
      setAddendumError(e instanceof Error ? e.message : 'Error al agregar.')
    } finally {
      setAddendumSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" data-testid="evolution-note-detail">
      {/* Sticky header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            data-testid="note-back"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-50 truncate">
              Nota de evolución
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
              {current.patientName} · {current.date} · {current.time}
            </p>
          </div>
          <SignatureBadge note={current} />
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Imprimir nota"
            >
              <Printer className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Aviso legal de firma */}
        {isSigned && (
          <div
            className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900"
            data-testid="signed-banner"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.75} />
            <div className="text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
              <p className="font-bold uppercase tracking-widest">Nota firmada electrónicamente</p>
              <p>
                Firmada por <strong>{current.authorName}</strong> el{' '}
                <strong>{current.signedAt ? formatLegalCDMX(current.signedAt) : '—'}</strong>{' '}
                (zona horaria Ciudad de México).
              </p>
              {current.firmaHash && (
                <p className="font-mono text-[10px] break-all opacity-80">
                  SHA-256: {current.firmaHash}
                </p>
              )}
              <p className="opacity-80">
                Conforme a NOM-004-SSA3-2012 y NOM-024-SSA3-2012, esta nota no puede modificarse.
                Las correcciones se registran como adendums.
              </p>
            </div>
          </div>
        )}

        {/* Cuerpo de la nota */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Nota original
            </p>
            {!isSigned && canEdit && !editing && (
              <button
                type="button"
                onClick={startEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                data-testid="note-edit-button"
              >
                <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                Editar
              </button>
            )}
          </div>

          {editing ? (
            <>
              <div>
                <Label>S — Subjetivo (motivo / síntomas)</Label>
                <textarea rows={3} value={motivoConsulta} onChange={(e) => setMotivoConsulta(e.target.value)} className={textareaCls} data-testid="edit-subjective" />
              </div>
              <div>
                <Label>O — Objetivo</Label>
                <textarea rows={3} value={objetivo} onChange={(e) => setObjetivo(e.target.value)} className={textareaCls} data-testid="edit-objective" />
              </div>
              <div>
                <Label>A — Análisis</Label>
                <textarea rows={2} value={analisis} onChange={(e) => setAnalisis(e.target.value)} className={textareaCls} data-testid="edit-assessment" />
              </div>
              <div>
                <Label>P — Plan</Label>
                <textarea rows={3} value={plan} onChange={(e) => setPlan(e.target.value)} className={textareaCls} data-testid="edit-plan" />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <Label>Signos vitales / GIIS-B015</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Sistólica</label>
                    <input type="number" value={pSis} onChange={e => setPSis(e.target.value)} className={inputCls} placeholder="120" min={50} max={250} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Diastólica</label>
                    <input type="number" value={pDia} onChange={e => setPDia(e.target.value)} className={inputCls} placeholder="80" min={30} max={150} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">FC (lpm)</label>
                    <input type="number" value={fc} onChange={e => setFc(e.target.value)} className={inputCls} placeholder="72" min={30} max={250} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Temp (°C)</label>
                    <input type="number" step="0.1" value={temp} onChange={e => setTemp(e.target.value)} className={inputCls} placeholder="36.5" min={34} max={42} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">SpO₂ (%)</label>
                    <input type="number" value={spo2} onChange={e => setSpo2(e.target.value)} className={inputCls} placeholder="98" min={70} max={100} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Peso (kg)</label>
                    <input type="number" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} className={inputCls} placeholder="70" min={1} max={300} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Talla (cm)</label>
                    <input type="number" value={talla} onChange={e => setTalla(e.target.value)} className={inputCls} placeholder="170" min={30} max={250} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Cintura (cm)</label>
                    <input type="number" value={cintura} onChange={e => setCintura(e.target.value)} className={inputCls} placeholder="90" min={20} max={300} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Servicio SIS-CE</label>
                    <input type="number" value={servicioSISCE} onChange={e => setServicioSISCE(e.target.value)} className={inputCls} placeholder="Ej. 1" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Sintomático resp. TB</label>
                    <select value={respTB} onChange={e => setRespTB(e.target.value)} className={inputCls}>
                      <option value="-1">No aplica</option>
                      <option value="0">No</option>
                      <option value="1">Sí</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">1ª vez año</label>
                    <select value={primeraAnio} onChange={e => setPrimeraAnio(e.target.value)} className={inputCls}>
                      <option value="0">No</option>
                      <option value="1">Sí</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">1ª vez UNEME</label>
                    <select value={primeraUneme} onChange={e => setPrimeraUneme(e.target.value)} className={inputCls}>
                      <option value="-1">No aplica</option>
                      <option value="0">No</option>
                      <option value="1">Sí</option>
                    </select>
                  </div>
                </div>
              </div>

              {current.diagnosticos.length > 0 && (
                <DiagnosticosDisplay diagnosticos={current.diagnosticos} />
              )}
              {savingError && <p className="text-xs text-rose-600 dark:text-rose-400">{savingError}</p>}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  data-testid="edit-cancel"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white transition-colors"
                  data-testid="edit-save"
                >
                  <Save className="w-4 h-4" strokeWidth={2} />
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </>
          ) : (
            <>
              <Section label="S — Subjetivo (motivo / síntomas)" value={current.consultationReason} testId="note-subjective" />
              <Section label="O — Objetivo" value={current.findings} testId="note-objective" />
              <Section label="A — Análisis" value={current.updatedDiagnosis} testId="note-assessment" />
              <Section label="P — Plan" value={current.plan} testId="note-plan" />
              {current.diagnosticos.length > 0 && (
                <DiagnosticosDisplay diagnosticos={current.diagnosticos} />
              )}
              <GIISB015Display note={current} />
            </>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <UserIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
            Autor: <span className="text-slate-600 dark:text-slate-400">{current.authorName}</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
            {formatLegalCDMX(current.createdAt)}
          </div>
        </div>

        {/* Botón firmar */}
        {!isSigned && canEdit && !editing && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900 p-5">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={1.75} />
              <div className="flex-1 text-xs text-slate-600 dark:text-slate-400">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Firma electrónica</p>
                <p>
                  Al firmar, esta nota quedará <strong>inalterable</strong>. Cualquier corrección
                  posterior deberá registrarse como adendum (NOM-004-SSA3-2012). Se generará un
                  hash SHA-256 con sello de tiempo (NOM-151) que valida su autoría.
                </p>
              </div>
            </div>
            {!confirmSign ? (
              <button
                type="button"
                onClick={() => setConfirmSign(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                data-testid="sign-button"
              >
                <FileSignature className="w-4 h-4" strokeWidth={2} />
                Firmar nota electrónicamente
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  ¿Confirmas que la nota es correcta y deseas firmarla?
                </p>
                {signError && <p className="text-xs text-rose-600 dark:text-rose-400">{signError}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setConfirmSign(false); setSignError(null) }}
                    disabled={signing}
                    className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    data-testid="sign-cancel"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSign}
                    disabled={signing}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white transition-colors"
                    data-testid="sign-confirm"
                  >
                    <FileSignature className="w-4 h-4" strokeWidth={2} />
                    {signing ? 'Firmando…' : 'Sí, firmar ahora'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Adendums */}
        {isSigned && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Adendums</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  {current.addendums.length}
                </span>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setAddendumOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-colors"
                  data-testid="addendum-add-button"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                  Agregar adendum
                </button>
              )}
            </div>

            {current.addendums.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-600 italic">
                Sin adendums registrados.
              </p>
            ) : (
              <ol className="space-y-3">
                {current.addendums.map((a, i) => (
                  <li
                    key={a.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/40"
                    data-testid={`addendum-${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Adendum #{i + 1}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">·</span>
                        <span className="text-slate-500 dark:text-slate-400">{a.authorName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                        {formatLegalCDMX(a.fecha)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {a.contenido}
                    </p>
                    {a.firmaHash && (
                      <p className="mt-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 break-all">
                        Hash: {a.firmaHash}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>

      {/* Modal de adendum */}
      {addendumOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 relative">
            <button
              type="button"
              onClick={() => setAddendumOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              data-testid="addendum-close"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              Agregar adendum a la nota firmada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              El adendum se firmará automáticamente con su nombre y fecha actual. No se puede borrar
              ni modificar después de guardar.
            </p>

            <Label>Contenido del adendum</Label>
            <textarea
              rows={6}
              value={addendumText}
              onChange={(e) => setAddendumText(e.target.value)}
              placeholder="Aclare, corrija o complemente la nota original con la información necesaria…"
              className={textareaCls}
              autoFocus
              data-testid="addendum-input"
            />
            <p className="text-[10px] text-slate-400 mt-1">{addendumText.length} / 5000 caracteres</p>

            {addendumError && (
              <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{addendumError}</p>
            )}

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setAddendumOpen(false)}
                disabled={addendumSaving}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                data-testid="addendum-cancel"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddAddendum}
                disabled={addendumSaving || addendumText.trim().length < 5}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white transition-colors"
                data-testid="addendum-save"
              >
                <Save className="w-4 h-4" strokeWidth={2} />
                {addendumSaving ? 'Guardando…' : 'Guardar adendum'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className={readonlyCls} data-testid={testId}>
        {value || <span className="italic text-slate-400 dark:text-slate-600">Sin información</span>}
      </div>
    </div>
  )
}

function GIISB015Display({ note }: { note: EvolutionNote }) {
  const hasVitals = note.vitals && Object.values(note.vitals).some(v => v !== null)
  const hasFields =
    note.servicioAtencion !== null ||
    note.sintomaticoRespTb !== null ||
    note.primeraVezAnio !== null ||
    note.primeraVezUneme !== null

  if (!hasVitals && !hasFields) return null

  return (
    <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
      <Label>Datos GIIS-B015 / Signos Vitales</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
        {note.vitals?.presionSistolica && note.vitals?.presionDiastolica && (
          <DataField label="T/A" value={`${note.vitals.presionSistolica}/${note.vitals.presionDiastolica} mmHg`} />
        )}
        {note.vitals?.frecuenciaCardiaca && <DataField label="FC" value={`${note.vitals.frecuenciaCardiaca} lpm`} />}
        {note.vitals?.temperatura && <DataField label="Temp" value={`${note.vitals.temperatura} °C`} />}
        {note.vitals?.saturacionOxigeno && <DataField label="SpO₂" value={`${note.vitals.saturacionOxigeno} %`} />}
        {note.vitals?.peso && <DataField label="Peso" value={`${note.vitals.peso} kg`} />}
        {note.vitals?.talla && <DataField label="Talla" value={`${note.vitals.talla} cm`} />}
        {note.vitals?.circunferenciaCintura && <DataField label="Cintura" value={`${note.vitals.circunferenciaCintura} cm`} />}

        {note.servicioAtencion !== null && <DataField label="Servicio SIS-CE" value={note.servicioAtencion.toString()} />}
        {note.sintomaticoRespTb !== null && (
          <DataField label="Sint. Resp. TB" value={SELECT_LABELS.respTB[note.sintomaticoRespTb] || '—'} />
        )}
        {note.primeraVezAnio !== null && (
          <DataField label="1ª vez año" value={SELECT_LABELS.primeraAnio[note.primeraVezAnio] || '—'} />
        )}
        {note.primeraVezUneme !== null && (
          <DataField label="1ª vez UNEME" value={SELECT_LABELS.primeraUneme[note.primeraVezUneme] || '—'} />
        )}
      </div>
    </div>
  )
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{value}</p>
    </div>
  )
}

function DiagnosticosDisplay({ diagnosticos }: { diagnosticos: NoteDiagnostico[] }) {
  return (
    <div>
      <Label>Diagnósticos CIE-10</Label>
      <div className="flex flex-wrap gap-1.5" data-testid="note-diagnosticos">
        {diagnosticos.map(dx => (
          <span
            key={dx.codigo}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300"
          >
            <span className="font-mono font-bold">{dx.codigo}</span>
            <span className="text-sky-600 dark:text-sky-400">{dx.descripcion}</span>
            {dx.tipo !== 'presuntivo' && (
              <span className="text-[10px] text-sky-500 dark:text-sky-500 uppercase">{dx.tipo}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

function SignatureBadge({ note }: { note: EvolutionNote }) {
  if (note.signed) {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50 shrink-0">
        <Lock className="w-3 h-3" strokeWidth={2.5} />
        Firmada
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 shrink-0">
      <Pencil className="w-3 h-3" strokeWidth={2.5} />
      Borrador
    </span>
  )
}

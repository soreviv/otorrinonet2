'use client'

import { useRef, useState, useEffect } from 'react'
import type { PrescriptionDetailProps } from '@/lib/notas-types'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

export function PrescriptionDetail({
  prescription,
  onSign,
  onPrint,
  onBack,
}: PrescriptionDetailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasStrokes, setHasStrokes] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  const isSigned = prescription.status === 'firmada'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#0f766e'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (isSigned) return
    e.preventDefault()
    const canvas = canvasRef.current!
    setIsDrawing(true)
    setLastPos(getPos(e, canvas))
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing || isSigned) return
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setLastPos(pos)
    setHasStrokes(true)
  }

  function stopDraw() { setIsDrawing(false) }

  function clearCanvas() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
  }

  function handleSign() {
    if (!hasStrokes) return
    const canvas = canvasRef.current!
    onSign?.(prescription.id, canvas.toDataURL('image/png'))
  }

  const rx = prescription

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Page header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Receta Médica</h1>
            <p className="text-xs font-mono text-slate-400 dark:text-slate-500">{rx.patientName}</p>
          </div>
          <div className="flex items-center gap-2">
            {isSigned ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-xs font-semibold text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-700/50">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Firmada
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Borrador
              </span>
            )}
            {isSigned && (
              <button
                onClick={() => onPrint?.(rx.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Imprimir
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-8">

        {/* Official prescription document */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">

          {/* ── Membrete: Establecimiento ── */}
          <div className="bg-sky-700 dark:bg-sky-800 px-5 py-4">
            <p className="text-lg font-bold text-white">{rx.clinicName}</p>
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-0.5">
              <span className="flex items-center gap-1.5 text-xs text-sky-200">
                <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {rx.clinicAddress}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-sky-200">
                <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.44a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15.92z" />
                </svg>
                {rx.clinicPhone}
              </span>
              {rx.clinicCofepris && (
                <span className="text-xs text-sky-300">AF: {rx.clinicCofepris}</span>
              )}
            </div>
          </div>

          {/* ── Datos del médico ── */}
          <div className="px-5 py-3 bg-sky-50 dark:bg-sky-900/20 border-b border-sky-100 dark:border-sky-800/50">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wide">Médico</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{rx.doctorName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rx.doctorUniversity}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-1">
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                  {rx.doctorLicense}
                </span>
                <span className="text-xs font-mono text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/40 px-2 py-0.5 rounded">
                  {rx.doctorSpecialtyLicense}
                </span>
              </div>
            </div>
          </div>

          {/* ── Datos del paciente y fecha ── */}
          <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Paciente</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{rx.patientName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Fecha de expedición</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {new Date(rx.date + 'T00:00:00').toLocaleDateString('es-MX', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* ── Medicamentos ── */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {rx.medications.map((med, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{med.name}</p>
                      {med.brandName && (
                        <p className="text-xs italic text-slate-500 dark:text-slate-400">({med.brandName})</p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400">{med.presentation}</p>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-x-4 gap-y-1">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium">Dosis</p>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{med.dose}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium">Frecuencia</p>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{med.frequency}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium">Duración</p>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{med.duration}</p>
                      </div>
                    </div>
                    {med.instructions && (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                        ℹ {med.instructions}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Firma electrónica ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isSigned ? 'Firma autógrafa del médico' : 'Firmar receta'}
              </h2>
            </div>
            {!isSigned && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Dibuja tu firma de puño y letra. Al confirmar, la receta quedará sellada con timestamp y no podrá modificarse.
              </p>
            )}
          </div>

          <div className="px-5 py-4">
            {isSigned ? (
              <div className="space-y-3">
                <div className="rounded-xl border-2 border-dashed border-sky-200 dark:border-sky-700/50 bg-sky-50 dark:bg-sky-900/10 h-28 flex items-center justify-center">
                  <span className="text-xs text-sky-500 dark:text-sky-500 italic">Firma autógrafa registrada ✓</span>
                </div>
                {rx.signedAt && (
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 px-4 py-3 space-y-1">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium">
                      Timestamp — Normatividad mexicana
                    </p>
                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                      {formatDateTime(rx.signedAt)}
                    </p>
                    {rx.signatureTimestamp && (
                      <>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium mt-2">
                          UTC (auditoría)
                        </p>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {rx.signatureTimestamp}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30 overflow-hidden select-none">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={160}
                    className="w-full cursor-crosshair touch-none"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                  {!hasStrokes && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic">Firma autógrafa aquí</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearCanvas}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                    </svg>
                    Limpiar
                  </button>
                  <button
                    onClick={handleSign}
                    disabled={!hasStrokes}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white transition-colors shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Firmar y sellar receta
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                  Al firmar, se genera un timestamp conforme a normatividad mexicana. La receta será inmutable.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

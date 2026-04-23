'use client'

import { useRef, useState, useEffect } from 'react'
import type { ConsentFormDetailProps } from '@/lib/notas-types'

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

export function ConsentFormDetail({
  consent,
  onSignPresential,
  onSendEmail,
  onPrint,
  onBack,
}: ConsentFormDetailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasStrokes, setHasStrokes] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const [signMode, setSignMode] = useState<'presencial' | 'correo' | null>(null)
  const [emailSent, setEmailSent] = useState(!!consent.emailSentAt)

  const isSigned = consent.status === 'firmado-presencial' || consent.status === 'firmado-correo'
  const isRejected = consent.status === 'rechazado'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#0369a1'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [signMode])

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
    e.preventDefault()
    const canvas = canvasRef.current!
    setIsDrawing(true)
    setLastPos(getPos(e, canvas))
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing) return
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

  function handleSignPresential() {
    if (!hasStrokes) return
    onSignPresential?.(consent.id, canvasRef.current!.toDataURL('image/png'))
  }

  function handleSendEmail() {
    onSendEmail?.(consent.id)
    setEmailSent(true)
  }

  const statusMap = {
    'pendiente': { label: 'Pendiente de firma', cls: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/50' },
    'firmado-presencial': { label: 'Firmado presencialmente', cls: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-700/50' },
    'firmado-correo': { label: 'Firmado por correo', cls: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-700/50' },
    'rechazado': { label: 'Rechazado', cls: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700/50' },
  }

  const { label: statusLabel, cls: statusCls } = statusMap[consent.status]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
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
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Consentimiento Informado</h1>
            <p className="text-xs font-mono text-slate-400 dark:text-slate-500">{consent.patientName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${statusCls}`}>
              {statusLabel}
            </span>
            {isSigned && (
              <button
                onClick={() => onPrint?.(consent.id)}
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

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-sky-700 dark:bg-sky-800 px-5 py-4">
            <p className="text-xs font-medium text-sky-200 uppercase tracking-widest">Consentimiento Informado</p>
            <p className="text-lg font-bold text-white mt-0.5">{consent.procedure}</p>
            <p className="text-sm text-sky-200 mt-0.5">Médico: {consent.authorName}</p>
          </div>

          <div className="px-5 py-3 bg-sky-50 dark:bg-sky-900/20 border-b border-sky-100 dark:border-sky-800/50">
            <p className="text-xs text-sky-700 dark:text-sky-400 font-medium uppercase tracking-wide">Paciente</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{consent.patientName}</p>
          </div>

          <div className="px-5 py-4">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{consent.consentText}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Firma del paciente</h2>
          </div>

          <div className="px-5 py-4">
            {isSigned ? (
              <div className="space-y-3">
                <div className="rounded-xl border-2 border-dashed border-sky-200 dark:border-sky-700/50 bg-sky-50 dark:bg-sky-900/10 h-24 flex items-center justify-center">
                  <span className="text-xs text-sky-500 dark:text-sky-400 italic">Firma del paciente registrada ✓</span>
                </div>
                {consent.signedAt && (
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 px-4 py-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium">
                        Método de firma
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        consent.signatureMethod === 'presencial'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400'
                          : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400'
                      }`}>
                        {consent.signatureMethod === 'presencial' ? 'Presencial' : 'Correo electrónico'}
                      </span>
                    </div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium mt-2">Firmado el</p>
                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                      {formatDateTime(consent.signedAt)}
                    </p>
                  </div>
                )}
              </div>
            ) : isRejected ? (
              <div className="rounded-xl border border-rose-200 dark:border-rose-700/50 bg-rose-50 dark:bg-rose-900/10 px-5 py-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-rose-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
                </svg>
                <p className="text-sm text-rose-700 dark:text-rose-400">El paciente ha rechazado este consentimiento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emailSent && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50">
                    <svg className="w-4 h-4 text-sky-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.44a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15.92z" />
                    </svg>
                    <p className="text-xs text-sky-700 dark:text-sky-400">
                      Enlace de firma enviado por correo.
                      {consent.emailSentAt && (
                        <span className="text-sky-500 ml-1">
                          ({new Date(consent.emailSentAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {!signMode ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Selecciona el método de firma:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSignMode('presencial')}
                        className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all group"
                      >
                        <svg className="w-6 h-6 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <path d="M8 21h8M12 17v4" />
                        </svg>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors text-center">
                          Firma presencial
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center">Canvas en pantalla táctil</span>
                      </button>
                      <button
                        onClick={handleSendEmail}
                        className="flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all group"
                      >
                        <svg className="w-6 h-6 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors text-center">
                          Enviar por correo
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center">Enlace al dispositivo del paciente</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">El paciente firma en pantalla:</p>
                      <button
                        onClick={() => { setSignMode(null); clearCanvas() }}
                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        ← Cambiar método
                      </button>
                    </div>
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
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic">Firma del paciente aquí</p>
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
                        onClick={handleSignPresential}
                        disabled={!hasStrokes}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white transition-colors shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Confirmar firma del paciente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

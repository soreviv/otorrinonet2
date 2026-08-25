'use client'

import { useState } from 'react'
import { Download, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function DgisPage() {
  const now = new Date()
  const defaultMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [mes, setMes] = useState(defaultMes)
  const [estado, setEstado] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [mensaje, setMensaje] = useState('')
  const [filas, setFilas] = useState<number | null>(null)

  async function handleDescargar() {
    setEstado('loading')
    setMensaje('')
    setFilas(null)
    try {
      const res = await fetch(`/api/dgis/exportar-cex?mes=${mes}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? `Error ${res.status}`)
      }
      const text = await res.text()
      const lineas = text.trim() ? text.trim().split('\r\n').length : 0
      setFilas(lineas)

      // Disparar descarga
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const cd = res.headers.get('Content-Disposition') ?? ''
      const match = cd.match(/filename="([^"]+)"/)
      a.download = match?.[1] ?? `SINCLUES_${mes.replace('-', '_')}_CEX.txt`
      a.href = url
      a.click()
      URL.revokeObjectURL(url)

      setEstado('ok')
      setMensaje(`Archivo generado con ${lineas} ${lineas === 1 ? 'consulta' : 'consultas'}.`)
    } catch (e) {
      setEstado('error')
      setMensaje(e instanceof Error ? e.message : 'Error desconocido')
    }
  }

  const [anio, mesNum] = mes.split('-').map(Number)
  const nombreMes = new Date(anio, mesNum - 1, 1).toLocaleString('es-MX', { month: 'long', year: 'numeric' })

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-xl font-semibold">Exportación DGIS — GIIS-B015</h1>
          <p className="text-sm text-gray-500">Archivo de intercambio Consulta Externa (NOM-024-SSA3-2012)</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mes a exportar
          </label>
          <input
            type="month"
            value={mes}
            onChange={e => { setMes(e.target.value); setEstado('idle'); setMensaje('') }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {mes && (
            <p className="text-xs text-gray-500 mt-1 capitalize">{nombreMes}</p>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800 space-y-1">
          <p className="font-medium">Requisitos del archivo</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>Solo se incluyen notas de evolución <strong>firmadas</strong></li>
            <li>Cada nota debe tener al menos un diagnóstico CIE-10</li>
            <li>El CLUES del consultorio debe estar configurado en Ajustes</li>
          </ul>
        </div>

        <button
          onClick={handleDescargar}
          disabled={estado === 'loading' || !mes}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {estado === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {estado === 'loading' ? 'Generando...' : 'Descargar archivo CEX'}
        </button>

        {estado === 'ok' && (
          <div className="flex items-start gap-2 text-green-700 bg-green-50 border border-green-200 rounded-md p-3 text-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{mensaje}</span>
          </div>
        )}

        {estado === 'error' && (
          <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-md p-3 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{mensaje}</span>
          </div>
        )}
      </div>

      {filas !== null && filas === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          No hay notas firmadas en {nombreMes}. El archivo estará vacío.
        </p>
      )}

      <div className="mt-6 text-xs text-gray-400 space-y-1">
        <p>El archivo generado debe enviarse mensualmente a la DGIS a través del mecanismo de entrega oficial.</p>
        <p>Contacto técnico DGIS: angel.serrano@salud.gob.mx · +52 55 6392 2300 ext. 52584</p>
      </div>
    </div>
  )
}

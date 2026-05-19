'use client'

import { useRef, useState } from 'react'
import { Upload, Download, CheckCircle2, XCircle, Loader2, FileSpreadsheet } from 'lucide-react'
import { importarProductos, type FilaImportacion, type ResultadoFila } from '@/app/actions/tienda-admin'
import { ProductCategory, DeliveryMode } from '@/generated/prisma'

type FilaPrevia = FilaImportacion & { _errores: string[]; _linea: number }

const CATEGORIA_MAP: Record<string, ProductCategory> = {
  dispositivo_medico: ProductCategory.dispositivo_medico,
  suplemento_otc: ProductCategory.suplemento_otc,
  paquete_consulta: ProductCategory.paquete_consulta,
  vacuna: ProductCategory.vacuna,
  otro: ProductCategory.otro,
}

const ENTREGA_MAP: Record<string, DeliveryMode> = {
  ambos: DeliveryMode.both,
  solo_envio: DeliveryMode.shipping_only,
  solo_recoger: DeliveryMode.pickup_only,
}

function slugificar(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function parsearCSV(texto: string): string[][] {
  const filas: string[][] = []
  const lineas = texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  for (const linea of lineas) {
    if (!linea.trim()) continue
    const campos: string[] = []
    let i = 0
    while (i < linea.length) {
      if (linea[i] === '"') {
        let campo = ''
        i++
        while (i < linea.length) {
          if (linea[i] === '"' && linea[i + 1] === '"') { campo += '"'; i += 2 }
          else if (linea[i] === '"') { i++; break }
          else { campo += linea[i]; i++ }
        }
        campos.push(campo)
        if (linea[i] === ',') i++
      } else {
        const fin = linea.indexOf(',', i)
        if (fin === -1) { campos.push(linea.slice(i).trim()); i = linea.length }
        else { campos.push(linea.slice(i, fin).trim()); i = fin + 1 }
      }
    }
    filas.push(campos)
  }
  return filas
}

function validarFila(campos: string[], linea: number): FilaPrevia {
  const [
    nombre = '', slug = '', descripcion = '', categoria = '',
    modoEntrega = '', precioPesos = '', stock = '', stockIlimitado = '',
    activo = '', imagenUrl = '', claveSat = '', claveUnidadSat = '',
    metaTitle = '', metaDesc = '',
  ] = campos

  const errores: string[] = []

  if (!nombre.trim()) errores.push('nombre requerido')

  const catVal = CATEGORIA_MAP[categoria.trim()]
  if (!catVal) errores.push(`categoría inválida: "${categoria}"`)

  const entregaVal = ENTREGA_MAP[modoEntrega.trim()]
  if (!entregaVal) errores.push(`modo_entrega inválido: "${modoEntrega}"`)

  const precio = parseFloat(precioPesos)
  if (isNaN(precio) || precio < 0) errores.push('precio_pesos inválido')

  const stockNum = parseInt(stock)
  if (isNaN(stockNum) || stockNum < 0) errores.push('stock inválido')

  const ilimitado = stockIlimitado.trim().toLowerCase() === 'si'
  const actBool = activo.trim().toLowerCase() !== 'no'
  const slugFinal = slug.trim() || slugificar(nombre.trim())
  const imagenes = imagenUrl.trim() ? [imagenUrl.trim()] : []

  return {
    nombre: nombre.trim(),
    slug: slugFinal,
    descripcion: descripcion.trim() || undefined,
    categoria: catVal ?? ProductCategory.otro,
    modoEntrega: entregaVal ?? DeliveryMode.both,
    precioUnitario: isNaN(precio) ? 0 : Math.round(precio * 100),
    stock: isNaN(stockNum) ? 0 : stockNum,
    stockIlimitado: ilimitado,
    activo: actBool,
    imagenes,
    claveSat: claveSat.trim() || undefined,
    claveUnidadSat: claveUnidadSat.trim() || undefined,
    metaTitle: metaTitle.trim() || undefined,
    metaDesc: metaDesc.trim() || undefined,
    _errores: errores,
    _linea: linea,
  }
}

export function ImportarProductos() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [filas, setFilas] = useState<FilaPrevia[]>([])
  const [resultados, setResultados] = useState<ResultadoFila[] | null>(null)
  const [cargando, setCargando] = useState(false)
  const [abierto, setAbierto] = useState(false)

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    const lector = new FileReader()
    lector.onload = (ev) => {
      const texto = ev.target?.result as string
      const todas = parsearCSV(texto)
      // saltar fila de encabezados
      const datos = todas.slice(1).filter(f => f.some(c => c.trim()))
      setFilas(datos.map((campos, i) => validarFila(campos, i + 2)))
      setResultados(null)
    }
    lector.readAsText(archivo, 'utf-8')
    e.target.value = ''
  }

  const filasValidas = filas.filter(f => f._errores.length === 0)
  const filasConError = filas.filter(f => f._errores.length > 0)

  const confirmar = async () => {
    if (filasValidas.length === 0) return
    setCargando(true)
    const res = await importarProductos(filasValidas)
    setResultados(res)
    setCargando(false)
  }

  const limpiar = () => {
    setFilas([])
    setResultados(null)
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Importar CSV
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-sky-600" />
          Importar productos desde CSV
        </h2>
        <button
          onClick={() => { limpiar(); setAbierto(false) }}
          className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          Cerrar
        </button>
      </div>

      {/* Acciones: descargar plantilla + subir archivo */}
      {!resultados && (
        <div className="flex flex-wrap gap-3">
          <a
            href="/api/tienda/plantilla-productos"
            download
            className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar plantilla
          </a>
          <button
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            {filas.length > 0 ? 'Cambiar archivo' : 'Seleccionar CSV'}
          </button>
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleArchivo} />
        </div>
      )}

      {/* Vista previa */}
      {filas.length > 0 && !resultados && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-emerald-600 font-medium">{filasValidas.length} válidas</span>
            {filasConError.length > 0 && (
              <span className="text-rose-600 font-medium">{filasConError.length} con errores</span>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Categoría</th>
                  <th className="px-3 py-2 text-left">Precio</th>
                  <th className="px-3 py-2 text-left">Stock</th>
                  <th className="px-3 py-2 text-left">Clave SAT</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filas.map((fila) => (
                  <tr
                    key={fila._linea}
                    className={fila._errores.length > 0 ? 'bg-rose-50 dark:bg-rose-900/10' : ''}
                  >
                    <td className="px-3 py-2 text-slate-400">{fila._linea}</td>
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200 max-w-[180px] truncate">{fila.nombre || '—'}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{fila.categoria}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                      {fila.precioUnitario > 0 ? `$${(fila.precioUnitario / 100).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                      {fila.stockIlimitado ? '∞' : fila.stock}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono">{fila.claveSat || '—'}</td>
                    <td className="px-3 py-2">
                      {fila._errores.length > 0 ? (
                        <span className="text-rose-600 text-[10px]">{fila._errores.join(', ')}</span>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filasValidas.length > 0 && (
            <button
              onClick={confirmar}
              disabled={cargando}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
            >
              {cargando
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</>
                : <>Importar {filasValidas.length} producto{filasValidas.length !== 1 ? 's' : ''}</>
              }
            </button>
          )}
        </div>
      )}

      {/* Resultados */}
      {resultados && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-emerald-600 font-medium">
              {resultados.filter(r => r.ok).length} importados correctamente
            </span>
            {resultados.filter(r => !r.ok).length > 0 && (
              <span className="text-rose-600 font-medium">
                {resultados.filter(r => !r.ok).length} fallidos
              </span>
            )}
          </div>
          <ul className="space-y-1.5">
            {resultados.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                {r.ok
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                }
                <span className={r.ok ? 'text-slate-700 dark:text-slate-300' : 'text-rose-600'}>
                  {r.nombre}
                  {!r.ok && <span className="ml-1 text-xs">— {r.error}</span>}
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => { limpiar(); setAbierto(false) }}
            className="text-sm font-medium text-sky-600 hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  )
}

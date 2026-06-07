/**
 * GIIS-B015 — Generador de archivo de intercambio Consulta Externa
 * NOM-024-SSA3-2012 / DGIS v4.11 (noviembre 2024)
 *
 * Formato: pipe-delimited (|), 38 campos por fila, CRLF, UTF-8.
 * Nomenclatura: {CLUES}_{YYYY}_{MM}_CEX.txt
 */

/** Normaliza un nombre para GIIS: mayúsculas, sin acentos, solo A-Z Ñ y -, , . / ' */
export function normName(s: string | null | undefined, maxLen = 50): string {
  if (!s) return ''
  return s
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quitar diacríticos excepto Ñ
    .replace(/Ñ/g, '\x00') // proteger Ñ
    .replace(/[^A-Z0-9\x00\-,.\/' ]/g, '')
    .replace(/\x00/g, 'Ñ')
    .trim()
    .slice(0, maxLen)
}

export interface GiisRow {
  // Datos del establecimiento y prestador
  clues: string
  paisNacPrestador: number
  curpPrestador: string
  nombrePrestador: string
  primerApellidoPrestador: string
  segundoApellidoPrestador: string
  tipoPersonal: number
  programaSMyMG: number
  // Fecha
  anio: number
  mes: number
  // Datos del paciente
  curpPaciente: string
  nombrePaciente: string
  primerApellidoPaciente: string
  segundoApellidoPaciente: string
  fechaNacPaciente: string // YYYY-MM-DD
  sexoCurp: number
  paisNacPaciente: number
  entidadNacPaciente: string
  afiliacion: string
  sexoBiologico: number
  genero: number
  seConsideraIndigena: number
  seAutodenominaAfromexicano: number
  migrante: number
  paisProcedenciaPaciente: number
  // Datos de la consulta
  servicioAtencion: number
  peso: number       // ###.### (999 = desconocido)
  talla: number      // entero cm (999 = desconocido)
  circunferenciaCintura: number
  presionSistolica: number
  presionDiastolica: number
  frecuenciaCardiaca: number
  frecuenciaRespiratoria: number
  temperatura: number // ##.# (0 = desconocido)
  saturacionOxigeno: number
  glucemia: number
  // Diagnósticos CIE-10
  diagnostico1: string
  diagnostico2: string
  diagnostico3: string
  // Indicadores
  sintomaticoRespTb: number
  primeraVezAnio: number
  primeraVezUneme: number
}

/** Serializa una fila a la línea pipe-delimitada del GIIS-B015 (sin salto de línea) */
export function serializeRow(r: GiisRow): string {
  const peso = r.peso === 999 ? '999' : r.peso.toFixed(3)
  const temp = r.temperatura === 0 ? '0' : r.temperatura.toFixed(1)
  return [
    r.clues,
    r.paisNacPrestador,
    r.curpPrestador,
    r.nombrePrestador,
    r.primerApellidoPrestador,
    r.segundoApellidoPrestador,
    r.tipoPersonal,
    r.programaSMyMG,
    r.anio,
    r.mes,
    r.curpPaciente,
    r.nombrePaciente,
    r.primerApellidoPaciente,
    r.segundoApellidoPaciente,
    r.fechaNacPaciente,
    r.sexoCurp,
    r.paisNacPaciente,
    r.entidadNacPaciente,
    r.afiliacion,
    r.sexoBiologico,
    r.genero,
    r.seConsideraIndigena,
    r.seAutodenominaAfromexicano,
    r.migrante,
    r.paisProcedenciaPaciente,
    r.servicioAtencion,
    peso,
    r.talla,
    r.circunferenciaCintura,
    r.presionSistolica,
    r.presionDiastolica,
    r.frecuenciaCardiaca,
    r.frecuenciaRespiratoria,
    temp,
    r.saturacionOxigeno,
    r.glucemia,
    r.diagnostico1,
    r.diagnostico2,
    r.diagnostico3,
    r.sintomaticoRespTb,
    r.primeraVezAnio,
    r.primeraVezUneme,
  ].join('|')
}

/** Genera el contenido completo del archivo (CRLF entre filas) */
export function buildGiisFile(rows: GiisRow[]): string {
  return rows.map(serializeRow).join('\r\n')
}

/** Nombre canónico del archivo: {CLUES}_{YYYY}_{MM}_CEX.txt */
export function giisFilename(clues: string, anio: number, mes: number): string {
  const cluesSafe = clues || 'SINCLUES'
  const mm = String(mes).padStart(2, '0')
  return `${cluesSafe}_${anio}_${mm}_CEX.txt`
}

// ── Tipos de datos para la consulta a BD ────────────────────────────────────

export interface NoteForGiis {
  id: string
  fecha: Date
  patientId: string
  servicioAtencion: number | null
  sintomaticoRespTb: number | null
  primeraVezAnio: number | null
  primeraVezUneme: number | null
  diagnoses: { codigo: string }[]
  vitals: {
    peso: number | null
    talla: number | null
    circunferenciaCintura: number | null
    presionSistolica: number | null
    presionDiastolica: number | null
    frecuenciaCardiaca: number | null
    frecuenciaRespiratoria: number | null
    temperatura: number | null
    saturacionOxigeno: number | null
    glucosa: number | null
  } | null
  patient: {
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string | null
    fechaNacimiento: Date | null
    curp: string | null
    paisNacimiento: number | null
    entidadNacimiento: string | null
    sexoCurp: number | null
    sexoBiologico: number | null
    genero: number | null
    derechohabiencia: string | null
    seConsideraIndigena: number | null
    seAutodenominaAfromexicano: number | null
    migrante: number | null
    paisProcedencia: number | null
  }
}

export interface ClinicDataForGiis {
  clues: string
  curpPrestador: string
  doctorName: string
  servicioAtencionCex: number | null
}

/** Convierte una nota + datos de clínica a una GiisRow lista para serializar */
export function noteToGiisRow(note: NoteForGiis, clinic: ClinicDataForGiis): GiisRow {
  const p = note.patient
  const v = note.vitals

  // Descomponer nombre del doctor (formato: "Dr. Nombre Apellido1 Apellido2")
  const doctorParts = clinic.doctorName
    .replace(/^Dr\.?\s*/i, '')
    .trim()
    .split(/\s+/)
  const nombrePrestador = normName(doctorParts[0] ?? '')
  const apellido1Prestador = normName(doctorParts[1] ?? '')
  const apellido2Prestador = normName(doctorParts[2] ?? '')

  const anio = note.fecha.getFullYear()
  const mes = note.fecha.getMonth() + 1

  const fechaNac = p.fechaNacimiento
    ? p.fechaNacimiento.toISOString().slice(0, 10)
    : '1900-01-01'

  // Diagnósticos (máx 3)
  const diags = note.diagnoses.map(d => d.codigo)
  const dx1 = diags[0] ?? 'R69X'
  const dx2 = diags[1] ?? ''
  const dx3 = diags[2] ?? ''

  return {
    clues: clinic.clues || 'SINCLUES',
    paisNacPrestador: 142,
    curpPrestador: clinic.curpPrestador || 'XXXX999999XXXXXX99',
    nombrePrestador,
    primerApellidoPrestador: apellido1Prestador,
    segundoApellidoPrestador: apellido2Prestador,
    tipoPersonal: 4,
    programaSMyMG: 0,
    anio,
    mes,
    curpPaciente: p.curp || 'XXXX999999XXXXXX99',
    nombrePaciente: normName(p.nombre),
    primerApellidoPaciente: normName(p.apellidoPaterno),
    segundoApellidoPaciente: normName(p.apellidoMaterno),
    fechaNacPaciente: fechaNac,
    sexoCurp: p.sexoCurp ?? 99,
    paisNacPaciente: p.paisNacimiento ?? 142,
    entidadNacPaciente: p.entidadNacimiento ?? '99',
    afiliacion: p.derechohabiencia ?? '0',
    sexoBiologico: p.sexoBiologico ?? 0,
    genero: p.genero ?? 0,
    seConsideraIndigena: p.seConsideraIndigena ?? -1,
    seAutodenominaAfromexicano: p.seAutodenominaAfromexicano ?? -1,
    migrante: p.migrante ?? -1,
    paisProcedenciaPaciente: p.paisProcedencia ?? 999,
    servicioAtencion: note.servicioAtencion ?? clinic.servicioAtencionCex ?? 0,
    peso: v?.peso ?? 999,
    talla: v?.talla ? Math.round(v.talla) : 999,
    circunferenciaCintura: v?.circunferenciaCintura ?? 0,
    presionSistolica: v?.presionSistolica ?? 0,
    presionDiastolica: v?.presionDiastolica ?? 0,
    frecuenciaCardiaca: v?.frecuenciaCardiaca ?? 0,
    frecuenciaRespiratoria: v?.frecuenciaRespiratoria ?? 0,
    temperatura: v?.temperatura ?? 0,
    saturacionOxigeno: v?.saturacionOxigeno ?? 0,
    glucemia: v?.glucosa ?? 0,
    diagnostico1: dx1,
    diagnostico2: dx2,
    diagnostico3: dx3,
    sintomaticoRespTb: note.sintomaticoRespTb ?? -1,
    primeraVezAnio: note.primeraVezAnio ?? 0,
    primeraVezUneme: note.primeraVezUneme ?? -1,
  }
}

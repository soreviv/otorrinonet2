/**
 * Utilidades para normalización de nombres hispanos y gestión de expedientes clínicos.
 */

export interface ParsedName {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string | null
}

const PREPOSITIONS = new Set(['de', 'del', 'la', 'las', 'los', 'san', 'santa'])

/**
 * Agrupa tokens que forman parte de partículas compuestas como "de la", "del", "de los", "san".
 */
function groupParticles(tokens: string[]): string[] {
  const result: string[] = []
  let i = 0

  while (i < tokens.length) {
    const current = tokens[i].toLowerCase()
    if (PREPOSITIONS.has(current) && i + 1 < tokens.length) {
      let particle = tokens[i]
      i++
      while (i < tokens.length && PREPOSITIONS.has(tokens[i].toLowerCase())) {
        particle += ' ' + tokens[i]
        i++
      }
      if (i < tokens.length) {
        particle += ' ' + tokens[i]
        i++
      }
      result.push(particle)
    } else {
      result.push(tokens[i])
      i++
    }
  }

  return result
}

/**
 * Parsea un nombre completo en la convención hispana:
 * [Nombre(s)] [Apellido Paterno] [Apellido Materno (opcional)]
 */
export function parseHispanicFullName(fullName: string): ParsedName {
  if (!fullName) {
    return { nombre: '', apellidoPaterno: '', apellidoMaterno: null }
  }

  const rawTokens = fullName.trim().split(/\s+/).filter(Boolean)
  if (rawTokens.length === 0) {
    return { nombre: '', apellidoPaterno: '', apellidoMaterno: null }
  }

  if (rawTokens.length === 1) {
    return {
      nombre: rawTokens[0],
      apellidoPaterno: rawTokens[0],
      apellidoMaterno: null,
    }
  }

  if (rawTokens.length === 2) {
    return {
      nombre: rawTokens[0],
      apellidoPaterno: rawTokens[1],
      apellidoMaterno: null,
    }
  }

  // Agrupar partículas ("de la", "del", etc.)
  const grouped = groupParticles(rawTokens)

  if (grouped.length === 1) {
    return { nombre: grouped[0], apellidoPaterno: grouped[0], apellidoMaterno: null }
  }
  if (grouped.length === 2) {
    return { nombre: grouped[0], apellidoPaterno: grouped[1], apellidoMaterno: null }
  }
  if (grouped.length === 3) {
    return {
      nombre: grouped[0],
      apellidoPaterno: grouped[1],
      apellidoMaterno: grouped[2],
    }
  }

  // 4 o más partes agrupadas:
  // Primeras partes corresponden al nombre propio compuesto, penúltima al apellido paterno, última al materno.
  const apellidoMaterno = grouped[grouped.length - 1]
  const apellidoPaterno = grouped[grouped.length - 2]
  const nombre = grouped.slice(0, grouped.length - 2).join(' ')

  return {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
  }
}

/**
 * Formatea un número de expediente clínico con el estándar del consultorio: VIV-YYYY-XXXX.
 */
export function formatExpedienteNumber(year: number, sequence: number): string {
  const safeSeq = Math.max(1, Math.floor(sequence))
  return `VIV-${year}-${String(safeSeq).padStart(4, '0')}`
}

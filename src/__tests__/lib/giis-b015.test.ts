import { describe, it, expect } from 'vitest'
import {
  normName,
  serializeRow,
  buildGiisFile,
  giisFilename,
  noteToGiisRow,
  type GiisRow,
  type NoteForGiis,
  type ClinicDataForGiis,
} from '@/lib/giis-b015'

// ── normName ────────────────────────────────────────────────────────────────

describe('normName', () => {
  it('convierte a mayúsculas', () => {
    expect(normName('alejandro')).toBe('ALEJANDRO')
  })

  it('elimina acentos', () => {
    expect(normName('Héctor')).toBe('HECTOR')
    expect(normName('María')).toBe('MARIA')
    expect(normName('José')).toBe('JOSE')
  })

  it('conserva la Ñ', () => {
    expect(normName('Domínguez')).toBe('DOMINGUEZ')
    expect(normName('Muñoz')).toBe('MUNOZ')
    expect(normName('España')).toBe('ESPANA')
  })

  it('respeta el máximo de caracteres', () => {
    const largo = 'A'.repeat(60)
    expect(normName(largo, 50)).toHaveLength(50)
  })

  it('devuelve cadena vacía para null/undefined', () => {
    expect(normName(null)).toBe('')
    expect(normName(undefined)).toBe('')
    expect(normName('')).toBe('')
  })
})

// ── giisFilename ─────────────────────────────────────────────────────────────

describe('giisFilename', () => {
  it('genera el nombre correcto con ceros en el mes', () => {
    expect(giisFilename('DOCMX001', 2025, 3)).toBe('DOCMX001_2025_03_CEX.txt')
  })

  it('usa SINCLUES cuando el CLUES está vacío', () => {
    expect(giisFilename('', 2025, 12)).toBe('SINCLUES_2025_12_CEX.txt')
  })

  it('mes de dos dígitos', () => {
    expect(giisFilename('ABC', 2025, 11)).toBe('ABC_2025_11_CEX.txt')
  })
})

// ── serializeRow ─────────────────────────────────────────────────────────────

const rowBase: GiisRow = {
  clues: 'DOCMX001',
  paisNacPrestador: 142,
  curpPrestador: 'VIDA800101HDFVRN09',
  nombrePrestador: 'ALEJANDRO',
  primerApellidoPrestador: 'VIVEROS',
  segundoApellidoPrestador: 'DOMINGUEZ',
  tipoPersonal: 4,
  programaSMyMG: 0,
  anio: 2025,
  mes: 3,
  curpPaciente: 'GOLA900215MDFPZL07',
  nombrePaciente: 'LAURA',
  primerApellidoPaciente: 'LOPEZ',
  segundoApellidoPaciente: 'GARCIA',
  fechaNacPaciente: '1990-02-15',
  sexoCurp: 2,
  paisNacPaciente: 142,
  entidadNacPaciente: '09',
  afiliacion: '2',
  sexoBiologico: 2,
  genero: 2,
  seConsideraIndigena: 0,
  seAutodenominaAfromexicano: 0,
  migrante: 0,
  paisProcedenciaPaciente: 999,
  servicioAtencion: 16,
  peso: 65.5,
  talla: 162,
  circunferenciaCintura: 80,
  presionSistolica: 120,
  presionDiastolica: 80,
  frecuenciaCardiaca: 72,
  frecuenciaRespiratoria: 16,
  temperatura: 36.5,
  saturacionOxigeno: 98,
  glucemia: 90,
  diagnostico1: 'J349',
  diagnostico2: '',
  diagnostico3: '',
  sintomaticoRespTb: -1,
  primeraVezAnio: 1,
  primeraVezUneme: -1,
}

describe('serializeRow', () => {
  it('genera exactamente 42 campos separados por |', () => {
    const line = serializeRow(rowBase)
    expect(line.split('|')).toHaveLength(42)
  })

  it('el primer campo es el CLUES', () => {
    const line = serializeRow(rowBase)
    expect(line.split('|')[0]).toBe('DOCMX001')
  })

  it('peso con 3 decimales', () => {
    const line = serializeRow(rowBase)
    const campos = line.split('|')
    expect(campos[26]).toBe('65.500')
  })

  it('peso 999 queda como "999" (sin decimales)', () => {
    const r = { ...rowBase, peso: 999 }
    const campos = serializeRow(r).split('|')
    expect(campos[26]).toBe('999')
  })

  it('temperatura con 1 decimal', () => {
    const campos = serializeRow(rowBase).split('|')
    expect(campos[33]).toBe('36.5')
  })

  it('temperatura 0 queda como "0"', () => {
    const r = { ...rowBase, temperatura: 0 }
    const campos = serializeRow(r).split('|')
    expect(campos[33]).toBe('0')
  })

  it('diagnóstico 1 en posición correcta', () => {
    const campos = serializeRow(rowBase).split('|')
    expect(campos[36]).toBe('J349')
  })
})

// ── buildGiisFile ─────────────────────────────────────────────────────────────

describe('buildGiisFile', () => {
  it('separa filas con CRLF', () => {
    const file = buildGiisFile([rowBase, rowBase])
    expect(file).toContain('\r\n')
    const lines = file.split('\r\n')
    expect(lines).toHaveLength(2)
  })

  it('archivo vacío devuelve cadena vacía', () => {
    expect(buildGiisFile([])).toBe('')
  })

  it('una sola fila no termina en CRLF', () => {
    const file = buildGiisFile([rowBase])
    expect(file.endsWith('\r\n')).toBe(false)
  })
})

// ── noteToGiisRow ─────────────────────────────────────────────────────────────

const clinicBase: ClinicDataForGiis = {
  clues: 'DOCMX001',
  curpPrestador: 'VIDA800101HDFVRN09',
  doctorName: 'Dr. Alejandro Viveros Domínguez',
  servicioAtencionCex: 16,
}

const noteBase: NoteForGiis = {
  id: 'note1',
  fecha: new Date('2025-03-15T10:00:00Z'),
  patientId: 'pat1',
  servicioAtencion: null,
  sintomaticoRespTb: -1,
  primeraVezAnio: 1,
  primeraVezUneme: -1,
  diagnoses: [{ codigo: 'J349' }, { codigo: 'H902' }],
  vitals: {
    peso: 70,
    talla: 170,
    circunferenciaCintura: 85,
    presionSistolica: 118,
    presionDiastolica: 76,
    frecuenciaCardiaca: 68,
    frecuenciaRespiratoria: 14,
    temperatura: 36.6,
    saturacionOxigeno: 99,
    glucosa: 95,
  },
  patient: {
    nombre: 'Laura',
    apellidoPaterno: 'López',
    apellidoMaterno: 'García',
    fechaNacimiento: new Date('1990-02-15'),
    curp: 'GOLA900215MDFPZL07',
    paisNacimiento: 142,
    entidadNacimiento: '09',
    sexoCurp: 2,
    sexoBiologico: 2,
    genero: 2,
    derechohabiencia: '2',
    seConsideraIndigena: 0,
    seAutodenominaAfromexicano: 0,
    migrante: 0,
    paisProcedencia: null,
  },
}

describe('noteToGiisRow', () => {
  it('normaliza el nombre del paciente (sin acento)', () => {
    const row = noteToGiisRow(noteBase, clinicBase)
    expect(row.nombrePaciente).toBe('LAURA')
    expect(row.primerApellidoPaciente).toBe('LOPEZ')
    expect(row.segundoApellidoPaciente).toBe('GARCIA')
  })

  it('descompone el nombre del doctor correctamente', () => {
    const row = noteToGiisRow(noteBase, clinicBase)
    expect(row.nombrePrestador).toBe('ALEJANDRO')
    expect(row.primerApellidoPrestador).toBe('VIVEROS')
    expect(row.segundoApellidoPrestador).toBe('DOMINGUEZ')
  })

  it('usa servicioAtencion de la clínica cuando la nota no lo especifica', () => {
    const row = noteToGiisRow(noteBase, clinicBase)
    expect(row.servicioAtencion).toBe(16)
  })

  it('usa servicioAtencion de la nota cuando está especificado', () => {
    const row = noteToGiisRow({ ...noteBase, servicioAtencion: 22 }, clinicBase)
    expect(row.servicioAtencion).toBe(22)
  })

  it('mapea glucosa→glucemia', () => {
    const row = noteToGiisRow(noteBase, clinicBase)
    expect(row.glucemia).toBe(95)
  })

  it('usa 999 de peso cuando no hay vitales', () => {
    const row = noteToGiisRow({ ...noteBase, vitals: null }, clinicBase)
    expect(row.peso).toBe(999)
    expect(row.talla).toBe(999)
  })

  it('usa R69X cuando no hay diagnósticos', () => {
    const row = noteToGiisRow({ ...noteBase, diagnoses: [] }, clinicBase)
    expect(row.diagnostico1).toBe('R69X')
  })

  it('asigna hasta 3 diagnósticos en orden', () => {
    const row = noteToGiisRow(noteBase, clinicBase)
    expect(row.diagnostico1).toBe('J349')
    expect(row.diagnostico2).toBe('H902')
    expect(row.diagnostico3).toBe('')
  })

  it('usa SINCLUES cuando el CLUES está vacío', () => {
    const row = noteToGiisRow(noteBase, { ...clinicBase, clues: '' })
    expect(row.clues).toBe('SINCLUES')
  })

  it('tipoPersonal siempre es 4 (Médico Especialista)', () => {
    const row = noteToGiisRow(noteBase, clinicBase)
    expect(row.tipoPersonal).toBe(4)
  })
})

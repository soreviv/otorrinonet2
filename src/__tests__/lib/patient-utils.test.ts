import { describe, it, expect } from 'vitest'
import { parseHispanicFullName, formatExpedienteNumber } from '@/lib/patient-utils'

describe('patient-utils: parseHispanicFullName', () => {
  it('maneja nombres de una sola palabra', () => {
    const result = parseHispanicFullName('Alejandro')
    expect(result).toEqual({
      nombre: 'Alejandro',
      apellidoPaterno: 'Alejandro',
      apellidoMaterno: null,
    })
  })

  it('maneja nombre y un solo apellido', () => {
    const result = parseHispanicFullName('Carlos Mendoza')
    expect(result).toEqual({
      nombre: 'Carlos',
      apellidoPaterno: 'Mendoza',
      apellidoMaterno: null,
    })
  })

  it('maneja nombre simple con dos apellidos tradicionales (3 palabras)', () => {
    const result = parseHispanicFullName('María González Reyes')
    expect(result).toEqual({
      nombre: 'María',
      apellidoPaterno: 'González',
      apellidoMaterno: 'Reyes',
    })
  })

  it('maneja nombres compuestos frecuentes de 2 nombres y 2 apellidos (4 palabras)', () => {
    const result = parseHispanicFullName('Juan Carlos Gómez Pérez')
    expect(result).toEqual({
      nombre: 'Juan Carlos',
      apellidoPaterno: 'Gómez',
      apellidoMaterno: 'Pérez',
    })
  })

  it('maneja partículas y preposiciones en apellidos ("de la", "del")', () => {
    const r1 = parseHispanicFullName('María de la Cruz Salinas')
    expect(r1.apellidoPaterno).toBe('de la Cruz')
    expect(r1.apellidoMaterno).toBe('Salinas')

    const r2 = parseHispanicFullName('Pedro del Ángel Martínez')
    expect(r2.apellidoPaterno).toBe('del Ángel')
    expect(r2.apellidoMaterno).toBe('Martínez')
  })

  it('limpia espacios redundantes al inicio, final e interiores', () => {
    const result = parseHispanicFullName('   Ana   Sofía   Torres   Villarreal   ')
    expect(result).toEqual({
      nombre: 'Ana Sofía',
      apellidoPaterno: 'Torres',
      apellidoMaterno: 'Villarreal',
    })
  })

  it('maneja entradas vacías o caracteres en blanco sin romperse', () => {
    const result = parseHispanicFullName('   ')
    expect(result).toEqual({
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: null,
    })
  })
})

describe('patient-utils: formatExpedienteNumber', () => {
  it('formatea correctamente el número con prefijo y padding de 4 dígitos', () => {
    expect(formatExpedienteNumber(2026, 1)).toBe('VIV-2026-0001')
    expect(formatExpedienteNumber(2026, 42)).toBe('VIV-2026-0042')
    expect(formatExpedienteNumber(2025, 9999)).toBe('VIV-2025-9999')
  })
})

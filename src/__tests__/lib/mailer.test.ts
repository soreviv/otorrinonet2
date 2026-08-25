import { describe, it, expect } from 'vitest'
import { esc } from '@/lib/mailer'

describe('mailer - función esc()', () => {
  it('debe escapar <script>', () => {
    expect(esc('<script>')).toBe('&lt;script&gt;')
  })

  it('debe escapar comillas dobles', () => {
    expect(esc('"comillas"')).toBe('&quot;comillas&quot;')
  })

  it('debe escapar comilla simple', () => {
    expect(esc("it's")).toBe('it&#39;s')
  })

  it('debe mantener texto normal sin cambios', () => {
    expect(esc('texto normal')).toBe('texto normal')
  })

  it('debe manejar strings vacíos, null o undefined sin error', () => {
    expect(esc('')).toBe('')
    expect(esc(null)).toBe('')
    expect(esc(undefined)).toBe('')
  })
})

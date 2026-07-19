import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, computeNoteSignatureHash } from '@/lib/crypto'

describe('crypto - encrypt() / decrypt()', () => {
  it('hace round-trip de un texto simple', () => {
    const plaintext = 'Paciente: Juan Pérez'
    const encrypted = encrypt(plaintext)
    expect(encrypted).not.toBe(plaintext)
    expect(decrypt(encrypted)).toBe(plaintext)
  })

  it('produce el formato iv:authTag:cipher (tres segmentos hex)', () => {
    const encrypted = encrypt('dato clínico')
    const parts = encrypted.split(':')
    expect(parts).toHaveLength(3)
    // iv = 16 bytes → 32 hex, authTag = 16 bytes → 32 hex
    expect(parts[0]).toMatch(/^[0-9a-f]{32}$/)
    expect(parts[1]).toMatch(/^[0-9a-f]{32}$/)
    expect(parts[2]).toMatch(/^[0-9a-f]+$/)
  })

  it('usa un IV aleatorio: dos cifrados del mismo texto difieren', () => {
    const a = encrypt('mismo texto')
    const b = encrypt('mismo texto')
    expect(a).not.toBe(b)
    // pero ambos descifran al mismo valor
    expect(decrypt(a)).toBe('mismo texto')
    expect(decrypt(b)).toBe('mismo texto')
  })

  it('preserva caracteres unicode y acentos', () => {
    const plaintext = 'Diagnóstico: otitis — niño, ñandú, 🩺'
    expect(decrypt(encrypt(plaintext))).toBe(plaintext)
  })

  it('devuelve el string vacío sin cifrar', () => {
    expect(encrypt('')).toBe('')
    expect(decrypt('')).toBe('')
  })

  it('trata como plaintext legado los valores sin ":"', () => {
    expect(decrypt('texto-plano-sin-cifrar')).toBe('texto-plano-sin-cifrar')
  })

  it('devuelve el dato original si el authTag fue manipulado', () => {
    const encrypted = encrypt('nota confidencial')
    const [iv, authTag, cipher] = encrypted.split(':')
    // invertir un carácter del authTag → GCM debe fallar la verificación
    const tamperedTag = authTag.slice(0, -1) + (authTag.at(-1) === '0' ? '1' : '0')
    const tampered = `${iv}:${tamperedTag}:${cipher}`
    expect(decrypt(tampered)).toBe(tampered)
  })

  it('devuelve el dato original si el ciphertext fue manipulado', () => {
    const encrypted = encrypt('nota confidencial')
    const [iv, authTag, cipher] = encrypted.split(':')
    const tamperedCipher = cipher.slice(0, -1) + (cipher.at(-1) === '0' ? '1' : '0')
    const tampered = `${iv}:${authTag}:${tamperedCipher}`
    expect(decrypt(tampered)).toBe(tampered)
  })
})

describe('crypto - computeNoteSignatureHash()', () => {
  it('devuelve un hash SHA-256 en hex (64 caracteres)', () => {
    const hash = computeNoteSignatureHash('note-1', 'user-1', '2026-07-19T00:00:00.000Z')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('es determinista con las mismas entradas', () => {
    const args: [string, string, string] = ['note-1', 'user-1', '2026-07-19T00:00:00.000Z']
    expect(computeNoteSignatureHash(...args)).toBe(computeNoteSignatureHash(...args))
  })

  it('cambia si cambia cualquier entrada', () => {
    const base = computeNoteSignatureHash('note-1', 'user-1', '2026-07-19T00:00:00.000Z')
    expect(computeNoteSignatureHash('note-2', 'user-1', '2026-07-19T00:00:00.000Z')).not.toBe(base)
    expect(computeNoteSignatureHash('note-1', 'user-2', '2026-07-19T00:00:00.000Z')).not.toBe(base)
    expect(computeNoteSignatureHash('note-1', 'user-1', '2026-07-19T00:00:00.001Z')).not.toBe(base)
  })
})

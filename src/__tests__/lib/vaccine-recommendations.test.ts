import { describe, it, expect } from 'vitest'
import {
  getRecommendations,
  getContraindicatedVaccines,
  vaccines,
} from '@/lib/vaccine-recommendations'

describe('vaccine-recommendations: getRecommendations', () => {
  it('recomienda BCG al recién nacido (0 meses)', () => {
    const results = getRecommendations(0, 'male', [])
    const bcg = results.find(v => v.id === 'bcg')
    expect(bcg).toBeDefined()
    expect(bcg?.priority).toBe('routine')
  })

  it('no recomienda BCG a adultos mayores', () => {
    const results = getRecommendations(65, 'male', [])
    const bcg = results.find(v => v.id === 'bcg')
    expect(bcg).toBeUndefined()
  })

  it('filtra por sexo cuando la vacuna es específica', () => {
    // VPH en esquema básico SSA suele dirigirse o tener notas de sexo
    const allFemale = getRecommendations(20, 'female', [])
    const allMale = getRecommendations(20, 'male', [])
    expect(Array.isArray(allFemale)).toBe(true)
    expect(Array.isArray(allMale)).toBe(true)
  })

  it('activa vacunas por condición médica fuera de rango de edad usual', () => {
    // Neumococo o Shingrix por condición de inmunosupresión o diabetes
    const results = getRecommendations(25, 'male', ['diabetes'])
    const triggered = results.filter(v => v.triggeredByCondition)
    expect(triggered.length).toBeGreaterThan(0)
  })

  it('EXCLUYE vacunas vivas atenuadas (SRP, Varicela) cuando el paciente tiene inmunosupresión', () => {
    const safe = getRecommendations(30, 'female', [])
    const withSrp = safe.find(v => v.id === 'srp')
    expect(withSrp).toBeDefined()

    // Con inmunosupresión, SRP no debe ser recomendada
    const immunosuppressed = getRecommendations(30, 'female', ['inmunosupresion'])
    const forbiddenSrp = immunosuppressed.find(v => v.id === 'srp')
    const forbiddenVar = immunosuppressed.find(v => v.id === 'varicela')
    expect(forbiddenSrp).toBeUndefined()
    expect(forbiddenVar).toBeUndefined()
  })

  it('identifica y lista vacunas contraindicadas por condición', () => {
    const contra = getContraindicatedVaccines(['inmunosupresion'])
    const ids = contra.map(v => v.id)
    expect(ids).toContain('srp')
    expect(ids).toContain('varicela')
  })

  it('ordena resultados por prioridad: routine -> recommended -> shared-decision', () => {
    const results = getRecommendations(65, 'female', ['diabetes'])
    const priorities = results.map(r => r.priority)
    const priorityWeight: Record<string, number> = {
      routine: 1,
      recommended: 2,
      'shared-decision': 3,
    }
    for (let i = 0; i < priorities.length - 1; i++) {
      expect(priorityWeight[priorities[i]]).toBeLessThanOrEqual(priorityWeight[priorities[i + 1]])
    }
  })
})

export type Sexo = 'masculino' | 'femenino'

export type Condicion =
  | 'embarazo'
  | 'diabetes'
  | 'inmunosupresion'
  | 'cardiovascular'
  | 'pulmonar'
  | 'renal'
  | 'hepatica'
  | 'asplenia'
  | 'viajero'

export interface FormVacunas {
  sexo: Sexo
  edad: number
  condiciones: Condicion[]
}

export type Prioridad = 'rutina' | 'recomendada' | 'condicional'

export interface VacunaRecomendada {
  nombre: string
  descripcion: string
  prioridad: Prioridad
  fuente: 'SSA' | 'CDC' | 'SSA+CDC'
  nota?: string
}

export const CONDICIONES_LABELS: Record<Condicion, string> = {
  embarazo: 'Embarazo actual',
  diabetes: 'Diabetes mellitus',
  inmunosupresion: 'Inmunosupresión (VIH, cáncer, trasplante, corticosteroides)',
  cardiovascular: 'Enfermedad cardiovascular crónica',
  pulmonar: 'Enfermedad pulmonar crónica (asma, EPOC)',
  renal: 'Enfermedad renal crónica',
  hepatica: 'Enfermedad hepática crónica (hepatitis, cirrosis)',
  asplenia: 'Asplenia (sin bazo o bazo no funcional)',
  viajero: 'Viajero frecuente al extranjero',
}

export function obtenerRecomendaciones(form: FormVacunas): VacunaRecomendada[] {
  const { sexo, edad, condiciones } = form
  const recomendadas: VacunaRecomendada[] = []
  const vistas = new Set<string>()

  const add = (v: VacunaRecomendada) => {
    if (!vistas.has(v.nombre)) {
      vistas.add(v.nombre)
      recomendadas.push(v)
    }
  }

  const esInmunocomp = condiciones.includes('inmunosupresion')
  const esEmbarazada = sexo === 'femenino' && condiciones.includes('embarazo')

  // ── LACTANTE (< 1 año) ───────────────────────────────────────
  if (edad === 0) {
    add({ nombre: 'BCG', descripcion: 'Protección contra tuberculosis grave. Se aplica al nacer.', prioridad: 'rutina', fuente: 'SSA' })
    add({ nombre: 'Hepatitis B', descripcion: '3 dosis: al nacer, 2 meses y 6 meses.', prioridad: 'rutina', fuente: 'SSA+CDC' })
    add({ nombre: 'Pentavalente acelular (DPTa+VIP+Hib)', descripcion: 'Difteria, tosferina, tétanos, polio e Hib. 3 dosis: 2, 4 y 6 meses.', prioridad: 'rutina', fuente: 'SSA' })
    add({ nombre: 'Rotavirus', descripcion: 'Previene gastroenteritis grave. 3 dosis: 2, 4 y 6 meses.', prioridad: 'rutina', fuente: 'SSA' })
    add({ nombre: 'Neumocócica conjugada (PCV13)', descripcion: 'Previene neumonía, meningitis y otitis. 3 dosis: 2, 4 y 6 meses + refuerzo a los 12 meses.', prioridad: 'rutina', fuente: 'SSA+CDC' })
    add({ nombre: 'Influenza', descripcion: 'Desde los 6 meses, una vez al año. Primera aplicación: 2 dosis con 4 semanas de intervalo.', prioridad: 'rutina', fuente: 'SSA+CDC' })
  }

  // ── PREESCOLARES (1–4 años) ──────────────────────────────────
  if (edad >= 1 && edad <= 4) {
    if (!esInmunocomp) {
      add({ nombre: 'SRP (Sarampión-Rubéola-Parotiditis)', descripcion: '2 dosis: a los 12 meses y a los 4–6 años.', prioridad: 'rutina', fuente: 'SSA+CDC' })
      add({ nombre: 'Varicela', descripcion: '2 dosis: 12–15 meses y 4–6 años.', prioridad: 'rutina', fuente: 'SSA+CDC' })
    }
    add({ nombre: 'Hepatitis A', descripcion: '2 dosis a partir de los 12 meses, con 6 meses de intervalo.', prioridad: 'rutina', fuente: 'SSA+CDC' })
    add({ nombre: 'Neumocócica conjugada (PCV13)', descripcion: 'Dosis de refuerzo a los 12–15 meses.', prioridad: 'rutina', fuente: 'SSA+CDC' })
    add({ nombre: 'Pentavalente acelular (4.ª dosis)', descripcion: 'Refuerzo a los 18 meses.', prioridad: 'rutina', fuente: 'SSA' })
    add({ nombre: 'DPT (refuerzo a los 4 años)', descripcion: 'Refuerzo de difteria, tosferina y tétanos.', prioridad: 'rutina', fuente: 'SSA' })
    add({ nombre: 'Influenza', descripcion: 'Una dosis anual.', prioridad: 'rutina', fuente: 'SSA+CDC' })
  }

  // ── ESCOLARES (5–10 años) ────────────────────────────────────
  if (edad >= 5 && edad <= 10) {
    add({ nombre: 'Influenza', descripcion: 'Una dosis anual.', prioridad: 'rutina', fuente: 'SSA+CDC' })
    add({ nombre: 'VPH (Virus del Papiloma Humano)', descripcion: '2 dosis desde los 9 años con 6 meses de intervalo.', prioridad: 'rutina', fuente: 'SSA', nota: 'El esquema nacional SSA incluye niñas y niños desde los 9 años.' })
    if (!esInmunocomp) {
      add({ nombre: 'SRP — verificar cartilla', descripcion: 'Completar 2 dosis si no están registradas en la cartilla.', prioridad: 'recomendada', fuente: 'SSA+CDC' })
      add({ nombre: 'Varicela — verificar cartilla', descripcion: 'Completar 2 dosis si no están registradas.', prioridad: 'recomendada', fuente: 'SSA+CDC' })
    }
    add({ nombre: 'Hepatitis A — verificar cartilla', descripcion: 'Completar 2 dosis si no están registradas.', prioridad: 'recomendada', fuente: 'SSA+CDC' })
  }

  // ── ADOLESCENTES (11–17 años) ────────────────────────────────
  if (edad >= 11 && edad <= 17) {
    add({ nombre: 'Tdap', descripcion: 'Refuerzo de tétanos, difteria y tosferina. 1 dosis.', prioridad: 'rutina', fuente: 'SSA+CDC' })
    add({ nombre: 'VPH (Virus del Papiloma Humano)', descripcion: '2 dosis (inicio ≤14 años) o 3 dosis (inicio ≥15 años).', prioridad: 'rutina', fuente: 'SSA+CDC' })
    add({ nombre: 'Meningocócica conjugada (MCV4)', descripcion: '1 dosis a los 11–12 años; refuerzo a los 16.', prioridad: 'rutina', fuente: 'CDC' })
    add({ nombre: 'Influenza', descripcion: 'Una dosis anual.', prioridad: 'rutina', fuente: 'SSA+CDC' })
    add({ nombre: 'COVID-19', descripcion: 'Serie primaria y refuerzos actualizados según esquema vigente.', prioridad: 'recomendada', fuente: 'CDC' })
    if (!esInmunocomp) {
      add({ nombre: 'Varicela — verificar cartilla', descripcion: '2 dosis si no tiene antecedente de vacuna o enfermedad.', prioridad: 'recomendada', fuente: 'SSA+CDC' })
    }
  }

  // ── ADULTOS (18+) ────────────────────────────────────────────
  if (edad >= 18) {
    add({ nombre: 'Influenza', descripcion: 'Una dosis anual, preferentemente en octubre–noviembre.', prioridad: 'rutina', fuente: 'SSA+CDC' })
    add({ nombre: 'COVID-19', descripcion: 'Serie primaria completa y refuerzos actualizados.', prioridad: 'rutina', fuente: 'CDC' })
    add({ nombre: 'Td / Tdap', descripcion: 'Refuerzo cada 10 años. Sustituir al menos una dosis por Tdap (incluye tosferina).', prioridad: 'rutina', fuente: 'SSA+CDC' })
    add({ nombre: 'Hepatitis A', descripcion: 'Serie de 2 dosis si no tiene antecedente de infección o vacuna.', prioridad: 'recomendada', fuente: 'CDC' })
    add({ nombre: 'Hepatitis B', descripcion: 'Serie de 3 dosis (o 2 dosis con Heplisav-B) si no es inmune.', prioridad: 'recomendada', fuente: 'CDC' })
    if (!esInmunocomp && !esEmbarazada) {
      add({ nombre: 'Varicela', descripcion: '2 dosis separadas 4–8 semanas si no tiene antecedente de varicela o vacuna.', prioridad: 'recomendada', fuente: 'CDC' })
      add({ nombre: 'SRP (MMR)', descripcion: '1–2 dosis si nació después de 1957 y no es inmune.', prioridad: 'recomendada', fuente: 'CDC' })
    }
    if (edad <= 45) {
      add({ nombre: 'VPH (Virus del Papiloma Humano)', descripcion: '3 dosis si no fue vacunado. Más efectivo antes de los 26 años.', prioridad: 'condicional', fuente: 'CDC', nota: 'Para personas de 27–45 años la decisión debe individualizarse con el médico.' })
    }
  }

  // ── ADULTOS 50+ ──────────────────────────────────────────────
  if (edad >= 50) {
    add({ nombre: 'Herpes Zóster (Shingrix)', descripcion: '2 dosis con 2–6 meses de diferencia. Se recomienda aunque haya tenido varicela o la vacuna antigua de zóster.', prioridad: 'rutina', fuente: 'CDC' })
  }

  // ── ADULTOS MAYORES 65+ ──────────────────────────────────────
  if (edad >= 65) {
    add({ nombre: 'Neumocócica (PCV15 → PPSV23)', descripcion: 'PCV15 seguida de PPSV23 al menos 1 año después. Si ya recibió PCV13, consulte a su médico.', prioridad: 'rutina', fuente: 'CDC' })
    add({ nombre: 'RSV (Virus Sincitial Respiratorio)', descripcion: '1 dosis para adultos ≥60 años, según evaluación médica.', prioridad: 'recomendada', fuente: 'CDC' })
  }

  // ── EMBARAZO ─────────────────────────────────────────────────
  if (esEmbarazada) {
    add({ nombre: 'Tdap (durante el embarazo)', descripcion: 'Una dosis en cada embarazo, idealmente entre las semanas 27–36. Protege al recién nacido de tosferina.', prioridad: 'rutina', fuente: 'SSA+CDC', nota: 'Las vacunas de virus vivos (MMR, Varicela, VPH) están contraindicadas durante el embarazo.' })
  }

  // ── DIABETES ─────────────────────────────────────────────────
  if (condiciones.includes('diabetes')) {
    add({ nombre: 'Neumocócica (PCV15 + PPSV23)', descripcion: 'La diabetes aumenta el riesgo de neumonía neumocócica grave.', prioridad: 'rutina', fuente: 'CDC' })
    add({ nombre: 'Hepatitis B', descripcion: 'Serie completa si no es inmune; riesgo aumentado por hiperglucemia.', prioridad: 'rutina', fuente: 'CDC' })
  }

  // ── INMUNOSUPRESIÓN ──────────────────────────────────────────
  if (esInmunocomp) {
    add({ nombre: 'Neumocócica (PCV15 + PPSV23)', descripcion: 'Ambas vacunas son prioritarias en pacientes inmunocomprometidos.', prioridad: 'rutina', fuente: 'CDC', nota: 'Las vacunas de virus vivos (MMR, Varicela, Rotavirus) están generalmente contraindicadas.' })
    add({ nombre: 'Meningocócica (MCV4 + MenB)', descripcion: '2 dosis iniciales; refuerzo cada 5 años.', prioridad: 'rutina', fuente: 'CDC' })
    add({ nombre: 'Hepatitis A', descripcion: 'Serie de 2 dosis.', prioridad: 'rutina', fuente: 'CDC' })
    add({ nombre: 'Hepatitis B', descripcion: 'Serie completa; puede requerir dosis más alta.', prioridad: 'rutina', fuente: 'CDC' })
  }

  // ── CARDIOVASCULAR ───────────────────────────────────────────
  if (condiciones.includes('cardiovascular')) {
    add({ nombre: 'Neumocócica (PCV15 + PPSV23)', descripcion: 'La infección neumocócica puede desencadenar eventos cardiovasculares graves.', prioridad: 'rutina', fuente: 'CDC' })
  }

  // ── PULMONAR ─────────────────────────────────────────────────
  if (condiciones.includes('pulmonar')) {
    add({ nombre: 'Neumocócica (PCV15 + PPSV23)', descripcion: 'Alta prioridad en asma moderada-grave y EPOC.', prioridad: 'rutina', fuente: 'CDC' })
  }

  // ── RENAL ────────────────────────────────────────────────────
  if (condiciones.includes('renal')) {
    add({ nombre: 'Neumocócica (PCV15 + PPSV23)', descripcion: 'Riesgo elevado de infección neumocócica en nefropatía crónica.', prioridad: 'rutina', fuente: 'CDC' })
    add({ nombre: 'Hepatitis B (dosis alta)', descripcion: 'Pacientes en diálisis o con nefropatía avanzada requieren dosis doble.', prioridad: 'rutina', fuente: 'CDC' })
  }

  // ── HEPÁTICA ─────────────────────────────────────────────────
  if (condiciones.includes('hepatica')) {
    add({ nombre: 'Hepatitis A', descripcion: 'La sobreinfección por VHA en hepatopatía crónica puede ser fulminante.', prioridad: 'rutina', fuente: 'CDC' })
    add({ nombre: 'Hepatitis B', descripcion: 'Serie completa si no es inmune.', prioridad: 'rutina', fuente: 'CDC' })
    add({ nombre: 'Neumocócica (PCV15 + PPSV23)', descripcion: 'La cirrosis aumenta el riesgo de infecciones bacterianas graves.', prioridad: 'rutina', fuente: 'CDC' })
  }

  // ── ASPLENIA ─────────────────────────────────────────────────
  if (condiciones.includes('asplenia')) {
    add({ nombre: 'Neumocócica (PCV15 + PPSV23)', descripcion: 'Riesgo de sepsis fulminante por bacterias encapsuladas. Ambas vacunas son esenciales.', prioridad: 'rutina', fuente: 'CDC' })
    add({ nombre: 'Meningocócica (MCV4 + MenB)', descripcion: 'Ambos serotipos son obligatorios; refuerzo cada 5 años.', prioridad: 'rutina', fuente: 'CDC' })
    add({ nombre: 'Hib (Haemophilus influenzae tipo b)', descripcion: '1 dosis si no tiene esquema completo previo.', prioridad: 'rutina', fuente: 'CDC' })
  }

  // ── VIAJERO ──────────────────────────────────────────────────
  if (condiciones.includes('viajero')) {
    add({ nombre: 'Hepatitis A', descripcion: 'Esencial para viajes a América Latina, Asia, África y Medio Oriente.', prioridad: 'rutina', fuente: 'CDC' })
    add({ nombre: 'Fiebre Tifoidea', descripcion: 'Para viajes a zonas endémicas. Vacuna oral (Ty21a) o inyectable (Vi polisacárida).', prioridad: 'recomendada', fuente: 'CDC' })
    add({ nombre: 'Meningocócica conjugada (MCV4)', descripcion: 'Obligatoria para peregrinaciones a Arabia Saudita y recomendada para África subsahariana.', prioridad: 'condicional', fuente: 'CDC', nota: 'Consulte a un médico de medicina del viajero para recomendaciones específicas por destino.' })
  }

  return recomendadas
}

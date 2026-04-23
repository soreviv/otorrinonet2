import type {
  EvolutionNote,
  SurgicalNote,
  Prescription,
  ConsentForm,
} from './notas-types'

export const SAMPLE_EVOLUTION_NOTES: EvolutionNote[] = [
  {
    id: 'note-001',
    patientId: 'exp-001',
    patientName: 'María González Reyes',
    date: '2026-04-18',
    time: '09:30',
    consultationReason: 'Seguimiento rinitis alérgica — control mensual',
    findings:
      'Paciente refiere mejoría del 60% en síntomas nasales con tratamiento ajustado. Reducción de obstrucción bilateral. Rinorrea hialina leve. Cornetes con menor edema respecto a consulta previa. Signos vitales estables.',
    updatedDiagnosis:
      'Rinitis alérgica debida a polen (J30.1) — en control. Desviación septal (J34.2) — sin cambios.',
    plan: 'Se mantiene esquema actual: loratadina + fluticasona nasal + montelukast. Se agrega irrigación nasal con solución salina hipertónica mañana y noche. Control en 4 semanas.',
    authorName: 'Dr. Alejandro Viveros Domínguez',
    createdAt: '2026-04-18T09:45:00-06:00',
  },
  {
    id: 'note-002',
    patientId: 'exp-001',
    patientName: 'María González Reyes',
    date: '2026-03-15',
    time: '10:00',
    consultationReason: 'Primera consulta — obstrucción nasal bilateral',
    findings:
      'Paciente con 3 semanas de obstrucción nasal bilateral progresiva, rinorrea hialina, estornudos matutinos y prurito nasal. Otoscopia normal. Cornetes inferiores hipertróficos con mucosa pálida. Desviación septal leve a la derecha.',
    updatedDiagnosis: 'Rinitis alérgica (J30.1). Desviación del tabique nasal (J34.2).',
    plan: 'Inicio de loratadina 10mg y fluticasona spray nasal. Lavados con solución salina. Control en 4 semanas.',
    authorName: 'Dr. Alejandro Viveros Domínguez',
    createdAt: '2026-03-15T10:20:00-06:00',
  },
  {
    id: 'note-003',
    patientId: 'exp-002',
    patientName: 'Carlos Mendoza Ortiz',
    date: '2026-04-10',
    time: '10:00',
    consultationReason: 'Control VPPB — 2 semanas post maniobra de Epley',
    findings:
      'Paciente refiere resolución completa de episodios de vértigo desde 48 horas después de la maniobra. Prueba de Dix-Hallpike negativa bilateral. Sin nistagmo. Marcha y equilibrio normales.',
    updatedDiagnosis: 'VPPB canal posterior derecho (H81.1) — resuelto.',
    plan: 'Alta. Se indica continuar ejercicios de Brandt-Daroff por 2 semanas más. Regresar si hay recidiva.',
    authorName: 'Dr. Alejandro Viveros Domínguez',
    createdAt: '2026-04-10T10:15:00-06:00',
  },
]

export const SAMPLE_SURGICAL_NOTES: SurgicalNote[] = [
  {
    id: 'surg-001',
    patientId: 'exp-005',
    patientName: 'Lucía Ramírez Fuentes',
    type: 'preoperatoria',
    procedure: 'Septoplastia + Turbinoplastia bilateral',
    scheduledDate: '2026-05-10',
    anesthesia: 'General',
    instructions:
      'Suspender AINE 7 días antes. Ayuno de 8 horas previo. Baño con jabón antiséptico la noche anterior. Llegar 2 horas antes al hospital. Acompañante obligatorio.',
    observations:
      'Paciente alérgica a AINE (broncoespasmo con naproxeno). Anestesiología notificada. Valoración preanestésica programada para 3 días antes de la cirugía.',
    authorName: 'Dr. Alejandro Viveros Domínguez',
    createdAt: '2026-04-15T11:50:00-06:00',
  },
]

const DOCTOR_FIELDS = {
  doctorName: 'Dr. Alejandro Viveros Domínguez',
  doctorLicense: 'Céd. Prof. 8765432',
  doctorSpecialtyLicense: 'Céd. Esp. 1234567',
  doctorUniversity: 'Universidad Nacional Autónoma de México',
  clinicName: 'Consultorios OtorrinoNet',
  clinicAddress: 'Av. Insurgentes Sur 1234, Col. Del Valle, CP 03100, CDMX',
  clinicPhone: '55 1234-5678',
  clinicCofepris: 'AF-2023-0012345',
}

export const SAMPLE_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-001',
    patientId: 'exp-001',
    patientName: 'María González Reyes',
    date: '2026-04-18',
    status: 'firmada',
    medications: [
      {
        name: 'Loratadina',
        brandName: 'Clarityne',
        presentation: 'Tabletas 10 mg',
        dose: '1 tableta',
        frequency: 'Cada 24 horas',
        duration: '30 días',
        instructions: 'Tomar preferentemente en la noche',
      },
      {
        name: 'Fluticasona propionato',
        brandName: 'Flixonase',
        presentation: 'Spray nasal 50 mcg/dosis',
        dose: '2 aplicaciones por fosa nasal',
        frequency: 'Cada 24 horas',
        duration: 'Uso continuo',
        instructions: 'Aplicar en la mañana. No exceder 4 aplicaciones por día',
      },
      {
        name: 'Montelukast',
        presentation: 'Tabletas 10 mg',
        dose: '1 tableta',
        frequency: 'Cada 24 horas',
        duration: '30 días',
        instructions: 'Tomar en la noche',
      },
    ],
    ...DOCTOR_FIELDS,
    signatureData: 'data:image/png;base64,SIGNATURE_PLACEHOLDER',
    signedAt: '2026-04-18T09:48:22-06:00',
    signatureTimestamp: '2026-04-18T15:48:22Z',
    createdAt: '2026-04-18T09:40:00-06:00',
  },
  {
    id: 'rx-002',
    patientId: 'exp-004',
    patientName: 'Roberto Silva Cárdenas',
    date: '2026-04-17',
    status: 'borrador',
    medications: [
      {
        name: 'Betahistina',
        brandName: 'Serc',
        presentation: 'Tabletas 24 mg',
        dose: '1 tableta',
        frequency: 'Cada 12 horas',
        duration: '30 días',
        instructions: 'Tomar con alimentos',
      },
    ],
    ...DOCTOR_FIELDS,
    signatureData: null,
    signedAt: null,
    signatureTimestamp: null,
    createdAt: '2026-04-17T16:55:00-06:00',
  },
]

export const SAMPLE_CONSENT_FORMS: ConsentForm[] = [
  {
    id: 'consent-001',
    patientId: 'exp-005',
    patientName: 'Lucía Ramírez Fuentes',
    procedure: 'Septoplastia y Turbinoplastia bilateral',
    consentText:
      'Yo, el/la paciente abajo firmante, declaro haber sido informado/a por el Dr. Alejandro Viveros Domínguez sobre el procedimiento de Septoplastia y Turbinoplastia bilateral, sus objetivos, riesgos (sangrado, infección, perforación septal, cambios en olfato, recidiva), alternativas de tratamiento y el pronóstico esperado. He tenido la oportunidad de hacer preguntas y han sido respondidas satisfactoriamente. Autorizo al médico y a su equipo a realizar el procedimiento descrito.',
    status: 'firmado-presencial',
    patientSignatureData: 'data:image/png;base64,PATIENT_SIGNATURE_PLACEHOLDER',
    signedAt: '2026-04-15T12:05:00-06:00',
    signatureMethod: 'presencial',
    authorName: 'Dr. Alejandro Viveros Domínguez',
    createdAt: '2026-04-15T11:55:00-06:00',
  },
  {
    id: 'consent-002',
    patientId: 'exp-004',
    patientName: 'Roberto Silva Cárdenas',
    procedure: 'Punción y lavado de senos paranasales',
    consentText:
      'Yo, el/la paciente abajo firmante, declaro haber sido informado/a sobre el procedimiento de punción y lavado de senos paranasales, sus objetivos, riesgos menores (sangrado nasal, mareo transitorio, raramente infección) y beneficios esperados. Autorizo la realización del procedimiento.',
    status: 'pendiente',
    patientSignatureData: null,
    signedAt: null,
    signatureMethod: null,
    emailSentAt: '2026-04-17T17:00:00-06:00',
    authorName: 'Dr. Alejandro Viveros Domínguez',
    createdAt: '2026-04-17T16:58:00-06:00',
  },
  {
    id: 'consent-003',
    patientId: 'exp-001',
    patientName: 'María González Reyes',
    procedure: 'Inmunoterapia subcutánea con extracto de ácaros',
    consentText:
      'Yo, el/la paciente abajo firmante, declaro haber sido informado/a sobre el tratamiento de inmunoterapia subcutánea, su duración (3-5 años), riesgos de reacción alérgica local o sistémica, y la necesidad de permanecer 30 minutos en observación tras cada aplicación. Autorizo el inicio del tratamiento.',
    status: 'pendiente',
    patientSignatureData: null,
    signedAt: null,
    signatureMethod: null,
    emailSentAt: null,
    authorName: 'Dr. Alejandro Viveros Domínguez',
    createdAt: '2026-04-18T09:50:00-06:00',
  },
]

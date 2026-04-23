import type { Patient } from './ehr-types'

export const SAMPLE_PATIENTS: Patient[] = [
  {
    id: 'exp-001',
    expedienteNumber: 'VIV-2024-001',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2026-04-18T09:30:00Z',
    generalData: {
      fullName: 'María González Reyes',
      birthDate: '1985-06-12',
      sex: 'femenino',
      curp: 'GORM850612MNLNYR08',
      phone: '81 2345 6789',
      email: 'maria.gonzalez@gmail.com',
      address: 'Av. Constitución 1540, Col. Obispado, Monterrey, N.L.',
    },
    familyHistory: {
      notes: 'Madre con diabetes mellitus tipo 2 e hipertensión arterial. Padre con rinitis alérgica crónica. Abuela materna con hipoacusia bilateral.',
      relevantConditions: ['Diabetes mellitus tipo 2', 'Hipertensión arterial', 'Rinitis alérgica', 'Hipoacusia familiar'],
    },
    personalHistory: {
      pathological: 'Rinitis alérgica desde los 12 años. Amigdalectomía a los 8 años. Sin hospitalizaciones previas relevantes.',
      allergies: ['Polen', 'Polvo doméstico', 'Penicilina (urticaria)'],
      currentMedications: [
        { name: 'Loratadina 10mg', dose: '1 tableta', frequency: 'cada 24 horas', indication: 'rinitis alérgica' },
        { name: 'Fluticasona spray nasal', dose: '2 aplicaciones por fosa nasal', frequency: 'cada 24 horas', indication: 'rinitis alérgica' },
      ],
      nonPathological: 'Tabaquismo negado. Alcoholismo social ocasional. Sedentaria.',
    },
    currentCondition: {
      chiefComplaint: 'Obstrucción nasal bilateral y rinorrea hialina de 3 semanas de evolución',
      onset: '2026-03-28',
      description: 'Paciente femenina de 40 años que refiere obstrucción nasal bilateral progresiva de 3 semanas de evolución, acompañada de rinorrea hialina abundante, estornudos en salva matutinos y prurito nasal y ocular.',
      evolution: 'Progresiva',
    },
    physicalExam: {
      vitalSigns: { bloodPressure: '118/76 mmHg', heartRate: '72 lpm', temperature: '36.5 °C', weight: '62 kg', height: '163 cm', bmi: '23.3' },
      ears: 'Otoscopia bilateral: conductos auditivos externos sin alteraciones, membranas timpánicas íntegras, con buen cono de luz.',
      noseAndSinuses: 'Tabique nasal desviado leve hacia la derecha. Cornetes inferiores hipertróficos bilaterales con mucosa pálida y edematosa.',
      pharynxAndNeck: 'Orofaringe sin eritema. Amígdalas palatinas ausentes. Sin adenopatías cervicales palpables.',
    },
    diagnoses: [
      { id: 'dx-001', code: 'J30.1', description: 'Rinitis alérgica debida a polen', status: 'activo', treatment: 'Se ajusta dosis de antihistamínico. Se indica lavados nasales con solución salina isotónica. Se agrega montelukast 10mg noche.', followUp: 'Control en 4 semanas. Se solicita pruebas de alergia.' },
      { id: 'dx-002', code: 'J34.2', description: 'Desviación del tabique nasal', status: 'crónico', treatment: 'Manejo conservador por el momento. Se comentan opciones quirúrgicas (septoplastia).', followUp: 'Reevaluación en próxima consulta.' },
    ],
  },
  {
    id: 'exp-002',
    expedienteNumber: 'VIV-2024-008',
    createdAt: '2024-07-22T11:00:00Z',
    updatedAt: '2026-04-10T14:20:00Z',
    generalData: {
      fullName: 'Carlos Mendoza Ortiz',
      birthDate: '1972-11-03',
      sex: 'masculino',
      curp: 'MEOC721103HNLNRL07',
      phone: '81 9876 5432',
      email: 'c.mendoza@hotmail.com',
      address: 'Calle Hidalgo 320, Col. Centro, San Pedro Garza García, N.L.',
    },
    familyHistory: {
      notes: 'Sin antecedentes heredofamiliares de relevancia para el padecimiento actual.',
      relevantConditions: [],
    },
    personalHistory: {
      pathological: 'Hipertensión arterial sistémica en tratamiento desde 2019. Sin cirugías previas.',
      allergies: [],
      currentMedications: [
        { name: 'Losartán 50mg', dose: '1 tableta', frequency: 'cada 24 horas', indication: 'hipertensión arterial' },
      ],
      nonPathological: 'Tabaquismo 10 años, suspendido hace 5 años. Ingesta de alcohol moderada los fines de semana.',
    },
    currentCondition: {
      chiefComplaint: 'Episodios de vértigo con náuseas de 2 meses de evolución',
      onset: '2026-02-10',
      description: 'Paciente masculino de 53 años que refiere episodios de vértigo de inicio súbito, de segundos a un minuto de duración, desencadenados al levantarse de la cama o al voltear la cabeza.',
      evolution: 'Episódica, sin mejoría espontánea',
    },
    physicalExam: {
      vitalSigns: { bloodPressure: '132/84 mmHg', heartRate: '78 lpm', temperature: '36.7 °C', weight: '84 kg', height: '175 cm', bmi: '27.4' },
      ears: 'Otoscopia bilateral sin alteraciones. Prueba de Dix-Hallpike positiva del lado derecho con nistagmo rotatorio de latencia corta y fatigable.',
      noseAndSinuses: 'Sin alteraciones.',
      pharynxAndNeck: 'Sin alteraciones en orofaringe ni laringe. Sin adenopatías. Tiroides normal.',
    },
    diagnoses: [
      { id: 'dx-003', code: 'H81.1', description: 'Vértigo posicional paroxístico benigno (VPPB), canal semicircular posterior derecho', status: 'activo', treatment: 'Maniobra de reposición de Epley realizada en consultorio. Se indica evitar posiciones desencadenantes por 48 horas.', followUp: 'Control en 2 semanas para confirmar resolución.' },
    ],
  },
  {
    id: 'exp-003',
    expedienteNumber: 'VIV-2025-015',
    createdAt: '2025-01-10T09:15:00Z',
    updatedAt: '2026-03-20T16:00:00Z',
    generalData: {
      fullName: 'Ana Sofía Torres Villarreal',
      birthDate: '1998-04-25',
      sex: 'femenino',
      curp: 'TOVA980425MNLRLN09',
      phone: '81 1122 3344',
      email: 'ana.torres@outlook.com',
      address: 'Av. Lázaro Cárdenas 2400, Col. Residencial San Agustín, Monterrey, N.L.',
    },
    familyHistory: {
      notes: 'Madre y hermano mayor con rinitis alérgica. Padre con asma bronquial.',
      relevantConditions: ['Rinitis alérgica', 'Asma bronquial'],
    },
    personalHistory: {
      pathological: 'Rinitis alérgica desde la infancia. Dermatitis atópica en remisión. Sin cirugías.',
      allergies: ['Ácaros del polvo', 'Epitelio de gato'],
      currentMedications: [],
      nonPathological: 'Niega tabaquismo y alcoholismo. Activa físicamente.',
    },
    currentCondition: {
      chiefComplaint: 'Rinitis alérgica persistente con respuesta insuficiente a tratamiento farmacológico',
      onset: '2025-01-01',
      description: 'Paciente femenina de 28 años con rinitis alérgica de larga evolución que persiste sintomática a pesar de tratamiento con antihistamínicos y corticosteroides intranasales.',
      evolution: 'Crónica con exacerbaciones',
    },
    physicalExam: {
      vitalSigns: { bloodPressure: '110/70 mmHg', heartRate: '68 lpm', temperature: '36.4 °C', weight: '57 kg', height: '165 cm', bmi: '20.9' },
      ears: 'Sin alteraciones. Otoscopia bilateral normal.',
      noseAndSinuses: 'Cornetes inferiores con mucosa pálida y edema moderado. Rinorrea hialina escasa. Tabique central.',
      pharynxAndNeck: 'Orofaringe con leve granulación en pared posterior. Sin adenopatías cervicales.',
    },
    diagnoses: [
      { id: 'dx-004', code: 'J30.9', description: 'Rinitis alérgica perenne', status: 'activo', treatment: 'Inicio de inmunoterapia subcutánea con extracto de ácaros. Protocolo de inducción semanal por 16 semanas.', followUp: 'Próxima dosis en 1 semana. Control médico mensual durante fase de inducción.' },
    ],
  },
  {
    id: 'exp-004',
    expedienteNumber: 'VIV-2025-031',
    createdAt: '2025-06-01T08:00:00Z',
    updatedAt: '2026-04-05T10:10:00Z',
    generalData: {
      fullName: 'Roberto Silva Cárdenas',
      birthDate: '1968-09-17',
      sex: 'masculino',
      curp: 'SICR680917HNLLBT04',
      phone: '81 5566 7788',
      email: 'rsilva@empresa.com',
      address: 'Privada Eucalipto 8, Fracc. Los Pinos, Guadalupe, N.L.',
    },
    familyHistory: {
      notes: 'Padre con hipoacusia bilateral de inicio en la quinta década. Madre sana.',
      relevantConditions: ['Hipoacusia de inicio tardío'],
    },
    personalHistory: {
      pathological: 'Diabetes mellitus tipo 2 diagnosticada en 2020, controlada con metformina. Sin cirugías previas.',
      allergies: [],
      currentMedications: [
        { name: 'Metformina 850mg', dose: '1 tableta', frequency: 'cada 12 horas con alimentos', indication: 'diabetes mellitus tipo 2' },
      ],
      nonPathological: 'Exposición laboral a ruido en planta industrial por más de 15 años. Usa protección auditiva desde hace 3 años.',
    },
    currentCondition: {
      chiefComplaint: 'Acúfeno continuo en oído izquierdo de 1 mes de evolución',
      onset: '2026-03-15',
      description: 'Paciente masculino de 57 años refiere acúfeno de tono agudo, continuo, no pulsátil, en oído izquierdo de aparición gradual hace un mes.',
      evolution: 'Progresiva lenta',
    },
    physicalExam: {
      vitalSigns: { bloodPressure: '138/88 mmHg', heartRate: '76 lpm', temperature: '36.6 °C', weight: '91 kg', height: '172 cm', bmi: '30.8' },
      ears: 'Otoscopia bilateral: oído derecho sin alteraciones. Oído izquierdo con leve retracción de membrana timpánica. Audiometría: hipoacusia neurosensorial leve en frecuencias agudas del lado izquierdo.',
      noseAndSinuses: 'Sin alteraciones.',
      pharynxAndNeck: 'Sin alteraciones. Sin adenopatías ni masas cervicales.',
    },
    diagnoses: [
      { id: 'dx-005', code: 'H93.1', description: 'Tinnitus unilateral izquierdo', status: 'activo', treatment: 'Se solicita audiometría completa y potenciales evocados auditivos. Inicio de betahistina 24mg cada 12 horas.', followUp: 'Revisión con resultados de estudios en 3 semanas.' },
      { id: 'dx-006', code: 'H90.3', description: 'Hipoacusia neurosensorial unilateral izquierda', status: 'activo', treatment: 'Expectante pendiente de estudios complementarios.', followUp: 'Según resultados de audiometría completa.' },
    ],
  },
  {
    id: 'exp-005',
    expedienteNumber: 'VIV-2026-002',
    createdAt: '2026-01-08T13:30:00Z',
    updatedAt: '2026-04-15T11:45:00Z',
    generalData: {
      fullName: 'Lucía Ramírez Fuentes',
      birthDate: '1990-02-14',
      sex: 'femenino',
      curp: 'RAFL900214MNLMCC04',
      phone: '81 3344 5566',
      email: 'lucia.ramirez@gmail.com',
      address: 'Calle Morelos 678, Col. San Jerónimo, Monterrey, N.L.',
    },
    familyHistory: {
      notes: 'Sin antecedentes familiares de relevancia.',
      relevantConditions: [],
    },
    personalHistory: {
      pathological: 'Sin antecedentes patológicos de importancia. Sin cirugías previas.',
      allergies: ['AINE (naproxeno — broncoespasmo)'],
      currentMedications: [],
      nonPathological: 'No fuma. No consume alcohol. Practica yoga 3 veces por semana.',
    },
    currentCondition: {
      chiefComplaint: 'Obstrucción nasal crónica y dificultad respiratoria nasal bilateral',
      onset: '2025-09-01',
      description: 'Paciente femenina de 36 años con historia de obstrucción nasal bilateral crónica que no mejora con tratamiento médico. Refiere respiración bucal durante la noche y ronquido leve.',
      evolution: 'Crónica, sin mejoría con tratamiento',
    },
    physicalExam: {
      vitalSigns: { bloodPressure: '112/72 mmHg', heartRate: '66 lpm', temperature: '36.3 °C', weight: '60 kg', height: '167 cm', bmi: '21.5' },
      ears: 'Sin alteraciones bilaterales.',
      noseAndSinuses: 'Desviación septal severa hacia la izquierda con espolón óseo. Cornetes inferiores hipertróficos. Permeabilidad muy reducida del lado izquierdo.',
      pharynxAndNeck: 'Orofaringe con úvula de tamaño normal. Amígdalas grado I. Sin adenopatías.',
    },
    diagnoses: [
      { id: 'dx-007', code: 'J34.2', description: 'Desviación del tabique nasal con obstrucción significativa', status: 'activo', treatment: 'Se indica septoplastia + turbinoplastia bilateral. Se realizan estudios preoperatorios. Suspender AINE por alergia.', followUp: 'Programación de cirugía. Cita preoperatoria con anestesiología.' },
    ],
  },
]

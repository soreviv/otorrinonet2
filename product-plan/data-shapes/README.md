# UI Data Shapes

These types define the shape of data that the UI components expect to receive as props. They represent the **frontend contract** — what the components need to render correctly.

How you model, store, and fetch this data on the backend is an implementation decision. You may combine, split, or extend these types to fit your architecture.

## Entities

- **User** — Personal con acceso al sistema (médico, recepcionista, enfermera) (usado en: administracion)
- **Patient** — Paciente con expediente clínico (usado en: expediente-clinico, notas-recetas-consentimientos, agenda-de-citas)
- **Appointment** — Cita médica con estado y servicio (usado en: agenda-de-citas)
- **Service** — Tipo de consulta o especialidad disponible para agendar (usado en: agenda-de-citas, sitio-publico)
- **DayAvailability / TimeSlot** — Horarios disponibles por día para agendar cita (usado en: agenda-de-citas)
- **ClinicalRecord / Patient** — Expediente clínico NOM-004-SSA3 con antecedentes, exploración y diagnósticos (usado en: expediente-clinico)
- **EvolutionNote** — Nota SOAP de consulta firmada electrónicamente (usado en: notas-recetas-consentimientos)
- **SurgicalNote** — Nota preoperatoria o postoperatoria (usado en: notas-recetas-consentimientos)
- **Prescription** — Receta médica digital con firma electrónica y timestamp (usado en: notas-recetas-consentimientos)
- **ConsentForm** — Consentimiento informado con firma del paciente (presencial o por correo) (usado en: notas-recetas-consentimientos)
- **AuditLog** — Registro inmutable de operaciones sobre datos personales LFPDPPP (usado en: administracion)
- **ArcoRequest** — Solicitud de derechos ARCO de pacientes (usado en: administracion)
- **FhirExport** — Exportación de expediente en formato HL7-FHIR (usado en: administracion)

## Per-Section Types

Each section includes its own `types.ts` with full interface definitions:

- `sections/sitio-publico/types.ts`
- `sections/agenda-de-citas/types.ts`
- `sections/expediente-clinico/types.ts`
- `sections/notas-recetas-consentimientos/types.ts`
- `sections/administracion-cumplimiento-interoperabilidad/types.ts`

## Combined Reference

See `overview.ts` for all entity types aggregated in one file.

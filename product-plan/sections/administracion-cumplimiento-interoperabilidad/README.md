# Administración, Cumplimiento e Interoperabilidad

## Overview

Panel de administración del consultorio accesible solo para el rol médico. Centraliza la gestión de usuarios y roles, el cumplimiento normativo (LFPDPPP, NOM-024-SSA3) y la interoperabilidad HL7-FHIR. Proporciona visibilidad del estado de seguridad y herramientas de auditoría, exportación y derechos ARCO.

## User Flows

- Administrador accede al dashboard y ve métricas de seguridad y operación
- Administrador gestiona la lista de usuarios: edita rol o desactiva usuarios
- Administrador consulta la bitácora de auditoría inmutable y filtra por usuario/acción/fecha
- Administrador descarga el expediente de un paciente en formato HL7-FHIR JSON
- Administrador realiza exportación masiva de expedientes con filtros de fecha
- Administrador consulta y descarga el aviso de privacidad LFPDPPP vigente
- Administrador gestiona solicitudes ARCO de pacientes y actualiza su estado

## Design Decisions

- Navigation is tab-based: Dashboard, Usuarios, Bitácora, Exportación FHIR, Privacidad y ARCO
- Audit log (`AuditLog`) has no edit/delete actions — immutable by design
- FHIR export shows a status indicator: `en-proceso` | `completado` | `error`
- "e.firma SAT" section is displayed as a "Próximamente" card (read-only, not interactive)
- Compliance badges (NOM-024-SSA3, LFPDPPP, NOM-035) are decorative indicators in the dashboard

## Data Shapes

**Entities:** `SystemUser`, `UserRole`, `UserStatus`, `AuditLog`, `AuditAction`, `ArcoRequest`, `ArcoType`, `ArcoStatus`, `FhirExport`

## Visual Reference

See `AdminDashboard.png`, `AdminUsuarios.png`, `AdminBitacora.png`, `AdminFhir.png`, and `AdminPrivacidad.png` for the target UI design.

## Components Provided

- `AdminDashboard` — Full admin panel with tabbed navigation covering all sub-sections

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onEditUser(id)` | Admin clicks to edit a user's role or status |
| `onToggleUserStatus(id)` | Admin toggles a user active/inactive |
| `onExportFhir(patientId)` | Admin requests individual FHIR export |
| `onExportFhirBulk(filters)` | Admin requests bulk FHIR export |
| `onUpdateArcoStatus(id, status)` | Admin updates an ARCO request status |
| `onDownloadPrivacyPolicy()` | Admin downloads the privacy policy PDF |

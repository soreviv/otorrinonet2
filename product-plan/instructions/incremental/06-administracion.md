# Milestone 6: Administración, Cumplimiento e Interoperabilidad

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** All previous milestones complete

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Goal

Implement the administration panel: user management, immutable audit log, FHIR data export, privacy policy management, and ARCO rights requests — accessible only to the doctor role.

## Overview

A tab-based admin panel for the doctor only (`role === 'medico'`). Provides full visibility into system security, user activity, and compliance status. The audit log is immutable by design. FHIR exports support both individual patient and bulk exports.

**Key Functionality:**
- Dashboard with security and compliance metrics
- User management: list, edit role, activate/deactivate
- Immutable audit log with filtering by user/action/date
- FHIR export: individual patient and bulk with date filters
- Privacy policy display and download (LFPDPPP)
- ARCO rights requests management (acceso, rectificación, cancelación, oposición)

## Components Provided

Copy from `product-plan/sections/administracion-cumplimiento-interoperabilidad/components/`:

- `AdminDashboard` — Full admin panel with tabbed navigation
- `index.ts` — Clean export

## Props Reference

**Key types:**

```typescript
type UserRole = 'medico' | 'enfermera' | 'recepcionista'
type UserStatus = 'activo' | 'inactivo'
type AuditAction = 'acceso' | 'creacion' | 'modificacion' | 'eliminacion' | 'firma' | 'exportacion-fhir'
type ArcoType = 'acceso' | 'rectificacion' | 'cancelacion' | 'oposicion'
type ArcoStatus = 'pendiente' | 'en-proceso' | 'resuelta' | 'rechazada'

interface SystemUser { id, name, email, role, status, lastAccess, createdAt }
interface AuditLog { id, action, resource, userId, userName, ipAddress, timestamp }
interface ArcoRequest { id, type, patientName, patientId, description, status, submittedAt, resolvedAt, notes }
interface FhirExport { id, type, patientName, patientId, dateRangeFrom?, dateRangeTo?, totalPatients?, requestedBy, status, fileSize, requestedAt, completedAt }
```

**Callback props:**

| Callback | Triggered When |
|----------|---------------|
| `onEditUser(id)` | Admin clicks to edit a user |
| `onToggleUserStatus(id)` | Admin toggles user active/inactive |
| `onExportFhir(patientId)` | Admin requests individual FHIR export |
| `onExportFhirBulk(filters)` | Admin requests bulk FHIR export |
| `onUpdateArcoStatus(id, status)` | Admin updates an ARCO request status |
| `onDownloadPrivacyPolicy()` | Admin downloads privacy policy PDF |

## Expected User Flows

### Flow 1: View Dashboard

1. Admin navigates to `/staff/admin`
2. Admin sees metric cards: usuarios activos, accesos últimas 24h, exportaciones FHIR del mes, solicitudes ARCO pendientes
3. Admin sees compliance badges: NOM-024-SSA3, LFPDPPP, NOM-035
4. **Outcome:** Dashboard provides at-a-glance security and compliance overview

### Flow 2: Deactivate a User

1. Admin clicks "Usuarios" tab
2. Admin finds user and clicks "Desactivar"
3. **Outcome:** `onToggleUserStatus(userId)` called; user status updates

### Flow 3: Review Audit Log

1. Admin clicks "Bitácora" tab
2. Admin filters by user "Dr. Viveros" and action "acceso"
3. **Outcome:** Filtered log shows only matching entries; no edit/delete actions visible

### Flow 4: Export a Patient's FHIR Record

1. Admin clicks "Exportación FHIR" tab
2. Admin searches for a patient and clicks "Exportar FHIR"
3. **Outcome:** `onExportFhir(patientId)` called; status shows "en-proceso" then "completado"

### Flow 5: Resolve an ARCO Request

1. Admin clicks "Privacidad y ARCO" tab
2. Admin finds a pending ARCO request and clicks "Marcar como resuelta"
3. **Outcome:** `onUpdateArcoStatus(id, "resuelta")` called; badge updates

## Important Backend Notes

- **Access control**: Enforce `role === 'medico'` server-side; do not rely on UI-only restriction
- **Audit log immutability**: The log table should have no UPDATE or DELETE permissions for the application user; only INSERT
- **FHIR format**: Export should conform to HL7-FHIR R4; the `Patient`, `Condition`, `MedicationRequest`, and `AllergyIntolerance` resources are the minimum set
- **ARCO compliance**: Under LFPDPPP, ARCO requests must be resolved within 20 business days
- **e.firma SAT section**: The "Próximamente" card in the UI is decorative — no action needed for now; implement when integrating SAT's e.firma PKI

## Empty States

- No users: unlikely in production, but handle gracefully
- No audit log entries: "Sin registros de auditoría" message
- No ARCO requests: "Sin solicitudes pendientes" message

## Testing

See `product-plan/sections/administracion-cumplimiento-interoperabilidad/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/administracion-cumplimiento-interoperabilidad/README.md` — Feature overview
- `product-plan/sections/administracion-cumplimiento-interoperabilidad/tests.md` — UI behavior test specs
- `product-plan/sections/administracion-cumplimiento-interoperabilidad/components/` — React components
- `product-plan/sections/administracion-cumplimiento-interoperabilidad/types.ts` — TypeScript interfaces
- `product-plan/sections/administracion-cumplimiento-interoperabilidad/sample-data.json` — Test data
- `product-plan/sections/administracion-cumplimiento-interoperabilidad/AdminDashboard.png` — Visual reference

## Done When

- [ ] Admin panel renders at `/staff/admin` inside the staff shell
- [ ] Route is protected: only accessible to `role === 'medico'`
- [ ] Dashboard metric cards show real counts from the backend
- [ ] Users table shows all staff with role and status
- [ ] Toggle user status calls `onToggleUserStatus`
- [ ] Audit log renders with no edit/delete actions
- [ ] Audit log filters work (user, action, date range)
- [ ] FHIR individual export calls `onExportFhir` and shows status
- [ ] ARCO requests list with status update action
- [ ] Privacy policy download calls `onDownloadPrivacyPolicy`
- [ ] Responsive on mobile

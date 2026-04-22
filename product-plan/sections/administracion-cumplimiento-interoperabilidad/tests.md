# Test Specs: Administración, Cumplimiento e Interoperabilidad

These test specs are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

Admin panel accessible only to the doctor role. Covers user management, immutable audit log, FHIR export, privacy policy, and ARCO rights requests. Tab-based navigation between all sub-sections.

---

## User Flow Tests

### Flow 1: Admin Views Dashboard and Switches Tabs

**Scenario:** Admin opens the panel and navigates between tabs.

**Setup:**
- Dashboard metrics populated: active users, recent accesses, FHIR exports, pending ARCO requests

**Steps:**
1. Admin opens the administration section
2. Admin sees the dashboard with metric cards
3. Admin clicks the "Usuarios" tab
4. Admin sees the user management table
5. Admin clicks the "Bitácora" tab
6. Admin sees the audit log table

**Expected Results:**
- [ ] Dashboard shows metric cards for: usuarios activos, accesos últimas 24h, exportaciones FHIR, solicitudes ARCO pendientes
- [ ] "Usuarios" tab shows a table with name, role, status, last access
- [ ] "Bitácora" tab shows action, user, resource, timestamp, IP columns
- [ ] Switching tabs does not lose state in other tabs

---

### Flow 2: Admin Deactivates a User

**Scenario:** Admin disables a receptionist account.

**Setup:**
- `users` has a user with `status: "activo"` and role `recepcionista`

**Steps:**
1. Admin navigates to "Usuarios" tab
2. Admin finds "María Rodríguez" (recepcionista)
3. Admin clicks "Desactivar"
4. `onToggleUserStatus("usr-002")` is called

**Expected Results:**
- [ ] `onToggleUserStatus` is called with the user ID
- [ ] User row shows updated status visually

---

### Flow 3: Admin Edits a User's Role

**Scenario:** Admin changes a user's role from enfermera to recepcionista.

**Steps:**
1. Admin clicks "Editar" on a user row
2. `onEditUser(userId)` is called

**Expected Results:**
- [ ] `onEditUser` is called with the user ID
- [ ] Edit action is visible for all users in the table

---

### Flow 4: Admin Filters the Audit Log

**Scenario:** Admin filters the audit log to find accesses by a specific user.

**Setup:**
- `auditLogs` has 20+ entries with varied users and actions

**Steps:**
1. Admin opens "Bitácora" tab
2. Admin sees all audit entries
3. Admin filters by user "Dr. Viveros"
4. Admin filters by action "acceso"

**Expected Results:**
- [ ] Log filters to show only entries matching the filters
- [ ] No edit or delete buttons are visible on any log entry (immutable)

---

### Flow 5: Admin Requests FHIR Export for a Patient

**Scenario:** Admin exports a single patient's expediente in FHIR format.

**Steps:**
1. Admin opens "Exportación FHIR" tab
2. Admin searches for patient "Carlos García"
3. Admin clicks "Exportar FHIR"
4. `onExportFhir("pat-001")` is called

**Expected Results:**
- [ ] `onExportFhir` is called with the patient ID
- [ ] Status indicator shows "en-proceso" or "completado"

---

### Flow 6: Admin Updates an ARCO Request Status

**Scenario:** Admin marks an ARCO request as resolved.

**Setup:**
- `arcoRequests` has a request with `status: "pendiente"`

**Steps:**
1. Admin opens "Privacidad y ARCO" tab
2. Admin sees pending ARCO request from "Ana Martínez" (type: "acceso")
3. Admin clicks "Marcar como resuelta"
4. `onUpdateArcoStatus("arco-001", "resuelta")` is called

**Expected Results:**
- [ ] `onUpdateArcoStatus` is called with ID and new status
- [ ] ARCO request shows updated status badge

---

## Empty State Tests

### No Pending ARCO Requests

**Setup:**
- `arcoRequests` is `[]` or all requests are resolved

**Expected Results:**
- [ ] ARCO section shows "No hay solicitudes pendientes" (or similar)
- [ ] Section renders without error

### No Audit Log Entries

**Setup:**
- `auditLogs` is `[]`

**Expected Results:**
- [ ] Bitácora shows empty state message
- [ ] Table headers are still visible

### No Users

**Setup:**
- `users` is `[]`

**Expected Results:**
- [ ] Users section shows empty state
- [ ] No errors thrown

---

## Component Interaction Tests

### Dashboard Metrics

- [ ] Shows correct count for active users
- [ ] Shows correct count for pending ARCO requests
- [ ] Compliance badges render: "NOM-024-SSA3", "LFPDPPP", "NOM-035"
- [ ] "e.firma SAT — Próximamente" card is visible but has no interactive action

### User Table

- [ ] User roles show as: Médico, Enfermera, Recepcionista
- [ ] Active users show green status badge; inactive show gray
- [ ] `lastAccess` is formatted as readable date

### Audit Log Table

- [ ] AuditAction types render in Spanish: acceso, creación, modificación, eliminación, firma, exportación-fhir
- [ ] IP address is visible per entry
- [ ] No edit/delete/update buttons are visible anywhere in the log

### FHIR Export

- [ ] Export status shows "en-proceso" (spinner/loading), "completado" (green), or "error" (red)
- [ ] `fileSize` is shown for completed exports
- [ ] Export type ("individual" vs "masiva") is differentiated

---

## Edge Cases

- [ ] Very long IP address renders without overflow
- [ ] Admin with no recent audit log entries sees empty state in dashboard "accesos últimas 24h"
- [ ] FHIR export with `error` status shows an error indicator with retry option
- [ ] ARCO request with `resolvedAt` date shows resolution date
- [ ] Tab navigation state persists when switching back and forth

---

## Accessibility Checks

- [ ] Tab navigation is keyboard accessible
- [ ] Status badges communicate status via text, not only color
- [ ] Table columns have proper `<th>` elements with labels
- [ ] "Desactivar/Activar" toggle communicates state change to screen readers

---

## Sample Test Data

```typescript
const mockUser: SystemUser = {
  id: "usr-001",
  name: "Dr. Alejandro Viveros Domínguez",
  email: "drviverosorl@gmail.com",
  role: "medico",
  status: "activo",
  lastAccess: "2025-06-15T09:00:00Z",
  createdAt: "2024-01-01T00:00:00Z",
}

const mockAuditLog: AuditLog = {
  id: "log-001",
  action: "acceso",
  resource: "Expediente EXP-2024-001",
  userId: "usr-001",
  userName: "Dr. Alejandro Viveros Domínguez",
  ipAddress: "192.168.1.1",
  timestamp: "2025-06-15T09:01:00Z",
}

const mockArcoRequest: ArcoRequest = {
  id: "arco-001",
  type: "acceso",
  patientName: "Ana Martínez",
  patientId: "pat-002",
  description: "Solicitud de copia de expediente clínico",
  status: "pendiente",
  submittedAt: "2025-06-10T14:00:00Z",
  resolvedAt: null,
  notes: null,
}

const mockFhirExport: FhirExport = {
  id: "fhir-001",
  type: "individual",
  patientName: "Carlos García Méndez",
  patientId: "pat-001",
  requestedBy: "Dr. Alejandro Viveros Domínguez",
  status: "completado",
  fileSize: "45 KB",
  requestedAt: "2025-06-15T08:00:00Z",
  completedAt: "2025-06-15T08:01:00Z",
}
```

# Application Shell

## Overview

Dos shells independientes para la plataforma del Dr. Alejandro Viveros Domínguez (ORL):

- **Portal Pacientes** (`variant="patient"`) — navegación horizontal superior para el sitio público
- **Panel Staff** (`variant="staff"`) — barra lateral colapsable para médico, enfermera y recepcionista

Ambos soportan modo claro y oscuro y aplican los tokens de diseño: teal (primario), sky (secundario), slate (neutro).

## Navigation Structure

### Portal Pacientes (Top Navigation)
| Label | Route |
|-------|-------|
| Inicio | `/` |
| Servicios | `/servicios` |
| **Agendar Cita** (CTA teal) | `/agendar` |
| Legal (dropdown) | `/legal` |

### Panel Staff (Sidebar)
| Label | Route | Roles |
|-------|-------|-------|
| Agenda de Citas | `/staff/agenda` | todos |
| Expediente Clínico | `/staff/ehr` | médico, enfermera |
| Notas, Recetas y Consentimientos | `/staff/notas` | médico |
| Administración | `/staff/admin` | médico |

## Components Provided

- `AppShell.tsx` — Wrapper principal; acepta `variant="patient"` o `variant="staff"`
- `PatientShell.tsx` — Implementación de la navegación superior para pacientes
- `StaffShell.tsx` — Implementación del sidebar colapsable para staff

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onNavigate(href)` | User clicks any navigation link |
| `onLogout()` | User clicks logout from user menu |

## Shell Variants

### Patient Shell Props
- `navigationItems` — Array of `{ label, href, isActive? }`
- `legalItems` — Array of `{ label, href }` for the Legal dropdown
- `patientUser` — `{ name, avatarUrl? }` or `null` for logged-out state

### Staff Shell Props
- `staffNavItems` — Array of `{ id, label, href, icon, isActive?, roles? }`
- `staffUser` — `{ name, role: 'medico' | 'enfermera' | 'recepcionista', avatarUrl? }`

## Design Notes

- Active nav item in staff shell: `bg-teal-50 dark:bg-teal-950 text-teal-700 border-l-2 border-teal-600`
- Staff sidebar: `w-56` expanded, `w-16` collapsed (icons only)
- Staff role badge visible in sidebar user panel
- Patient header: sticky, white/slate-950 background, slate-200/slate-800 border

## Visual Reference

See `screenshot.png` if available for the target design.

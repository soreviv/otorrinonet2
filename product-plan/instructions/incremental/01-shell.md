# Milestone 1: Shell

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

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

Set up the design tokens and application shell — the persistent chrome that wraps all staff sections of the platform.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Color palette:** teal (primary), sky (secondary), slate (neutral)
**Typography:** DM Sans (headings/nav labels), Inter (body/UI copy), IBM Plex Mono (codes/timestamps)

### 2. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main shell wrapper; accepts `variant="patient"` or `variant="staff"`
- `PatientShell.tsx` — Top navigation for the public patient portal
- `StaffShell.tsx` — Collapsible sidebar for medical staff

**Wire Up Patient Navigation (`variant="patient"`):**

Connect navigation to your routing:

| Label | Route |
|-------|-------|
| Inicio | `/` |
| Servicios | `/servicios` |
| Agendar Cita (CTA) | `/agendar` |
| Legal | `/legal` |

**Wire Up Staff Navigation (`variant="staff"`):**

| Label | Route | Visible to |
|-------|-------|------------|
| Agenda de Citas | `/staff/agenda` | todos |
| Expediente Clínico | `/staff/ehr` | médico, enfermera |
| Notas, Recetas y Consentimientos | `/staff/notas` | médico |
| Administración | `/staff/admin` | médico |

**User Menu:**

- Patient shell: avatar in top-right → dropdown with "Mis Citas" and "Cerrar sesión"
- Staff shell: fixed panel at the bottom of the sidebar with name, role badge, and logout button

**Staff Role:**

`StaffRole` is `'medico' | 'enfermera' | 'recepcionista'`. Pass the current user's role via `staffUser.role` to control which nav items appear.

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens are configured (colors, typography, Tailwind)
- [ ] Google Fonts are loaded (DM Sans, Inter, IBM Plex Mono)
- [ ] Patient shell renders with navigation links
- [ ] Staff shell renders with sidebar navigation and role badge
- [ ] Active page is visually indicated in both shells
- [ ] User menu shows user name and logout action
- [ ] Staff sidebar collapses to icon-only mode (w-56 → w-16)
- [ ] Responsive on mobile (drawer overlay for staff, hamburger for patient)
- [ ] Light and dark mode work correctly

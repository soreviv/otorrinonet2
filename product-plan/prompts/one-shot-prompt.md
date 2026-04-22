# One-Shot Implementation Prompt

Use this prompt with your coding agent (Claude, Cursor, Copilot, etc.) to implement the full platform in a single session.

---

## Prompt

```
I'm handing you a complete UI design package for a medical platform called "Dr. Alejandro Viveros ORL". 
The package contains finished React components, TypeScript types, sample data, design tokens, and test specs.

Your job is to integrate these designs into a working application.

## What's provided

- `product-plan/product-overview.md` — Full product description and implementation sequence
- `product-plan/instructions/one-shot-instructions.md` — Complete implementation guide for all milestones
- `product-plan/design-system/` — Tailwind colors, fonts, CSS tokens
- `product-plan/data-shapes/overview.ts` — All TypeScript entity types
- `product-plan/shell/components/` — Application shell (patient nav + staff sidebar)
- `product-plan/sections/[section]/components/` — UI components for each section
- `product-plan/sections/[section]/types.ts` — TypeScript interfaces per section
- `product-plan/sections/[section]/sample-data.json` — Test data per section
- `product-plan/sections/[section]/tests.md` — UI behavior test specs per section
- `product-plan/sections/[section]/*.png` — Visual reference screenshots

## Instructions

Please read `product-plan/instructions/one-shot-instructions.md` and implement the full platform milestone by milestone:

1. Shell (design tokens + AppShell)
2. Sitio Público (5 standalone public pages)
3. Agenda de Citas (booking form + receptionist calendar)
4. Expediente Clínico (NOM-004-SSA3 EHR)
5. Notas, Recetas y Consentimientos (clinical documents with digital signatures)
6. Administración (user management, audit log, FHIR export, ARCO compliance)

For each milestone:
- Copy the provided components into your project
- Wire up callback props to real routing and business logic
- Replace sample data with real backend data
- Implement loading, error, and empty states
- Write tests based on the test specs in `tests.md`

Start with Milestone 1 (Shell). Confirm when each milestone is complete before moving to the next.
```

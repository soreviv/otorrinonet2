# Section-by-Section Prompt Template

Use this template to implement one milestone at a time. Replace `[MILESTONE_NUMBER]` and `[SECTION_NAME]` with the specific milestone you're implementing.

---

## Prompt Template

```
I'm handing you a UI design handoff for Milestone [MILESTONE_NUMBER]: [SECTION_NAME] of the Dr. Alejandro Viveros ORL medical platform.

## Context

Read `product-plan/product-overview.md` first to understand the full product. This milestone assumes:
- Milestone 1 (Shell) is already complete
- Previous milestones are complete (if applicable)

## What's provided for this milestone

- `product-plan/instructions/incremental/[NN]-[section-id].md` — Implementation guide for this milestone
- `product-plan/sections/[section-id]/components/` — Finished React components
- `product-plan/sections/[section-id]/types.ts` — TypeScript interfaces
- `product-plan/sections/[section-id]/sample-data.json` — Realistic test data
- `product-plan/sections/[section-id]/tests.md` — UI behavior test specs
- `product-plan/sections/[section-id]/*.png` — Visual reference screenshots

## Instructions

1. Read the milestone instruction file at `product-plan/instructions/incremental/[NN]-[section-id].md`
2. Copy components from `product-plan/sections/[section-id]/components/` into your project
3. Wire up callback props to your routing and business logic
4. Replace sample data with real backend data
5. Implement loading, error, and empty states
6. Write tests based on `product-plan/sections/[section-id]/tests.md`
7. Verify the "Done When" checklist at the end of the instruction file

The components are props-based — they receive data and fire callbacks. How you architect the backend is up to you.
```

---

## Available Milestones

| # | File | Section |
|---|------|---------|
| 1 | `instructions/incremental/01-shell.md` | Shell (design tokens + AppShell) |
| 2 | `instructions/incremental/02-sitio-publico.md` | Sitio Público (5 public pages) |
| 3 | `instructions/incremental/03-agenda-de-citas.md` | Agenda de Citas |
| 4 | `instructions/incremental/04-expediente-clinico.md` | Expediente Clínico (EHR) |
| 5 | `instructions/incremental/05-notas-recetas-consentimientos.md` | Notas, Recetas y Consentimientos |
| 6 | `instructions/incremental/06-administracion.md` | Administración y Cumplimiento |

# Dr. Alejandro Viveros ORL — Handoff Package

This package contains everything needed to implement the Dr. Viveros ORL platform from the finished UI designs.

## Quick Start

1. Read `product-overview.md` to understand the full product
2. Choose your implementation approach:
   - **One-shot:** Use `instructions/one-shot-instructions.md` — all milestones in a single document
   - **Milestone-by-milestone:** Start with `instructions/incremental/01-shell.md` and work through each milestone
3. Reference `design-system/` for colors and typography setup
4. Reference `data-shapes/overview.ts` for all TypeScript entity types
5. Copy components from `sections/[section-id]/components/` into your project

## Package Contents

```
product-plan/
├── README.md                    ← You are here
├── product-overview.md          ← Product summary and implementation sequence
│
├── prompts/
│   ├── one-shot-prompt.md       ← Ready-to-use prompt for full implementation
│   └── section-prompt.md        ← Template for section-by-section prompts
│
├── instructions/
│   ├── one-shot-instructions.md ← All milestones combined
│   └── incremental/
│       ├── 01-shell.md          ← Design tokens + application shell
│       ├── 02-sitio-publico.md  ← Five public pages
│       ├── 03-agenda-de-citas.md ← Appointment booking + calendar
│       ├── 04-expediente-clinico.md ← EHR (NOM-004-SSA3)
│       ├── 05-notas-recetas-consentimientos.md ← Clinical documents
│       └── 06-administracion.md ← Admin + compliance + FHIR
│
├── design-system/
│   ├── tokens.css               ← CSS custom properties
│   ├── tailwind-colors.md       ← Tailwind config guide
│   └── fonts.md                 ← Google Fonts setup
│
├── data-shapes/
│   ├── README.md                ← Entity index
│   └── overview.ts              ← All TypeScript entity types combined
│
├── shell/
│   ├── README.md                ← Shell design intent
│   └── components/              ← AppShell, PatientShell, StaffShell
│
└── sections/
    ├── sitio-publico/           ← 5 public pages (no shell)
    ├── agenda-de-citas/         ← Booking form + calendar
    ├── expediente-clinico/      ← EHR components
    ├── notas-recetas-consentimientos/ ← Clinical documents
    └── administracion-cumplimiento-interoperabilidad/ ← Admin panel
```

Each section folder contains:
- `README.md` — Feature overview and design intent
- `tests.md` — UI behavior test specs (framework-agnostic)
- `components/` — Exportable React components (props-based)
- `types.ts` — TypeScript interfaces
- `sample-data.json` — Realistic test data
- `*.png` — Visual reference screenshots

## Key Conventions

- **Components are props-based** — they accept data and fire callbacks; never import data.json
- **Callbacks are optional** — use optional chaining: `onClick={() => onDelete?.(id)}`
- **Design tokens:** teal (primary), sky (secondary), slate (neutral)
- **Fonts:** DM Sans (headings), Inter (body), IBM Plex Mono (codes/timestamps/IDs)
- **Dark mode:** all components support `dark:` Tailwind variants
- **Shell:** Sitio Público pages are standalone; all staff sections use the staff shell

## Normative Compliance Notes

This platform must comply with:
- **NOM-004-SSA3** — Electronic health record structure (Expediente Clínico section)
- **NOM-024-SSA3** — Healthcare information systems security
- **LFPDPPP** — Mexican personal data protection law (audit log, ARCO requests, privacy policy)
- **HL7-FHIR R4** — Health data interoperability standard (FHIR export)

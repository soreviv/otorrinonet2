---
name: cobros
description: Registro de honorarios y cobros por cita — úsalo al tocar `src/app/actions/cobros.ts`, `CobroPanel.tsx`, o `/staff/cobros`.
---

## Cobros (honorarios)

- Registro manual de honorarios por cita: primera vez $1,100 / subsecuente $1,000 / lavado de oídos $600 / otro (monto libre) — catálogo en `src/lib/cobros-data.ts`.
- Modelo `Cobro` en `prisma/schema.prisma` — relación 1:1 con `Appointment`. Campos `facturado`/`cfdiUid`/`cfdiUuid` lo ligan con la autofactura CFDI (`src/app/actions/autofactura.ts`).
- Server actions en `src/app/actions/cobros.ts`: `registrarCobro()` (upsert por cita — sin historial de ediciones, decisión intencional), `getResumenFinanciero()`, `listarCobros()`.
- UI: `CobroPanel.tsx` embebido en `/staff/agenda` (registro por cita) y vista `/staff/cobros` (resumen financiero, filtros, historial, exportación CSV vía `/api/staff/cobros/export`).
- Sin restricción de rol en las server actions (cualquier sesión de staff puede registrar/consultar cobros); el enlace de nav a `/staff/cobros` solo se oculta a `enfermera`.

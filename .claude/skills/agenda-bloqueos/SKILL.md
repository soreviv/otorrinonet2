---
name: agenda-bloqueos
description: Bloqueo de fechas en la agenda (vacaciones, congresos) — úsalo al tocar `AgendaBlock` o la disponibilidad en `/agendar`.
---

## Agenda — Bloqueo de fechas

- El personal puede bloquear rangos de fechas (vacaciones, congresos, incapacidad) desde `/staff/agenda`.
- Modelo `AgendaBlock` en `prisma/schema.prisma`.
- El formulario público de agendado (`/agendar`) consulta los bloqueos antes de mostrar disponibilidad.

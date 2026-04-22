# Agenda de Citas

## Overview

Módulo de gestión de citas médicas con dos flujos principales: solicitud en línea para pacientes desde el sitio público, y panel de gestión para la recepcionista con calendario, confirmaciones y seguimiento.

## User Flows

- Paciente selecciona servicio, fecha y hora disponible desde el sitio público
- Paciente completa formulario con nombre, teléfono, correo y motivo de consulta
- Paciente acepta el aviso de privacidad (obligatorio antes de enviar)
- Recepcionista visualiza citas del día y próximas en vista de calendario semanal
- Recepcionista confirma o rechaza solicitudes pendientes
- Recepcionista cancela o reprograma citas confirmadas
- Recepcionista busca pacientes por nombre o teléfono
- Recepcionista crea una cita manualmente desde el panel

## Design Decisions

- Booking flow is 3 steps: servicio → fecha/hora → datos del paciente
- Available slots are modeled as `DayAvailability[]` with `TimeSlot[]` per day — the component never computes availability itself
- Actual schedule: Mon/Tue/Wed 16:00–19:00, Thu/Fri 10:00–13:00 (half-hour slots)
- Privacy checkbox is required; submit button is disabled until checked
- Calendar view is weekly; selected day shows appointment details in a side panel
- Appointment status badges: Pendiente (yellow), Confirmada (green), Cancelada (red), Reprogramada (blue)

## Data Shapes

**Entities:** `Appointment`, `AppointmentStatus`, `Service`, `TimeSlot`, `DayOfWeek`, `DayAvailability`, `BookingFormData`

## Visual Reference

See `AppointmentBooking.png` and `AppointmentCalendar.png` for the target UI design.

## Components Provided

- `AppointmentBooking` — 3-step patient booking form with slot selection
- `AppointmentCalendar` — Weekly calendar view for receptionist management

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onSubmit(data)` | Patient completes and submits booking form |
| `onConfirm(id)` | Receptionist confirms a pending appointment |
| `onReject(id)` | Receptionist rejects a pending appointment |
| `onCancel(id)` | Receptionist cancels a confirmed appointment |
| `onReschedule(id)` | Receptionist reschedules an appointment |
| `onSelect(id)` | Receptionist clicks an appointment to view detail |
| `onCreate()` | Receptionist initiates manual appointment creation |
| `onSearch(query)` | Receptionist types in the search box |

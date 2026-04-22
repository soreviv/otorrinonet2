# Milestone 3: Agenda de Citas

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1 (Shell) and 2 (Sitio Público) complete

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

Implement appointment management: a 3-step patient booking form and a weekly calendar for receptionist management.

## Overview

Two views for two audiences: patients book appointments from the public site, while the receptionist manages them from the staff panel. The booking flow steps through service selection → date/time slot selection → patient data. The calendar view shows appointments by week with status badges and a side detail panel.

**Key Functionality:**
- 3-step patient booking form with slot availability display
- Privacy checkbox required before submission
- Receptionist weekly calendar view
- Appointment status management: confirm, reject, cancel, reschedule
- Manual appointment creation from the staff panel
- Patient search by name or phone

## Components Provided

Copy from `product-plan/sections/agenda-de-citas/components/`:

- `AppointmentBooking` — 3-step patient booking form with slot selection
- `AppointmentCalendar` — Weekly calendar view for receptionist management
- `index.ts` — Clean export

## Props Reference

**Key types:**

```typescript
type AppointmentStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'reprogramada'
type DayOfWeek = 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes'

interface Service { id, name, duration, description }
interface TimeSlot { time: string; available: boolean }
interface DayAvailability { date: string; dayOfWeek: DayOfWeek; slots: TimeSlot[] }
interface Appointment { id, patientName, phone, email, serviceId, serviceName, date, time, reason, status, privacyAccepted, createdAt }
```

**AppointmentBooking callback:**

| Callback | Triggered When |
|----------|---------------|
| `onSubmit(data)` | Patient submits completed booking form |

**AppointmentCalendar callbacks:**

| Callback | Triggered When |
|----------|---------------|
| `onConfirm(id)` | Receptionist confirms a pending appointment |
| `onReject(id)` | Receptionist rejects a pending appointment |
| `onCancel(id)` | Receptionist cancels a confirmed appointment |
| `onReschedule(id)` | Receptionist reschedules an appointment |
| `onSelect(id)` | Receptionist clicks an appointment for detail |
| `onCreate()` | Receptionist initiates manual creation |
| `onSearch(query)` | Receptionist types in the search box |

## Expected User Flows

### Flow 1: Patient Books an Appointment

1. Patient clicks "Agendar Cita" from the public site
2. Patient selects a service (e.g., "Consulta ORL General")
3. Patient selects an available date and time slot
4. Patient fills in name, phone, email, and reason for visit
5. Patient checks the privacy acceptance checkbox
6. Patient clicks "Confirmar cita"
7. **Outcome:** `onSubmit` is called; confirmation screen appears; patient receives email

### Flow 2: Receptionist Confirms a Pending Appointment

1. Receptionist opens the staff calendar at `/staff/agenda`
2. Receptionist sees pending appointments highlighted
3. Receptionist clicks a pending appointment to see details
4. Receptionist clicks "Confirmar"
5. **Outcome:** `onConfirm(id)` called; appointment status updates to "confirmada"

### Flow 3: Receptionist Creates a Manual Appointment

1. Receptionist clicks "Nueva Cita" in the calendar view
2. **Outcome:** `onCreate` is called; create form opens

## Important Backend Notes

- `availableSlots` must be computed server-side based on the doctor's schedule (Mon/Tue/Wed 16:00–19:00, Thu/Fri 10:00–13:00 in 30-min increments) minus already-booked appointments
- The component never computes availability — it only displays `TimeSlot[]` per day
- After `onSubmit`, send a confirmation email to the patient with confirm/cancel/reschedule links

## Empty States

- Calendar with no appointments: show empty week grid with "Nueva Cita" button
- Booking with no available slots: show message and suggest another week

## Testing

See `product-plan/sections/agenda-de-citas/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/agenda-de-citas/README.md` — Feature overview
- `product-plan/sections/agenda-de-citas/tests.md` — UI behavior test specs
- `product-plan/sections/agenda-de-citas/components/` — React components
- `product-plan/sections/agenda-de-citas/types.ts` — TypeScript interfaces
- `product-plan/sections/agenda-de-citas/sample-data.json` — Test data
- `product-plan/sections/agenda-de-citas/AppointmentBooking.png` — Visual reference
- `product-plan/sections/agenda-de-citas/AppointmentCalendar.png` — Visual reference

## Done When

- [ ] Patient booking form renders at `/agendar` (or embedded in public site)
- [ ] 3-step flow: service → slot → patient data works correctly
- [ ] Privacy checkbox required; form won't submit without it
- [ ] Available and unavailable slots are visually distinguished
- [ ] `onSubmit` is called with complete `BookingFormData`
- [ ] Staff calendar renders at `/staff/agenda` inside the staff shell
- [ ] Appointment status badges render in correct colors
- [ ] Confirm, reject, cancel, reschedule actions work
- [ ] Search filters appointments in real time
- [ ] Responsive on mobile

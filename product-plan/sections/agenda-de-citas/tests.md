# Test Specs: Agenda de Citas

These test specs are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

Two views: a 3-step patient booking form, and a weekly calendar for receptionist management. Key functionality: slot selection, form validation with privacy checkbox, and appointment status management.

---

## User Flow Tests

### Flow 1: Patient Books an Appointment — Success Path

**Scenario:** Patient selects a service, picks an available slot, fills in their data, and submits.

#### Success Path

**Setup:**
- `services` has at least 1 service
- `availableSlots` has at least one `DayAvailability` with `available: true` slots

**Steps:**
1. User sees Step 1: service selection
2. User clicks on "Consulta ORL General"
3. User sees Step 2: date and time selection
4. User clicks on an available date
5. User clicks on an available time slot (e.g., "16:00")
6. User sees Step 3: patient data form
7. User enters name "María López"
8. User enters phone "331-234-5678"
9. User enters email "maria@email.com"
10. User enters reason "Dolor de oído desde hace 3 días"
11. User checks the privacy checkbox
12. User clicks "Confirmar cita"

**Expected Results:**
- [ ] `onSubmit` is called with `{ serviceId: "...", date: "...", time: "16:00", patientName: "María López", phone: "331-234-5678", email: "maria@email.com", reason: "...", privacyAccepted: true }`
- [ ] Confirmation screen appears

#### Failure Path: Privacy Not Accepted

**Steps:**
1. User completes all steps but does NOT check the privacy checkbox
2. User clicks "Confirmar cita"

**Expected Results:**
- [ ] Form is NOT submitted (`onSubmit` is not called)
- [ ] Privacy checkbox shows an error or is highlighted

#### Failure Path: Missing Required Fields

**Steps:**
1. User reaches Step 3 without filling in name
2. User clicks "Confirmar cita"

**Expected Results:**
- [ ] Form is NOT submitted
- [ ] Name field shows a validation error

---

### Flow 2: Receptionist Manages Appointments

**Scenario:** Receptionist views the weekly calendar and manages pending appointments.

**Setup:**
- `appointments` has mix of statuses: pendiente, confirmada, cancelada, reprogramada

**Steps:**
1. Receptionist views the calendar (default current week)
2. Receptionist sees appointments displayed on their scheduled days
3. Receptionist clicks on a "Pendiente" appointment
4. Receptionist clicks "Confirmar"
5. Receptionist searches for "García" in the search box

**Expected Results:**
- [ ] Calendar shows appointments on correct days
- [ ] Clicking appointment calls `onSelect(appointmentId)`
- [ ] Clicking "Confirmar" calls `onConfirm(appointmentId)`
- [ ] Typing "García" calls `onSearch("García")`

---

### Flow 3: Receptionist Creates Manual Appointment

**Scenario:** Receptionist creates an appointment on behalf of a patient.

**Steps:**
1. Receptionist clicks "Nueva Cita" button
2. `onCreate` callback is triggered

**Expected Results:**
- [ ] `onCreate` is called
- [ ] "Nueva Cita" button is visible and accessible

---

## Empty State Tests

### No Appointments in Calendar

**Scenario:** No appointments exist for the current week.

**Setup:**
- `appointments` is `[]`

**Expected Results:**
- [ ] Calendar renders without errors
- [ ] Empty state message or empty calendar grid is shown
- [ ] "Nueva Cita" button is still visible

### No Available Slots

**Scenario:** All time slots are unavailable (e.g., fully booked day).

**Setup:**
- `availableSlots` has one `DayAvailability` with all slots `available: false`

**Expected Results:**
- [ ] Day renders in the slot picker but shows as unavailable or disabled
- [ ] Patient cannot select an unavailable slot
- [ ] User sees a message indicating no availability for that day

### No Services

**Scenario:** Services list is empty.

**Setup:**
- `services` is `[]`

**Expected Results:**
- [ ] Step 1 shows empty state or helpful message
- [ ] Form does not crash

---

## Component Interaction Tests

### AppointmentBooking — Step Navigation

- [ ] Step 1 → Step 2 transition happens when a service is selected
- [ ] Step 2 → Step 3 transition happens when date and time are selected
- [ ] "Atrás" button returns to previous step
- [ ] Selected service name is shown in Step 2 and Step 3 as confirmation

### AppointmentBooking — Slot Display

- [ ] Available slots show with normal styling and are clickable
- [ ] Unavailable slots show as disabled/grayed out and are not clickable
- [ ] Selected slot is visually highlighted

### AppointmentCalendar — Status Badges

- [ ] "Pendiente" appointments show a yellow badge
- [ ] "Confirmada" appointments show a green badge
- [ ] "Cancelada" appointments show a red badge
- [ ] "Reprogramada" appointments show a blue badge

---

## Edge Cases

- [ ] Patient with very long name renders without overflow in the form and calendar
- [ ] Calendar handles week transitions (previous/next week navigation)
- [ ] Booking form preserves data when navigating back between steps
- [ ] When all slots on a day are taken, that day is not selectable in the date picker
- [ ] Privacy checkbox is keyboard accessible

---

## Accessibility Checks

- [ ] Step indicator communicates current step to screen readers
- [ ] Form inputs have associated labels
- [ ] Error messages are linked to their fields via `aria-describedby`
- [ ] Slot buttons have descriptive accessible labels (e.g., "16:00, disponible")
- [ ] Calendar is navigable by keyboard

---

## Sample Test Data

```typescript
const mockService = {
  id: "orl-general",
  name: "Consulta ORL General",
  duration: 30,
  description: "Evaluación completa de oído, nariz y garganta.",
}

const mockSlot: TimeSlot = { time: "16:00", available: true }
const mockUnavailableSlot: TimeSlot = { time: "16:30", available: false }

const mockDayAvailability: DayAvailability = {
  date: "2025-06-09",
  dayOfWeek: "lunes",
  slots: [mockSlot, mockUnavailableSlot, { time: "17:00", available: true }],
}

const mockAppointment: Appointment = {
  id: "apt-001",
  patientName: "María López",
  phone: "331-234-5678",
  email: "maria@email.com",
  serviceId: "orl-general",
  serviceName: "Consulta ORL General",
  date: "2025-06-09",
  time: "16:00",
  reason: "Dolor de oído",
  status: "pendiente",
  privacyAccepted: true,
  createdAt: "2025-06-01T10:00:00Z",
}
```

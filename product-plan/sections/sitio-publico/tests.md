# Test Specs: Sitio Público

These test specs are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

Five standalone public pages for patients visiting Dr. Viveros' website. Key functionality: hero presentation, services listing, Google reviews, location/schedule, and contact form. All pages include a prominent "Agendar Cita" CTA.

---

## User Flow Tests

### Flow 1: View Home Page and Navigate to Profile

**Scenario:** Visitor lands on the home page and navigates to the doctor's profile.

#### Success Path

**Setup:**
- `doctorProfile` populated with full data (name, photo, tagline, shortBio)
- `services` array has 6 services
- `googleReviews` has at least 3 reviews

**Steps:**
1. User navigates to `/`
2. User sees hero section with `doctorProfile.fullName` — e.g., "Dr. Alejandro Viveros Domínguez"
3. User sees `doctorProfile.tagline` and `doctorProfile.shortBio` in the hero
4. User clicks "Ver perfil completo"
5. `onViewAllServices` is called (for navigation to profile)

**Expected Results:**
- [ ] Hero renders doctor's full name
- [ ] Hero renders tagline and short bio
- [ ] Clicking "Ver perfil completo" triggers navigation callback
- [ ] "Agendar Cita" button is visible in the navigation bar

---

### Flow 2: Navigate to Services Page

**Scenario:** Visitor views the services page to learn about specialties.

**Setup:**
- `services` has 6 services with names, icons, and descriptions

**Steps:**
1. User navigates to `/servicios`
2. User sees all 6 service cards
3. User clicks "Agendar consulta" on a service card

**Expected Results:**
- [ ] All 6 services render with name and short description
- [ ] Each card shows a service icon
- [ ] Clicking "Agendar consulta" calls `onBookAppointment`
- [ ] Bottom CTA banner with "Agendar Cita" is visible

---

### Flow 3: Submit Contact Form — Success

**Scenario:** Visitor fills out the contact form and submits it.

**Setup:**
- `contactInfo` populated with phone, email, whatsapp, address, schedule

**Steps:**
1. User navigates to `/contacto`
2. User enters name "Juan García"
3. User enters phone "555-1234"
4. User enters message "Quisiera información sobre consultas"
5. User clicks "Enviar mensaje"

**Expected Results:**
- [ ] Success state renders with "¡Mensaje enviado!" heading
- [ ] `onSubmitContactForm` is called with `{ name: "Juan García", phone: "555-1234", message: "..." }`
- [ ] "Enviar otro mensaje" button appears in the success state

---

### Flow 4: Submit Contact Form — Validation Error

**Scenario:** Visitor tries to submit the form with missing required fields.

**Steps:**
1. User navigates to `/contacto`
2. User enters name but leaves phone AND email empty
3. User enters a message
4. User clicks "Enviar mensaje"

**Expected Results:**
- [ ] Form is NOT submitted (`onSubmitContactForm` is not called)
- [ ] Error message appears indicating phone or email is required
- [ ] Form data is preserved (name and message remain filled in)

---

### Flow 5: Reset Contact Form After Success

**Scenario:** After a successful submission, visitor sends another message.

**Steps:**
1. User successfully submits the contact form (Flow 3)
2. User sees the success state
3. User clicks "Enviar otro mensaje"

**Expected Results:**
- [ ] Form resets to empty state
- [ ] Success state is no longer visible
- [ ] All form fields are cleared

---

## Empty State Tests

### Home Page — No Reviews

**Scenario:** Google reviews array is empty.

**Setup:**
- `googleReviews` is `[]`

**Expected Results:**
- [ ] Reviews section either shows an empty state message or is hidden gracefully
- [ ] Other sections (hero, services, contact info) render normally

### Home Page — No Services

**Scenario:** Services array is empty.

**Setup:**
- `services` is `[]`

**Expected Results:**
- [ ] Services section shows empty state or is hidden gracefully
- [ ] Page does not crash

---

## Component Interaction Tests

### Navigation Bar (all pages)

- [ ] Doctor's name or logo is visible in the navbar
- [ ] All page links are present: Perfil, Servicios, Ubicación, Contacto
- [ ] "Agendar Cita" button calls `onBookAppointment` when clicked
- [ ] Active page is visually indicated in the navbar

### Location Page

- [ ] `contactInfo.address.street` and neighborhood are visible
- [ ] Google Maps iframe is embedded (uses `contactInfo.googleMapsEmbedUrl`)
- [ ] "Cómo llegar" link uses `contactInfo.googleMapsDirectionsUrl`
- [ ] Schedule entries render with day/hours pairs
- [ ] WhatsApp button uses formatted phone (digits only via `whatsapp.replace(/\D/g, '')`)

---

## Edge Cases

- [ ] Long doctor name renders without overflow
- [ ] Long service description text is truncated or wraps gracefully
- [ ] Contact form preserves filled data when a validation error occurs
- [ ] "Agendar Cita" button is accessible and keyboard-focusable on all pages
- [ ] Dark mode: all pages render with correct contrast using `dark:` Tailwind variants

---

## Accessibility Checks

- [ ] All form fields have associated `<label>` elements
- [ ] Contact form error messages are associated with inputs via `aria-describedby`
- [ ] Navigation links are keyboard accessible
- [ ] Images have descriptive `alt` text (doctor photo, service icons)

---

## Sample Test Data

```typescript
const mockDoctorProfile = {
  id: "dr-viveros",
  fullName: "Dr. Alejandro Viveros Domínguez",
  title: "Especialista en ORL y Cirugía de Cabeza y Cuello",
  licenseNumber: "12345678",
  specialtyLicense: "98765432",
  photo: "/images/doctor.jpg",
  tagline: "Especialista en ORL con más de 10 años de experiencia",
  shortBio: "Otorrinolaringólogo certificado, egresado del IMSS.",
  fullBio: "...",
  education: [{ degree: "Especialidad ORL", institution: "IMSS", year: 2012 }],
  certifications: ["Consejo Mexicano de ORL"],
  hospitals: ["Hospital Ángeles"],
  yearsOfExperience: 10,
}

const mockServices = [
  { id: "s1", name: "Consulta ORL General", icon: "stethoscope" as const, shortDescription: "Evaluación completa de oído, nariz y garganta." },
  { id: "s2", name: "Audiología", icon: "ear" as const, shortDescription: "Estudios de audición y adaptación de auxiliares auditivos." },
]

const mockContactInfo = {
  clinicName: "Consultorio Dr. Viveros ORL",
  address: { street: "Av. Juárez 123", neighborhood: "Centro", city: "Guadalajara", state: "Jalisco", postalCode: "44100", country: "México" },
  phone: "33 1234 5678",
  whatsapp: "33 1234 5678",
  email: "drviverosorl@gmail.com",
  schedule: [{ days: "Lunes a Miércoles", hours: "16:00 – 19:00" }, { days: "Jueves y Viernes", hours: "10:00 – 13:00" }],
  googleMapsEmbedUrl: "https://maps.google.com/embed?...",
  googleMapsDirectionsUrl: "https://maps.google.com/...",
}
```

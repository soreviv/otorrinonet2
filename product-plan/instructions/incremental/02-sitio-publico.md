# Milestone 2: Sitio Público

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell) complete

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

Implement the five standalone public pages of the Dr. Viveros ORL website — the patient-facing presence that introduces the doctor, his services, location, and contact info.

## Overview

Five standalone pages (no app shell) for prospective patients visiting the website. Each page has its own navigation bar with links to all pages and a prominent "Agendar Cita" CTA. Content is static/hardcoded from the backend — no patient authentication required.

**Key Functionality:**
- Hero page introducing Dr. Viveros with photo, tagline, and service preview
- Doctor profile page with full bio, education timeline, certifications, and hospital affiliations
- Services page with full descriptions of all ORL specialties
- Location page with Google Maps embed, address, and schedule
- Contact page with validated form (name + phone/email + message)

## Components Provided

Copy from `product-plan/sections/sitio-publico/components/`:

- `HomePage` — Hero, services preview, Google reviews, contact info footer
- `DoctorProfilePage` — Full bio, education timeline, certifications, hospital affiliations
- `ServicesPage` — Service cards grid with booking CTA
- `LocationPage` — Google Maps embed, address, schedule, contact links
- `ContactPage` — Validated contact form with success state
- `ServiceCard` — Used inside ServicesPage
- `ReviewCard` — Used inside HomePage
- `index.ts` — Clean export of all components

## Props Reference

**Data props (see `types.ts` for full definitions):**

```typescript
// Shared data needed by multiple pages:
type DoctorProfile = { id, fullName, title, licenseNumber, specialtyLicense, photo, tagline, shortBio, fullBio, education, certifications, hospitals, yearsOfExperience }
type PublicService = { id, name, icon: ServiceIcon, shortDescription }
type GoogleReview = { id, authorName, authorInitials, rating, text, date, source: 'Google' }
type ContactInfo = { clinicName, address, phone, whatsapp, email, schedule, googleMapsEmbedUrl, googleMapsDirectionsUrl }
```

**Callback props:**

| Callback | Triggered When |
|----------|---------------|
| `onBookAppointment()` | User clicks any "Agendar Cita" button |
| `onViewAllServices()` | User clicks "Ver todos los servicios" on home |
| `onSubmitContactForm(data)` | User submits valid contact form |

## Expected User Flows

### Flow 1: Visit Home and Navigate to Profile

1. User arrives at `/`
2. User sees the hero with doctor photo, name, and tagline
3. User clicks "Ver perfil completo"
4. **Outcome:** User navigates to `/perfil`

### Flow 2: Browse Services

1. User navigates to `/servicios`
2. User sees all ORL service cards with descriptions
3. User clicks "Agendar consulta" on a service card
4. **Outcome:** `onBookAppointment` is called; user is redirected to the booking flow

### Flow 3: Send a Contact Message

1. User navigates to `/contacto`
2. User fills in name, phone (or email), and message
3. User clicks "Enviar mensaje"
4. **Outcome:** `onSubmitContactForm` is called with form data; success state is shown

## Empty States

- If `googleReviews` is empty, the reviews section hides gracefully
- If `services` is empty, the services section hides or shows a placeholder

## Testing

See `product-plan/sections/sitio-publico/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/sitio-publico/README.md` — Feature overview
- `product-plan/sections/sitio-publico/tests.md` — UI behavior test specs
- `product-plan/sections/sitio-publico/components/` — React components
- `product-plan/sections/sitio-publico/types.ts` — TypeScript interfaces
- `product-plan/sections/sitio-publico/sample-data.json` — Test data
- `product-plan/sections/sitio-publico/Home.png` — Visual reference (home)
- `product-plan/sections/sitio-publico/Perfil.png` — Visual reference (profile)

## Done When

- [ ] All 5 pages render with real data at their routes (/, /perfil, /servicios, /ubicacion, /contacto)
- [ ] Navigation bar links between pages correctly
- [ ] "Agendar Cita" CTA routes to the appointment booking flow
- [ ] Contact form validates (name + phone/email required) before calling `onSubmitContactForm`
- [ ] Contact form success state appears after submission
- [ ] Google Maps embed loads on the location page
- [ ] Schedule entries display correctly
- [ ] WhatsApp button opens wa.me link with correct number
- [ ] Responsive on mobile
- [ ] Light and dark mode work correctly

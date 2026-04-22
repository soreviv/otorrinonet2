# Sitio Público

## Overview

Sitio web público del Dr. Alejandro Viveros, orientado a pacientes en México. Presenta al doctor, sus especialidades y servicios ORL, ubicación y horarios, reseñas de Google y un formulario de contacto, organizado en cinco páginas independientes sin app shell.

## User Flows

- Visitante llega al home y ve un hero con la foto y descripción breve del doctor
- Visitante hace clic en "Ver perfil completo" y accede a la página de perfil del doctor
- Visitante navega a Servicios y consulta las especialidades con descripciones detalladas
- Visitante navega a Ubicación y Horarios para conocer la dirección, mapa y horarios de atención
- Visitante ve las reseñas de Google en el home
- Visitante hace clic en "Agendar Cita" desde cualquier página y es redirigido al flujo de agenda
- Visitante navega a Contacto y llena el formulario de preguntas/consultas

## Design Decisions

- Standalone pages (no app shell) — each page has its own nav bar
- Only Spanish content
- WhatsApp CTA is always visible and uses `whatsapp.replace(/\D/g, '')` for the wa.me URL
- `onBookAppointment` callback is the single hook for all "Agendar Cita" actions across pages
- `onSubmitContactForm` fires only on successful client-side form validation (name + phone/email + message required)
- Service cards cycle through teal/sky accent colors by index for visual variety

## Data Shapes

**Entities:** `DoctorProfile`, `EducationEntry`, `PublicService`, `ServiceIcon`, `GoogleReview`, `GoogleRatingSummary`, `ContactInfo`, `ScheduleEntry`

## Visual Reference

See `Home.png` and `Perfil.png` for the target UI design.

## Components Provided

- `HomePage` — Hero, services preview, Google reviews, contact info footer
- `DoctorProfilePage` — Full bio, education timeline, certifications, hospital affiliations
- `ServicesPage` — Full service cards grid with booking CTA
- `LocationPage` — Google Maps embed, address, schedule, contact links
- `ContactPage` — Contact form with validation, sidebar with quick contact links

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onBookAppointment()` | User clicks any "Agendar Cita" button |
| `onViewAllServices()` | User clicks "Ver todos los servicios" on home |
| `onSubmitContactForm(data)` | User submits valid contact form |

// ================================
// Agenda de Citas — Types
// ================================

export type AppointmentStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'reprogramada'

export interface Service {
  id: string
  name: string
  /** Duration in minutes */
  duration: number
  description: string
}

export interface Appointment {
  id: string
  patientName: string
  phone: string
  email: string
  serviceId: string
  serviceName: string
  /** ISO date: YYYY-MM-DD */
  date: string
  /** HH:mm */
  time: string
  reason: string
  status: AppointmentStatus
  privacyAccepted: boolean
  /** ISO timestamp */
  createdAt: string
}

// ================================
// Available Slots
// ================================

export interface TimeSlot {
  /** HH:mm */
  time: string
  available: boolean
}

export type DayOfWeek = 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes'

export interface DayAvailability {
  /** ISO date: YYYY-MM-DD */
  date: string
  dayOfWeek: DayOfWeek
  slots: TimeSlot[]
}

// ================================
// Booking Form — Patient View
// ================================

export interface BookingFormData {
  serviceId: string
  date: string
  time: string
  patientName: string
  phone: string
  email: string
  reason: string
  privacyAccepted: boolean
}

export interface AppointmentBookingProps {
  services: Service[]
  availableSlots: DayAvailability[]
  /** Called when patient completes and submits the booking form */
  onSubmit?: (data: BookingFormData) => void
}

// ================================
// Calendar — Receptionist View
// ================================

export interface AppointmentCalendarProps {
  appointments: Appointment[]
  services: Service[]
  /** Called when receptionist confirms a pending appointment */
  onConfirm?: (appointmentId: string) => void
  /** Called when receptionist rejects/declines a pending appointment */
  onReject?: (appointmentId: string) => void
  /** Called when receptionist cancels a confirmed appointment */
  onCancel?: (appointmentId: string) => void
  /** Called when receptionist reschedules an appointment */
  onReschedule?: (appointmentId: string) => void
  /** Called when receptionist clicks an appointment to view its detail */
  onSelect?: (appointmentId: string) => void
  /** Called when receptionist initiates creating a new appointment manually */
  onCreate?: () => void
  /** Called when receptionist types in the search box */
  onSearch?: (query: string) => void
}

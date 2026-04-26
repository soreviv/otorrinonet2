export type AppointmentStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'reprogramada' | 'completada'

export interface Service {
  id: string
  name: string
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
  date: string
  time: string
  reason: string
  status: AppointmentStatus
  privacyAccepted: boolean
  createdAt: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

export type DayOfWeek = 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes'

export interface DayAvailability {
  date: string
  dayOfWeek: DayOfWeek
  slots: TimeSlot[]
}

export interface BookingFormData {
  date: string
  time: string
  patientName: string
  phone: string
  email: string
  reason: string
  privacyAccepted: boolean
}

export interface AppointmentBookingProps {
  availableSlots?: DayAvailability[]
  onSubmit?: (data: BookingFormData) => void
}

export interface AppointmentCalendarProps {
  appointments: Appointment[]
  services?: Service[]
  onConfirm?: (appointmentId: string) => void
  onReject?: (appointmentId: string) => void
  onCancel?: (appointmentId: string) => void
  onReschedule?: (appointmentId: string) => void
  onSelect?: (appointmentId: string) => void
  onCreate?: () => void
  onSearch?: (query: string) => void
}

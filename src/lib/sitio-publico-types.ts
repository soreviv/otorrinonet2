// ─── Doctor Profile ───────────────────────────────────────────────────────────

export interface EducationEntry {
  degree: string
  institution: string
  year: number
}

export interface DoctorProfile {
  id: string
  fullName: string
  title: string
  licenseNumber: string
  specialtyLicense: string
  photo: string
  photoProfile: string
  tagline: string
  shortBio: string
  fullBio: string
  education: EducationEntry[]
  certifications: string[]
  hospitals: string[]
  yearsOfExperience: number
}

// ─── Services ────────────────────────────────────────────────────────────────

export type ServiceIcon =
  | 'stethoscope'
  | 'ear'
  | 'syringe'
  | 'allergen'
  | 'surgery'
  | 'balance'

export interface Service {
  id: string
  name: string
  icon: ServiceIcon
  shortDescription: string
}

// ─── Google Reviews ───────────────────────────────────────────────────────────

export interface GoogleReview {
  id: string
  authorName: string
  authorInitials: string
  rating: 1 | 2 | 3 | 4 | 5
  text: string
  date: string
  source: 'Google'
}

export interface GoogleRatingSummary {
  averageRating: number
  totalReviews: number
  placeId: string
  googleMapsUrl: string
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export interface ScheduleEntry {
  days: string
  hours: string
}

export interface ContactAddress {
  street: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface ContactInfo {
  clinicName: string
  address: ContactAddress
  phone: string
  whatsapp: string
  email: string
  schedule: ScheduleEntry[]
  googleMapsEmbedUrl: string
  googleMapsDirectionsUrl: string
}

export type ContactFormStatus = 'pending' | 'contacted' | 'resolved'

export interface ContactFormSubmission {
  id: string
  name: string
  phone: string
  email: string
  message: string
  submittedAt: string
  status: ContactFormStatus
}

// ─── Page Props ───────────────────────────────────────────────────────────────

export interface HomePageProps {
  doctorProfile: DoctorProfile
  services: Service[]
  googleReviews: GoogleReview[]
  googleRatingSummary: GoogleRatingSummary
  contactInfo: Pick<ContactInfo, 'phone' | 'whatsapp' | 'email'>
  onViewDoctorProfile?: () => void
  onViewAllServices?: () => void
}

export interface DoctorProfilePageProps {
  doctorProfile: DoctorProfile
}

export interface ServicesPageProps {
  services: Service[]
  doctorProfile: Pick<DoctorProfile, 'fullName' | 'title'>
}

export interface LocationPageProps {
  contactInfo: ContactInfo
}

export interface ContactPageProps {
  contactInfo: ContactInfo
  onSubmitContactForm?: (data: Omit<ContactFormSubmission, 'id' | 'submittedAt' | 'status'>) => void
}

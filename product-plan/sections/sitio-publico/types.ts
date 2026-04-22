// ─── Doctor Profile ───────────────────────────────────────────────────────────

export interface EducationEntry {
  degree: string;
  institution: string;
  year: number;
}

export interface DoctorProfile {
  id: string;
  fullName: string;
  title: string;
  licenseNumber: string;
  specialtyLicense: string;
  photo: string;
  tagline: string;
  shortBio: string;
  fullBio: string;
  education: EducationEntry[];
  certifications: string[];
  hospitals: string[];
  yearsOfExperience: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

export type ServiceIcon =
  | 'stethoscope'
  | 'ear'
  | 'nose'
  | 'allergen'
  | 'surgery'
  | 'balance';

export interface Service {
  id: string;
  name: string;
  icon: ServiceIcon;
  shortDescription: string;
}

// ─── Google Reviews ───────────────────────────────────────────────────────────

export interface GoogleReview {
  id: string;
  authorName: string;
  authorInitials: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string; // ISO date string
  source: 'Google';
}

export interface GoogleRatingSummary {
  averageRating: number;
  totalReviews: number;
  placeId: string;
  googleMapsUrl: string;
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export interface ScheduleEntry {
  days: string;
  hours: string;
}

export interface ContactAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  clinicName: string;
  address: ContactAddress;
  phone: string;
  whatsapp: string;
  email: string;
  schedule: ScheduleEntry[];
  googleMapsEmbedUrl: string;
  googleMapsDirectionsUrl: string;
}

export type ContactFormStatus = 'pending' | 'contacted' | 'resolved';

export interface ContactFormSubmission {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  submittedAt: string; // ISO datetime string
  status: ContactFormStatus;
}

// ─── Page Props ───────────────────────────────────────────────────────────────

export interface HomePageProps {
  doctorProfile: DoctorProfile;
  services: Service[];
  googleReviews: GoogleReview[];
  googleRatingSummary: GoogleRatingSummary;
  contactInfo: Pick<ContactInfo, 'phone' | 'whatsapp' | 'email'>;
  /** Called when the user clicks the "Agendar Cita" CTA */
  onBookAppointment?: () => void;
  /** Called when the user clicks "Ver perfil completo" on the doctor card */
  onViewDoctorProfile?: () => void;
  /** Called when the user clicks "Ver todos los servicios" */
  onViewAllServices?: () => void;
}

export interface DoctorProfilePageProps {
  doctorProfile: DoctorProfile;
  /** Called when the user clicks the "Agendar Cita" CTA */
  onBookAppointment?: () => void;
}

export interface ServicesPageProps {
  services: Service[];
  doctorProfile: Pick<DoctorProfile, 'fullName' | 'title'>;
  /** Called when the user clicks the "Agendar Cita" CTA */
  onBookAppointment?: () => void;
}

export interface LocationPageProps {
  contactInfo: ContactInfo;
  /** Called when the user clicks the "Agendar Cita" CTA */
  onBookAppointment?: () => void;
}

export interface ContactPageProps {
  contactInfo: ContactInfo;
  /** Called when the contact form is submitted with the form data */
  onSubmitContactForm?: (data: Omit<ContactFormSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  /** Called when the user clicks the "Agendar Cita" CTA */
  onBookAppointment?: () => void;
}

export interface SitioPublicoProps {
  home: HomePageProps;
  doctorProfile: DoctorProfilePageProps;
  services: ServicesPageProps;
  location: LocationPageProps;
  contact: ContactPageProps;
}

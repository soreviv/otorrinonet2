import type {
  DoctorProfile,
  Service,
  GoogleReview,
  GoogleRatingSummary,
  ContactInfo,
} from './sitio-publico-types'

export const doctorProfile: DoctorProfile = {
  id: 'dr-viveros',
  fullName: 'Dr. Alejandro Viveros Domínguez',
  title: 'Médico Otorrinolaringólogo',
  licenseNumber: '6277305',
  specialtyLicense: '10148701',
  photo: '/assets/dr-viveros-perfil.jpg',
  tagline:
    'Especialista en Otorrinolaringología y Cirugía de Cabeza y Cuello. Atención humana, ética y de alta calidad con las técnicas más modernas y menos invasivas.',
  shortBio:
    'Otorrinolaringólogo egresado de la Universidad La Salle con especialidad por la UNAM, formado en el Centro Médico Nacional La Raza. Comprometido con la actualización constante y la rápida recuperación de sus pacientes.',
  fullBio:
    'El Dr. Alejandro Viveros Domínguez es Médico Cirujano egresado de la Facultad Mexicana de Medicina de la Universidad La Salle, con especialidad en Otorrinolaringología y Cirugía de Cabeza y Cuello por la UNAM, formado en el Centro Médico Nacional La Raza. Su enfoque se centra en brindar una atención humana, ética y de alta calidad.\n\nComprometido con la actualización constante, utiliza las técnicas más modernas y menos invasivas para asegurar la rápida recuperación de sus pacientes.',
  education: [
    {
      degree: 'Médico Cirujano',
      institution: 'Facultad Mexicana de Medicina — Universidad La Salle',
      year: 2010,
    },
    {
      degree: 'Especialidad en Otorrinolaringología y Cirugía de Cabeza y Cuello',
      institution: 'UNAM — Centro Médico Nacional La Raza',
      year: 2015,
    },
  ],
  certifications: [
    'Miembro de la Sociedad Mexicana de Otorrinolaringología y Cirugía de Cabeza y Cuello',
    'Médico adscrito al IMSS desde 2016',
  ],
  hospitals: [],
  yearsOfExperience: 10,
}

export const services: Service[] = [
  {
    id: 'consulta-orl-general',
    name: 'Consulta ORL General',
    icon: 'stethoscope',
    shortDescription:
      'Diagnóstico y tratamiento de enfermedades del oído, nariz y garganta para todas las edades.',
  },
  {
    id: 'audiologia',
    name: 'Audiología',
    icon: 'ear',
    shortDescription:
      'Evaluación de la audición, diagnóstico de hipoacusia y orientación sobre auxiliares auditivos.',
  },
  {
    id: 'rinologia',
    name: 'Rinología',
    icon: 'nose',
    shortDescription:
      'Atención de enfermedades nasales y sinusales, incluyendo cirugía endoscópica nasal.',
  },
  {
    id: 'rinitis-alergica-inmunoterapia',
    name: 'Rinitis Alérgica e Inmunoterapia',
    icon: 'allergen',
    shortDescription:
      'Diagnóstico de alérgenos y tratamiento con inmunoterapia alergeno-específica personalizada.',
  },
  {
    id: 'cirugia-orl',
    name: 'Cirugía ORL',
    icon: 'surgery',
    shortDescription:
      'Procedimientos quirúrgicos de oído, nariz, garganta y cuello realizados en ambiente hospitalario.',
  },
  {
    id: 'vertigo-equilibrio',
    name: 'Vértigo y Equilibrio',
    icon: 'balance',
    shortDescription:
      'Evaluación y manejo de trastornos vestibulares, vértigo posicional y mareos crónicos.',
  },
]

export const googleReviews: GoogleReview[] = [
  {
    id: 'review-001',
    authorName: 'María Fernanda López',
    authorInitials: 'ML',
    rating: 5,
    text: 'Excelente atención, el Dr. Viveros es muy profesional y tomó el tiempo necesario para explicarme mi diagnóstico con claridad. El tratamiento funcionó perfectamente. ¡Muy recomendado!',
    date: '2026-02-10',
    source: 'Google',
  },
  {
    id: 'review-002',
    authorName: 'Carlos Mendoza',
    authorInitials: 'CM',
    rating: 5,
    text: 'Llevé a mi hijo de 8 años con problema de amígdalas. El doctor fue muy paciente y amable con él. La cirugía salió muy bien y la recuperación fue rápida. Gracias, doctor.',
    date: '2026-01-28',
    source: 'Google',
  },
  {
    id: 'review-003',
    authorName: 'Ana Sofía Ramos',
    authorInitials: 'AR',
    rating: 5,
    text: 'Después de años sufriendo de rinitis alérgica, el Dr. Viveros me indicó inmunoterapia. En seis meses he mejorado notablemente. Por fin puedo respirar bien.',
    date: '2026-01-15',
    source: 'Google',
  },
  {
    id: 'review-004',
    authorName: 'Jorge Herrera',
    authorInitials: 'JH',
    rating: 4,
    text: 'Muy buena consulta. El doctor es puntual y el consultorio está muy limpio y bien equipado. Me explicó todo con detalle. Solo tuve que esperar un poco, pero valió la pena.',
    date: '2025-12-20',
    source: 'Google',
  },
  {
    id: 'review-005',
    authorName: 'Lucía Torres',
    authorInitials: 'LT',
    rating: 5,
    text: 'Llegué con vértigo severo que me impedía trabajar. El diagnóstico fue preciso y en pocas sesiones de rehabilitación ya estaba completamente bien. El trato del doctor y su equipo es de primera.',
    date: '2025-12-05',
    source: 'Google',
  },
  {
    id: 'review-006',
    authorName: 'Roberto Castillo',
    authorInitials: 'RC',
    rating: 5,
    text: 'Llevo años consultando con el Dr. Viveros. Siempre resuelve mis problemas de sinusitis de manera efectiva. Es mi médico de confianza para todo lo relacionado con ORL.',
    date: '2025-11-18',
    source: 'Google',
  },
]

export const googleRatingSummary: GoogleRatingSummary = {
  averageRating: 4.9,
  totalReviews: 127,
  placeId: 'ChIJxxxxxxxxxxxxxxxxx',
  googleMapsUrl: 'https://maps.google.com/?cid=PLACEHOLDER',
}

export const contactInfo: ContactInfo = {
  clinicName: 'Consultorio Dr. Alejandro Viveros Domínguez — ORL',
  address: {
    street: 'Chosica 730',
    neighborhood: 'Col. Lindavista, Gustavo A. Madero',
    city: 'Ciudad de México',
    state: 'CDMX',
    postalCode: '07300',
    country: 'México',
  },
  phone: '',
  whatsapp: '',
  email: 'contacto@otorrinonet.com',
  schedule: [
    { days: 'Lunes a Miércoles', hours: '16:00 – 20:00' },
    { days: 'Jueves y Viernes', hours: '10:00 – 14:00' },
    { days: 'Sábado y Domingo', hours: 'Cerrado' },
  ],
  googleMapsEmbedUrl:
    'https://maps.google.com/maps?q=Chosica+730+Lindavista+Gustavo+A.+Madero+CDMX+07300&output=embed',
  googleMapsDirectionsUrl:
    'https://maps.google.com/?q=Chosica+730+Lindavista+Gustavo+A.+Madero+CDMX+07300',
}

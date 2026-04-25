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
  photoProfile: '/assets/dr-viveros-perfil-2.jpg',
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
    authorName: 'Monica Bautista',
    authorInitials: 'MB',
    rating: 5,
    text: 'Urgentemente necesitaba un otorrino, y por googlemaps encontré al Dr. Alejandro V. Lo recomiendo ampliamente. Muy amable, considerado, me explicó la causa de mi dolencia y nada abusivo en pedirme estudios. Calidad humana de doctor. Lo recomiendo ampliamente.',
    date: '',
    source: 'Google',
  },
  {
    id: 'review-002',
    authorName: 'Yazmin Garcia',
    authorInitials: 'YG',
    rating: 5,
    text: 'Ha sido una experiencia increíble, servicio y atención de primera, ampliamente recomendado, gracias a la atención oportuna varios de mis padecimientos han desaparecido, agradezco infinitamente al doctor Viveros su profesionalismo y calidad humana.',
    date: '',
    source: 'Google',
  },
  {
    id: 'review-003',
    authorName: 'Karen Sandoval',
    authorInitials: 'KS',
    rating: 5,
    text: 'Un excelente doctor. Atendió a mi mamá con mucho profesionalismo, muy amable y explicó todo detalladamente. Le agradezco mucho su atención. Lo recomiendo totalmente.',
    date: '',
    source: 'Google',
  },
  {
    id: 'review-004',
    authorName: 'Alejandra Vázquez',
    authorInitials: 'AV',
    rating: 5,
    text: 'Extraordinaria intervención, muy valiosa la visión sistémica del Doctor Alejandro Viveros, gran atención. Altamente recomendable.',
    date: '',
    source: 'Google',
  },
  {
    id: 'review-005',
    authorName: 'Consuelo Dominguez',
    authorInitials: 'CD',
    rating: 5,
    text: 'Muy buen doctor. Llevé a mi hijo y el diagnóstico muy acertado; el doctor muy paciente y muy amable.',
    date: '',
    source: 'Google',
  },
  {
    id: 'review-006',
    authorName: 'Mijo Leon',
    authorInitials: 'ML',
    rating: 5,
    text: 'Excelente doctor, muy buena atención, súper profesional. Estoy muy agradecido por sus atenciones como médico. Muy recomendable.',
    date: '',
    source: 'Google',
  },
]

export const googleRatingSummary: GoogleRatingSummary = {
  averageRating: 5.0,
  totalReviews: 6,
  placeId: 'ChIJ0R5OAqT5BIYR1jEuvyIO4M4',
  googleMapsUrl: 'https://maps.app.goo.gl/f5hcoJKatHBB8K4i9',
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

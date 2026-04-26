export const CLINIC_CONFIG = {
  doctorName: 'Dr. Alejandro Viveros Domínguez',
  doctorLicense: process.env.DOCTOR_LICENSE ?? '',
  doctorSpecialtyLicense: process.env.DOCTOR_SPECIALTY_LICENSE ?? '',
  doctorUniversity: process.env.DOCTOR_UNIVERSITY ?? '',
  clinicName: 'Clínica ORL Viveros',
  clinicAddress: process.env.CLINIC_ADDRESS ?? '',
  clinicPhone: process.env.CLINIC_PHONE ?? '',
  clinicCofepris: process.env.CLINIC_COFEPRIS,
} as const

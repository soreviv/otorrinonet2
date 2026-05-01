import { prisma } from '@/lib/prisma'

export const CLINIC_CONFIG = {
  doctorName: process.env.DOCTOR_NAME ?? 'Dr. Alejandro Viveros Domínguez',
  doctorLicense: process.env.DOCTOR_LICENSE ?? '',
  doctorSpecialtyLicense: process.env.DOCTOR_SPECIALTY_LICENSE ?? '',
  doctorUniversity: process.env.DOCTOR_UNIVERSITY ?? '',
  doctorUniversityLogoUrl: '' as string,
  clinicName: process.env.CLINIC_NAME ?? 'Clínica ORL Viveros',
  clinicAddress: process.env.CLINIC_ADDRESS ?? '',
  clinicPhone: process.env.CLINIC_PHONE ?? '',
  clinicEmail: process.env.CLINIC_EMAIL ?? '',
  clinicLogoUrl: '' as string,
  clinicCofepris: process.env.CLINIC_COFEPRIS ?? undefined,
}

export async function getClinicConfigFromDB(): Promise<typeof CLINIC_CONFIG> {
  try {
    const cfg = await prisma.clinicConfig.findUnique({ where: { id: 'singleton' } })
    if (!cfg) return CLINIC_CONFIG
    return {
      doctorName: cfg.doctorName || CLINIC_CONFIG.doctorName,
      doctorLicense: cfg.doctorLicense || CLINIC_CONFIG.doctorLicense,
      doctorSpecialtyLicense: cfg.doctorSpecialtyLicense || CLINIC_CONFIG.doctorSpecialtyLicense,
      doctorUniversity: cfg.doctorUniversity || CLINIC_CONFIG.doctorUniversity,
      doctorUniversityLogoUrl: cfg.doctorUniversityLogoUrl || '',
      clinicName: cfg.clinicName || CLINIC_CONFIG.clinicName,
      clinicAddress: cfg.clinicAddress || CLINIC_CONFIG.clinicAddress,
      clinicPhone: cfg.clinicPhone || CLINIC_CONFIG.clinicPhone,
      clinicEmail: cfg.clinicEmail || CLINIC_CONFIG.clinicEmail,
      clinicLogoUrl: cfg.clinicLogoUrl || '',
      clinicCofepris: cfg.clinicCofepris || CLINIC_CONFIG.clinicCofepris,
    }
  } catch {
    return CLINIC_CONFIG
  }
}

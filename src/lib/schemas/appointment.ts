import { z } from 'zod'

export const PatientFormSchema = z.object({
  patientNombre: z.string().min(2, 'Ingrese su nombre'),
  patientApellidoPaterno: z.string().min(2, 'Ingrese su primer apellido'),
  patientApellidoMaterno: z.string().optional().default(''),
  phone: z.string().min(8, 'Teléfono inválido').max(20, 'Teléfono demasiado largo'),
  email: z.string().email('Correo electrónico inválido'),
  reason: z.string().min(5, 'Describa brevemente su motivo de consulta'),
  privacyAccepted: z
    .boolean()
    .refine((v) => v === true, { message: 'Debe aceptar el aviso de privacidad' }),
})

export const DateTimeSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Seleccione una fecha válida'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Seleccione un horario'),
})

export type PatientFormData = z.infer<typeof PatientFormSchema>
export type DateTimeData = z.infer<typeof DateTimeSchema>

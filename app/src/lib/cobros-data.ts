export const TIPOS_CONSULTA = [
  { value: 'primera_vez',  label: 'Primera vez',    monto: 110000 },
  { value: 'subsecuente',  label: 'Subsecuente',     monto: 100000 },
  { value: 'lavado_oidos', label: 'Lavado de oídos', monto:  60000 },
  { value: 'otro',         label: 'Otro',            monto:       0 },
] as const

export type TipoConsulta = typeof TIPOS_CONSULTA[number]['value']
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'

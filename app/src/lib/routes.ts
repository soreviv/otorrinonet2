export const ROUTES = {
  home: '/',
  services: '/servicios',
  profile: '/perfil',
  contact: '/contacto',
  location: '/ubicacion',
  vaccines: '/vacunacion',
  book: '/agendar',
  legal: {
    index: '/legal',
    privacy: '/legal/privacidad',
    cookies: '/legal/cookies',
  },
  staff: {
    root: '/staff',
    agenda: '/staff/agenda',
    ehr: '/staff/ehr',
    notas: '/staff/notas',
    admin: '/staff/admin',
    config: '/staff/configuracion',
  },
  login: '/login',
  setup2fa: '/login/setup-2fa',
  verify2fa: '/login/verify-2fa',
} as const

export type AppRoute =
  | typeof ROUTES.home
  | typeof ROUTES.services
  | typeof ROUTES.profile
  | typeof ROUTES.contact
  | typeof ROUTES.location
  | typeof ROUTES.vaccines
  | typeof ROUTES.book
  | typeof ROUTES.legal[keyof typeof ROUTES.legal]
  | typeof ROUTES.staff[keyof typeof ROUTES.staff]
  | typeof ROUTES.login
  | typeof ROUTES.setup2fa
  | typeof ROUTES.verify2fa

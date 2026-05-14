import { loadStripe } from '@stripe/stripe-js'

const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

// Singleton para no crear múltiples instancias al re-renderizar
export const stripePromise = loadStripe(key)

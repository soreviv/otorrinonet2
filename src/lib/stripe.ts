import 'server-only'
import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY no está configurado')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-08-26.dahlia',
      typescript: true,
    })
  }
  return _stripe
}

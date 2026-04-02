import Stripe from 'stripe'
import { env } from './env.js'

export const stripe = env.STRIPE_SECRET_KEY 
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    })
  : null

export const STRIPE_PLANS = {
  MONTHLY: {
    name: 'Monthly Premium',
    price: Number(env.MONTHLY_SUBSCRIPTION_PRICE) || 9.99,
    interval: 'month' as const,
  },
  YEARLY: {
    name: 'Yearly Premium',
    price: Number(env.YEARLY_SUBSCRIPTION_PRICE) || 99.99,
    interval: 'year' as const,
  },
}

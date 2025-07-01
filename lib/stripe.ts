import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PLANS = {
  free: {
    name: 'Free',
    features: [
      'Basic exercise tracking',
      'Limited AI analysis',
      'Community support',
    ],
    priceId: process.env.STRIPE_FREE_PLAN_ID || 'price_free',
  },
  pro: {
    name: 'Pro',
    features: [
      'Advanced exercise tracking',
      'Unlimited AI analysis',
      'Priority support',
      'Video consultations',
      'Custom workout plans',
    ],
    priceId: process.env.STRIPE_PRO_PLAN_ID || 'price_pro',
  },
  enterprise: {
    name: 'Enterprise',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom integrations',
      'SLA 99.9% uptime',
      'Team management',
    ],
    priceId: process.env.STRIPE_ENTERPRISE_PLAN_ID || 'price_enterprise',
  },
}

export async function createStripeCustomer(params: {
  email: string
  name?: string
  userId: string
}) {
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      userId: params.userId,
    },
  })

  return customer
}

export async function createCheckoutSession(params: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  trialDays?: number
}) {
  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    ...(params.trialDays && {
      subscription_data: {
        trial_period_days: params.trialDays,
      },
    }),
    allow_promotion_codes: true,
  })

  return session
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

export async function reactivateSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'always_invoice',
  })
}

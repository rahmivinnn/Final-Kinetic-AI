import Stripe from 'stripe'
import { prisma } from './db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function createStripeCustomer(email: string, name?: string) {
  return stripe.customers.create({
    email,
    name,
  })
}

export async function getStripeCustomer(customerId: string) {
  return stripe.customers.retrieve(customerId)
}

export async function createStripeSubscription(
  customerId: string,
  priceId: string,
  paymentMethodId?: string
) {
  if (paymentMethodId) {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })
  }

  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    expand: ['latest_invoice.payment_intent'],
    trial_period_days: 7,
  })
}

export async function cancelStripeSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

export async function updateSubscriptionInDatabase(
  subscription: Stripe.Subscription
) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    throw new Error('User not found for this subscription')
  }

  return prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status: subscription.status.toUpperCase(),
      planId: subscription.items.data[0].price.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    },
    create: {
      userId: user.id,
      status: subscription.status.toUpperCase(),
      planId: subscription.items.data[0].price.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      stripeSubscriptionId: subscription.id,
    },
  })
}

export async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  previousAttributes?: { status?: string }
) {
  // Only process if the status has changed
  if (
    previousAttributes?.status &&
    previousAttributes.status === subscription.status
  ) {
    return
  }

  await updateSubscriptionInDatabase(subscription)
}

export async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
) {
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  )
  await updateSubscriptionInDatabase(subscription)
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
      cancelAtPeriodEnd: true,
    },
  })
}

export async function getActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ['ACTIVE', 'TRIALING', 'PAST_DUE'],
      },
    },
    orderBy: {
      currentPeriodEnd: 'desc',
    },
  })
}

export async function isUserSubscribed(userId: string) {
  const subscription = await getActiveSubscription(userId)
  return !!subscription && !subscription.cancelAtPeriodEnd
}

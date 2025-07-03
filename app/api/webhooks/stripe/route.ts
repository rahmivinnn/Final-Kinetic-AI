import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

// Type-safe Stripe subscription with required properties
type StripeSubscription = Stripe.Subscription & {
  current_period_end: number;
  cancel_at_period_end: boolean;
  customer: string | Stripe.Customer;
};

// Type-safe Stripe invoice with optional subscription
type StripeInvoice = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription;
  customer?: string | Stripe.Customer;
};

// Type for user with subscription fields
interface UserWithSubscription {
  id: string;
  stripeCustomerId: string | null;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: Date | null;
}

// Helper to safely initialize Stripe
const getStripe = () => {
  // Only initialize in production or if environment variables are set
  if (process.env.NODE_ENV !== 'production' && 
      (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)) {
    console.warn('Stripe environment variables not configured - running in safe mode')
    return { stripe: null, webhookSecret: null }
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!stripeKey || !webhookSecret) {
    console.warn('Stripe environment variables not configured')
    return { stripe: null, webhookSecret: null }
  }

  try {
    return {
      stripe: new Stripe(stripeKey, {
        apiVersion: '2023-10-16' as any, // Using 'as any' to bypass version check
        typescript: true,
      }),
      webhookSecret
    }
  } catch (error) {
    console.error('Failed to initialize Stripe:', error)
    return { stripe: null, webhookSecret: null }
  }
}

// Initialize Stripe only when needed
const { stripe, webhookSecret } = getStripe()

export async function POST(req: NextRequest) {
  // Early return if Stripe is not initialized
  if (!stripe || !webhookSecret) {
    console.warn('Stripe is not properly configured. Webhook handler is inactive.')
    return NextResponse.json(
      { 
        error: 'Webhook handler is not configured',
        message: 'Stripe environment variables are not set or invalid'
      },
      { status: 501 } // 501 Not Implemented is more appropriate for missing configuration
    )
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature found', { status: 400 })
  }

  let event: Stripe.Event

  try {
    if (!stripe || !webhookSecret) {
      throw new Error('Stripe is not properly configured')
    }
    
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    ) as Stripe.Event
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error(`Webhook signature verification failed: ${errorMessage}`)
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.updated':
        const subscription = event.data.object as StripeSubscription
        await handleSubscriptionUpdated(subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as StripeSubscription)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as StripeInvoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as StripeInvoice)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new Response('Webhook handler failed', { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (!session.subscription || !session.customer) return

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  )

  await updateSubscriptionInDatabase(subscription)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    await updateSubscriptionInDatabase({
      ...subscription,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      customer: subscription.customer
    } as StripeSubscription)
  } catch (error) {
    console.error('Error updating subscription:', error)
    // Don't re-throw to prevent webhook retries for non-critical errors
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
      cancelAtPeriodEnd: true,
    },
  })
}

async function handleInvoicePaymentSucceeded(invoice: StripeInvoice) {
  if (!stripe) {
    console.error('Stripe is not initialized')
    return
  }

  try {
    if (typeof invoice.subscription === 'string') {
      // Handle the case where subscription is just an ID
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
      await updateSubscriptionInDatabase({
        ...subscription,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        customer: subscription.customer
      } as StripeSubscription)
    } else if (invoice.subscription) {
      // Handle the case where subscription is an expanded object
      const sub = invoice.subscription
      await updateSubscriptionInDatabase({
        ...sub,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        customer: sub.customer
      } as StripeSubscription)
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: StripeInvoice) {
  if (!stripe) {
    console.error('Stripe is not initialized')
    return
  }

  try {
    // Handle subscription update if present
    if (invoice.subscription) {
      if (typeof invoice.subscription === 'string') {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
        await updateSubscriptionInDatabase({
          ...subscription,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          customer: subscription.customer
        } as StripeSubscription)
      } else {
        const sub = invoice.subscription
        await updateSubscriptionInDatabase({
          ...sub,
          current_period_end: sub.current_period_end,
          cancel_at_period_end: sub.cancel_at_period_end,
          customer: sub.customer
        } as StripeSubscription)
      }
    }

    // Notify user of payment failure
    if (invoice.customer) {
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id
      
      if (customerId) {
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId } as any,
        })

        if (user) {
          // In a real app, you would send an email or notification here
          console.log(`Payment failed for user ${user.id}`)
        }
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
}

async function updateSubscriptionInDatabase(subscription: StripeSubscription) {
  if (!stripe) {
    console.error('Stripe is not initialized')
    return
  }

  try {
    // Get the customer ID from the subscription
    const customerId = typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer.id

    if (!customerId) {
      console.error('No customer ID found in subscription')
      return
    }

    // Find the user with this customer ID
    const user = await prisma.user.findFirst({
      where: { 
        stripeCustomerId: customerId 
      } as any
    })

    if (!user) {
      console.error(`User not found for customer ID: ${customerId}`)
      return
    }

    // Update the user's subscription status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: subscription.status,
        subscriptionExpiresAt: new Date(subscription.current_period_end * 1000),
      } as any // Type assertion for dynamic properties
    })
  } catch (error) {
    console.error('Error in updateSubscriptionInDatabase:', error)
  }
}

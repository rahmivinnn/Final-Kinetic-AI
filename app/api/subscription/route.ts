import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import { authOptions } from '../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED']
            }
          },
          orderBy: {
            currentPeriodEnd: 'desc'
          },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    const subscription = user.subscriptions[0] || null
    
    return NextResponse.json({
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.planId,
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      } : null
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { planId, paymentMethodId } = await req.json()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (!planId || !paymentMethodId) {
      return NextResponse.json(
        { message: 'Plan ID and payment method ID are required' },
        { status: 400 }
      )
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['ACTIVE', 'TRIALING', 'PAST_DUE']
        }
      }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { message: 'User already has an active subscription' },
        { status: 400 }
      )
    }

    // Create a Stripe customer if not exists
    let customerId = user.stripeCustomerId
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name || undefined,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      })

      customerId = customer.id
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    } else {
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

    // Create subscription in Stripe
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: planId }],
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: 7,
    })

    // Create subscription in database
    const dbSubscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        status: subscription.status.toUpperCase(),
        planId,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        stripeSubscriptionId: subscription.id,
      },
    })

    return NextResponse.json({
      subscription: {
        id: dbSubscription.id,
        status: dbSubscription.status,
        planId: dbSubscription.planId,
        currentPeriodEnd: dbSubscription.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: dbSubscription.cancelAtPeriodEnd
      }
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get the user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        user: { email: session.user.email },
        status: {
          in: ['ACTIVE', 'TRIALING', 'PAST_DUE']
        }
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { message: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Cancel subscription in Stripe
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
    }

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { 
        status: 'CANCELED',
        cancelAtPeriodEnd: true 
      }
    })

    return NextResponse.json({ 
      message: 'Subscription will be canceled at the end of the billing period' 
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

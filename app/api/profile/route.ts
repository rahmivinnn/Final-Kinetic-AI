import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import { authOptions } from '../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { UserRole } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to format user data
function formatUserResponse(user: any) {
  const subscription = user.subscriptions?.[0] || null
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
    isPremium: subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING',
    credits: user.credits || 0,
    lastLogin: user.lastLogin?.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    subscription: subscription ? {
      id: subscription.id,
      status: subscription.status,
      planId: subscription.planId,
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
    } : null
  }
}

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
              in: ['ACTIVE', 'TRIALING', 'PAST_DUE']
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

    return NextResponse.json({ user: formatUserResponse(user) })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { name, email, phone, bio } = await req.json()
    
    // Validate input
    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      )
    }
    
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser) {
        return NextResponse.json(
          { message: 'Email is already in use' },
          { status: 400 }
        )
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        email: email || undefined,
        phone: phone || null,
        bio: bio || null
      },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['ACTIVE', 'TRIALING', 'PAST_DUE']
            }
          },
          orderBy: {
            currentPeriodEnd: 'desc'
          },
          take: 1
        }
      }
    })

    return NextResponse.json({ user: formatUserResponse(updatedUser) })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

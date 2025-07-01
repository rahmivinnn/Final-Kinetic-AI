'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'

interface Subscription {
  id: string
  status: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'inactive'
  planId: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

interface User {
  id: string
  name?: string | null
  email?: string | null
  role?: string
  image?: string | null
  subscription?: Subscription | null
  isPremium: boolean
  credits?: number
  lastLogin?: string
  createdAt?: string
  updatedAt?: string
}

type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  role?: string
  image?: string | null
  subscription?: Subscription | null
  isPremium?: boolean
  credits?: number
  lastLogin?: string
  createdAt?: string
  updatedAt?: string
}

interface AuthContextType {
  user: User | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  updateUser: (user: Partial<User>) => void
  refreshUser: () => Promise<void>
  updateSubscription: (subscription: Partial<Subscription>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userData = session.user as SessionUser
      setUser({
        id: userData.id || '',
        name: userData.name || null,
        email: userData.email || null,
        role: userData.role || 'PATIENT',
        image: userData.image || null,
        subscription: userData.subscription || null,
        isPremium: userData.isPremium || false,
        credits: userData.credits || 0,
        lastLogin: userData.lastLogin,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      })
    } else if (status === 'unauthenticated') {
      setUser(null)
    }
  }, [status, session])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, redirect: false })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Sign in failed')
      }

      // This will trigger the session update
      await update()
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      // Automatically sign in after registration
      await signIn(email, password)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const updateUser = (updatedUser: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...updatedUser } : null))
  }

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          image: data.user.image,
          subscription: data.user.subscription,
          isPremium: data.user.isPremium,
          credits: data.user.credits,
          lastLogin: data.user.lastLogin,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt
        })
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

  const updateSubscription = (subscription: Partial<Subscription>) => {
    setUser(prev => {
      if (!prev) return null
      return {
        ...prev,
        subscription: {
          ...(prev.subscription || {
            id: '',
            status: 'inactive',
            planId: '',
            currentPeriodEnd: new Date().toISOString(),
            cancelAtPeriodEnd: false
          }),
          ...subscription
        },
        isPremium: subscription.status === 'active' || subscription.status === 'trialing'
      }
    })
  }

  const value = {
    user,
    status,
    signIn,
    signOut,
    signUp,
    updateUser,
    refreshUser,
    updateSubscription
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

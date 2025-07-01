"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'

type UserRole = "patient" | "provider" | "admin"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  image?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        role: (session.user.role as UserRole) || 'patient',
        image: session.user.image || undefined
      })
    } else if (status === 'unauthenticated') {
      setUser(null)
    }
    
    if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [session, status])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: pathname || '/dashboard'
      })

      if (result?.error) {
        toast.error("Invalid email or password")
        return { success: false, error: result.error }
      }

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = "Login failed. Please try again."
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string, role: UserRole = 'patient') => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Auto-login after registration
      await login(email, password)
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await signOut({ redirect: false })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to log out. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    isLoading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

type UserRole = "patient" | "provider" | "admin"

interface User {
  id: string
  name: string
  email: string
  password: string
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

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    if (storedUser) {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      // Simulate login: cek user di localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const found = users.find((u: User) => u.email === email && u.password === password)
      if (found) {
        setUser(found)
        localStorage.setItem('user', JSON.stringify(found))
        return { success: true }
      } else {
        toast.error('Invalid email or password')
        return { success: false, error: 'Invalid email or password' }
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = 'Login failed. Please try again.'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string, role: UserRole = 'patient') => {
    try {
      setIsLoading(true)
      // Simulate registration: simpan ke localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      if (users.find((u: User) => u.email === email)) {
        toast.error('Email already registered')
        return { success: false, error: 'Email already registered' }
      }
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role,
        image: undefined
      }
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
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
      setUser(null)
      localStorage.removeItem('user')
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

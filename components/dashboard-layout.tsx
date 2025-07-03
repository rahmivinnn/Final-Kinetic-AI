"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Home, Activity, Users, MessageSquare, BarChart2, FileText, User, Settings, LogOut, Camera } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Logo } from "@/components/logo"
import { useRouter } from "next/navigation"


export function DashboardLayout({ children, activeLink = "home" }: { children: React.ReactNode; activeLink?: string }) {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const logout = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Menu dinamis berdasarkan role
  const patientMenu = [
    { href: '/dashboard', icon: Home, key: 'home' },
    { href: '/exercises', icon: Activity, key: 'exercises' },
    { href: '/appointments', icon: Users, key: 'appointments' },
    { href: '/messages', icon: MessageSquare, key: 'messages' },
    { href: '/progress', icon: BarChart2, key: 'progress' },
    { href: '/video-library', icon: FileText, key: 'videos' },
    { href: '/pose-estimation', icon: Camera, key: 'pose' },
  ];
  const providerMenu = [
    { href: '/dashboard', icon: Home, key: 'home' },
    { href: '/patients', icon: Users, key: 'patients' },
    { href: '/appointments', icon: Activity, key: 'appointments' },
    { href: '/analytics', icon: BarChart2, key: 'analytics' },
    { href: '/messages', icon: MessageSquare, key: 'messages' },
  ];
  const menu = user?.role === 'provider' ? providerMenu : patientMenu;

  return (
    <div className="flex h-screen bg-[#f0f4f9]">
      {/* Sidebar */}
      <div className="w-[78px] bg-gradient-to-b from-[#001a41] to-[#003366] flex flex-col items-center py-6">
        <div className="mb-8">
          <Logo size={40} />
        </div>

        <nav className="flex flex-col items-center space-y-6 flex-1">
          {menu.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`w-10 h-10 rounded-xl ${activeLink === item.key ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"} flex items-center justify-center text-white transition-all duration-200 hover:scale-105`}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col items-center space-y-6">
          <Link
            href="/profile"
            className={`w-10 h-10 rounded-xl ${
              activeLink === "profile" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } flex items-center justify-center text-white transition-all duration-200 hover:scale-105`}
          >
            <User className="w-5 h-5" />
          </Link>
          <Link
            href="/settings"
            className={`w-10 h-10 rounded-xl ${
              activeLink === "settings" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } flex items-center justify-center text-white transition-all duration-200 hover:scale-105`}
          >
            <Settings className="w-5 h-5" />
          </Link>
          <button
            onClick={logout}
            className="w-10 h-10 rounded-xl hover:bg-white/10 hover:bg-red-500/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}

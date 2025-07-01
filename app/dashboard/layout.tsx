"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { 
  Home, 
  Activity, 
  MessageSquare, 
  Users, 
  BarChart2, 
  FileText, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Camera 
} from "lucide-react"
import { Logo } from "@/components/logo"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Exercises', href: '/exercises', icon: Activity },
  { name: 'Appointments', href: '/appointments', icon: Users },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Progress', href: '/progress', icon: BarChart2 },
  { name: 'Video Library', href: '/video-library', icon: FileText },
  { name: 'Pose Estimation', href: '/pose-estimation', icon: Camera }
]

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login/patient")
    }
  }, [user, isLoading, router])

  if (!user && !isLoading) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getActiveLink = () => {
    if (pathname.startsWith('/exercises')) return 'exercises'
    if (pathname.startsWith('/appointments')) return 'appointments'
    if (pathname.startsWith('/messages')) return 'messages'
    if (pathname.startsWith('/progress')) return 'progress'
    if (pathname.startsWith('/video-library')) return 'videos'
    if (pathname.startsWith('/pose-estimation')) return 'pose'
    if (pathname.startsWith('/profile')) return 'profile'
    if (pathname.startsWith('/settings')) return 'settings'
    return 'home'
  }

  const activeLink = getActiveLink()

  return (
    <div className="flex h-screen bg-[#f0f4f9]">
      {/* Sidebar */}
      <div className="w-[78px] bg-gradient-to-b from-[#001a41] to-[#003366] flex flex-col items-center py-6">
        <div className="mb-8">
          <Logo size={40} />
        </div>

        <nav className="flex flex-col items-center space-y-6 flex-1">
          <Link
            href="/dashboard"
            className={`w-10 h-10 rounded-xl ${
              activeLink === "home" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } flex items-center justify-center text-white transition-all duration-200 hover:scale-105`}
            title="Dashboard"
          >
            <Home className="w-5 h-5" />
          </Link>
          <Link
            href="/exercises"
            className={`w-10 h-10 rounded-xl ${
              activeLink === "exercises" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } flex items-center justify-center text-white transition-all duration-200 hover:scale-105`}
            title="Exercises"
          >
            <Activity className="w-5 h-5" />
          </Link>
          <Link
            href="/appointments"
            className={`w-10 h-10 rounded-xl ${
              activeLink === "appointments" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } flex items-center justify-center text-white transition-all duration-200 hover:scale-105`}
            title="Appointments"
          >
            <Users className="w-5 h-5" />
          </Link>
          <Link
            href="/messages"
            className={`w-10 h-10 rounded-xl ${
              activeLink === "messages" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } flex items-center justify-center text-white transition-all duration-200 hover:scale-105`}
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
          </Link>
          <Link
            href="/progress"
            className={`w-10 h-10 rounded-xl ${
              activeLink === "progress" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } flex items-center justify-center text-white transition-all duration-200 hover:scale-105`}
            title="Progress"
          >
            <BarChart2 className="w-5 h-5" />
          </Link>
          <Link
            href="/video-library"
            className={`w-10 h-10 rounded-xl ${
              activeLink === "videos" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } flex items-center justify-center text-white transition-all duration-200 hover:scale-105`}
            title="Video Library"
          >
            <FileText className="w-5 h-5" />
          </Link>
          <Link
            href="/pose-estimation"
            className={`w-10 h-10 rounded-xl ${
              activeLink === "pose" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } flex items-center justify-center text-white transition-all duration-200 hover:scale-105`}
            title="Pose Estimation"
          >
            <Camera className="w-5 h-5" />
          </Link>
        </nav>

        <div className="mt-auto flex flex-col items-center space-y-6">
          <Link
            href="/profile"
            className={`w-10 h-10 rounded-xl ${
              activeLink === "profile" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } flex items-center justify-center text-white transition-all duration-200 hover:scale-105`}
            title="Profile"
          >
            <UserIcon className="w-5 h-5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout

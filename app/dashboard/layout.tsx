"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useIsMobile } from "@/hooks/use-mobile"
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
  Camera,
  Menu,
  X 
} from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

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
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login/patient")
    }
  }, [user, isLoading, router])

  if (!user && !isLoading) {
    return null
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if logout fails
      router.push("/login")
    }
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
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#001a41] to-[#003366] px-4 py-3 flex items-center justify-between">
          <Logo size={32} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-white/10"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${
        isMobile 
          ? `fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'w-[78px]'
      } bg-gradient-to-b from-[#001a41] to-[#003366] flex flex-col items-center py-6`}>
        {!isMobile && (
          <div className="mb-8">
            <Logo size={40} />
          </div>
        )}

        <nav className={`flex flex-col ${isMobile ? 'items-start w-full px-4 mt-16' : 'items-center'} space-y-6 flex-1`}>
          <Link
            href="/dashboard"
            className={`${isMobile ? 'w-full p-3 rounded-lg flex items-center space-x-3' : 'w-10 h-10 rounded-xl flex items-center justify-center'} ${
              activeLink === "home" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } text-white transition-all duration-200 hover:scale-105`}
            title="Dashboard"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <Home className="w-5 h-5" />
            {isMobile && <span className="text-sm font-medium">Dashboard</span>}
          </Link>
          <Link
            href="/exercises"
            className={`${isMobile ? 'w-full p-3 rounded-lg flex items-center space-x-3' : 'w-10 h-10 rounded-xl flex items-center justify-center'} ${
              activeLink === "exercises" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } text-white transition-all duration-200 hover:scale-105`}
            title="Exercises"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <Activity className="w-5 h-5" />
            {isMobile && <span className="text-sm font-medium">Exercises</span>}
          </Link>
          <Link
            href="/appointments"
            className={`${isMobile ? 'w-full p-3 rounded-lg flex items-center space-x-3' : 'w-10 h-10 rounded-xl flex items-center justify-center'} ${
              activeLink === "appointments" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } text-white transition-all duration-200 hover:scale-105`}
            title="Appointments"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <Users className="w-5 h-5" />
            {isMobile && <span className="text-sm font-medium">Appointments</span>}
          </Link>
          <Link
            href="/messages"
            className={`${isMobile ? 'w-full p-3 rounded-lg flex items-center space-x-3' : 'w-10 h-10 rounded-xl flex items-center justify-center'} ${
              activeLink === "messages" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } text-white transition-all duration-200 hover:scale-105`}
            title="Messages"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <MessageSquare className="w-5 h-5" />
            {isMobile && <span className="text-sm font-medium">Messages</span>}
          </Link>
          <Link
            href="/progress"
            className={`${isMobile ? 'w-full p-3 rounded-lg flex items-center space-x-3' : 'w-10 h-10 rounded-xl flex items-center justify-center'} ${
              activeLink === "progress" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } text-white transition-all duration-200 hover:scale-105`}
            title="Progress"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <BarChart2 className="w-5 h-5" />
            {isMobile && <span className="text-sm font-medium">Progress</span>}
          </Link>
          <Link
            href="/video-library"
            className={`${isMobile ? 'w-full p-3 rounded-lg flex items-center space-x-3' : 'w-10 h-10 rounded-xl flex items-center justify-center'} ${
              activeLink === "videos" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } text-white transition-all duration-200 hover:scale-105`}
            title="Video Library"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <FileText className="w-5 h-5" />
            {isMobile && <span className="text-sm font-medium">Video Library</span>}
          </Link>
          <Link
            href="/pose-estimation"
            className={`${isMobile ? 'w-full p-3 rounded-lg flex items-center space-x-3' : 'w-10 h-10 rounded-xl flex items-center justify-center'} ${
              activeLink === "pose" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } text-white transition-all duration-200 hover:scale-105`}
            title="Pose Estimation"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <Camera className="w-5 h-5" />
            {isMobile && <span className="text-sm font-medium">Pose Estimation</span>}
          </Link>
        </nav>

        <div className={`mt-auto flex flex-col ${isMobile ? 'items-start w-full px-4' : 'items-center'} space-y-6`}>
          <Link
            href="/profile"
            className={`${isMobile ? 'w-full p-3 rounded-lg flex items-center space-x-3' : 'w-10 h-10 rounded-xl flex items-center justify-center'} ${
              activeLink === "profile" ? "bg-[#7e58f4] bg-opacity-20" : "hover:bg-white/10"
            } text-white transition-all duration-200 hover:scale-105`}
            title="Profile"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <UserIcon className="w-5 h-5" />
            {isMobile && <span className="text-sm font-medium">Profile</span>}
          </Link>
          <button
            onClick={() => {
              handleLogout()
              if (isMobile) setSidebarOpen(false)
            }}
            className={`${isMobile ? 'w-full p-3 rounded-lg flex items-center space-x-3' : 'w-10 h-10 rounded-xl flex items-center justify-center'} hover:bg-white/10 text-white transition-all duration-200 hover:scale-105`}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
            {isMobile && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={`flex-1 overflow-auto ${isMobile ? 'pt-16' : ''}`}>
        <div className={`${isMobile ? 'p-4' : 'p-8'}`}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout

"use client"

import { useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Logo } from "./logo"
import { useAuth } from "@/components/auth-provider"

// Custom DropdownMenuShortcut component with proper typing
const MenuShortcut = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-auto text-xs tracking-widest opacity-60">
    {children}
  </span>
)

type UserNavProps = {
  className?: string;
}

export function UserNav({ className = "" }: UserNavProps) {
  const { user, logout, isLoading: isAuthLoading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const handleNavigation = useCallback(async (path: string) => {
    if (pathname === path) return
    
    try {
      setIsNavigating(true)
      await router.prefetch(path)
      router.push(path)
    } catch (error) {
      console.error('Navigation error:', error)
      toast({
        title: "Navigation Error",
        description: "Failed to navigate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsNavigating(false)
    }
  }, [router, pathname, toast])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      await handleNavigation("/login")
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleProfileClick = () => handleNavigation("/profile")
  const handleSettingsClick = () => handleNavigation("/settings")

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Logo size={40} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-10 w-10 rounded-full"
            disabled={isLoggingOut || isNavigating}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={user?.image || "/avatar.png"} 
                alt={user?.name ? `${user.name}'s avatar` : "User avatar"} 
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56" 
          align="end" 
          forceMount
          onCloseAutoFocus={(e: React.FocusEvent<HTMLDivElement>) => e.preventDefault()}
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={handleProfileClick}
              disabled={isNavigating}
            >
              {isNavigating && pathname === "/profile" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Profile
              <MenuShortcut>⇧⌘P</MenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleSettingsClick}
              disabled={isNavigating}
            >
              {isNavigating && pathname === "/settings" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Settings
              <MenuShortcut>⌘S</MenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Log out
            <MenuShortcut>⇧⌘Q</MenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

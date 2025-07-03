"use client"

import { useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { useMobileMenu } from "@/hooks/use-mobile-menu"

export function SiteHeader() {
  const { isOpen: isMobileMenuOpen, toggleMenu, closeMenu, menuRef } = useMobileMenu()
  const { user } = useAuth()

  // Navigation links data
  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#success-stories", label: "Success Stories" },
    { href: "#resources", label: "Resources" },
  ]

  const authLinks = user ? (
    <div className="flex items-center space-x-4">
      <Link href="/dashboard">
        <Button variant="ghost" className="text-white hover:bg-[#001a41]/90 hover:text-white">
          Dashboard
        </Button>
      </Link>
    </div>
  ) : (
    <>
      <Link href="/login">
        <Button variant="ghost" className="text-white hover:bg-[#001a41]/90 hover:text-white">
          Log in
        </Button>
      </Link>
      <Link href="/register">
        <Button variant="ghost" className="text-white hover:bg-[#001a41]/90 hover:text-white">
          Sign up
        </Button>
      </Link>
      <Link href="/book-consultation">
        <Button className="bg-white text-[#001a41] hover:bg-white/90">Book Consultation</Button>
      </Link>
    </>
  )

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-[#001a41] text-white transition-all duration-300 shadow-md"
      )}
    >
      <div className="container flex h-16 items-center">
        <MainNav className="mx-6" />
        
        {/* Desktop Navigation */}
        <div className="ml-auto hidden md:flex items-center space-x-4">
          {authLinks}
        </div>

        {/* Mobile Menu Button */}
        <div className="ml-auto md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="text-white hover:bg-[#001a41]/90 hover:text-white"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        id="mobile-navigation"
        ref={menuRef}
        className={cn(
          "fixed inset-0 z-40 md:hidden bg-[#001a41]/95 backdrop-blur-sm transition-all duration-300 ease-in-out transform",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isMobileMenuOpen}
        aria-label="Mobile navigation menu"
      >
        <div className="h-full w-4/5 max-w-xs bg-[#001a41] shadow-xl overflow-y-auto">
          <div className="container py-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div className="text-xl font-bold">Menu</div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={closeMenu}
                className="text-white hover:bg-[#001a41]/90"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-white transition-colors hover:text-white/80 py-2 px-3 rounded-md hover:bg-white/10 block w-full text-left"
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col space-y-3 pt-6 border-t border-white/10">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={closeMenu} className="w-full">
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/profile" onClick={closeMenu} className="w-full">
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                      My Profile
                    </Button>
                  </Link>
                  <Link href="/settings" onClick={closeMenu} className="w-full">
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                      Settings
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMenu} className="w-full">
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMenu} className="w-full">
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/book-consultation" onClick={closeMenu} className="w-full">
                <Button className="w-full bg-white text-[#001a41] hover:bg-white/90">
                  Book Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollLink } from "@/components/scroll-link"

interface NavItem {
  href: string
  label: string
  external?: boolean
}

const mainNavItems: NavItem[] = [
  {
    href: "#features",
    label: "Features",
  },
  {
    href: "#how-it-works",
    label: "How It Works",
  },
  {
    href: "#success-stories",
    label: "Success Stories",
  },
  {
    href: "#resources",
    label: "Resources",
  },
]

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
}

export function MainNav({ className, ...props }: MainNavProps) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <div 
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link 
        href="/" 
        className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001a41] rounded"
        aria-label="Go to homepage"
      >
        <Image
          src="/kinetic-logo.png"
          alt=""
          width={60}
          height={60}
          className="h-12 w-auto"
          aria-hidden="true"
          priority
        />
      </Link>
      
      <nav 
        className="hidden md:flex items-center space-x-6"
        aria-label="Main navigation"
      >
        {mainNavItems.map((item) => {
          // Only show scroll links on the homepage
          const NavComponent = isHomePage ? ScrollLink : Link
          
          return (
            <NavComponent
              key={item.href}
              href={isHomePage ? item.href : `/${item.href}`}
              className={cn(
                "text-sm font-medium text-white transition-colors hover:text-white/80",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001a41] rounded px-2 py-1"
              )}
              onNavigationStart={() => {
                // Close mobile menu if open
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  document.body.style.overflow = 'auto'
                }
              }}
            >
              {item.label}
            </NavComponent>
          )
        })}
      </nav>
    </div>
  )
}

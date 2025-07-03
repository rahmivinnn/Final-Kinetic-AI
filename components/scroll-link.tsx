"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useRef, useCallback } from "react"
import { useIsMounted } from "@/hooks/use-is-mounted"
import { cn } from "@/lib/utils"

// Define the type for the ref used in the hook
type MutableRefObject<T> = {
  current: T
}

export interface ScrollLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The target URL or element ID to scroll to */
  href: string
  /** Optional callback when the link is clicked */
  onNavigationStart?: () => void
  /** Optional callback when navigation is complete */
  onNavigationEnd?: () => void
  /** Scroll behavior (default: 'smooth') */
  scrollBehavior?: ScrollBehavior
  /** Scroll margin top (in pixels) to account for fixed headers */
  scrollMarginTop?: number
  /** Whether to add scroll padding to the target element */
  addScrollPadding?: boolean
  /** Additional class names */
  className?: string
  /** Link content */
  children: React.ReactNode
}

/**
 * A smart link component that handles both in-page scrolling and page navigation with smooth scrolling.
 * Automatically detects if the target is on the current page or a different page.
 */
export function ScrollLink({
  href,
  className,
  onNavigationStart,
  onNavigationEnd,
  scrollBehavior = 'smooth',
  scrollMarginTop = 100,
  addScrollPadding = true,
  children,
  onClick,
  ...props
}: ScrollLinkProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isMounted = useIsMounted()
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [targetPath, targetHash] = href.split('#')
  const isExternal = href.startsWith('http') || href.startsWith('//')
  const isSamePage = !targetPath || targetPath === '' || targetPath === pathname
  const isHashLink = href.startsWith('#')
  const elementId = isHashLink ? href.slice(1) : targetHash

  // Clean up any pending timeouts on unmount
  useEffect(() => {
    const timeoutRef = scrollTimeoutRef.current
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef)
      }
    }
  }, [])

  // Scroll to the target element with proper error handling
  const scrollToElement = useCallback((id: string, behavior: ScrollBehavior = 'smooth') => {
    if (!isMounted) return

    try {
      const element = document.getElementById(id)
      if (!element) {
        console.warn(`Element with id "${id}" not found`)
        return false
      }

      // Add scroll-margin-top to the target element for better positioning
      if (addScrollPadding) {
        element.style.scrollMarginTop = `${scrollMarginTop}px`
      }

      element.scrollIntoView({
        behavior,
        block: 'start',
      })
      return true
    } catch (error) {
      console.error('Error scrolling to element:', error)
      return false
    }
  }, [isMounted, addScrollPadding, scrollMarginTop])

  const handleClick = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    try {
      // Call the onClick handler if provided
      onClick?.(e)
      onNavigationStart?.()

      if (isExternal) {
        // Handle external links
        window.open(href, '_blank', 'noopener,noreferrer')
        return
      }

      if (isHashLink || isSamePage) {
        // Handle in-page anchor links
        const success = scrollToElement(elementId, scrollBehavior)
        if (!success) {
          // If element not found, try again after a short delay
          scrollTimeoutRef.current = setTimeout(() => {
            scrollToElement(elementId, 'auto')
          }, 300)
        }
      } else {
        // Handle navigation to a different page with hash
        await router.push(href)
        
        // Wait for the page to load and then scroll to the element
        scrollTimeoutRef.current = setTimeout(() => {
          scrollToElement(elementId, scrollBehavior)
          onNavigationEnd?.()
        }, 100)
      }
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback to regular navigation
      router.push(href.split('#')[0])
    } finally {
      onNavigationEnd?.()
    }
  }, [
    href, 
    onClick, 
    onNavigationStart, 
    onNavigationEnd, 
    router, 
    isExternal, 
    isHashLink, 
    isSamePage, 
    elementId, 
    scrollToElement, 
    scrollBehavior
  ])

  // Add scroll behavior for initial page load with hash
  useEffect(() => {
    if (!isMounted || !isSamePage || !elementId) return

    // Check if we have a hash in the URL on initial load
    if (window.location.hash === `#${elementId}`) {
      scrollTimeoutRef.current = setTimeout(() => {
        scrollToElement(elementId, 'auto')
      }, 100)
    }
  }, [isMounted, isSamePage, elementId, scrollToElement])

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        'transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
    </a>
  )
}

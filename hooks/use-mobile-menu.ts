import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Custom hook to manage mobile menu state and behavior
 * @returns {Object} Mobile menu state and methods
 */
export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isMounted = typeof window !== 'undefined';

  // Close menu when route changes
  useEffect(() => {
    if (isOpen) {
      closeMenu();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (!isMounted) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Add event listener to close on escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeMenu();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, isMounted]);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openMenu = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    if (isMounted) {
      // Small delay to allow animations to complete
      setTimeout(() => {
        document.body.style.overflow = 'auto';
      }, 300);
    }
  }, [isMounted]);

  // Close menu when clicking outside
  const menuRef = useCallback(
    (node: HTMLElement | null) => {
      if (!isMounted || !node) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (isOpen && !node.contains(event.target as Node)) {
          closeMenu();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    },
    [isOpen, closeMenu, isMounted]
  );

  return {
    isOpen,
    toggleMenu,
    openMenu,
    closeMenu,
    menuRef,
  };
}

type UseMobileMenu = ReturnType<typeof useMobileMenu>;

declare module '@/hooks/use-is-mounted' {
  /**
   * Custom hook that returns whether the component is currently mounted.
   * This is useful for preventing state updates on unmounted components.
   * 
   * @returns {boolean} True if the component is mounted, false otherwise
   */
  export function useIsMounted(): boolean;
  
  /**
   * Custom hook that returns a function to check if the component is mounted.
   * This is useful for callbacks that might be called after the component unmounts.
   * 
   * @returns {() => boolean} A function that returns true if the component is mounted
   */
  export function useIsMountedRef(): () => boolean;
}

declare module '@/hooks/use-mobile-menu' {
  /**
   * Custom hook to manage mobile menu state and behavior
   * @returns {Object} Mobile menu state and methods
   * @property {boolean} isOpen - Whether the mobile menu is open
   * @property {() => void} toggleMenu - Toggle the mobile menu open/closed
   * @property {() => void} openMenu - Open the mobile menu
   * @property {() => void} closeMenu - Close the mobile menu
   * @property {(node: HTMLElement | null) => void} menuRef - Ref to attach to the mobile menu container for click-outside handling
   */
  export function useMobileMenu(): {
    isOpen: boolean;
    toggleMenu: () => void;
    openMenu: () => void;
    closeMenu: () => void;
    menuRef: (node: HTMLElement | null) => void;
  };
}

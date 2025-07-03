import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook that returns whether the component is currently mounted.
 * This is useful for preventing state updates on unmounted components.
 * 
 * @returns {boolean} True if the component is mounted, false otherwise
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    return () => {
      setIsMounted(false);
    };
  }, []);

  return isMounted;
}

/**
 * Custom hook that returns a function to check if the component is mounted.
 * This is useful for callbacks that might be called after the component unmounts.
 * 
 * @returns {() => boolean} A function that returns true if the component is mounted
 */
export function useIsMountedRef(): () => boolean {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}

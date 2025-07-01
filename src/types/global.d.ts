import { FC, useRef, useState, useEffect } from 'react';

declare global {
  // Re-export React types for global use
  type ReactFC<T = {}> = FC<T>;
  type ReactRef<T> = React.RefObject<T>;
  type ReactState<T> = [T, React.Dispatch<React.SetStateAction<T>>];
  
  // Extend Window interface if needed
  interface Window {
    // Add any global window properties here
  }
}

// Make these types available globally
declare const React: {
  FC: typeof FC;
  useRef: typeof useRef;
  useState: typeof useState;
  useEffect: typeof useEffect;
};

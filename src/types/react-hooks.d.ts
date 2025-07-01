import { useState, useRef, useEffect } from 'react';

declare global {
  // Re-export React hooks for global use
  const useState: typeof useState;
  const useRef: typeof useRef;
  const useEffect: typeof useEffect;
}

export {};

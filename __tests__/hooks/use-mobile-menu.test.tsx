import { renderHook, act } from '@testing-library/react-hooks';
import { useMobileMenu } from '@/hooks/use-mobile-menu';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('useMobileMenu', () => {
  const mockUsePathname = usePathname as jest.Mock;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUsePathname.mockReturnValue('/');
    
    // Mock window and document methods
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });
  
  it('should initialize with menu closed', () => {
    const { result } = renderHook(() => useMobileMenu());
    
    expect(result.current.isOpen).toBe(false);
  });
  
  it('should toggle menu open and closed', () => {
    const { result } = renderHook(() => useMobileMenu());
    
    // Menu should start closed
    expect(result.current.isOpen).toBe(false);
    
    // Open menu
    act(() => {
      result.current.toggleMenu();
    });
    
    expect(result.current.isOpen).toBe(true);
    
    // Close menu
    act(() => {
      result.current.toggleMenu();
    });
    
    expect(result.current.isOpen).toBe(false);
  });
  
  it('should close menu when route changes', () => {
    const { result, rerender } = renderHook(() => useMobileMenu());
    
    // Open menu
    act(() => {
      result.current.toggleMenu();
    });
    
    expect(result.current.isOpen).toBe(true);
    
    // Simulate route change
    mockUsePathname.mockReturnValue('/new-route');
    rerender();
    
    // Menu should be closed after route change
    expect(result.current.isOpen).toBe(false);
  });
  
  it('should close menu when clicking outside', () => {
    const { result } = renderHook(() => useMobileMenu());
    const div = document.createElement('div');
    
    // Set up menu ref
    act(() => {
      result.current.menuRef(div);
    });
    
    // Open menu
    act(() => {
      result.current.toggleMenu();
    });
    
    // Simulate click outside
    act(() => {
      fireEvent.mouseDown(document);
    });
    
    // Menu should be closed after clicking outside
    expect(result.current.isOpen).toBe(false);
  });
  
  it('should not close menu when clicking inside', () => {
    const { result } = renderHook(() => useMobileMenu());
    const div = document.createElement('div');
    const button = document.createElement('button');
    div.appendChild(button);
    
    // Set up menu ref
    act(() => {
      result.current.menuRef(div);
    });
    
    // Open menu
    act(() => {
      result.current.toggleMenu();
    });
    
    // Simulate click inside the menu
    act(() => {
      fireEvent.mouseDown(button);
    });
    
    // Menu should remain open
    expect(result.current.isOpen).toBe(true);
  });
  
  it('should close menu when pressing escape key', () => {
    const { result } = renderHook(() => useMobileMenu());
    
    // Open menu
    act(() => {
      result.current.toggleMenu();
    });
    
    // Simulate escape key press
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    
    // Menu should be closed after pressing escape
    expect(result.current.isOpen).toBe(false);
  });
  
  it('should clean up event listeners on unmount', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => useMobileMenu());
    
    // Verify event listeners were added
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    
    unmount();
    
    // Verify event listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    // Clean up
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});

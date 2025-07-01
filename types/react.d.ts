import 'react'

declare module 'react' {
  function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void]
  function useEffect(effect: () => void | (() => void), deps?: any[]): void
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T
}

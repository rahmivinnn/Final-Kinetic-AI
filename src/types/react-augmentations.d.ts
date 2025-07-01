import 'react';

declare module 'react' {
  // Extend React types
  function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  function useRef<T>(initialValue: T): { current: T };
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  
  // Add missing event types
  interface FormEvent<T = Element> extends SyntheticEvent<T> {}
  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }
  
  // Add other missing types as needed
  type FC<P = {}> = FunctionComponent<P>;
  
  interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P> | undefined;
    displayName?: string | undefined;
  }
}

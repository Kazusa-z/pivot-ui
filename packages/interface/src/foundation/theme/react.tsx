import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { defaultThemeStore } from './default-store'
import type { ThemeSnapshot, ThemeStore } from './store'

export const ThemeContext = createContext<ThemeStore | null>(null)

export interface ThemeProviderProps {
  readonly children: ReactNode
  readonly store?: ThemeStore
}

export interface ThemeState extends ThemeSnapshot {
  readonly setPreference: ThemeStore['setPreference']
}

export function ThemeProvider({ children, store }: ThemeProviderProps) {
  const inheritedStore = useContext(ThemeContext)
  const activeStore = store ?? inheritedStore ?? defaultThemeStore
  useEffect(() => activeStore.connect(), [activeStore])
  return <ThemeContext.Provider value={activeStore}>{children}</ThemeContext.Provider>
}

export function useThemeStore(): ThemeStore {
  return useContext(ThemeContext) ?? defaultThemeStore
}

export function useTheme(): ThemeState {
  const store = useThemeStore()
  // Standalone hook consumers also work without a Provider; connections are shared.
  useEffect(() => store.connect(), [store])
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
  return useMemo(() => ({ ...snapshot, setPreference: store.setPreference }), [snapshot, store])
}

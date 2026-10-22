import { createContext, useMemo, type ReactNode } from 'react'
import {
  ThemeProvider as InterfaceThemeProvider,
  createBrowserThemeStorage,
  defaultThemeStore,
  isThemePreference,
  themeClasses,
  useTheme as useInterfaceTheme,
  type ThemeStore,
} from '@pivot-ui/react/theme'

type ColorModeListener = (theme: string) => void

export const defaultThemes = Object.freeze({ ...themeClasses, system: 'system' })

/** @deprecated Read useTheme().theme in React; this getter never applies DOM styles. */
export function getDefaultTheme(): string {
  return createBrowserThemeStorage().read() ?? defaultThemeStore.getSnapshot().preference
}

const listenerSubscriptions = new Map<ColorModeListener, () => void>()

export function addThemeChangeListener(callback: ColorModeListener) {
  if (listenerSubscriptions.has(callback)) return
  let previousPreference = defaultThemeStore.getSnapshot().preference
  const unsubscribe = defaultThemeStore.subscribe(() => {
    const { preference } = defaultThemeStore.getSnapshot()
    if (preference === previousPreference) return
    previousPreference = preference
    callback(preference)
  })
  listenerSubscriptions.set(callback, unsubscribe)
}

export function removeThemeChangeListener(callback: ColorModeListener) {
  listenerSubscriptions.get(callback)?.()
  listenerSubscriptions.delete(callback)
}

export function useTheme() {
  const { preference, resolvedTheme, setPreference } = useInterfaceTheme()
  return useMemo(
    () => ({
      theme: preference,
      resolvedTheme,
      setTheme: (theme: string) => {
        if (isThemePreference(theme)) setPreference(theme)
      },
    }),
    [preference, resolvedTheme, setPreference]
  )
}

const setDefaultTheme = (theme: string) => {
  if (isThemePreference(theme)) defaultThemeStore.setPreference(theme)
}

/** @deprecated Prefer the new store context or useTheme. */
export const ThemeContext = createContext<{ theme: string; setTheme: (theme: string) => void }>({
  theme: defaultThemeStore.getSnapshot().preference,
  setTheme: setDefaultTheme,
})

function LegacyThemeContext({ children }: { children: ReactNode }) {
  const theme = useTheme()
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function ThemeProvider({ children, store }: { children: ReactNode; store?: ThemeStore }) {
  return (
    <InterfaceThemeProvider store={store}>
      <LegacyThemeContext>{children}</LegacyThemeContext>
    </InterfaceThemeProvider>
  )
}

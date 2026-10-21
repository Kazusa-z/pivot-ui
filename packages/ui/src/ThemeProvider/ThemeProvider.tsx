import React, { createContext, useState, useEffect } from 'react'

const THEME_CACHE_KEY = 'pivot-ui-editor-theme'

type Theme = string
type MediaTheme = 'light' | 'dark'

type ColorModeListener = (c: string) => void

const callbackList = new Set<ColorModeListener>()

const isBrowser = () => typeof window !== 'undefined'
const isNode = () => !isBrowser()

export const defaultThemes = {
  light: 'light-theme',
  dark: 'dark-theme',
  system: 'system',
}

const defaultTheme = 'dark'

const getThemePreference = (): Theme => {
  if (isNode()) return defaultTheme

  try {
    const savedMode = window.localStorage.getItem(THEME_CACHE_KEY)
    if (typeof savedMode === 'string') return savedMode
    return defaultTheme
  } catch (e) {
    console.warn(e)
    return defaultTheme
  }
}

const getMediaTheme = (): MediaTheme => {
  if (isNode()) return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getDefaultTheme(): Theme {
  if (!isBrowser()) return 'dark'

  const html = document.documentElement
  let userThemePreference = getThemePreference()

  if (userThemePreference == null) {
    userThemePreference = getMediaTheme()
  }

  const resolved = userThemePreference === 'system' ? getMediaTheme() : userThemePreference
  html.classList.add(defaultThemes[resolved])
  return userThemePreference
}

export function addThemeChangeListener(cb: ColorModeListener) {
  callbackList.add(cb)
}

export function removeThemeChangeListener(cb: ColorModeListener) {
  callbackList.delete(cb)
}

const useTheme = () => {
  const [theme, _setTheme] = useState('')

  const applyTheme = (nextTheme: Theme) => {
    const html = document.documentElement
    html.classList.remove(defaultThemes.light, defaultThemes.dark)

    const resolved = nextTheme === 'system' ? getMediaTheme() : nextTheme
    html.classList.add(defaultThemes[resolved])
    _setTheme(nextTheme)
  }

  const cacheTheme = (nextTheme: Theme) => {
    try {
      if (typeof nextTheme === 'string') window.localStorage.setItem(THEME_CACHE_KEY, nextTheme)
    } catch (e) {
      console.warn(e)
    }
  }

  useEffect(() => {
    const defaultTheme = getDefaultTheme()
    setTheme(defaultTheme)
  }, [])

  useEffect(() => {
    function darkListener(e: MediaQueryListEvent) {
      applyTheme(e.matches ? 'dark' : 'light')
    }
    function lightListener(e: MediaQueryListEvent) {
      applyTheme(e.matches ? 'light' : 'dark')
    }
    if (theme === 'system') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', darkListener)
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', lightListener)
    }
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', darkListener)
      window.matchMedia('(prefers-color-scheme: light)').removeEventListener('change', lightListener)
    }
  }, [theme])

  const setTheme = (nextTheme: Theme) => {
    applyTheme(nextTheme)
    cacheTheme(nextTheme)

    if (nextTheme && callbackList.size) {
      callbackList.forEach((cb) => {
        cb(nextTheme)
      })
    }
  }

  return { theme, setTheme }
}

const ThemeContext = createContext<{
  theme: string
  setTheme: (theme: string) => void
}>(null)

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, setTheme } = useTheme()

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export { ThemeProvider, ThemeContext, useTheme }

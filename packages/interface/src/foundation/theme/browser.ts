import {
  isThemePreference,
  type SystemThemeAdapter,
  type ThemeAppearanceAdapter,
  type ThemeStorageAdapter,
} from './store'

export const THEME_STORAGE_KEY = 'pivot-ui-editor-theme'
export const themeClasses = Object.freeze({ light: 'light-theme', dark: 'dark-theme' })

export interface BrowserThemeStorageOptions {
  readonly key?: string
  readonly getWindow?: () => Window | undefined
}

export interface BrowserSystemThemeOptions {
  readonly getWindow?: () => Window | undefined
}

export interface BrowserThemeAppearanceOptions {
  readonly getTarget?: () => HTMLElement | null | undefined
}

const getBrowserWindow = () => (typeof window === 'undefined' ? undefined : window)
const getDocumentElement = () => (typeof document === 'undefined' ? undefined : document.documentElement)

/** 使用浏览器存储保存主题偏好。在环境禁止访问存储时返回未保存状态，应用仍可在内存中切换主题。 */
export function createBrowserThemeStorage(options: BrowserThemeStorageOptions = {}): ThemeStorageAdapter {
  const key = options.key ?? THEME_STORAGE_KEY
  const getWindow = options.getWindow ?? getBrowserWindow
  return {
    read() {
      try {
        const preference = getWindow()?.localStorage.getItem(key)
        return isThemePreference(preference) ? preference : null
      } catch {
        return null
      }
    },
    write(preference) {
      try {
        getWindow()?.localStorage.setItem(key, preference)
      } catch {
        // Private/embedded browsing may disable persistence; the live store still works.
      }
    },
    subscribe(listener) {
      const target = getWindow()
      if (!target) return () => {}
      const onStorage = (event: StorageEvent) => {
        if (event.key !== key && event.key !== null) return
        try {
          if (event.storageArea && event.storageArea !== target.localStorage) return
        } catch {
          return
        }
        listener()
      }
      target.addEventListener('storage', onStorage)
      return () => target.removeEventListener('storage', onStorage)
    },
  }
}

export function createBrowserSystemTheme(options: BrowserSystemThemeOptions = {}): SystemThemeAdapter {
  const getWindow = options.getWindow ?? getBrowserWindow
  const getQuery = () => getWindow()?.matchMedia?.('(prefers-color-scheme: dark)')
  return {
    read: () => {
      const query = getQuery()
      return query ? (query.matches ? 'dark' : 'light') : 'dark'
    },
    subscribe(listener) {
      const query = getQuery()
      if (!query) return () => {}
      query.addEventListener('change', listener)
      return () => query.removeEventListener('change', listener)
    },
  }
}

/** 通过元素 class 应用明暗主题。默认作用于 documentElement；传入其他元素可为独立预览限定主题范围。 */
export function createBrowserThemeAppearance(options: BrowserThemeAppearanceOptions = {}): ThemeAppearanceAdapter {
  const getTarget = options.getTarget ?? getDocumentElement
  let restore: (() => void) | undefined
  let previousTarget: HTMLElement | null | undefined
  return {
    apply(theme) {
      const target = getTarget()
      if (target !== previousTarget) {
        restore?.()
        restore = undefined
        previousTarget = target
      }
      if (!target) return
      if (!restore) {
        const wasLight = target.classList.contains(themeClasses.light)
        const wasDark = target.classList.contains(themeClasses.dark)
        const colorScheme = target.style.colorScheme
        restore = () => {
          target.classList.toggle(themeClasses.light, wasLight)
          target.classList.toggle(themeClasses.dark, wasDark)
          target.style.colorScheme = colorScheme
        }
      }
      target.classList.toggle(themeClasses.light, theme === 'light')
      target.classList.toggle(themeClasses.dark, theme === 'dark')
      target.style.colorScheme = theme
    },
    clear() {
      restore?.()
      restore = undefined
      previousTarget = undefined
    },
  }
}

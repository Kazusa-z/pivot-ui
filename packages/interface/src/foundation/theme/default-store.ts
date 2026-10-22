import { createBrowserSystemTheme, createBrowserThemeAppearance, createBrowserThemeStorage } from './browser'
import { createThemeStore } from './store'

// The factories and store are lazy: importing this module is safe without a browser.
export const defaultThemeStore = createThemeStore({
  storage: createBrowserThemeStorage(),
  system: createBrowserSystemTheme(),
  appearance: createBrowserThemeAppearance(),
})

import { useEffect, useState, type ReactNode } from 'react'
import type { Decorator, Preview } from '@storybook/react'
import {
  createBrowserThemeAppearance,
  createThemeStore,
  ThemeProvider,
} from '../packages/interface/src/foundation/theme'

function ThemePreview({ mode, children }: { mode: 'dark' | 'light'; children: ReactNode }) {
  const [store] = useState(() =>
    createThemeStore({ initialPreference: mode, appearance: createBrowserThemeAppearance() })
  )
  useEffect(() => store.setPreference(mode), [mode, store])
  return <ThemeProvider store={store}>{children}</ThemeProvider>
}

const withTheme: Decorator = (Story, context) => (
  <ThemePreview mode={context.globals.theme === 'light' ? 'light' : 'dark'}>
    <Story />
  </ThemePreview>
)

export const themePreview = {
  decorators: [withTheme],
  initialGlobals: { theme: 'dark' },
  globalTypes: {
    theme: {
      description: 'Component color theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'dark', title: 'Dark theme' },
          { value: 'light', title: 'Light theme' },
        ],
      },
    },
  },
} satisfies Preview

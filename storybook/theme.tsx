import { useLayoutEffect, type ReactNode } from 'react'
import type { Decorator, Preview } from '@storybook/react'

function ThemePreview({ mode, children }: { mode: 'dark' | 'light'; children: ReactNode }) {
  useLayoutEffect(() => {
    const html = document.documentElement
    const wasLight = html.classList.contains('light-theme')
    const wasDark = html.classList.contains('dark-theme')
    const previousColorScheme = html.style.colorScheme

    html.classList.toggle('light-theme', mode === 'light')
    html.classList.toggle('dark-theme', mode === 'dark')
    html.style.colorScheme = mode

    return () => {
      html.classList.toggle('light-theme', wasLight)
      html.classList.toggle('dark-theme', wasDark)
      html.style.colorScheme = previousColorScheme
    }
  }, [mode])

  return children
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

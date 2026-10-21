import { resetStyle } from '@galacean/editor-ui'
import type { Preview } from '@storybook/react'

resetStyle()

const preview: Preview = {
  initialGlobals: { backgrounds: { value: 'dark' } },
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/ },
    },
    backgrounds: {
      options: {
        dark: { name: 'dark', value: '#111' },
        light: { name: 'light', value: '#fff' },
      },
    },
    layout: 'centered',
  },
}

export default preview

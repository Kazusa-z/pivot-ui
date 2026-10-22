import '../panda.css'
import type { Preview } from '@storybook/react'
import { themePreview } from '../../../storybook/theme'

const preview: Preview = {
  ...themePreview,
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/ },
    },
    backgrounds: { disable: true },
    layout: 'centered',
  },
}

export default preview

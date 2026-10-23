import '../panda.css'
import type { Preview } from '@storybook/react'
import { themePreview } from '../../../storybook/theme'

const preview: Preview = {
  ...themePreview,
  parameters: {
    docs: { story: { inline: false, height: '600px' } },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/ },
    },
    backgrounds: { disable: true },
    layout: 'centered',
  },
}

export default preview

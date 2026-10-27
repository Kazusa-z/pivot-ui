import '../panda.css'
import '../fonts.css'
import type { Preview } from '@storybook/react'
import { themePreview } from '../../../storybook/theme'
import { ComponentDocsPage, ThemedDocsContainer } from '../../../storybook/docs'

const preview: Preview = {
  ...themePreview,
  parameters: {
    docs: { page: ComponentDocsPage, container: ThemedDocsContainer, story: { inline: true } },
    controls: {
      expanded: true,
      sort: 'requiredFirst',
      matchers: { color: /(background|color)$/i, date: /Date$/ },
    },
    backgrounds: { disable: true },
    layout: 'padded',
    options: {
      // Sidebar = source layers, bottom to top (see scripts/audit-layers.mjs).
      storySort: {
        order: [
          'Guides',
          ['介绍', '快速开始', '选择组件', '编辑与数据', '拖放'],
          'Foundation',
          'Display',
          'Overlays',
          'Controls',
          'Layout',
          'Dialogs',
          'Collections',
          'Editors',
          ['Numeric', 'Color', 'Curve', 'Resources'],
          'Property',
          '*',
        ],
      },
    },
  },
}

export default preview

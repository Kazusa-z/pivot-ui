import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import { storybookViteConfig } from '../../../storybook/vite.ts'

const config: StorybookConfig = {
  viteFinal: (config) => mergeConfig(config, storybookViteConfig),
  stories: ['../{src,stories}/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen',
    // The package typecheck covers stories and tooling with their own strict projects.
    check: false,
  },
}

export default config

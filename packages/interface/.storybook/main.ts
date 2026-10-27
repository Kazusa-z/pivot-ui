import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import { storybookViteConfig } from '../../../storybook/vite.ts'

const config: StorybookConfig = {
  viteFinal: (config) => mergeConfig(config, storybookViteConfig),
  stories: ['../stories/guides/*.mdx', '../{src,stories}/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    // react-docgen reads the props interfaces and their JSDoc for the API table; the
    // TypeScript-based docgen needs the TS compiler API, which TypeScript 7 no longer ships.
    reactDocgen: 'react-docgen',
    // The package typecheck covers stories and tooling with their own strict projects.
    check: false,
  },
}

export default config

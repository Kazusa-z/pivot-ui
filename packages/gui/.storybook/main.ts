import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import { storybookViteConfig } from '../../../storybook/vite.ts'

const config: StorybookConfig = {
  viteFinal: (config) => mergeConfig(config, storybookViteConfig),
  stories: ['../stories/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    // Overrides the default Typescript configuration to allow multi-package components to be documented via Autodocs.
    reactDocgen: 'react-docgen',
    check: false,
  },
}

export default config

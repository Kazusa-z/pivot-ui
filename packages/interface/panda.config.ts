import { defineConfig } from '@pandacss/dev'
import { pandaBase } from '../../panda/base'

export default defineConfig({
  ...pandaBase,
  include: [
    './src/**/*.{ts,tsx}',
    './stories/**/*.{ts,tsx}',
    './.storybook/**/*.{ts,tsx}',
    '../../storybook/**/*.{ts,tsx}',
  ],
  outdir: 'styled-system',
})

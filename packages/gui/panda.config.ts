import { defineConfig } from '@pandacss/dev'
import { pandaBase } from '../../panda/base'

export default defineConfig({
  ...pandaBase,
  include: ['./src/**/*.{ts,tsx}', '../ui/src/**/*.{ts,tsx}'],
  exclude: ['**/*.stories.tsx', '**/*.stories.ts'],
  outdir: 'styled-system',
})

import { defineConfig } from '@pandacss/dev'
import { pandaBase } from '../panda/base'

export default defineConfig({
  ...pandaBase,
  include: ['./src/**/*.{ts,tsx}', '../packages/interface/src/**/*.{ts,tsx}'],
  exclude: ['**/*.stories.tsx', '**/*.stories.ts'],
  outdir: 'styled-system',
})

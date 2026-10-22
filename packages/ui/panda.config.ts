import { defineConfig } from '@pandacss/dev'
import { pandaBase } from '../../panda/base'

export default defineConfig({
  ...pandaBase,
  include: ['./src/**/*.{ts,tsx}', '../interface/src/**/*.{ts,tsx}'],
  outdir: 'styled-system',
})

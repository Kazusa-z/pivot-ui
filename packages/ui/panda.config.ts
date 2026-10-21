import { defineConfig } from '@pandacss/dev'
import { globalCss, globalFontface } from '../../panda/global'
import { tokens } from '../../panda/theme'

export default defineConfig({
  preflight: false,
  include: ['./src/panda-pilot/**/*.{ts,tsx}'],
  outdir: 'styled-system',
  prefix: 'panda',
  jsxFramework: 'react',
  globalCss,
  globalFontface,
  theme: {
    tokens,
    extend: {},
  },
})

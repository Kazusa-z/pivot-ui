import { defineConfig } from '@pandacss/dev'
import { globalCss, globalFontface } from '../../panda/global'

export default defineConfig({
  preflight: false,
  include: ['./src/panda-pilot/**/*.{ts,tsx}'],
  outdir: 'styled-system',
  jsxFramework: 'react',
  globalCss,
  globalFontface,
  theme: {
    extend: {},
  },
})

import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  preflight: false,
  include: ['./src/panda-pilot/**/*.{ts,tsx}'],
  outdir: 'styled-system',
  jsxFramework: 'react',
  theme: {
    extend: {},
  },
})

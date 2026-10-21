import { globalCss, globalFontface } from './global'
import { tokens } from './theme'

export const pandaBase = {
  preflight: false,
  prefix: 'panda',
  jsxFramework: 'react',
  globalCss,
  globalFontface,
  theme: {
    tokens,
    extend: {},
  },
} as const

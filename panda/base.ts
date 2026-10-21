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
    keyframes: {
      spin: {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
    },
    extend: {},
  },
} as const

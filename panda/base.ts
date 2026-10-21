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
      overlayFadeIn: {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
      overlayFadeOut: {
        '0%': { opacity: 1 },
        '100%': { opacity: 0 },
      },
      contentShow: {
        from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
        to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
      },
      contentFadeIn: {
        from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
        to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
      },
      contentFadeOut: {
        from: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        to: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
      },
    },
    extend: {},
  },
} as const

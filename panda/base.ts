import type { Config } from '@pandacss/dev'
import { globalCss, globalFontface } from './global'
import { tokens } from './theme'

export const pandaBase = {
  preflight: false,
  prefix: 'panda',
  jsxFramework: 'react',
  // Keep direct generated imports and the public styling subpaths statically extractable.
  importMap: [
    'styled-system',
    {
      css: '@pivot-ui/react/styling/css',
      jsx: '@pivot-ui/react/styling/jsx',
      tokens: '@pivot-ui/react/styling/tokens',
    },
  ],
  globalCss,
  globalFontface,
  theme: {
    tokens,
    keyframes: {
      spin: {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
      iconPendingPulse: {
        from: { opacity: 0.4 },
        '50%': { opacity: 1 },
        to: { opacity: 0.4 },
      },
      overlayFadeIn: {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
      contentShow: {
        from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
        to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
      },
      scaleIn: {
        '0%': { opacity: 0, transform: 'scale(0) translateY(-4px)' },
        '100%': { opacity: 1, transform: 'scale(1) translateY(0px)' },
      },
      accordionSlideDown: {
        from: { height: 0, opacity: 0 },
        to: { height: 'var(--radix-accordion-content-height)', opacity: 1 },
      },
      accordionSlideUp: {
        from: { height: 'var(--radix-accordion-content-height)', opacity: 1 },
        to: { height: 0, opacity: 0 },
      },
    },
    extend: {},
  },
} satisfies Config

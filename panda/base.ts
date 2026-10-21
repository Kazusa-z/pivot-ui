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
      scaleIn: {
        '0%': { opacity: 0, transform: 'scale(0) translateY(-4px)' },
        '100%': { opacity: 1, transform: 'scale(1) translateY(0px)' },
      },
      slideDownAndFade: {
        from: { opacity: 0, transform: 'translateY(-2px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      slideUpAndFade: {
        from: { opacity: 0, transform: 'translateY(2px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      slideRightAndFade: {
        from: { opacity: 0, transform: 'translateX(-2px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
      },
      breathing: {
        '0%': { fill: 'rgb(221 234 248 / 8%)' },
        '50%': { fill: 'rgb(221 234 248 / 15%)' },
        '100%': { fill: 'rgb(221 234 248 / 8%)' },
      },
      accordionSlideDown: {
        from: { height: 0, opacity: 0 },
        to: { height: 'var(--radix-accordion-content-height)', opacity: 1 },
      },
      accordionSlideUp: {
        from: { height: 'var(--radix-accordion-content-height)', opacity: 1 },
        to: { height: 0, opacity: 0 },
      },
      slideLeftAndFade: {
        from: { opacity: 0, transform: 'translateX(2px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
      },
    },
    extend: {},
  },
} as const

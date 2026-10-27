import { resetCSS } from './reset'
import {
  darkColors,
  fontSizes,
  fonts,
  fontWeights,
  lightColors,
  lineHeights,
  radii,
  shadows,
  sizes,
  space,
  transitions,
} from './designTokens'

const cssVars = (prefix: string, values: Record<string, string | number>) =>
  Object.fromEntries(Object.entries(values).map(([key, value]) => [`--${prefix}-${key}`, String(value)]))

const commonVars = {
  ...cssVars('colors', darkColors),
  ...cssVars('space', space),
  ...cssVars('sizes', sizes),
  ...cssVars('fontSizes', fontSizes),
  ...cssVars('radii', radii),
  ...cssVars('shadows', shadows),
  ...cssVars('fonts', fonts),
  ...cssVars('fontWeights', fontWeights),
  ...cssVars('lineHeights', lineHeights),
  ...cssVars('transitions', transitions),
}

const lightVars = cssVars('colors', lightColors)

const colorFallbacks: Record<string, string> = {
  appBg: '#111113',
  gray1: '#111113',
  gray3: '#212225',
  gray8: '#5a6169',
  grayA3: '#ddeaf814',
  grayA5: '#d9edfe25',
  grayA7: '#d9edff40',
  blue10: '#3b9eff',
  primarySolid: '#2870bd',
  surface: '#18191b',
  surfaceRaised: '#212225',
  textMuted: '#8b909a',
  textStrong: '#edeef0',
  white: '#ffffff',
}

const toCssValue = (value: string) =>
  value.replace(/\$([A-Za-z0-9_]+)/g, (_, token) => {
    const fallback = colorFallbacks[token]
    return fallback ? `var(--colors-${token}, ${fallback})` : `var(--colors-${token})`
  })

const convert = (value: unknown): unknown => {
  if (typeof value === 'string') return toCssValue(value)
  if (Array.isArray(value)) return value.map(convert)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, convert(entry)]))
  }
  return value
}

export const globalCss = {
  ...(convert(resetCSS) as Record<string, unknown>),
  ':root': commonVars as any,
  '.dark-theme': { ...cssVars('colors', darkColors), colorScheme: 'dark' } as any,
  '.light-theme': { ...lightVars, colorScheme: 'light' } as any,
  html: {
    fontFamily: 'var(--fonts-default)',
    fontSize: '16px',
    backgroundColor: 'var(--colors-appBg, #111113)',
    color: 'var(--colors-textStrong, #edeef0)',
  },
  body: {
    ...(convert(resetCSS.body) as Record<string, unknown>),
    fontSize: '16px',
    lineHeight: 'normal',
    backgroundColor: 'var(--colors-appBg, #111113)',
    color: 'var(--colors-textStrong, #edeef0)',
  },
}

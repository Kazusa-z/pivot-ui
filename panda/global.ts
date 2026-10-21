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
  gray1: '#111113',
  gray3: '#212225',
  gray8: '#5a6169',
  grayA3: '#ddeaf814',
  grayA5: '#d9edfe25',
  grayA7: '#d9edff40',
  blue10: '#3b9eff',
  white: '#ffffff',
  surface: '#111113',
  textStrong: '#edeef0',
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

const colorPickerCss = {
  '.pivot-color-picker .react-colorful': {
    width: '220px !important',
    height: '180px !important',
  },
  '.pivot-color-picker .react-colorful__saturation': {
    borderBottom: '6px !important',
    borderRadius: '6px !important',
  },
  '.pivot-color-picker .react-colorful__hue': {
    width: '140px !important',
    height: '6px !important',
    margin: '12px 0 !important',
    borderRadius: '4px !important',
  },
  '.pivot-color-picker .react-colorful__hue .react-colorful__pointer': {
    height: '12px !important',
    width: '12px !important',
    borderRadius: '9999px !important',
    borderWidth: '2px !important',
  },
  '.pivot-color-picker .react-colorful__pointer': {
    height: '16px !important',
    width: '16px !important',
    borderRadius: '9999px !important',
    borderWidth: '2px !important',
  },
  '.pivot-color-picker .react-colorful__alpha': {
    width: '140px !important',
    height: '6px !important',
    borderRadius: '4px !important',
  },
  '.pivot-color-picker .react-colorful__alpha .react-colorful__pointer': {
    height: '12px !important',
    width: '12px !important',
    borderRadius: '9999px !important',
    borderWidth: '2px !important',
  },
  '.pivot-color-picker[data-readonly="true"] .react-colorful__saturation, .pivot-color-picker[data-readonly="true"] .react-colorful__hue':
    {
      pointerEvents: 'none !important',
      opacity: '0.5 !important',
    },
}

export const globalCss = {
  ...(convert(resetCSS) as Record<string, unknown>),
  ...(colorPickerCss as any),
  ':root': commonVars as any,
  '.light-theme': lightVars as any,
  html: {
    fontFamily:
      'geist, InterVariable, -apple-system, system-ui, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", Segoe UI Symbol',
    fontSize: '16px',
    backgroundColor: 'var(--colors-surface, #111113)',
    color: 'var(--colors-textStrong, #edeef0)',
  },
  body: {
    ...(convert(resetCSS.body) as Record<string, unknown>),
    fontSize: '16px',
    lineHeight: 'normal',
    backgroundColor: 'var(--colors-surface, #111113)',
    color: 'var(--colors-textStrong, #edeef0)',
  },
}

export const globalFontface = {
  mono: [
    {
      fontFamily: 'mono',
      fontWeight: 300,
      src: 'url("https://mdn.alipayobjects.com/huamei_piroyv/afts/file/A*XvJJSIIEDbYAAAAAAAAAAAAADinLAQ/JetBrainsMono-Light.woff2") format("woff2")',
    },
    {
      fontFamily: 'mono',
      fontWeight: 400,
      src: 'url("https://mdn.alipayobjects.com/huamei_piroyv/afts/file/A*cCg_QbqN1BAAAAAAAAAAAAAADinLAQ/JetBrainsMono-Regular.woff2") format("woff2")',
    },
    {
      fontFamily: 'mono',
      fontWeight: 500,
      src: 'url("https://mdn.alipayobjects.com/huamei_piroyv/afts/file/A*M8hRRpGAU5sAAAAAAAAAAAAADinLAQ/JetBrainsMono-Medium.woff2") format("woff2")',
    },
  ],
  geist: [
    {
      fontFamily: 'geist',
      fontWeight: 300,
      fontStyle: 'normal',
      src: 'url(https://mdn.alipayobjects.com/huamei_piroyv/afts/file/A*zUmLTpFfGT4AAAAAAAAAAAAADinLAQ/Geist-ExtraLight.woff2) format("woff2")',
    },
    {
      fontFamily: 'geist',
      fontWeight: 400,
      fontStyle: 'normal',
      src: 'url(https://mdn.alipayobjects.com/huamei_piroyv/afts/file/A*uQQpSZey8WoAAAAAAAAAAAAADinLAQ/Geist-Regular.woff2) format("woff2")',
      unicodeRange: 'U+0000-002F, U+003A-007F, U+0080-00FF, U+0100-FFFF',
    },
    {
      fontFamily: 'geist',
      fontWeight: 500,
      fontStyle: 'normal',
      src: 'url(https://mdn.alipayobjects.com/huamei_piroyv/afts/file/A*y26-RqzF8tUAAAAAAAAAAAAADinLAQ/Geist-Medium.woff2) format("woff2")',
    },
    {
      fontFamily: 'geist',
      fontWeight: 600,
      fontStyle: 'normal',
      src: 'url(https://mdn.alipayobjects.com/huamei_piroyv/afts/file/A*RsRyTpStUPsAAAAAAAAAAAAADinLAQ/Geist-SemiBold.woff2) format("woff2")',
    },
    {
      fontFamily: 'geist',
      fontWeight: 700,
      fontStyle: 'normal',
      src: 'url(https://mdn.alipayobjects.com/huamei_piroyv/afts/file/A*S5q2SYDWJ44AAAAAAAAAAAAADinLAQ/Geist-Bold.woff2) format("woff2")',
    },
    {
      fontFamily: 'geist',
      fontWeight: 800,
      fontStyle: 'normal',
      src: 'url(https://mdn.alipayobjects.com/huamei_piroyv/afts/file/A*1HUETbzL9gsAAAAAAAAAAAAADinLAQ/Geist-Black.woff2) format("woff2")',
    },
  ],
}

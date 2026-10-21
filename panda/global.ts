import { resetCSS } from '../packages/ui/src/design-system/reset.css'
import { colors } from '../packages/ui/src/design-system/colors'
import { fontSizes, radii, shadows, sizes, space } from '../packages/ui/src/design-system/sizes'

const resolveColor = (value: string, map: Record<string, string>) => {
  let current = value
  const seen = new Set<string>()
  while (current.startsWith('$')) {
    const key = current.slice(1)
    if (seen.has(key) || !(key in map)) break
    seen.add(key)
    current = map[key]
  }
  return current
}

const resolveScale = (map: Record<string, string | number>) => {
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => {
      if (typeof value !== 'string' || !value.startsWith('$')) return [key, value]
      const resolved = map[value.slice(1)]
      return [key, resolved ?? value]
    })
  )
}

const cssVars = (prefix: string, values: Record<string, string | number>) =>
  Object.fromEntries(Object.entries(values).map(([key, value]) => [`--${prefix}-${key}`, String(value)]))

const darkColors = Object.fromEntries(
  Object.entries(colors.dark).map(([key, value]) => [key, resolveColor(value, colors.dark)])
)
const lightColors = Object.fromEntries(
  Object.entries(colors.light).map(([key, value]) => [key, resolveColor(value, colors.light)])
)

const resolvedSizes = resolveScale(sizes)
const resolvedFontSizes = resolveScale(fontSizes)

const resolvedShadows = Object.fromEntries(
  Object.entries(shadows).map(([key, value]) => [key, value.replace(/\$colors\$([A-Za-z0-9_]+)/g, 'var(--colors-$1)')])
)

const commonVars = {
  ...cssVars('colors', darkColors),
  ...cssVars('space', space),
  ...cssVars('sizes', resolvedSizes),
  ...cssVars('fontSizes', resolvedFontSizes),
  ...cssVars('radii', radii),
  ...cssVars('shadows', resolvedShadows),
  ...cssVars('fonts', {
    default:
      'geist,InterVariable,-apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol',
    untitled: 'Untitled Sans, -apple-system, system-ui, sans-serif',
    mono: 'mono, -apple-system, system-ui, sans-serif',
  }),
  ...cssVars('fontWeights', { light: 300, regular: 400, medium: 500, bold: 600 }),
  ...cssVars('lineHeights', {
    1: '16px',
    '1_5': '18px',
    2: '20px',
    3: '24px',
    4: '26px',
    5: '28px',
    6: '32px',
    7: '36px',
    8: '40px',
    9: '48px',
  }),
  ...cssVars('transitions', {
    shadow: 'box-shadow .2s ease',
    backgroundColor: 'background-color .2s ease',
    borderColor: 'border-color .2s ease',
    color: 'color .2s ease',
  }),
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

export const globalCss = {
  ...(convert(resetCSS) as Record<string, unknown>),
  ':root': commonVars as any,
  '.light-theme': lightVars as any,
  html: {
    fontFamily: 'geist, InterVariable, -apple-system, system-ui, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontSize: '16px',
    backgroundColor: 'var(--colors-surface, #111113)',
    color: 'var(--colors-textStrong, #edeef0)',
  },
  body: {
    ...(convert(resetCSS.body) as Record<string, unknown>),
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

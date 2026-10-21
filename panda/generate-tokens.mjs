import { build } from 'esbuild'
import path from 'node:path'
import fs from 'node:fs'

const outdir = '/tmp/pivot-token-gen'
fs.rmSync(outdir, { recursive: true, force: true })
await build({
  entryPoints: [
    path.resolve('packages/ui/src/design-system/colors.ts'),
    path.resolve('packages/ui/src/design-system/sizes.ts'),
  ],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir,
})
const { colors } = await import(`file://${outdir}/colors.js`)
const sizesMod = await import(`file://${outdir}/sizes.js`)

const resolveColor = (value, map) => {
  let current = value
  const seen = new Set()
  while (typeof current === 'string' && current.startsWith('$')) {
    const key = current.slice(1)
    if (seen.has(key) || !(key in map)) break
    seen.add(key)
    current = map[key]
  }
  return current
}
const resolveScale = (map) =>
  Object.fromEntries(
    Object.entries(map).map(([key, value]) => {
      if (typeof value !== 'string' || !value.startsWith('$')) return [key, value]
      return [key, map[value.slice(1)] ?? value]
    })
  )
const resolveShadows = (shadows) =>
  Object.fromEntries(
    Object.entries(shadows).map(([key, value]) => [
      key,
      value.replace(/\$colors\$([A-Za-z0-9_]+)/g, 'var(--colors-$1)'),
    ])
  )

const data = {
  darkColors: Object.fromEntries(Object.entries(colors.dark).map(([k, v]) => [k, resolveColor(v, colors.dark)])),
  lightColors: Object.fromEntries(Object.entries(colors.light).map(([k, v]) => [k, resolveColor(v, colors.light)])),
  space: sizesMod.space,
  sizes: resolveScale(sizesMod.sizes),
  fontSizes: resolveScale(sizesMod.fontSizes),
  radii: sizesMod.radii,
  shadows: resolveShadows(sizesMod.shadows),
  fonts: {
    default:
      'geist,InterVariable,-apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol',
    untitled: 'Untitled Sans, -apple-system, system-ui, sans-serif',
    mono: 'mono, -apple-system, system-ui, sans-serif',
  },
  fontWeights: { light: 300, regular: 400, medium: 500, bold: 600 },
  lineHeights: {
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
  },
  transitions: {
    shadow: 'box-shadow .2s ease',
    backgroundColor: 'background-color .2s ease',
    borderColor: 'border-color .2s ease',
    color: 'color .2s ease',
  },
}
const body = Object.entries(data)
  .map(([key, value]) => `export const ${key} = ${JSON.stringify(value, null, 2)} as const`)
  .join('\n\n')
fs.writeFileSync(
  'panda/designTokens.ts',
  `// Generated from packages/ui/src/design-system token sources.\n// Keep this snapshot in sync when the Stitches token source changes.\n\n${body}\n`
)
console.log('wrote panda/designTokens.ts')

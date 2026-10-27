import { build } from 'esbuild'
import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

const outdir = path.resolve('node_modules/.cache/pivot-token-gen')
fs.rmSync(outdir, { recursive: true, force: true })
await build({
  entryPoints: [path.resolve('panda/token-source/colors.ts'), path.resolve('panda/token-source/sizes.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir,
})
const { colors } = await import(pathToFileURL(path.join(outdir, 'colors.js')).href)
const sizesMod = await import(pathToFileURL(path.join(outdir, 'sizes.js')).href)

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
// A `$token` that survives resolution becomes an invalid CSS variable at runtime,
// which renders as transparent backgrounds or inherited text. Fail loudly instead.
const problems = []
for (const [scale, values] of Object.entries(data)) {
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === 'string' && /\$[A-Za-z]/.test(value) && scale !== 'shadows') {
      problems.push(`${scale}.${key} references an unknown token: ${value}`)
    }
  }
}
const darkKeys = new Set(Object.keys(data.darkColors))
const lightKeys = new Set(Object.keys(data.lightColors))
for (const key of darkKeys) if (!lightKeys.has(key)) problems.push(`lightColors is missing ${key}`)
for (const key of lightKeys) if (!darkKeys.has(key)) problems.push(`darkColors is missing ${key}`)
if (problems.length) {
  console.error(`token generation failed:\n  ${problems.join('\n  ')}`)
  process.exit(1)
}

const body = Object.entries(data)
  .map(([key, value]) => `export const ${key} = ${JSON.stringify(value, null, 2)} as const`)
  .join('\n\n')
fs.writeFileSync(
  'panda/designTokens.ts',
  `// Generated from panda/token-source token values.\n// Regenerate with node panda/generate-tokens.mjs after changing the token sources.\n\n${body}\n`
)
console.log('wrote panda/designTokens.ts')

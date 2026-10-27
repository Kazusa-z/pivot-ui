import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const srcRoot = join(root, 'packages/interface/src')
const allowedByFile = new Map([
  ['widgets/display/Kbd.tsx', new Set(['11px', '12px', '16px', '18px', '20px'])],
  ['widgets/color/ColorPlane.tsx', new Set(['130px'])],
  ['widgets/color/ColorWidget.tsx', new Set(['48px'])],
  ['widgets/sliders/Slider.tsx', new Set(['160px'])],
  ['widgets/collections/asset/AssetThumbnail.tsx', new Set(['64px'])],
  ['templates/color/RampControls.tsx', new Set(['64px'])],
  ['templates/resources/AssetReferenceInput.tsx', new Set(['48px'])],
  // Multi-line textarea content heights are content sizes, not control heights.
  ['widgets/inputs/text.styles.ts', new Set(['56px', '64px'])],
])
const propertyPattern = /\b(height|minHeight|borderRadius|fontSize):\s*'([^']+)'/g
const files = []

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'styled-system' || entry.name === 'node_modules') continue
      walk(full)
    } else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full)
  }
}

walk(srcRoot)
const problems = []
for (const full of files) {
  const file = relative(srcRoot, full).split('\\').join('/')
  const lines = readFileSync(full, 'utf8').split(/\r?\n/)
  const allowed = allowedByFile.get(file) ?? new Set()
  lines.forEach((line, index) => {
    for (const match of line.matchAll(propertyPattern)) {
      const [, property, value] = match
      if (!/^\d+(?:\.\d+)?px$/.test(value)) continue
      const pixels = Number.parseFloat(value)
      if ((property === 'height' || property === 'minHeight') && pixels <= 18) continue
      if ((property === 'height' || property === 'minHeight') && (pixels === 1 || pixels === 2)) continue
      if (property === 'borderRadius' && (pixels === 1 || pixels === 2)) continue
      if (allowed.has(value)) continue
      problems.push(`${file}:${index + 1}: ${property}: '${value}' (${line.trim()})`)
    }
  })
}

// Every `--colors-*` reference must exist, with a resolved value, in both themes.
// A missing or unresolved key becomes an invalid custom property at runtime: overlays
// turn transparent and selected text inherits the wrong color in only one theme.
const tokenSource = readFileSync(join(root, 'panda/designTokens.ts'), 'utf8')
const readColors = (name) => {
  const start = tokenSource.indexOf(`export const ${name} = {`)
  const end = tokenSource.indexOf('} as const', start)
  const entries = tokenSource.slice(start, end).matchAll(/^\s*['"]?([A-Za-z0-9_]+)['"]?:\s*['"]([^'"]*)['"]/gm)
  return new Map([...entries].map(([, key, value]) => [key, value]))
}
const themes = { dark: readColors('darkColors'), light: readColors('lightColors') }
const colorFiles = []
for (const directory of ['packages/interface/src', 'packages/interface/stories', 'storybook', 'app/src']) {
  const before = files.length
  walk(join(root, directory))
  colorFiles.push(...files.splice(before))
}
let colorReferences = 0
const colorProblems = new Set()
for (const full of [...files, ...colorFiles]) {
  const file = relative(root, full).split('\\').join('/')
  for (const [, key] of readFileSync(full, 'utf8').matchAll(/--colors-([A-Za-z0-9_]+)/g)) {
    colorReferences++
    for (const [theme, colors] of Object.entries(themes)) {
      const value = colors.get(key)
      if (value === undefined) colorProblems.add(`${file}: --colors-${key} is not defined in the ${theme} theme`)
      else if (value.startsWith('$'))
        colorProblems.add(`${file}: --colors-${key} is unresolved in the ${theme} theme (${value})`)
    }
  }
}
for (const [theme, colors] of Object.entries(themes)) {
  for (const [key, value] of colors) {
    if (value.startsWith('$')) colorProblems.add(`panda/designTokens.ts: ${theme} ${key} is unresolved (${value})`)
  }
}

if (problems.length) {
  console.error(`audit:styles failed with ${problems.length} raw size(s):`)
  for (const problem of problems) console.error(`- ${problem}`)
  process.exitCode = 1
}
if (colorProblems.size) {
  console.error(`audit:styles failed with ${colorProblems.size} color token problem(s):`)
  for (const problem of colorProblems) console.error(`- ${problem}`)
  process.exitCode = 1
}
if (!process.exitCode) {
  console.log(
    `audit:styles ok — ${files.length} source files use tokens for control sizes, radii and type; ` +
      `${colorReferences} color references resolve in both themes.`
  )
}

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

if (problems.length) {
  console.error(`audit:styles failed with ${problems.length} raw size(s):`)
  for (const problem of problems) console.error(`- ${problem}`)
  process.exitCode = 1
} else {
  console.log(`audit:styles ok — ${files.length} source files use tokens for control sizes, radii and type.`)
}

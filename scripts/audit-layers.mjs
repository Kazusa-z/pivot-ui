import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, normalize, relative, sep } from 'node:path'

// Component layers, bottom to top. A layer may import from any lower layer and from the
// shared modules, never from its own rank's siblings or from a higher layer. Storybook's
// sidebar follows the same order, so the source tree and the docs describe one structure.
const ranks = {
  foundation: 0,
  display: 1,
  overlays: 2,
  controls: 3,
  layout: 4,
  dialogs: 4,
  collections: 5,
  editors: 6,
  property: 7,
}
// Non-visual modules every layer may use; they must not import any component layer.
const shared = new Set(['values', 'contracts', 'interaction'])

const root = process.cwd()
const srcRoot = join(root, 'packages/interface/src')
const files = []
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full)
  }
}
walk(srcRoot)

const layerOf = (file) => relative(srcRoot, file).split(sep)[0]
const problems = []
for (const file of files) {
  const from = layerOf(file)
  if (!(from in ranks) && !shared.has(from)) {
    if (from !== 'index.ts') problems.push(`${relative(srcRoot, file)}: unknown layer "${from}"`)
    continue
  }
  const text = readFileSync(file, 'utf8')
  for (const [, spec] of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
    const target = normalize(join(dirname(file), spec))
    if (!target.startsWith(srcRoot + sep)) continue
    const to = layerOf(target)
    if (to === from || shared.has(to)) continue
    const where = `${relative(srcRoot, file)} -> ${relative(srcRoot, target)}`
    if (shared.has(from)) problems.push(`${where}: shared module "${from}" imports component layer "${to}"`)
    else if (!(to in ranks)) problems.push(`${where}: unknown layer "${to}"`)
    else if (ranks[to] >= ranks[from]) problems.push(`${where}: "${from}" may not depend on "${to}"`)
  }
}

if (problems.length) {
  console.error(`audit:layers failed with ${problems.length} problem(s):`)
  for (const problem of problems) console.error(`- ${problem}`)
  process.exitCode = 1
} else {
  console.log(`audit:layers ok — ${files.length} source files only depend on lower layers.`)
}

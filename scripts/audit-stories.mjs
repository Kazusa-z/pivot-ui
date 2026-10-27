import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const storiesRoot = join(root, 'packages/interface/stories')
const guidesRoot = join(storiesRoot, 'guides')
const files = readdirSync(storiesRoot)
  .filter((name) => name.endsWith('.stories.tsx'))
  .sort()
const problems = []

// Sidebar groups are the source layers (scripts/audit-layers.mjs); Editors adds the value type.
const layers = [
  'Foundation',
  'Display',
  'Overlays',
  'Controls',
  'Layout',
  'Dialogs',
  'Collections',
  'Editors',
  'Property',
]
const editorGroups = ['Numeric', 'Color', 'Curve', 'Resources']
// Pages still on the retired StoryPage layout while the migration is in progress.
const allowLegacy = true
let legacy = 0

for (const file of files) {
  const text = readFileSync(join(storiesRoot, file), 'utf8')
  const meta = text.match(/const meta = \{([\s\S]*?)\} satisfies Meta/)
  const title = meta?.[1].match(/title:\s*'([^']+)'/)?.[1]
  if (!meta || !title) {
    problems.push(`${file}: missing meta block or title`)
    continue
  }

  if (/from ['"]\.\/support\/StoryPage['"]/.test(text)) {
    legacy++
    if (!allowLegacy) problems.push(`${file}: still uses the retired StoryPage layout`)
    continue
  }

  const segments = title.split('/')
  if (!layers.includes(segments[0])) problems.push(`${file}: "${title}" must start with a layer: ${layers.join(', ')}`)
  if (segments[0] === 'Editors' && (segments.length !== 3 || !editorGroups.includes(segments[1])))
    problems.push(`${file}: editor pages are titled Editors/<${editorGroups.join('|')}>/<Component>`)
  if (segments[0] !== 'Editors' && segments.length !== 2) problems.push(`${file}: "${title}" must be <Layer>/<Page>`)
  const page = segments
    .at(-1)
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
    .replace(/[^A-Za-z0-9]/g, '')
  if (file !== `${page}.stories.tsx`) problems.push(`${file}: file name should be ${page}.stories.tsx for "${title}"`)
  if (!/describeComponent\(/.test(text)) problems.push(`${file}: describe the page with describeComponent()`)

  const stories = [...text.matchAll(/export const (\w+)\s*:\s*Story\s*=\s*\{/g)]
  if (!stories.length) problems.push(`${file}: no stories`)
  for (const [index, match] of stories.entries()) {
    const name = match[1]
    const body = text.slice(match.index, stories[index + 1]?.index ?? text.length)
    const hidden = /tags:\s*\[[^\]]*'!autodocs'/.test(body)
    if (name.startsWith('Behavior') !== hidden)
      problems.push(`${file}: ${name} — Behavior* stories, and only they, opt out of docs with tags: ['!autodocs']`)
    if (index === 0 && hidden)
      problems.push(`${file}: the first story is the docs primary example and must stay in docs`)
  }
}

for (const name of readdirSync(guidesRoot).filter((entry) => entry.endsWith('.mdx'))) {
  const title = readFileSync(join(guidesRoot, name), 'utf8').match(/<Meta title="([^"]+)"/)?.[1]
  if (!title?.startsWith('Guides/')) problems.push(`guides/${name}: guide pages are titled Guides/<Page>`)
}

if (problems.length) {
  console.error(`audit:stories failed with ${problems.length} problem(s):`)
  for (const problem of problems) console.error(`- ${problem}`)
  process.exitCode = 1
} else {
  const migrated = files.length - legacy
  console.log(
    `audit:stories ok — ${migrated} component page(s) follow the docs model` +
      (legacy ? `; ${legacy} legacy page(s) awaiting migration.` : '.')
  )
}

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const storiesRoot = join(root, 'packages/interface/stories')
const files = readdirSync(storiesRoot)
  .filter((name) => name.endsWith('.stories.tsx'))
  .sort()
const problems = []
const titlePattern = /^[A-Z][A-Za-z0-9 ]*(?:\/[A-Z][A-Za-z0-9 ]*)+$/
const forbidden = /ContractFrame|contractStyles|ControlButton|ControlInput|ControlSelect|<select\b|<input\b/

for (const file of files) {
  const full = join(storiesRoot, file)
  const text = readFileSync(full, 'utf8')
  if (!/from ['"]\.\/support\/StoryPage['"]/.test(text)) {
    problems.push(`${file}: missing StoryPage import`)
  }
  if (forbidden.test(text)) {
    problems.push(`${file}: contains a retired story helper or native demo control`)
  }
  const meta = text.match(/const meta = \{([\s\S]*?)\} satisfies Meta/)
  if (!meta) {
    problems.push(`${file}: missing meta block`)
  } else {
    const title = meta[1].match(/title:\s*'([^']+)'/)
    if (!title) problems.push(`${file}: missing meta title`)
    else if (!titlePattern.test(title[1])) problems.push(`${file}: invalid title "${title[1]}"`)
  }
  const overviews = text.match(/export const Overview\b/g)?.length ?? 0
  if (overviews !== 1) problems.push(`${file}: expected exactly one Overview export, found ${overviews}`)
  const exports = [...text.matchAll(/export const (\w+)\s*:\s*Story/g)].map((match) => match[1])
  if (exports.some((name) => name !== 'Overview') && !/tags:\s*\['!autodocs'\]/.test(text)) {
    problems.push(`${file}: additional stories must opt out of autodocs`)
  }
}

if (problems.length) {
  console.error(`audit:stories failed with ${problems.length} problem(s):`)
  for (const problem of problems) console.error(`- ${problem}`)
  process.exitCode = 1
} else {
  console.log(`audit:stories ok — ${files.length} story files use StoryPage, Overview docs and valid titles.`)
}

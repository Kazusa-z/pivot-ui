import type { MouseEvent, ReactNode } from 'react'
import { addons } from 'storybook/preview-api'
import { NAVIGATE_URL } from 'storybook/internal/core-events'

/** Docs entry id Storybook derives from a sidebar title, e.g. `Editors/Color/ColorField` → `editors-color-colorfield--docs`. */
export function docsId(title: string) {
  return `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}--docs`
}

/** A link to another docs page that navigates the Storybook manager, like markdown links in MDX do. */
export function DocLink({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  const href = `?path=/docs/${docsId(title)}`
  return (
    <a
      href={href}
      className={className}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
        event.preventDefault()
        addons.getChannel().emit(NAVIGATE_URL, href)
      }}>
      {children}
    </a>
  )
}

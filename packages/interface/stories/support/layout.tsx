import type { ReactNode } from 'react'
import { css, cx } from '../../styled-system/css'

// Minimal layout for example stories. Examples show the component, not a page around it:
// no headings or cards, just alignment and an optional caption per item.

const rowClass = css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)' })
const columnClass = css({ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 'var(--space-3)' })
const gridClass = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 'var(--space-4)',
  alignItems: 'start',
})
const itemClass = css({ display: 'flex', flexDirection: 'column', gap: 'var(--space-1_5)', minWidth: 0 })
const captionClass = css({
  fontSize: 'var(--fontSizes-micro)',
  lineHeight: 'var(--lineHeights-1)',
  color: 'var(--colors-textMuted)',
})
const panelClass = css({
  boxSizing: 'border-box',
  padding: 'var(--space-2)',
  borderRadius: 'var(--radii-controlMd)',
  backgroundColor: 'var(--colors-surface)',
  border: '1px solid var(--colors-border)',
})

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(rowClass, className)}>{children}</div>
}

export function Column({ children, width, className }: { children: ReactNode; width?: number; className?: string }) {
  return (
    <div className={cx(columnClass, className)} style={width ? { width, maxWidth: '100%' } : undefined}>
      {children}
    </div>
  )
}

export function Grid({ children }: { children: ReactNode }) {
  return <div className={gridClass}>{children}</div>
}

/** One example with a short caption above it, e.g. a size or a state name. */
export function Item({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className={itemClass}>
      <span className={captionClass}>{label}</span>
      {children}
    </div>
  )
}

/** A property-panel sized surface for components that live inside an inspector. */
export function Panel({ children, width = 320 }: { children: ReactNode; width?: number }) {
  return (
    <div className={panelClass} style={{ width, maxWidth: '100%' }}>
      {children}
    </div>
  )
}

const stateClass = css({
  margin: 0,
  padding: 'var(--space-2)',
  borderRadius: 'var(--radii-control)',
  backgroundColor: 'var(--colors-surfaceSubtle)',
  color: 'var(--colors-textMuted)',
  fontFamily: 'var(--fonts-mono)',
  fontSize: 'var(--fontSizes-micro)',
  lineHeight: 'var(--lineHeights-1_5)',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
})

/** Debug output for Behavior stories only; documentation examples never show it. */
export function StateView({ value }: { value: unknown }) {
  return <pre className={stateClass}>{JSON.stringify(value, null, 2) ?? 'undefined'}</pre>
}

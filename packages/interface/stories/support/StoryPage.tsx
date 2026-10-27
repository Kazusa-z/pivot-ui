import type { ReactNode } from 'react'
import { css, cx } from '../../styled-system/css'
import { Title, Text } from '../../src/foundation/typography'
import { Badge } from '../../src/widgets/display/Badge'
import { Separator } from '../../src/widgets/display/Separator'
import { Kbd } from '../../src/widgets/display/Kbd'

/* Page shell */
const pageClass = css({
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: '1040px',
  minHeight: '100%',
  margin: '0 auto',
  padding: 'var(--space-8)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-6)',
  color: 'var(--colors-text)',
  backgroundColor: 'var(--colors-appBg)',
  fontFamily: 'var(--fonts-default)',
  '@media (max-width: 720px)': { padding: 'var(--space-6)' },
})

const headerClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
  minWidth: 0,
})

const eyebrowClass = css({
  fontSize: 'var(--fontSizes-micro)',
  lineHeight: 'var(--lineHeights-1)',
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--colors-textMuted)',
})

const titleRowClass = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 'var(--space-3)',
  minWidth: 0,
})

const summaryClass = css({
  maxWidth: '72ch',
  color: 'var(--colors-textMuted)',
  lineHeight: 'var(--lineHeights-2)',
})

const metaClass = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--space-2)',
  minWidth: 0,
  fontSize: 'var(--fontSizes-control)',
  color: 'var(--colors-textMuted)',
})

const pageContentClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-8)',
  minWidth: 0,
})

export interface StoryPageProps {
  eyebrow?: ReactNode
  title: ReactNode
  summary?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

/** Public-documentation page shell: one title, one summary, consistent section rhythm. */
export function StoryPage({ eyebrow, title, summary, meta, actions, children }: StoryPageProps) {
  return (
    <main className={pageClass}>
      <header className={headerClass}>
        {eyebrow && <div className={eyebrowClass}>{eyebrow}</div>}
        <div className={titleRowClass}>
          <Title as="h1" size={5} weight="bold">
            {title}
          </Title>
          {actions && <div className={css({ display: 'flex', gap: 'var(--space-2)' })}>{actions}</div>}
        </div>
        {summary && (
          <Text as="p" size="md" tone="muted" className={summaryClass}>
            {summary}
          </Text>
        )}
        {meta && <div className={metaClass}>{meta}</div>}
      </header>
      <Separator decorative />
      <div className={pageContentClass}>{children}</div>
    </main>
  )
}

/* Sections */
const sectionClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
  minWidth: 0,
})

const sectionHeaderClass = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-3)',
  minWidth: 0,
})

const sectionDescriptionClass = css({
  maxWidth: '72ch',
  color: 'var(--colors-textMuted)',
  lineHeight: 'var(--lineHeights-1_5)',
})

const sectionContentClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
  minWidth: 0,
})

export interface StorySectionProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export function StorySection({ title, description, actions, children }: StorySectionProps) {
  return (
    <section className={sectionClass}>
      <div className={sectionHeaderClass}>
        <Title as="h2" size={3} weight="semi">
          {title}
        </Title>
        {actions && <div className={css({ display: 'flex', gap: 'var(--space-2)' })}>{actions}</div>}
      </div>
      {description && (
        <Text as="p" size="sm" tone="muted" className={sectionDescriptionClass}>
          {description}
        </Text>
      )}
      <div className={sectionContentClass}>{children}</div>
    </section>
  )
}

/* Layout primitives */
const gridClass = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
  gap: 'var(--space-4)',
  minWidth: 0,
})

export function StoryGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(gridClass, className)}>{children}</div>
}

const rowClass = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--space-2)',
  minWidth: 0,
})

export function StoryRow({
  children,
  className,
  align = 'center',
}: {
  children: ReactNode
  className?: string
  align?: 'center' | 'start' | 'end'
}) {
  return (
    <div
      className={cx(
        rowClass,
        css({ alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center' }),
        className
      )}>
      {children}
    </div>
  )
}

const cardClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  minWidth: 0,
  padding: 'var(--space-4)',
  border: '1px solid var(--colors-border)',
  borderRadius: 'var(--radii-card)',
  backgroundColor: 'var(--colors-surface)',
})

const cardSubtleClass = css({ backgroundColor: 'var(--colors-surfaceSubtle)' })
const cardTransparentClass = css({ backgroundColor: 'transparent' })
const cardLabelClass = css({
  fontSize: 'var(--fontSizes-control)',
  lineHeight: 'var(--lineHeights-1)',
  fontWeight: 500,
  color: 'var(--colors-textStrong)',
})
const cardHintClass = css({
  fontSize: 'var(--fontSizes-control)',
  lineHeight: 'var(--lineHeights-1_5)',
  color: 'var(--colors-textMuted)',
})

export function StoryCard({
  title,
  description,
  children,
  tone = 'surface',
  className,
}: {
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  tone?: 'surface' | 'subtle' | 'transparent'
  className?: string
}) {
  return (
    <div
      className={cx(
        cardClass,
        tone === 'subtle' ? cardSubtleClass : tone === 'transparent' ? cardTransparentClass : undefined,
        className
      )}>
      {title && <div className={cardLabelClass}>{title}</div>}
      {description && <div className={cardHintClass}>{description}</div>}
      {children}
    </div>
  )
}

const fieldClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1_5)',
  minWidth: 0,
})
const fieldLabelClass = css({
  fontSize: 'var(--fontSizes-control)',
  lineHeight: 'var(--lineHeights-1)',
  fontWeight: 500,
  color: 'var(--colors-text)',
})
const fieldHintClass = css({
  fontSize: 'var(--fontSizes-micro)',
  lineHeight: 'var(--lineHeights-1)',
  color: 'var(--colors-textMuted)',
})

export function StoryField({
  label,
  hint,
  children,
  className,
}: {
  label: ReactNode
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cx(fieldClass, className)}>
      <div className={fieldLabelClass}>{label}</div>
      {children}
      {hint && <div className={fieldHintClass}>{hint}</div>}
    </div>
  )
}

/* Density comparison */
const densityGridClass = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
  gap: 'var(--space-4)',
  minWidth: 0,
})

export function StoryDensity({
  tier,
  children,
  description,
}: {
  tier: 'compact' | 'regular'
  children: ReactNode
  description?: ReactNode
}) {
  return (
    <div className={cx(cardClass, cardSubtleClass)}>
      <div className={css({ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' })}>
        <Badge size="sm" variant="surface" color={tier === 'compact' ? 'gray' : 'blue'}>
          {tier === 'compact' ? 'Compact 20 / 24' : 'Regular 32 / 36'}
        </Badge>
      </div>
      {description && <div className={cardHintClass}>{description}</div>}
      <div className={css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' })}>
        {children}
      </div>
    </div>
  )
}

export function StoryDensityGroup({ children }: { children: ReactNode }) {
  return <div className={densityGridClass}>{children}</div>
}

/* Code and state */
const codeWrapClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  minWidth: 0,
})
const codeLabelClass = css({
  fontSize: 'var(--fontSizes-micro)',
  lineHeight: 'var(--lineHeights-1)',
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--colors-textMuted)',
})
const codeClass = css({
  margin: 0,
  padding: 'var(--space-3)',
  maxHeight: '320px',
  overflow: 'auto',
  border: '1px solid var(--colors-border)',
  borderRadius: 'var(--radii-controlMd)',
  backgroundColor: 'var(--colors-surfaceSubtle)',
  color: 'var(--colors-text)',
  fontFamily: 'var(--fonts-mono)',
  fontSize: 'var(--fontSizes-control)',
  lineHeight: 'var(--lineHeights-1_5)',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
})

export function StoryCode({ code, label }: { code: string; label?: ReactNode }) {
  return (
    <div className={codeWrapClass}>
      {label && <div className={codeLabelClass}>{label}</div>}
      <pre className={codeClass}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

// Debug state is secondary to the component: a quiet, collapsed disclosure line
// that only turns into a code panel when someone opens it.
const detailsClass = css({
  minWidth: 0,
  '& > summary': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-0_5) 0',
    cursor: 'pointer',
    fontSize: 'var(--fontSizes-micro)',
    lineHeight: 'var(--lineHeights-1)',
    color: 'var(--colors-textMuted)',
    listStyle: 'none',
    userSelect: 'none',
    '&::-webkit-details-marker': { display: 'none' },
    '&::before': { content: '"▸"', transition: 'transform 120ms ease-out' },
    '&:hover': { color: 'var(--colors-text)' },
    '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
  },
  '&[open] > summary::before': { transform: 'rotate(90deg)' },
  '& > pre': { marginTop: 'var(--space-1)' },
})

export function StoryState({
  label = 'State',
  value,
  open = false,
}: {
  label?: ReactNode
  value: unknown
  open?: boolean
}) {
  return (
    <details className={detailsClass} open={open}>
      <summary>{label}</summary>
      <pre className={codeClass}>
        <code>{JSON.stringify(value, null, 2) ?? 'undefined'}</code>
      </pre>
    </details>
  )
}

/* Tables */
const tableWrapClass = css({ width: '100%', minWidth: 0, overflowX: 'auto' })
const tableClass = css({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 'var(--fontSizes-control)',
  lineHeight: 'var(--lineHeights-1_5)',
  color: 'var(--colors-text)',
  '& th, & td': {
    padding: 'var(--space-2) var(--space-3)',
    textAlign: 'start',
    verticalAlign: 'top',
    borderBottom: '1px solid var(--colors-border)',
  },
  '& th': { fontWeight: 500, color: 'var(--colors-textMuted)' },
  '& tr:last-child td': { borderBottom: 0 },
  '& code': { fontFamily: 'var(--fonts-mono)', color: 'var(--colors-textStrong)' },
})

export interface StoryKeyboardRow {
  keys: string | readonly string[]
  action: ReactNode
}

export function StoryKeyboard({ rows }: { rows: readonly StoryKeyboardRow[] }) {
  return (
    <div className={tableWrapClass}>
      <table className={tableClass}>
        <thead>
          <tr>
            <th scope="col">Keys</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <span className={css({ display: 'inline-flex', gap: 'var(--space-1)' })}>
                  {(Array.isArray(row.keys) ? row.keys : [row.keys]).map((key) => (
                    <Kbd key={key} size="sm" letterCase="preserve">
                      {key}
                    </Kbd>
                  ))}
                </span>
              </td>
              <td>{row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export interface StoryPropRow {
  name: string
  type: string
  defaultValue?: string
  description: ReactNode
}

export function StoryProps({ rows }: { rows: readonly StoryPropRow[] }) {
  return (
    <div className={tableWrapClass}>
      <table className={tableClass}>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>
                <code>{row.type}</code>
              </td>
              <td>{row.defaultValue ?? '—'}</td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* Notes and stage */
const noteClass = css({
  margin: 0,
  maxWidth: '72ch',
  fontSize: 'var(--fontSizes-control)',
  lineHeight: 'var(--lineHeights-1_5)',
  color: 'var(--colors-textMuted)',
})
const noteStrongClass = css({ color: 'var(--colors-text)' })
const noteDangerClass = css({ color: 'var(--colors-dangerText)' })

export function StoryNote({
  children,
  tone = 'muted',
}: {
  children: ReactNode
  tone?: 'muted' | 'default' | 'danger'
}) {
  return (
    <p
      className={cx(noteClass, tone === 'default' ? noteStrongClass : tone === 'danger' ? noteDangerClass : undefined)}>
      {children}
    </p>
  )
}

const stageClass = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 0,
  minHeight: '200px',
  padding: 'var(--space-6)',
  border: '1px solid var(--colors-border)',
  borderRadius: 'var(--radii-card)',
  backgroundColor: 'var(--colors-appBg)',
  overflow: 'hidden',
})

export function StoryStage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(stageClass, className)}>{children}</div>
}

/* Small metadata helpers */
export function StoryMeta({ children }: { children: ReactNode }) {
  return <div className={metaClass}>{children}</div>
}

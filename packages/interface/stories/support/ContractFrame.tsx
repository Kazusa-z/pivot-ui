import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { css, cx } from '../../styled-system/css'

export const contractStyles = {
  stack: css({ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }),
  row: css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }),
  grid: css({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: '12px' }),
  note: css({ margin: 0, color: 'var(--colors-textMuted)', fontSize: '13px', lineHeight: '1.6' }),
}

const controlClass = css({
  boxSizing: 'border-box',
  minWidth: 0,
  maxWidth: '100%',
  minHeight: '34px',
  padding: '6px 10px',
  border: '1px solid var(--colors-borderStrong)',
  borderRadius: '6px',
  backgroundColor: 'var(--colors-surfaceSubtle)',
  color: 'var(--colors-text)',
  font: 'inherit',
  fontSize: '13px',
  '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
})

export function ControlButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={cx(controlClass, className)} {...props} />
}

export function ControlInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(controlClass, className)} {...props} />
}

export function ControlSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(controlClass, className)} {...props} />
}

export function ControlField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={css({ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' })}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export function StatePanel({ label, value }: { label: string; value: unknown }) {
  return (
    <section
      aria-label={label}
      className={css({
        minWidth: 0,
        padding: '12px',
        border: '1px solid var(--colors-border)',
        borderRadius: '8px',
        backgroundColor: 'var(--colors-surfaceSubtle)',
      })}>
      <h3 className={css({ margin: '0 0 8px', fontSize: '12px', fontWeight: 600 })}>{label}</h3>
      <pre
        className={css({
          margin: 0,
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          maxHeight: '300px',
          overflow: 'auto',
          fontSize: '12px',
          lineHeight: '1.6',
        })}>
        {JSON.stringify(value, null, 2) ?? 'undefined'}
      </pre>
    </section>
  )
}

export function ContractFrame({
  title,
  description,
  children,
  onReset,
}: {
  title: string
  description: string
  children: ReactNode
  onReset: () => void
}) {
  return (
    <main
      className={css({
        width: 'min(920px, 100%)',
        boxSizing: 'border-box',
        padding: '20px',
        margin: '0 auto',
        color: 'var(--colors-text)',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      })}>
      <header className={contractStyles.stack}>
        <div className={css({ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px' })}>
          <h1 className={css({ margin: 0, fontSize: '20px', lineHeight: '1.4' })}>{title}</h1>
          <ControlButton onClick={onReset}>Reset</ControlButton>
        </div>
        <p className={contractStyles.note}>{description}</p>
      </header>
      {children}
    </main>
  )
}

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

const calloutRecipe = cva({
  base: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    borderRadius: '4px',
    fontSize: '12px',
    lineHeight: '1.5',
    padding: '4px 8px',
    fontWeight: 500,
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
  variants: {
    severity: {
      info: { backgroundColor: 'var(--colors-blue3)', color: 'var(--colors-blueA11)' },
      warning: { backgroundColor: 'var(--colors-amber3)', color: 'var(--colors-amber11)' },
      error: { backgroundColor: 'var(--colors-red3)', color: 'var(--colors-red11)' },
      success: { backgroundColor: 'var(--colors-green3)', color: 'var(--colors-green11)' },
    },
  },
  defaultVariants: { severity: 'info' },
})

export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'role'> {
  severity?: 'info' | 'warning' | 'error' | 'success'
  /** Visual severity does not imply an assertive announcement. */
  role?: 'note' | 'status' | 'alert'
  title?: ReactNode
  icon?: ReactNode
  css?: SystemStyleObject
}

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { severity = 'info', role = 'note', title, icon, css: cssProp, className, children, ...props },
  ref
) {
  return (
    <div {...props} ref={ref} role={role} className={cx(css(calloutRecipe.raw({ severity }), cssProp), className)}>
      {icon && (
        <span aria-hidden="true" className={css({ display: 'inline-flex', flexShrink: 0, paddingTop: '2px' })}>
          {icon}
        </span>
      )}
      <div className={css({ minWidth: 0 })}>
        {title && <div className={css({ fontWeight: 600 })}>{title}</div>}
        {children}
      </div>
    </div>
  )
})

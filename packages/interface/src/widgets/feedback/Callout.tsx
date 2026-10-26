import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

const calloutRecipe = cva({
  base: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    borderRadius: 'var(--radii-controlMd)',
    border: '1px solid transparent',
    fontSize: 'var(--fontSizes-control)',
    lineHeight: 'var(--lineHeights-1_5)',
    padding: '8px 12px',
    fontWeight: 400,
    minWidth: 0,
    overflowWrap: 'anywhere',
    '& svg': { width: '16px', height: '16px' },
  },
  variants: {
    severity: {
      info: {
        backgroundColor: 'var(--colors-infoBg)',
        borderColor: 'var(--colors-infoBorder)',
        color: 'var(--colors-infoText)',
      },
      warning: {
        backgroundColor: 'var(--colors-warningBg)',
        borderColor: 'var(--colors-warningBorder)',
        color: 'var(--colors-warningText)',
      },
      error: {
        backgroundColor: 'var(--colors-dangerBg)',
        borderColor: 'var(--colors-dangerBorder)',
        color: 'var(--colors-dangerText)',
      },
      success: {
        backgroundColor: 'var(--colors-successBg)',
        borderColor: 'var(--colors-successBorder)',
        color: 'var(--colors-successText)',
      },
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

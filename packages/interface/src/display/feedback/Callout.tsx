import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

const calloutRecipe = cva({
  base: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    borderRadius: 'var(--radii-controlMd)',
    fontSize: 'var(--fontSizes-control)',
    color: 'var(--colors-text)',
    backgroundColor: 'color-mix(in srgb, var(--callout-accent) 10%, transparent)',
    lineHeight: 'var(--lineHeights-1_5)',
    padding: '8px 12px',
    fontWeight: 400,
    minWidth: 0,
    overflowWrap: 'anywhere',
    '& svg': { width: '16px', height: '16px' },
  },
  // Callouts are a faint tint of the severity color with no border: the icon and
  // title carry the severity, the body stays in regular text color so long copy is calm.
  variants: {
    severity: {
      info: { '--callout-accent': 'var(--colors-infoIcon)' },
      warning: { '--callout-accent': 'var(--colors-warningIcon)' },
      error: { '--callout-accent': 'var(--colors-dangerIcon)' },
      success: { '--callout-accent': 'var(--colors-successIcon)' },
    },
  },
  defaultVariants: { severity: 'info' },
})

export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'role'> {
  /** 严重程度，决定图标和标题的颜色。 */
  severity?: 'info' | 'warning' | 'error' | 'success'
  /** 读屏播报方式：`note` 普通说明（默认，不主动播报），`status` 礼貌播报结果，`alert` 立即播报紧急错误。与 `severity` 独立选择。 */
  role?: 'note' | 'status' | 'alert'
  /** 加粗的标题，说明是什么情况。 */
  title?: ReactNode
  /** 左侧图标，通常与 severity 对应。 */
  icon?: ReactNode
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { severity = 'info', role = 'note', title, icon, css: cssProp, className, children, ...props },
  ref
) {
  return (
    <div {...props} ref={ref} role={role} className={cx(css(calloutRecipe.raw({ severity }), cssProp), className)}>
      {icon && (
        <span
          aria-hidden="true"
          className={css({ display: 'inline-flex', flexShrink: 0, paddingTop: '2px', color: 'var(--callout-accent)' })}>
          {icon}
        </span>
      )}
      <div className={css({ minWidth: 0 })}>
        {title && <div className={css({ fontWeight: 600, color: 'var(--callout-accent)' })}>{title}</div>}
        {children}
      </div>
    </div>
  )
})

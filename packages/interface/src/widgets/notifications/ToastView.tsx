import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { Spin } from '../feedback/Spin'
import { getOverlaySurfaceClass, useOverlayTheme } from '../overlays/shared'

export interface ToastViewProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'info' | 'success' | 'error' | 'loading'
  icon?: ReactNode
  visible?: boolean
  onDismiss?: () => void
  dismissLabel?: string
  css?: SystemStyleObject
}

/** 展示一条带状态、内容和操作的通知。需要定时关闭或任务进度更新时，配合 NotificationProvider 的服务使用。 */
export const ToastView = forwardRef<HTMLDivElement, ToastViewProps>(function ToastView(
  {
    tone = 'info',
    icon,
    visible = true,
    onDismiss,
    dismissLabel = 'Dismiss notification',
    css: cssProp,
    className,
    children,
    role = 'status',
    'aria-live': live = 'polite',
    ...props
  },
  ref
) {
  const theme = useOverlayTheme()
  return (
    <div
      {...theme}
      {...props}
      ref={ref}
      inert={!visible || undefined}
      data-notification-view=""
      data-visible={visible ? '' : undefined}
      className={cx(
        getOverlaySurfaceClass(
          css.raw(
            {
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              maxWidth: 'min(420px, calc(100vw - 32px))',
              minHeight: '32px',
              pointerEvents: 'auto',
              '&:not([data-visible])': { pointerEvents: 'none' },
            },
            cssProp
          )
        ),
        theme.className,
        className
      )}
      style={{ ...props.style, opacity: visible ? 1 : 0 }}
      aria-hidden={!visible || undefined}>
      <span
        aria-hidden
        className={css({ display: 'inline-flex', flex: '0 0 auto', '& > svg': { width: '16px', height: '16px' } })}>
        {icon ??
          (tone === 'loading' ? (
            <Spin size="sm" decorative />
          ) : tone === 'success' ? (
            <IconCheck />
          ) : tone === 'error' ? (
            <IconX />
          ) : (
            <IconInfoCircle />
          ))}
      </span>
      <div
        role={role}
        aria-live={live}
        aria-atomic="true"
        className={css({ minWidth: 0, flex: 1, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' })}>
        {children}
      </div>
      {onDismiss && (
        <button
          type="button"
          aria-label={dismissLabel}
          tabIndex={visible ? 0 : -1}
          onClick={onDismiss}
          className={css({
            display: 'inline-flex',
            flex: '0 0 auto',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            color: 'inherit',
            background: 'transparent',
            border: 0,
            borderRadius: '4px',
            cursor: 'pointer',
            '&:focus-visible': { outline: '2px solid var(--colors-focusRing)' },
          })}>
          <IconX size={14} aria-hidden />
        </button>
      )}
    </div>
  )
})

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { Spin } from '../../display/feedback/Spin'
import { getOverlaySurfaceClass, useOverlayTheme } from '../shared'

export interface ToastViewProps extends HTMLAttributes<HTMLDivElement> {
  /** 状态：决定图标；`error` 应同时设置 `role="alert"`。 */
  tone?: 'info' | 'success' | 'error' | 'loading'
  /** 替换默认的状态图标。 */
  icon?: ReactNode
  /** 进入 / 离开动画状态，由 Toaster 控制；单独使用时不需要设置。 */
  visible?: boolean
  /** 提供时显示关闭按钮。 */
  onDismiss?: () => void
  /** 关闭按钮的无障碍名称，默认 "Dismiss notification"。 */
  dismissLabel?: string
  /** 追加 Panda 样式对象。 */
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
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-2_5)',
              width: '320px',
              maxWidth: 'min(320px, calc(100vw - 32px))',
              minHeight: 'var(--sizes-controlMd)',
              pointerEvents: 'auto',
              transition: 'opacity 120ms ease-out',
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
        data-tone={tone}
        className={css({
          display: 'inline-flex',
          flex: '0 0 auto',
          '& > svg': { width: 'var(--sizes-iconMd)', height: 'var(--sizes-iconMd)' },
          '&[data-tone="info"]': { color: 'var(--colors-infoText)' },
          '&[data-tone="success"]': { color: 'var(--colors-successText)' },
          '&[data-tone="error"]': { color: 'var(--colors-dangerText)' },
          '&[data-tone="loading"]': { color: 'var(--colors-primarySolid)' },
        })}>
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
            width: 'var(--sizes-controlSm)',
            height: 'var(--sizes-controlSm)',
            color: 'var(--colors-textMuted)',
            background: 'transparent',
            border: 0,
            borderRadius: 'var(--radii-control)',
            cursor: 'pointer',
            '&:hover': { color: 'var(--colors-textStrong)', backgroundColor: 'var(--colors-softBgHover)' },
            '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
          })}>
          <IconX size={14} aria-hidden />
        </button>
      )}
    </div>
  )
})

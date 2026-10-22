import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { Spin } from '../feedback/Spin'
import { ButtonBase, type ButtonBaseProps } from './ButtonBase'
import { getActionButtonClassName, getActionButtonGroupClassName, cornerIconClass } from './button.styles'

export interface ActionButtonProps extends Omit<ButtonBaseProps, 'asChild' | 'renderContent'> {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'soft' | 'subtle' | 'ghost'
  active?: boolean
  fancy?: boolean
  corner?: boolean
  css?: SystemStyleObject
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton(
  { size = 'sm', variant = 'soft', active, fancy, corner, css: cssProp, className, ...props },
  ref
) {
  return (
    <ButtonBase
      {...props}
      ref={ref}
      data-action-button=""
      aria-pressed={props['aria-pressed'] ?? active}
      className={cx(
        'action-button',
        getActionButtonClassName({ size, variant, active, fancy, corner }, cssProp),
        className
      )}
      renderContent={(children, loading) => (
        <>
          {loading ? <Spin decorative className="action-button-spin" size="xs" color="inherit" /> : children}
          {corner && (
            <svg aria-hidden="true" viewBox="0 0 4 4" className={cornerIconClass}>
              <path d="M4 0V4H0Z" fill="currentColor" />
            </svg>
          )}
        </>
      )}
    />
  )
})
ActionButton.toString = () => '.action-button'

export interface ActionButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical'
  css?: SystemStyleObject
}

/** Visual grouping only: callers can provide a group label, but this is not a toolbar. */
export const ActionButtonGroup = forwardRef<HTMLDivElement, ActionButtonGroupProps>(function ActionButtonGroup(
  { direction = 'horizontal', css: cssProp, className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx(getActionButtonGroupClassName({ orientation: direction }, cssProp), className)}
    />
  )
})

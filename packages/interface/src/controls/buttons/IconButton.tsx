import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { Spin } from '../../display/feedback/Spin'
import { ButtonBase, type ButtonBaseProps } from './ButtonBase'
import { getIconButtonClassName, getIconButtonGroupClassName, cornerIconClass } from './button.styles'

export interface IconButtonProps extends Omit<ButtonBaseProps, 'asChild' | 'renderContent'> {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'soft' | 'subtle' | 'ghost'
  active?: boolean
  fancy?: boolean
  corner?: boolean
  css?: SystemStyleObject
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { size = 'sm', variant = 'soft', active, fancy, corner, css: cssProp, className, ...props },
  ref
) {
  return (
    <ButtonBase
      {...props}
      ref={ref}
      data-icon-button=""
      aria-pressed={props['aria-pressed'] ?? active}
      className={cx(
        'icon-button',
        getIconButtonClassName({ size, variant, active, fancy, corner }, cssProp),
        className
      )}
      renderContent={(children, loading) => (
        <>
          {loading ? <Spin decorative className="icon-button-spin" size="xs" color="inherit" /> : children}
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
IconButton.toString = () => '.icon-button'

export interface IconButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical'
  /** Match the size of the buttons in the group so the outer corners line up. */
  size?: IconButtonProps['size']
  css?: SystemStyleObject
}

/** 将相关动作按钮排列成组。可提供组名称，每个按钮保留自己的点击和键盘操作。 */
export const IconButtonGroup = forwardRef<HTMLDivElement, IconButtonGroupProps>(function IconButtonGroup(
  { direction = 'horizontal', size = 'sm', css: cssProp, className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx(getIconButtonGroupClassName({ orientation: direction, size }, cssProp), className)}
    />
  )
})

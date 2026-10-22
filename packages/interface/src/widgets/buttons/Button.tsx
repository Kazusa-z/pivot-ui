import { forwardRef, type ReactNode } from 'react'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { Spin } from '../feedback/Spin'
import { ButtonBase, type ButtonBaseProps } from './ButtonBase'
import { getButtonClassName, slotRecipe } from './button.styles'

export interface ButtonProps extends Omit<ButtonBaseProps, 'renderContent'> {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'soft' | 'solid' | 'subtle' | 'inverted'
  critical?: boolean
  positive?: boolean
  round?: boolean
  fullWidth?: boolean
  uppercase?: boolean
  startSlot?: ReactNode
  endSlot?: ReactNode
  css?: SystemStyleObject
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    size = 'sm',
    variant = 'soft',
    critical,
    positive,
    round,
    fullWidth,
    uppercase,
    startSlot,
    endSlot,
    css: cssProp,
    className,
    ...props
  },
  ref
) {
  return (
    <ButtonBase
      {...props}
      ref={ref}
      className={cx(
        'editor-button-component',
        getButtonClassName({ size, variant, critical, positive, round, fullWidth, uppercase }, cssProp),
        className
      )}
      renderContent={(children, loading) => {
        const spin = <Spin decorative className="button-spin" color="inherit" size="xs" />
        const leading = startSlot ? (loading ? spin : startSlot) : !endSlot && loading ? spin : null
        const trailing = endSlot ? (loading ? spin : endSlot) : null
        return (
          <>
            {leading && (
              <span className={slotRecipe({ position: 'start', size, gap: size })} data-position="start">
                {leading}
              </span>
            )}
            {children}
            {trailing && (
              <span className={slotRecipe({ position: 'end', size, gap: size })} data-position="end">
                {trailing}
              </span>
            )}
          </>
        )
      }}
    />
  )
})
Button.toString = () => '.editor-button-component'

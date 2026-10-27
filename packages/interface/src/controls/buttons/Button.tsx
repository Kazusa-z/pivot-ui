import { forwardRef, type ReactNode } from 'react'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { Spin } from '../../display/feedback/Spin'
import { ButtonBase, type ButtonBaseProps } from './ButtonBase'
import type { ButtonStateOptions } from './useButtonState'
import { getButtonClassName, slotRecipe } from './button.styles'

export interface ButtonProps extends ButtonStateOptions, Omit<ButtonBaseProps, 'renderContent'> {
  /** 高度：`xs` 20、`sm` 24（紧凑档，工具栏和面板）；`md` 32、`lg` 36（常规档，对话框和表单）。 */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** 视觉层级：`solid` 主要操作，`soft` 默认，`outline` 次要，`subtle` 低强调，`inverted` 反色场景。 */
  variant?: 'outline' | 'soft' | 'solid' | 'subtle' | 'inverted'
  /** 危险操作（删除、覆盖）的红色语义。 */
  critical?: boolean
  /** 正向确认（应用、发布）的绿色语义。 */
  positive?: boolean
  /** 胶囊形圆角。 */
  round?: boolean
  /** 占满容器宽度。 */
  fullWidth?: boolean
  /** 文字转为大写。 */
  uppercase?: boolean
  /** 文字前的图标或附加内容；加载时被 Spin 替换。 */
  startSlot?: ReactNode
  /** 文字后的图标、快捷键或单位。 */
  endSlot?: ReactNode
  /** 追加 Panda 样式对象。 */
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

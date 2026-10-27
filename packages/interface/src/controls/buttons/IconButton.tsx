import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { Spin } from '../../display/feedback/Spin'
import { ButtonBase, type ButtonBaseProps } from './ButtonBase'
import type { ButtonStateOptions } from './useButtonState'
import { getIconButtonClassName, getIconButtonGroupClassName, cornerIconClass } from './button.styles'

/** 必须提供 `aria-label`（或 `aria-labelledby`）说明操作，图标本身保持装饰。 */
export interface IconButtonProps extends ButtonStateOptions, Omit<ButtonBaseProps, 'asChild' | 'renderContent'> {
  /** 方形尺寸：`xs` 20、`sm` 24（工具栏、面板）；`md` 32、`lg` 36。 */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** `soft` 默认浅底；`outline` 带边框；`subtle` 只在悬停时显示底色，适合标题栏；`ghost` 永远无底色。 */
  variant?: 'outline' | 'soft' | 'subtle' | 'ghost'
  /** 当前选中的工具（例如移动 / 旋转 / 缩放），以强调色填充并设置 `aria-pressed`。 */
  active?: boolean
  /** 按下时轻微缩小的触感反馈。 */
  fancy?: boolean
  /** 右下角的小三角，提示按钮还有展开菜单。 */
  corner?: boolean
  /** 追加 Panda 样式对象。 */
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
  /** 按钮的排列方向。 */
  direction?: 'horizontal' | 'vertical'
  /** 与组内按钮的 `size` 保持一致，外侧圆角才能对齐。 */
  size?: IconButtonProps['size']
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}

/** 将相关动作按钮排列成组。可提供组名称，每个按钮保留自己的点击和键盘操作。 */
export const IconButtonGroup = forwardRef<HTMLDivElement, IconButtonGroupProps>(function IconButtonGroup(
  { direction = 'horizontal', size = 'sm', css: cssProp, className, ...props },
  ref
) {
  return (
    <div
      role="group"
      {...props}
      ref={ref}
      className={cx(getIconButtonGroupClassName({ orientation: direction, size }, cssProp), className)}
    />
  )
})

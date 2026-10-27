import { forwardRef, type HTMLAttributes, type MouseEventHandler, type ReactNode, type Ref } from 'react'
import { cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'
import { getBadgeClassName, badgeInnerRecipe, getBadgeRemoveClassName } from './badge.styles'

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** 颜色：`gray` 中性、`blue` 信息、`green` 成功、`amber` 警告、`red` 错误表示状态；`violet` 是唯一的分类色。 */
  color?: 'gray' | 'green' | 'red' | 'blue' | 'amber' | 'violet'
  /** `xs` 16px 用于元信息，`sm` 20px 默认。 */
  size?: 'xs' | 'sm'
  /** `solid` 浅色底；`surface` 再加 1px 边框，适合放在有底色的区域。 */
  variant?: 'solid' | 'surface'
  /** 胶囊圆角，适合筛选标签。 */
  pill?: boolean
  /** 使用等宽字体，适合文件扩展名、标识符。 */
  code?: boolean
  /** 以强调色填充，表示当前选中的筛选条件。 */
  active?: boolean
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}

function BadgeFrame({
  color,
  size,
  variant,
  pill,
  code,
  active,
  css: cssProp,
  className,
  children,
  remove,
  elementRef,
  ...props
}: BadgeProps & { remove?: ReactNode; elementRef: Ref<HTMLSpanElement> }) {
  return (
    <span
      {...props}
      ref={elementRef}
      className={cx(
        getBadgeClassName({ color, size, variant, pill, code, active, closable: Boolean(remove) }, cssProp),
        className
      )}>
      <span data-part="inner" className={badgeInnerRecipe({ closable: Boolean(remove) })}>
        {children}
      </span>
      {remove}
    </span>
  )
}

/** 展示状态、数量或分类名称。需要可移除的标签时使用 Tag，并通过 onRemove 更新列表。 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  return <BadgeFrame {...props} elementRef={ref} />
})

export interface TagProps extends BadgeProps {
  /** 点击移除按钮时调用；由应用从列表中删掉这个标签。 */
  onRemove: MouseEventHandler<HTMLButtonElement>
  /** 移除按钮的无障碍名称，默认为 "Remove <标签文字>"。 */
  removeLabel?: string
  /** 禁用移除按钮，标签内容仍然显示。 */
  disabled?: boolean
}

/** The parent removes a tag from its data after accepting onRemove. */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { onRemove, removeLabel, disabled, ...props },
  ref
) {
  const label = removeLabel ?? (typeof props.children === 'string' ? `Remove ${props.children}` : 'Remove tag')
  return (
    <BadgeFrame
      {...props}
      elementRef={ref}
      remove={
        <button
          type="button"
          data-part="close"
          aria-label={label}
          disabled={disabled}
          className={getBadgeRemoveClassName(props.pill)}
          onClick={(event) => {
            event.stopPropagation()
            onRemove(event)
          }}>
          <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10">
            <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      }
    />
  )
})

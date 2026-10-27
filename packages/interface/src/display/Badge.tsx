import { forwardRef, type HTMLAttributes, type MouseEventHandler, type ReactNode, type Ref } from 'react'
import { cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'
import { getBadgeClassName, badgeInnerRecipe, getBadgeRemoveClassName } from './badge.styles'

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** gray / blue / green / amber / red carry state; violet is the only categorical color. */
  color?: 'gray' | 'green' | 'red' | 'blue' | 'amber' | 'violet'
  size?: 'xs' | 'sm'
  variant?: 'solid' | 'surface'
  pill?: boolean
  code?: boolean
  active?: boolean
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
  onRemove: MouseEventHandler<HTMLButtonElement>
  removeLabel?: string
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

import { forwardRef, useId, type ReactNode } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { IconCheck, IconMinus } from '@tabler/icons-react'
import { css, cva, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

export type CheckboxState = boolean | 'indeterminate'

export interface CheckboxProps extends Omit<
  CheckboxPrimitive.CheckboxProps,
  'onCheckedChange' | 'children' | 'asChild'
> {
  /** Mixed state is displayable; a user activation always requests a boolean value. */
  onCheckedChange?: (checked: boolean) => void
  readOnly?: boolean
  label?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  css?: SystemStyleObject
}

const checkboxRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    padding: 0,
    borderRadius: '4px',
    backgroundColor: 'var(--colors-softBg)',
    color: 'var(--colors-text)',
    border: '1px solid var(--colors-border)',
    cursor: 'pointer',
    '&:is([data-state=checked], [data-state=indeterminate])': {
      backgroundColor: 'var(--colors-selectionBg)',
      borderColor: 'var(--colors-selectionBorder)',
      color: 'var(--colors-selectionText)',
    },
    '&:disabled': {
      backgroundColor: 'var(--colors-surfaceSubtle)',
      color: 'var(--colors-textMuted)',
      cursor: 'not-allowed',
      opacity: 0.5,
    },
    '&[data-readonly]': { cursor: 'default' },
    '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
  },
  variants: {
    size: {
      sm: { width: '14px', height: '14px' },
      md: { width: '18px', height: '18px' },
      lg: { width: '22px', height: '22px' },
    },
  },
  defaultVariants: { size: 'sm' },
})

const labelClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
  color: 'var(--colors-text)',
  userSelect: 'none',
})

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  {
    checked,
    defaultChecked = false,
    onCheckedChange,
    readOnly = false,
    label,
    id,
    size = 'sm',
    css: cssProp,
    className,
    onClick,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const controlId = id ?? (label != null ? generatedId : undefined)
  const [current, setCurrent] = useControllableState<CheckboxState>({
    prop: checked,
    defaultProp: defaultChecked,
    onChange: (next) => {
      if (typeof next === 'boolean') onCheckedChange?.(next)
    },
    caller: 'Checkbox',
  })
  const control = (
    <CheckboxPrimitive.Root
      {...props}
      ref={ref}
      id={controlId}
      checked={current}
      aria-readonly={readOnly || undefined}
      data-readonly={readOnly ? '' : undefined}
      className={cx(css(checkboxRecipe.raw({ size }), cssProp), className)}
      onClick={(event) => {
        onClick?.(event)
        if (readOnly) event.preventDefault()
      }}
      onCheckedChange={(next) => {
        if (!readOnly && typeof next === 'boolean') setCurrent(next)
      }}>
      <CheckboxPrimitive.Indicator asChild>
        {current === 'indeterminate' ? (
          <IconMinus aria-hidden="true" size="80%" strokeWidth={3} />
        ) : (
          <IconCheck aria-hidden="true" size="80%" strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
  return label != null ? (
    <span className={labelClass}>
      {control}
      <label htmlFor={controlId}>{label}</label>
    </span>
  ) : (
    control
  )
})

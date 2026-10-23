import { forwardRef, type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import {
  getInputClass,
  getInputRootClass,
  getInputSlotClass,
  type TextInputSize,
  type TextInputState,
  type TextInputVariant,
} from './text.styles'

export interface InputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'size'> {
  size?: TextInputSize
  variant?: TextInputVariant
  state?: TextInputState
  startSlot?: ReactNode
  endSlot?: ReactNode
  overrideStartSlotStyle?: boolean
  overrideEndSlotStyle?: boolean
  ellipsis?: boolean
  rootRef?: Ref<HTMLDivElement>
  /** Styles the surrounding input frame; native className/style belong to the input. */
  css?: SystemStyleObject
  onValueChange?: (value: string) => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'sm',
    variant = 'soft',
    state,
    startSlot,
    endSlot,
    overrideStartSlotStyle,
    overrideEndSlotStyle,
    ellipsis,
    rootRef,
    css,
    className,
    disabled,
    onChange,
    onValueChange,
    ...props
  },
  ref
) {
  return (
    <div
      ref={rootRef}
      data-state={state ?? 'default'}
      data-disabled={disabled ? '' : undefined}
      className={getInputRootClass({ size, variant, state, disabled }, css)}>
      {startSlot != null &&
        (overrideStartSlotStyle ? (
          startSlot
        ) : (
          <div data-part="slot" className={getInputSlotClass(size)}>
            {startSlot}
          </div>
        ))}
      <input
        {...props}
        ref={ref}
        data-part="input"
        disabled={disabled}
        aria-invalid={props['aria-invalid'] ?? (state === 'invalid' ? true : undefined)}
        className={cx(getInputClass(size, ellipsis), className)}
        onChange={(event) => {
          const value = event.currentTarget.value
          onChange?.(event)
          onValueChange?.(value)
        }}
      />
      {endSlot != null &&
        (overrideEndSlotStyle ? (
          endSlot
        ) : (
          <div data-part="slot" className={getInputSlotClass(size)}>
            {endSlot}
          </div>
        ))}
    </div>
  )
})

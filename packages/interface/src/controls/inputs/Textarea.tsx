import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { getTextareaClass, type TextInputState, type TextInputVariant } from './text.styles'

export interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  size?: 'sm' | 'md'
  variant?: TextInputVariant
  state?: TextInputState
  css?: SystemStyleObject
  onValueChange?: (value: string) => void
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { size = 'sm', variant = 'soft', state, disabled, css, className, onChange, onValueChange, ...props },
  ref
) {
  return (
    <textarea
      {...props}
      ref={ref}
      disabled={disabled}
      aria-invalid={props['aria-invalid'] ?? (state === 'invalid' ? true : undefined)}
      className={cx(getTextareaClass({ size, variant, state, disabled }, css), className)}
      onChange={(event) => {
        const value = event.currentTarget.value
        onChange?.(event)
        onValueChange?.(value)
      }}
    />
  )
})

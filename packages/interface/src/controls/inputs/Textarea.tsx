import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { getTextareaClass, type TextInputState, type TextInputVariant } from './text.styles'

export interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  /** `sm` 用于面板（12px 字号），`md` 用于表单（14px）；高度随内容由 `rows` / 样式决定。 */
  size?: 'sm' | 'md'
  /** 与 `Input` 相同的 `soft` / `outline` / `subtle`。 */
  variant?: TextInputVariant
  /** 校验结果：只改变边框和文字色。 */
  state?: TextInputState
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
  /** 每次输入时收到新文本。 */
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

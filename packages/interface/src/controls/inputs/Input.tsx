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

/** Frame appearance shared by every single-line input (Input, NumberInput and the numeric editors). */
export interface TextInputAppearance {
  /** 高度：`xs` 20、`sm` 24（面板）；`md` 32、`lg` 36（表单）。 */
  size?: TextInputSize
  /** `soft` 默认浅底，适合面板内嵌；`outline` 带边框，适合独立字段；`subtle` 无底色。 */
  variant?: TextInputVariant
  /** 校验结果：只改变边框和文字色。 */
  state?: TextInputState
  /** 输入框内左侧的图标、前缀或轴标签。 */
  startSlot?: ReactNode
  /** 输入框内右侧的单位、后缀或按钮。 */
  endSlot?: ReactNode
}

export interface InputProps extends TextInputAppearance, Omit<ComponentPropsWithoutRef<'input'>, 'size'> {
  /** 不套用默认的左侧插槽样式，完全由传入内容决定。 */
  overrideStartSlotStyle?: boolean
  /** 不套用默认的右侧插槽样式，完全由传入内容决定。 */
  overrideEndSlotStyle?: boolean
  /** 文字过长时显示省略号（失焦时）。 */
  ellipsis?: boolean
  /** 外层框元素的 ref；`ref` 指向内部的 `<input>`。 */
  rootRef?: Ref<HTMLDivElement>
  /** 外层框的 Panda 样式；原生 className / style 作用于内部 input。 */
  css?: SystemStyleObject
  /** 每次输入时收到新文本；与原生 `onChange` 同时可用。 */
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

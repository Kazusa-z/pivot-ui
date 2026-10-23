import { forwardRef } from 'react'
import { InputNumber as NewInputNumber, type InputNumberProps as NewInputNumberProps } from '@pivot-ui/react'

export interface InputNumberProps extends NewInputNumberProps {
  /** @deprecated Use onEditStart and inspect its source. Removed with the compatibility package in B11. */
  onValueDragStart?: () => void
}

/** @deprecated Import from @pivot-ui/react. Only legacy defaults and callbacks are adapted. */
export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(function InputNumber(
  { onValueDragStart, onEditStart, step = 0.1, ...props },
  ref
) {
  return (
    <NewInputNumber
      {...props}
      ref={ref}
      step={step}
      onEditStart={(source) => {
        if (source === 'drag') onValueDragStart?.()
        return onEditStart?.(source)
      }}
    />
  )
})

import { InputNumber } from '@pivot-ui/editor'
import { type ReactNode } from 'react'
import { FormItem, extractFormItemProps, type BaseFormItemProps } from '../FormItem'

export type Vector2 = { x: number; y: number }

export interface FormItemVector2Props extends Omit<BaseFormItemProps<Vector2>, 'onChange'> {
  min?: number
  max?: number
  onChange?: (value: Vector2, key: keyof Vector2) => void
  slotMapping?: Record<keyof Vector2, ReactNode>
}

export function FormItemVector2(props: FormItemVector2Props) {
  const { value, onChange, min, max, disabled } = props
  const {
    slotMapping = {
      x: 'X',
      y: 'Y',
    },
  } = props

  const handleOnChange = (prefix: keyof Vector2) => (v: number) => {
    if (!onChange) return
    const result = { ...value, [prefix]: v }
    onChange && onChange(result, prefix)
  }

  return (
    <FormItem {...extractFormItemProps(props)} association="group" fieldColumn={2}>
      <InputNumber
        size="sm"
        aria-label="X"
        min={min}
        max={max}
        startSlot={slotMapping?.x}
        disabled={disabled}
        value={value.x}
        onValueChange={handleOnChange('x')}
      />
      <InputNumber
        size="sm"
        aria-label="Y"
        min={min}
        max={max}
        startSlot={slotMapping?.y}
        disabled={disabled}
        value={value.y}
        onValueChange={handleOnChange('y')}
      />
    </FormItem>
  )
}

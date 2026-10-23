import { type ReactNode } from 'react'
import { FormItem } from '../FormItem'
import { InputNumber } from '@pivot-ui/editor'
import { type BaseFormItemProps, extractFormItemProps } from '../FormItem'

export type Vector4 = { x: number; y: number; z: number; w: number }

export interface FormItemVector4Props extends Omit<BaseFormItemProps<Vector4>, 'onChange'> {
  min?: number
  max?: number
  step?: number
  dragStep?: number
  disabled?: boolean
  onChange?: (value: Vector4, key: keyof Vector4) => void
  slotMapping?: Record<keyof Vector4, ReactNode>
}

export function FormItemVector4(props: FormItemVector4Props) {
  const {
    onChange,
    min,
    max,
    step,
    dragStep,
    disabled,
    value,
    slotMapping = {
      x: 'X',
      y: 'Y',
      z: 'Z',
      w: 'W',
    },
  } = props

  const handleOnChange = (prefix: keyof Vector4) => (v: number) => {
    if (!onChange) return
    const result = { ...value, [prefix]: v }
    onChange && onChange(result, prefix)
  }

  return (
    <FormItem {...extractFormItemProps(props)} association="group" fieldColumn={4}>
      <InputNumber
        size="sm"
        aria-label="X"
        disabled={disabled}
        startSlot={slotMapping?.x}
        min={min}
        max={max}
        step={step}
        dragStep={dragStep}
        value={value.x}
        onValueChange={handleOnChange('x')}
      />
      <InputNumber
        size="sm"
        aria-label="Y"
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        dragStep={dragStep}
        startSlot={slotMapping?.y}
        value={value.y}
        onValueChange={handleOnChange('y')}
      />
      <InputNumber
        size="sm"
        aria-label="Z"
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        dragStep={dragStep}
        startSlot={slotMapping?.z}
        value={value.z}
        onValueChange={handleOnChange('z')}
      />
      <InputNumber
        size="sm"
        aria-label="W"
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        dragStep={dragStep}
        startSlot={slotMapping?.w}
        value={value.w}
        onValueChange={handleOnChange('w')}
      />
    </FormItem>
  )
}

import { ReactNode, useEffect, useRef, useState } from 'react'
import { ActionButton, InputNumber } from '@pivot-ui/editor'
import { ConstrainIcon } from '../../Icons/ConstrainIcon'
import { FormItem, extractFormItemProps, type BaseFormItemProps } from '../FormItem'

export type Vector3 = { x: number; y: number; z: number }

const ConstrainButton = function ConstrainButton(props: { active: boolean; onClick: (e) => void }) {
  return (
    <ActionButton
      aria-label="Toggle proportional scaling"
      aria-pressed={props.active}
      onClick={props.onClick}
      variant="subtle"
      fancy>
      <ConstrainIcon active={props.active} />
    </ActionButton>
  )
}

export interface FormItemVector3Props extends Omit<BaseFormItemProps<Vector3>, 'onChange'> {
  min?: number
  max?: number
  onChange?: (value: Vector3, key: keyof Vector3) => void
  constrainable?: boolean
}

export function FormItemVector3(props: FormItemVector3Props) {
  const { value, onChange, disabled, min, max, constrainable = false, formEndSlot } = props
  const [constrainMode, setConstrainMode] = useState(false)

  const masterAxisRef = useRef<keyof Vector3>('x')
  const originalValueRef = useRef<Vector3>(undefined)

  const handleFocus = (prefix: keyof Vector3) => () => {
    originalValueRef.current = { x: value.x, y: value.y, z: value.z }
    masterAxisRef.current = prefix
  }

  const handleOnChange = (prefix: keyof Vector3) => (v: number) => {
    if (!onChange) return
    if (!constrainMode) {
      onChange({ ...value, [prefix]: v }, prefix)
      return
    }

    const newValue = Object.fromEntries(
      Object.entries(value).map(([key]) => {
        if (key === prefix) {
          return [key, v]
        }

        const originalMasterValue = originalValueRef.current[masterAxisRef.current]
        if (originalMasterValue === 0) return [key, originalValueRef.current[key]]
        const ratio = originalValueRef.current[key] / originalMasterValue
        const newValue = v * ratio
        return [key, newValue]
      })
    ) as Vector3

    onChange(newValue, prefix)
  }

  useEffect(() => {
    originalValueRef.current = { x: value.x, y: value.y, z: value.z }
  }, [])

  const handleToggleConstrain = (e) => {
    setConstrainMode(!constrainMode)
  }

  let endSlot: ReactNode = null
  if (formEndSlot) {
    endSlot = formEndSlot
  } else {
    if (constrainable) {
      endSlot = <ConstrainButton active={constrainMode} onClick={handleToggleConstrain} />
    }
  }

  return (
    <FormItem {...extractFormItemProps(props)} association="group" formEndSlot={endSlot} fieldColumn={3}>
      {(['x', 'y', 'z'] as const).map((axis) => (
        <InputNumber
          size="sm"
          aria-label={axis.toUpperCase()}
          disabled={disabled}
          min={min}
          max={max}
          key={axis}
          startSlot={axis.toUpperCase()}
          value={value[axis]}
          onFocus={handleFocus(axis)}
          onValueDragStart={handleFocus(axis)}
          onValueChange={handleOnChange(axis)}
        />
      ))}
    </FormItem>
  )
}

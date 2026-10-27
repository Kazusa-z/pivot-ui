import { forwardRef, type ForwardedRef } from 'react'
import type { NumericConstraints } from '../../values'
import {
  type Vector2,
  type Vector3,
  type Vector4,
  type Rect,
  vector2ToTuple,
  vector3ToTuple,
  vector4ToTuple,
  rectToTuple,
  tupleToVector2,
  tupleToVector3,
  tupleToVector4,
  tupleToRect,
} from '../../values/geometry'
import type { NumericCancelReason, NumericCommitReason, NumericEditSource } from '../../interaction/numeric/types'
import { NumberTupleInput, type NumericAxisConfig, type NumberTupleInputProps } from './NumberTupleInput'

type AxisKey<T> = keyof T & string
export type NumericObjectInputProps<T extends object> = Omit<
  NumberTupleInputProps,
  'axes' | 'value' | 'defaultValue' | 'onValueChange' | 'onValueCommit' | 'onEditStart' | 'onEditCancel'
> & {
  value?: T
  defaultValue?: T
  axes?: Partial<Record<AxisKey<T>, Partial<Omit<NumericAxisConfig, 'key'>>>>
  onValueChange?: (value: T, axis: AxisKey<T>) => void
  onEditStart?: (source: NumericEditSource, axis: AxisKey<T>) => boolean | void
  onValueCommit?: (value: T, reason: NumericCommitReason, axis: AxisKey<T>) => void | Promise<void>
  onEditCancel?: (reason: NumericCancelReason, axis: AxisKey<T>) => void
}
export type Vector2InputProps = NumericObjectInputProps<Vector2>
export type Vector3InputProps = NumericObjectInputProps<Vector3>
export type Vector4InputProps = NumericObjectInputProps<Vector4>
export type RectInputProps = Omit<NumericObjectInputProps<Rect>, 'linked' | 'onLinkedChange' | 'linkLabel'> & {
  positionConstraints?: NumericConstraints
  sizeConstraints?: NumericConstraints
}

function ObjectInput<T extends object>({
  props,
  keys,
  labels,
  toTuple,
  fromTuple,
  elementRef,
}: {
  props: NumericObjectInputProps<T>
  keys: readonly AxisKey<T>[]
  labels?: readonly string[]
  toTuple: (value: T) => readonly number[]
  fromTuple: (value: readonly number[]) => T
  elementRef: ForwardedRef<HTMLDivElement>
}) {
  const { axes, value, defaultValue, onValueChange, onEditStart, onValueCommit, onEditCancel, ...rest } = props
  return (
    <NumberTupleInput
      {...rest}
      ref={elementRef}
      value={value === undefined ? undefined : toTuple(value)}
      defaultValue={defaultValue === undefined ? undefined : toTuple(defaultValue)}
      axes={keys.map((key, index) => ({ key, label: labels?.[index] ?? key.toUpperCase(), ...axes?.[key] }))}
      onValueChange={(next, index) => onValueChange?.(fromTuple(next), keys[index])}
      onEditStart={(source, index) => onEditStart?.(source, keys[index])}
      onValueCommit={(next, reason, index) => onValueCommit?.(fromTuple(next), reason, keys[index])}
      onEditCancel={(reason, index) => onEditCancel?.(reason, keys[index])}
    />
  )
}
export const Vector2Input = forwardRef<HTMLDivElement, Vector2InputProps>(function Vector2Input(props, ref) {
  return (
    <ObjectInput
      props={{ label: 'Vector 2', ...props }}
      keys={['x', 'y']}
      toTuple={vector2ToTuple}
      fromTuple={tupleToVector2}
      elementRef={ref}
    />
  )
})
export const Vector3Input = forwardRef<HTMLDivElement, Vector3InputProps>(function Vector3Input(props, ref) {
  return (
    <ObjectInput
      props={{ label: 'Vector 3', ...props }}
      keys={['x', 'y', 'z']}
      toTuple={vector3ToTuple}
      fromTuple={tupleToVector3}
      elementRef={ref}
    />
  )
})
export const Vector4Input = forwardRef<HTMLDivElement, Vector4InputProps>(function Vector4Input(props, ref) {
  return (
    <ObjectInput
      props={{ label: 'Vector 4', ...props }}
      keys={['x', 'y', 'z', 'w']}
      toTuple={vector4ToTuple}
      fromTuple={tupleToVector4}
      elementRef={ref}
    />
  )
})
export const RectInput = forwardRef<HTMLDivElement, RectInputProps>(function RectInput(
  { axes, positionConstraints, sizeConstraints, ...props },
  ref
) {
  return (
    <ObjectInput
      props={{
        label: 'Rectangle',
        ...props,
        axes: {
          x: { ...positionConstraints, ...axes?.x },
          y: { ...positionConstraints, ...axes?.y },
          width: { ...sizeConstraints, ...axes?.width },
          height: { ...sizeConstraints, ...axes?.height },
        },
      }}
      keys={['x', 'y', 'width', 'height']}
      labels={['X', 'Y', 'Width', 'Height']}
      toTuple={rectToTuple}
      fromTuple={tupleToRect}
      elementRef={ref}
    />
  )
})

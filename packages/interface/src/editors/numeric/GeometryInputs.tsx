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
import { NumberTupleInput, type NumericAxisConfig, type NumberTupleSharedProps } from './NumberTupleInput'

type AxisKey<T> = keyof T & string
export interface NumericObjectInputProps<T extends object> extends NumberTupleSharedProps {
  /** 当前值（受控），例如 `{ x, y, z }`。 */
  value?: T
  /** 非受控时的初始值。 */
  defaultValue?: T
  /** 按分量覆盖轴名、单位和范围，例如 `{ z: { min: 0 } }`。 */
  axes?: Partial<Record<AxisKey<T>, Partial<Omit<NumericAxisConfig, 'key'>>>>
  /** 编辑中的预览值；`axis` 是正在编辑的分量。 */
  onValueChange?: (value: T, axis: AxisKey<T>) => void
  /** 开始编辑时调用；返回 `false` 拒绝这次编辑。 */
  onEditStart?: (source: NumericEditSource, axis: AxisKey<T>) => boolean | void
  /** 提交完整的值；返回 Promise 时失败会恢复并显示错误。 */
  onValueCommit?: (value: T, reason: NumericCommitReason, axis: AxisKey<T>) => void | Promise<void>
  /** 编辑被取消，应用恢复编辑前的值。 */
  onEditCancel?: (reason: NumericCancelReason, axis: AxisKey<T>) => void
}
export type Vector2InputProps = NumericObjectInputProps<Vector2>
export type Vector3InputProps = NumericObjectInputProps<Vector3>
export type Vector4InputProps = NumericObjectInputProps<Vector4>
export type RectInputProps = Omit<NumericObjectInputProps<Rect>, 'linked' | 'onLinkedChange' | 'linkLabel'> & {
  /** `x`、`y` 共用的范围。 */
  positionConstraints?: NumericConstraints
  /** `width`、`height` 共用的范围，例如 `{ min: 0 }`。 */
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

export interface Vector2 {
  x: number
  y: number
}
export interface Vector3 extends Vector2 {
  z: number
}
export interface Vector4 extends Vector3 {
  w: number
}
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export function assertNumericTuple(value: readonly number[], length?: number): void {
  if (length !== undefined && value.length !== length) throw new RangeError(`Expected ${length} numeric axes.`)
  if (value.length === 0 || value.some((component) => !Number.isFinite(component)))
    throw new RangeError('Numeric tuples require finite components.')
}
export function vector2ToTuple(value: Vector2): readonly [number, number] {
  return [value.x, value.y]
}
export function vector3ToTuple(value: Vector3): readonly [number, number, number] {
  return [value.x, value.y, value.z]
}
export function vector4ToTuple(value: Vector4): readonly [number, number, number, number] {
  return [value.x, value.y, value.z, value.w]
}
export function rectToTuple(value: Rect): readonly [number, number, number, number] {
  return [value.x, value.y, value.width, value.height]
}
export function tupleToVector2(value: readonly number[]): Vector2 {
  assertNumericTuple(value, 2)
  return { x: value[0], y: value[1] }
}
export function tupleToVector3(value: readonly number[]): Vector3 {
  assertNumericTuple(value, 3)
  return { x: value[0], y: value[1], z: value[2] }
}
export function tupleToVector4(value: readonly number[]): Vector4 {
  assertNumericTuple(value, 4)
  return { x: value[0], y: value[1], z: value[2], w: value[3] }
}
export function tupleToRect(value: readonly number[]): Rect {
  assertNumericTuple(value, 4)
  return { x: value[0], y: value[1], width: value[2], height: value[3] }
}

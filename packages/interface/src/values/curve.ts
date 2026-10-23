export type CurvePointId = string
export interface CurveCoordinate {
  readonly x: number
  readonly y: number
}
/** Handles are absolute coordinates. Each handle's x stays in its adjacent segment. */
export interface CurvePoint extends CurveCoordinate {
  readonly id: CurvePointId
  readonly inHandle?: CurveCoordinate
  readonly outHandle?: CurveCoordinate
}
export interface CurveValue {
  readonly interpolation: 'linear' | 'bezier'
  readonly points: readonly CurvePoint[]
}
export interface CurveViewport {
  readonly xMin: number
  readonly xMax: number
  readonly yMin: number
  readonly yMax: number
}
export interface CurveTick {
  readonly value: number
  readonly label: string
}

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
function assertCoordinate(value: unknown): asserts value is CurveCoordinate {
  if (
    !value ||
    typeof value !== 'object' ||
    !finite((value as CurveCoordinate).x) ||
    !finite((value as CurveCoordinate).y)
  )
    throw new TypeError('Curve coordinates must be finite numbers.')
}
export function assertCurveValue(value: unknown): asserts value is CurveValue {
  if (!value || typeof value !== 'object') throw new TypeError('A curve must be an object.')
  const curve = value as CurveValue
  if (curve.interpolation !== 'linear' && curve.interpolation !== 'bezier')
    throw new TypeError('Curve interpolation must be linear or bezier.')
  if (!Array.isArray(curve.points)) throw new TypeError('Curve points must be an array.')
  const points: readonly CurvePoint[] = curve.points
  const ids = new Set<string>()
  for (const [index, point] of points.entries()) {
    assertCoordinate(point)
    if (typeof point.id !== 'string' || point.id.length === 0 || ids.has(point.id))
      throw new TypeError('Curve point IDs must be nonempty and unique.')
    ids.add(point.id)
    const previous = curve.points[index - 1],
      next = curve.points[index + 1]
    if (previous && point.x <= previous.x)
      throw new RangeError('Curve point x coordinates must be strictly increasing; duplicate x is not supported.')
    if (point.inHandle !== undefined) {
      assertCoordinate(point.inHandle)
      if (point.inHandle.x > point.x || (previous && point.inHandle.x < previous.x))
        throw new RangeError('Incoming handle x must lie in the preceding segment.')
    }
    if (point.outHandle !== undefined) {
      assertCoordinate(point.outHandle)
      if (point.outHandle.x < point.x || (next && point.outHandle.x > next.x))
        throw new RangeError('Outgoing handle x must lie in the following segment.')
    }
  }
}
export function copyCurveValue(value: CurveValue): CurveValue {
  assertCurveValue(value)
  return Object.freeze({
    interpolation: value.interpolation,
    points: Object.freeze(
      value.points.map((point) =>
        Object.freeze({
          ...point,
          ...(point.inHandle ? { inHandle: Object.freeze({ ...point.inHandle }) } : {}),
          ...(point.outHandle ? { outHandle: Object.freeze({ ...point.outHandle }) } : {}),
        })
      )
    ),
  })
}
const equalCoordinate = (a: CurveCoordinate | undefined, b: CurveCoordinate | undefined) =>
  a === b || (!!a && !!b && a.x === b.x && a.y === b.y)
export function areCurvesEqual(a: CurveValue, b: CurveValue): boolean {
  return (
    a === b ||
    (a.interpolation === b.interpolation &&
      a.points.length === b.points.length &&
      a.points.every((point, index) => {
        const other = b.points[index]
        return (
          point.id === other.id &&
          equalCoordinate(point, other) &&
          equalCoordinate(point.inHandle, other.inHandle) &&
          equalCoordinate(point.outHandle, other.outHandle)
        )
      }))
  )
}
const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t
const ratio = (value: number, min: number, max: number) =>
  Number.isFinite(max - min) ? (value - min) / (max - min) : (value / 2 - min / 2) / (max / 2 - min / 2)
function cubic(a: number, b: number, c: number, d: number, t: number) {
  return lerp(lerp(lerp(a, b, t), lerp(b, c, t), t), lerp(lerp(b, c, t), lerp(c, d, t), t), t)
}
/** Empty curves sample to null. A single point and values outside the knot domain use constant extension. */
export function sampleCurve(value: CurveValue, x: number): number | null {
  assertCurveValue(value)
  if (!finite(x)) throw new RangeError('Curve sample x must be finite.')
  const first = value.points[0],
    last = value.points[value.points.length - 1]
  if (!first) return null
  if (x <= first.x) return first.y
  if (x >= last.x) return last.y
  let low = 0,
    high = value.points.length - 1
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2)
    if (value.points[middle].x <= x) low = middle
    else high = middle
  }
  const a = value.points[low],
    d = value.points[high]
  if (value.interpolation === 'linear') return lerp(a.y, d.y, ratio(x, a.x, d.x))
  const b = a.outHandle ?? a,
    c = d.inHandle ?? d
  let start = 0,
    end = 1
  for (let index = 0; index < 64; index++) {
    const middle = (start + end) / 2
    if (cubic(a.x, b.x, c.x, d.x, middle) < x) start = middle
    else end = middle
  }
  return cubic(a.y, b.y, c.y, d.y, (start + end) / 2)
}
export function assertCurveViewport(value: CurveViewport): void {
  if (
    ![value.xMin, value.xMax, value.yMin, value.yMax].every(finite) ||
    value.xMin >= value.xMax ||
    value.yMin >= value.yMax ||
    !finite(value.xMax - value.xMin) ||
    !finite(value.yMax - value.yMin)
  )
    throw new RangeError('Curve viewport must have finite, increasing x and y ranges.')
}
export function fitCurveViewport(value: CurveValue): CurveViewport {
  assertCurveValue(value)
  const coordinates = value.points.flatMap((point) => [
    point,
    ...(point.inHandle ? [point.inHandle] : []),
    ...(point.outHandle ? [point.outHandle] : []),
  ])
  if (!coordinates.length) return Object.freeze({ xMin: 0, xMax: 1, yMin: 0, yMax: 1 })
  let xMin = coordinates[0].x,
    xMax = xMin,
    yMin = coordinates[0].y,
    yMax = yMin
  for (const coordinate of coordinates) {
    xMin = Math.min(xMin, coordinate.x)
    xMax = Math.max(xMax, coordinate.x)
    yMin = Math.min(yMin, coordinate.y)
    yMax = Math.max(yMax, coordinate.y)
  }
  const xPad = xMax === xMin ? Math.max(0.5, Math.abs(xMin) * 0.1) : (xMax - xMin) * 0.1
  const yPad = yMax === yMin ? Math.max(0.5, Math.abs(yMin) * 0.1) : (yMax - yMin) * 0.1
  const result = { xMin: xMin - xPad, xMax: xMax + xPad, yMin: yMin - yPad, yMax: yMax + yPad }
  assertCurveViewport(result)
  return Object.freeze(result)
}
export function getCurveTicks(min: number, max: number, count = 6): readonly CurveTick[] {
  if (!finite(min) || !finite(max) || min >= max || !finite(max - min) || !finite(count) || count < 1)
    throw new RangeError('Tick range and count must be finite and positive.')
  const desired = (max - min) / Math.min(100, Math.max(1, count)),
    power = 10 ** Math.floor(Math.log10(desired)),
    scaled = desired / power
  const step = (scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10) * power
  if (!finite(step) || step <= 0) return []
  const start = Math.ceil(min / step),
    end = Math.floor(max / step),
    result: CurveTick[] = []
  for (let index = 0; index <= Math.min(100, end - start); index++) {
    const value = Number(((start + index) * step).toPrecision(12))
    if (!finite(value) || value < min || value > max || result[result.length - 1]?.value === value) continue
    result.push(
      Object.freeze({ value: Object.is(value, -0) ? 0 : value, label: String(Object.is(value, -0) ? 0 : value) })
    )
  }
  return Object.freeze(result)
}
/** Exact SVG segment serialization with a downward screen y axis; no DOM or view state is stored. */
export function createCurvePath(value: CurveValue, viewport: CurveViewport, width = 100, height = 100): string {
  assertCurveValue(value)
  assertCurveViewport(viewport)
  if (!finite(width) || !finite(height) || width <= 0 || height <= 0)
    throw new RangeError('Curve path dimensions must be positive and finite.')
  const screen = (point: CurveCoordinate) =>
    `${ratio(point.x, viewport.xMin, viewport.xMax) * width} ${(1 - ratio(point.y, viewport.yMin, viewport.yMax)) * height}`
  const first = value.points[0],
    last = value.points[value.points.length - 1]
  if (!first) return ''
  if (value.points.length === 1)
    return `M ${screen({ x: viewport.xMin, y: first.y })} L ${screen({ x: viewport.xMax, y: first.y })}`
  let path = `M ${screen(viewport.xMin < first.x ? { x: viewport.xMin, y: first.y } : first)}`
  if (viewport.xMin < first.x) path += ` L ${screen(first)}`
  for (let index = 1; index < value.points.length; index++) {
    const point = value.points[index],
      previous = value.points[index - 1]
    path +=
      value.interpolation === 'linear'
        ? ` L ${screen(point)}`
        : ` C ${screen(previous.outHandle ?? previous)}, ${screen(point.inHandle ?? point)}, ${screen(point)}`
  }
  if (viewport.xMax > last.x) path += ` L ${screen({ x: viewport.xMax, y: last.y })}`
  return path
}
function checkBounds(bounds: Partial<CurveViewport>) {
  for (const value of Object.values(bounds))
    if (value !== undefined && !finite(value))
      throw new RangeError('Curve editing bounds must be finite when provided.')
  if ((bounds.xMin ?? -Infinity) > (bounds.xMax ?? Infinity) || (bounds.yMin ?? -Infinity) > (bounds.yMax ?? Infinity))
    throw new RangeError('Curve editing bounds must be ordered.')
}
const clamp = (value: number, min = -Infinity, max = Infinity) => Math.max(min, Math.min(max, value))
function adjacentFloat(value: number, direction: 1 | -1): number {
  if (value === 0) return direction * Number.MIN_VALUE
  const buffer = new DataView(new ArrayBuffer(8))
  buffer.setFloat64(0, value)
  let high = buffer.getUint32(0),
    low = buffer.getUint32(4)
  if (value > 0 === direction > 0) {
    if (low === 0xffffffff) {
      low = 0
      high++
    } else low++
  } else if (low === 0) {
    low = 0xffffffff
    high--
  } else low--
  buffer.setUint32(0, high)
  buffer.setUint32(4, low)
  return buffer.getFloat64(0)
}
const after = (value: number) => adjacentFloat(value, 1)
const before = (value: number) => adjacentFloat(value, -1)
export function getCurvePointBounds(
  value: CurveValue,
  id: CurvePointId,
  bounds: Partial<CurveViewport> = {}
): Partial<CurveViewport> {
  assertCurveValue(value)
  checkBounds(bounds)
  const index = value.points.findIndex((point) => point.id === id)
  if (index === -1) throw new RangeError('Curve point ID does not exist.')
  return {
    ...bounds,
    xMin: value.points[index - 1] ? Math.max(bounds.xMin ?? -Infinity, after(value.points[index - 1].x)) : bounds.xMin,
    xMax: value.points[index + 1] ? Math.min(bounds.xMax ?? Infinity, before(value.points[index + 1].x)) : bounds.xMax,
  }
}
function repairHandles(points: readonly CurvePoint[]): CurvePoint[] {
  return points.map((point, index) => ({
    ...point,
    ...(point.inHandle
      ? { inHandle: { x: clamp(point.inHandle.x, points[index - 1]?.x ?? -Infinity, point.x), y: point.inHandle.y } }
      : {}),
    ...(point.outHandle
      ? { outHandle: { x: clamp(point.outHandle.x, point.x, points[index + 1]?.x ?? Infinity), y: point.outHandle.y } }
      : {}),
  }))
}
export function updateCurvePoint(
  value: CurveValue,
  id: CurvePointId,
  patch: Partial<Omit<CurvePoint, 'id'>>,
  bounds: Partial<CurveViewport> = {}
): CurveValue {
  assertCurveValue(value)
  checkBounds(bounds)
  const limits = getCurvePointBounds(value, id, bounds)
  const points = value.points.map((point) => {
    if (point.id !== id) return point
    const coordinate = { x: patch.x ?? point.x, y: patch.y ?? point.y }
    assertCoordinate(coordinate)
    // Bounds constrain edits only. An unreachable x interval cannot move a knot across its neighbours.
    const x =
      patch.x === undefined || (limits.xMin ?? -Infinity) > (limits.xMax ?? Infinity)
        ? point.x
        : clamp(coordinate.x, limits.xMin, limits.xMax)
    const y = patch.y === undefined ? point.y : clamp(coordinate.y, limits.yMin, limits.yMax)
    const translate = (handle: CurveCoordinate | undefined) =>
      handle ? { x: handle.x + (x - point.x), y: handle.y + (y - point.y) } : undefined
    const handle = (key: 'inHandle' | 'outHandle') => {
      const explicit = Object.prototype.hasOwnProperty.call(patch, key),
        next = explicit ? patch[key] : translate(point[key])
      if (next) assertCoordinate(next)
      return next && (explicit || patch.y !== undefined)
        ? { ...next, y: clamp(next.y, bounds.yMin, bounds.yMax) }
        : next
    }
    return { ...point, x, y, inHandle: handle('inHandle'), outHandle: handle('outHandle') }
  })
  return copyCurveValue({ ...value, points: repairHandles(points) })
}
export function addCurvePoint(value: CurveValue, point: CurvePoint): CurveValue {
  assertCurveValue(value)
  assertCoordinate(point)
  const points = [...value.points, point].sort((a, b) => a.x - b.x)
  return copyCurveValue({ ...value, points: repairHandles(points) })
}
export function removeCurvePoints(value: CurveValue, ids: readonly CurvePointId[]): CurveValue {
  assertCurveValue(value)
  const removed = new Set(ids)
  return copyCurveValue({ ...value, points: value.points.filter((point) => !removed.has(point.id)) })
}
export function setCurveInterpolation(value: CurveValue, interpolation: CurveValue['interpolation']): CurveValue {
  assertCurveValue(value)
  const points =
    interpolation === 'bezier'
      ? value.points.map((point, index) => {
          const previous = value.points[index - 1],
            next = value.points[index + 1]
          return {
            ...point,
            ...(previous && !point.inHandle
              ? { inHandle: { x: lerp(point.x, previous.x, 1 / 3), y: lerp(point.y, previous.y, 1 / 3) } }
              : {}),
            ...(next && !point.outHandle
              ? { outHandle: { x: lerp(point.x, next.x, 1 / 3), y: lerp(point.y, next.y, 1 / 3) } }
              : {}),
          }
        })
      : value.points
  return copyCurveValue({ interpolation, points })
}

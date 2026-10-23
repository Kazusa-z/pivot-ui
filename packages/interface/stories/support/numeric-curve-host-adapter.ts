import { copyCurveValue, type CurveCoordinate, type CurveValue } from '../../src/values/curve'

export interface HostNumericCurve {
  readonly interpolation: 'linear' | 'bezier'
  readonly keys: readonly {
    readonly id: string
    readonly time: number
    readonly value: number
    readonly incoming?: { readonly time: number; readonly value: number }
    readonly outgoing?: { readonly time: number; readonly value: number }
  }[]
  /** 应用在计算曲线结果时使用的倍率，读取 CurveValue 后按业务单位换算。 */
  readonly multiplier: number
}

export function fromHostNumericCurve(dto: HostNumericCurve): CurveValue {
  return copyCurveValue({
    interpolation: dto.interpolation,
    points: dto.keys.map((key) => ({
      id: key.id,
      x: key.time,
      y: key.value,
      ...(key.incoming ? { inHandle: { x: key.incoming.time, y: key.incoming.value } } : {}),
      ...(key.outgoing ? { outHandle: { x: key.outgoing.time, y: key.outgoing.value } } : {}),
    })),
  })
}

export function toHostNumericCurve(
  value: CurveValue,
  metadata: Pick<HostNumericCurve, 'multiplier'>
): HostNumericCurve {
  const snapshot = copyCurveValue(value)
  const coordinate = (point: CurveCoordinate) => Object.freeze({ time: point.x, value: point.y })
  return Object.freeze({
    interpolation: snapshot.interpolation,
    multiplier: metadata.multiplier,
    keys: Object.freeze(
      snapshot.points.map((point) =>
        Object.freeze({
          id: point.id,
          time: point.x,
          value: point.y,
          ...(point.inHandle ? { incoming: coordinate(point.inHandle) } : {}),
          ...(point.outHandle ? { outgoing: coordinate(point.outHandle) } : {}),
        })
      )
    ),
  })
}

import { assertCurveValue, type CurveValue, type CurvePoint } from '@pivot-ui/react'
import type { IPoint } from './types'

/** The old flat cubic encoding was P0,C0,C1,P1,C2,P2,... with mirrored intermediate outgoing handles. */
export function fromLegacyCurve(points: readonly IPoint[], interpolation: 'linear' | 'bezier'): CurveValue {
  interpolation = points[0]?.interpolation ?? interpolation
  const encoded = interpolation === 'bezier' && (points.length >= 4 || points[0]?.interpolation === 'bezier')
  if (encoded && points.length % 2 !== 0) throw new Error('Legacy cubic curves require pairs of anchors and handles.')
  const anchors: CurvePoint[] = []
  if (encoded) {
    for (let index = 0; index < points.length / 2; index++) {
      const anchor = points[index === 0 ? 0 : index * 2 + 1]
      const handle = points[index === 0 ? 1 : index * 2]
      anchors.push({
        id: anchor.id ?? `legacy-point-${index}`,
        x: anchor.x,
        y: anchor.y,
        ...(anchor.interpolation
          ? {
              ...(anchor.inHandle ? { inHandle: { ...anchor.inHandle } } : {}),
              ...(anchor.outHandle ? { outHandle: { ...anchor.outHandle } } : {}),
            }
          : {
              ...(index > 0 ? { inHandle: { x: handle.x, y: handle.y } } : {}),
              ...(index < points.length / 2 - 1
                ? {
                    outHandle:
                      index === 0
                        ? { x: handle.x, y: handle.y }
                        : { x: 2 * anchor.x - handle.x, y: 2 * anchor.y - handle.y },
                  }
                : {}),
            }),
      })
    }
  } else
    for (const [index, point] of points.entries())
      anchors.push({
        id: point.id ?? `legacy-point-${index}`,
        x: point.x,
        y: point.y,
        ...(point.inHandle ? { inHandle: { ...point.inHandle } } : {}),
        ...(point.outHandle ? { outHandle: { ...point.outHandle } } : {}),
      })
  const value: CurveValue = {
    interpolation: encoded || points.length === 0 ? interpolation : 'linear',
    points: anchors,
  }
  assertCurveValue(value)
  return value
}

/** Preserve the legacy pair layout, plus explicit metadata for handles the old mirrored form could not express. */
export function toLegacyCurve(value: CurveValue): IPoint[] {
  assertCurveValue(value)
  if (value.interpolation === 'linear')
    return value.points.map(({ id, x, y, inHandle, outHandle }) => ({
      id,
      x,
      y,
      interpolation: 'linear',
      ...(inHandle ? { inHandle: { ...inHandle } } : {}),
      ...(outHandle ? { outHandle: { ...outHandle } } : {}),
    }))
  return value.points.flatMap((point, index) => {
    const incoming = point.inHandle ?? { x: point.x, y: point.y }
    const outgoing = point.outHandle ?? { x: point.x, y: point.y }
    const anchor: IPoint = {
      id: point.id,
      interpolation: 'bezier',
      x: point.x,
      y: point.y,
      ...(point.inHandle ? { inHandle: { ...point.inHandle } } : {}),
      ...(point.outHandle ? { outHandle: { ...point.outHandle } } : {}),
    }
    return index === 0 ? [anchor, { ...outgoing }] : [{ ...incoming }, anchor]
  })
}

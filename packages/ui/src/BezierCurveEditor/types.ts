import type { CurveCoordinate } from '@pivot-ui/react'

/** Legacy flat point DTO; optional metadata preserves stable identity and independent handles. */
export interface IPoint {
  x: number
  y: number
  id?: string
  /** Encoding of values emitted by the adapter; absent on original legacy data. */
  interpolation?: 'linear' | 'bezier'
  inHandle?: CurveCoordinate
  outHandle?: CurveCoordinate
}
export interface IBezierPoint {
  point: IPoint
  controlPoint: IPoint | null
}

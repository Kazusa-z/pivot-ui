import { useRef, useState } from 'react'
import { CurvePicker, InputNumber, type CurvePresetService, type CurvePreset } from '@pivot-ui/react'
import { fromLegacyCurve, toLegacyCurve } from './helper'
import type { IPoint } from './types'

export interface BezierCurveEditorProps {
  value?: IPoint[]
  defaultValue?: IPoint[]
  onChange?: (value: IPoint[]) => void
  algo?: 'linear' | 'bezier'
  axisLabel?: string
  yTickScale?: number
  yRangeMode?: 'symmetric' | 'positive'
  onYTickScaleChange?: (value: number) => void
  onYTickScaleCommit?: () => void
  yTickScaleMin?: number
  yTickScaleMax?: number
  disabled?: boolean
  readOnly?: boolean
  presetService?: CurvePresetService
  presets?: readonly CurvePreset[]
}
const initial: IPoint[] = [
  { x: 0, y: 0 },
  { x: 0.25, y: 0.25 },
  { x: 0.75, y: 0.75 },
  { x: 1, y: 1 },
]

/** Compatibility boundary only. Rendering, editing and optional presets belong to the unified package. */
export function BezierCurveEditor({
  value,
  defaultValue,
  onChange,
  algo = 'bezier',
  axisLabel = 'time',
  yTickScale = 1,
  yRangeMode = 'symmetric',
  onYTickScaleChange,
  onYTickScaleCommit,
  yTickScaleMin = 0.01,
  yTickScaleMax,
  disabled,
  readOnly,
  presetService,
  presets,
}: BezierCurveEditorProps) {
  const [local, setLocal] = useState(() => defaultValue ?? initial.map((point) => ({ ...point })))
  const curve = fromLegacyCurve(value ?? local, algo)
  const beforeEdit = useRef<IPoint[] | null>(null)
  const publish = (next: IPoint[]) => {
    if (value === undefined) setLocal(next)
    onChange?.(next)
  }
  return (
    <div style={{ minWidth: 0, width: '100%' }}>
      <CurvePicker
        value={curve}
        label="Edit curve"
        disabled={disabled}
        readOnly={readOnly}
        presetService={presetService}
        presets={presets}
        showInterpolationSelector={false}
        xLabel={axisLabel}
        formatYTick={(value) => Number((value * yTickScale).toPrecision(6)).toString()}
        bounds={{ xMin: 0, xMax: 1, yMin: yRangeMode === 'positive' ? 0 : -1, yMax: 1 }}
        defaultViewport={{ xMin: 0, xMax: 1, yMin: yRangeMode === 'positive' ? 0 : -1, yMax: 1 }}
        onEditStart={() => {
          beforeEdit.current = toLegacyCurve(curve)
        }}
        onValueChange={(next) => publish(toLegacyCurve(next))}
        onValueCommit={() => {
          beforeEdit.current = null
        }}
        onEditCancel={(reason) => {
          const snapshot = beforeEdit.current
          beforeEdit.current = null
          if (snapshot && ['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only'].includes(reason))
            publish(snapshot)
        }}
      />
      {onYTickScaleChange && (
        <InputNumber
          aria-label="Curve Y display scale"
          value={yTickScale}
          min={yTickScaleMin}
          max={yTickScaleMax}
          step={0.01}
          disabled={disabled}
          readOnly={readOnly}
          onValueChange={onYTickScaleChange}
          onValueCommit={onYTickScaleCommit}
        />
      )}
    </div>
  )
}
export type { IPoint, IBezierPoint } from './types'

import { useRef } from 'react'
import { ColorRamp } from '@pivot-ui/react'
import { fromLegacyRamp, toLegacyRamp, type GradientColor } from '../ColorPicker/helper'

export interface GradientSliderProps {
  selectedIndex?: number
  onSelect?: (index: number) => void
  colors?: GradientColor
  onChange?: (colors: GradientColor) => void
  disabled?: boolean
  readOnly?: boolean
}
const defaultColors: GradientColor = [
  { id: 'start', value: { r: 30, g: 99, b: 238, a: 0.5 }, position: 0 },
  { id: 'end', value: { r: 30, g: 99, b: 238, a: 1 }, position: 1 },
]
export function GradientSlider({ colors, selectedIndex, onSelect, onChange, ...props }: GradientSliderProps) {
  const latest = useRef(fromLegacyRamp(colors ?? defaultColors))
  if (colors !== undefined) latest.current = fromLegacyRamp(colors)
  return (
    <ColorRamp
      {...props}
      value={colors === undefined ? undefined : latest.current}
      defaultValue={fromLegacyRamp(defaultColors)}
      activeStopId={selectedIndex === undefined ? undefined : (latest.current.stops[selectedIndex]?.id ?? null)}
      onActiveStopIdChange={(id) => onSelect?.(latest.current.stops.findIndex((stop) => stop.id === id))}
      onValueChange={(value) => {
        if (colors === undefined) latest.current = value
        onChange?.(toLegacyRamp(value))
      }}
    />
  )
}

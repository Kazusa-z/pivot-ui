import { useRef } from 'react'
import { ColorRampChannels } from '@pivot-ui/react'
import { fromLegacyChannels, toLegacyChannels, type ParticleColor } from '../ColorPicker/helper'

export interface ParticleSliderProps {
  selectedType?: 'color' | 'alpha'
  selectedIndex?: number
  colors?: ParticleColor
  onSelect?: (index: number, type: 'color' | 'alpha') => void
  onChange?: (colors: ParticleColor) => void
  disabled?: boolean
  readOnly?: boolean
}
const defaultColors: ParticleColor = {
  color: [
    { id: 'start', value: { r: 255, g: 255, b: 255, a: 1 }, position: 0 },
    { id: 'end', value: { r: 30, g: 99, b: 238, a: 1 }, position: 1 },
  ],
  alpha: [
    { id: 'alpha-start', value: { r: 255, g: 255, b: 255, a: 0.5 }, position: 0 },
    { id: 'alpha-end', value: { r: 255, g: 255, b: 255, a: 1 }, position: 1 },
  ],
}
export function ParticleSlider({
  colors,
  selectedIndex,
  selectedType,
  onSelect,
  onChange,
  ...props
}: ParticleSliderProps) {
  const latest = useRef(fromLegacyChannels(colors ?? defaultColors))
  if (colors !== undefined) latest.current = fromLegacyChannels(colors)
  const controlledSelection = selectedIndex !== undefined && selectedType !== undefined
  return (
    <ColorRampChannels
      {...props}
      value={colors === undefined ? undefined : latest.current}
      defaultValue={fromLegacyChannels(defaultColors)}
      activeStopId={
        controlledSelection
          ? selectedType === 'color'
            ? (latest.current.color.stops[selectedIndex]?.id ?? null)
            : null
          : undefined
      }
      activeAlphaStopId={
        controlledSelection
          ? selectedType === 'alpha'
            ? (latest.current.alpha[selectedIndex]?.id ?? null)
            : null
          : undefined
      }
      onActiveStopIdChange={(id) => {
        if (id !== null)
          onSelect?.(
            latest.current.color.stops.findIndex((stop) => stop.id === id),
            'color'
          )
      }}
      onActiveAlphaStopIdChange={(id) => {
        if (id !== null)
          onSelect?.(
            latest.current.alpha.findIndex((stop) => stop.id === id),
            'alpha'
          )
      }}
      onValueChange={(value) => {
        if (colors === undefined) latest.current = value
        onChange?.(toLegacyChannels(value))
      }}
    />
  )
}

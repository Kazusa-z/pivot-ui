import { convertColorSpace, type ColorSpace, type ColorValue } from '../../src/values/color'
import type { ColorRampChannelsValue } from '../../src/values/color-ramp'

/** Example host DTO: normalized channels, explicit storage encoding and stable engine IDs. */
export interface HostColorChannels {
  color: readonly { id: string; time: number; value: { r: number; g: number; b: number; a: number } }[]
  alpha: readonly { id: string; time: number; value: number }[]
  interpolation: 'linear' | 'constant'
}

export function fromHostColorChannels(value: HostColorChannels, space: ColorSpace): ColorRampChannelsValue {
  return {
    color: {
      interpolation: value.interpolation,
      stops: value.color.map((stop) => ({ id: stop.id, position: stop.time, color: { ...stop.value, space } })),
    },
    alpha: value.alpha.map((stop) => ({ id: stop.id, position: stop.time, alpha: stop.value })),
  }
}

export function toHostColorChannels(value: ColorRampChannelsValue, storageSpace: ColorSpace): HostColorChannels {
  return {
    interpolation: value.color.interpolation,
    color: value.color.stops.map((stop) => {
      const { r, g, b, a }: ColorValue = convertColorSpace(stop.color, storageSpace)
      return { id: stop.id, time: stop.position, value: { r, g, b, a } }
    }),
    alpha: value.alpha.map((stop) => ({ id: stop.id, time: stop.position, value: stop.alpha })),
  }
}

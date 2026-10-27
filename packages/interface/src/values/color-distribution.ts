import { areColorsEqual, assertColorValue, type ColorOptions, type ColorValue } from './color'
import {
  assertColorAlphaRampValue,
  areColorAlphaRampsEqual,
  cloneColorAlphaRampValue,
  sampleColorAlphaRamp,
  type ColorAlphaRampValue,
} from './color-ramp'

export type ColorDistributionValue =
  | { readonly mode: 'constant'; readonly color: ColorValue }
  | { readonly mode: 'gradient'; readonly ramp: ColorAlphaRampValue }
  | { readonly mode: 'two-constant'; readonly colors: readonly [ColorValue, ColorValue] }
  | { readonly mode: 'two-gradient'; readonly ramps: readonly [ColorAlphaRampValue, ColorAlphaRampValue] }

export type ColorDistributionMode = ColorDistributionValue['mode']
/** 保存各模式的编辑值，方便切回某模式时恢复内容。当前正在使用的值通过 ColorDistributionValue 传入。 */
export type ColorDistributionCache = {
  readonly [Mode in ColorDistributionMode]?: Extract<ColorDistributionValue, { mode: Mode }>
}

export const colorDistributionModes: readonly ColorDistributionMode[] = Object.freeze([
  'constant',
  'gradient',
  'two-constant',
  'two-gradient',
])

export function assertColorDistributionValue(
  value: unknown,
  options: ColorOptions = { hdr: true }
): asserts value is ColorDistributionValue {
  if (!value || typeof value !== 'object') throw new TypeError('A color distribution must be an object.')
  const candidate = value as ColorDistributionValue
  switch (candidate.mode) {
    case 'constant':
      assertColorValue(candidate.color, options)
      return
    case 'gradient':
      assertColorAlphaRampValue(candidate.ramp, options)
      return
    case 'two-constant':
      if (!Array.isArray(candidate.colors) || candidate.colors.length !== 2)
        throw new TypeError('Two-color distributions require exactly two colors.')
      candidate.colors.forEach((color) => assertColorValue(color, options))
      return
    case 'two-gradient':
      if (!Array.isArray(candidate.ramps) || candidate.ramps.length !== 2)
        throw new TypeError('Two-gradient distributions require exactly two ramps.')
      candidate.ramps.forEach((ramp) => assertColorAlphaRampValue(ramp, options))
      return
    default:
      throw new TypeError('Unknown color distribution mode.')
  }
}

const copyColor = (color: ColorValue): ColorValue => Object.freeze({ ...color })
const copyRamp = cloneColorAlphaRampValue

/** 校验并深拷贝颜色分布，保留通道精度和颜色编码。需要映射到渲染引擎的数据格式时，由应用转换结果。 */
export function copyColorDistributionValue(value: ColorDistributionValue): ColorDistributionValue {
  assertColorDistributionValue(value)
  switch (value.mode) {
    case 'constant':
      return Object.freeze({ mode: value.mode, color: copyColor(value.color) })
    case 'gradient':
      return Object.freeze({ mode: value.mode, ramp: copyRamp(value.ramp) })
    case 'two-constant':
      return Object.freeze({
        mode: value.mode,
        colors: Object.freeze(value.colors.map(copyColor)) as readonly [ColorValue, ColorValue],
      })
    case 'two-gradient':
      return Object.freeze({
        mode: value.mode,
        ramps: Object.freeze(value.ramps.map(copyRamp)) as readonly [ColorAlphaRampValue, ColorAlphaRampValue],
      })
  }
}

export function areColorDistributionsEqual(a: ColorDistributionValue, b: ColorDistributionValue): boolean {
  if (a.mode === 'constant' && b.mode === 'constant') return areColorsEqual(a.color, b.color)
  if (a.mode === 'gradient' && b.mode === 'gradient') return areColorAlphaRampsEqual(a.ramp, b.ramp)
  if (a.mode === 'two-constant' && b.mode === 'two-constant')
    return a.colors.every((color, index) => areColorsEqual(color, b.colors[index]))
  if (a.mode === 'two-gradient' && b.mode === 'two-gradient')
    return a.ramps.every((ramp, index) => areColorAlphaRampsEqual(ramp, b.ramps[index]))
  return false
}

export function copyColorDistributionCache(cache: ColorDistributionCache = {}): ColorDistributionCache {
  const result: Record<string, ColorDistributionValue> = {}
  for (const mode of colorDistributionModes) {
    const value = cache[mode]
    if (value !== undefined) {
      if (value.mode !== mode) throw new TypeError('A color distribution cache key must match its value mode.')
      result[mode] = copyColorDistributionValue(value)
    }
  }
  return Object.freeze(result)
}

export function rememberColorDistribution(
  cache: ColorDistributionCache,
  value: ColorDistributionValue
): ColorDistributionCache {
  return Object.freeze({ ...copyColorDistributionCache(cache), [value.mode]: copyColorDistributionValue(value) })
}

function constantRamp(color: ColorValue): ColorAlphaRampValue {
  return {
    color: {
      interpolation: 'linear',
      stops: [
        { id: 'color-start', position: 0, color: { ...color, a: 1 } },
        { id: 'color-end', position: 1, color: { ...color, a: 1 } },
      ],
    },
    alpha: [
      { id: 'alpha-start', position: 0, alpha: color.a },
      { id: 'alpha-end', position: 1, alpha: color.a },
    ],
  }
}

/** First visits derive from the current value; revisits restore the explicitly owned cache. */
export function switchColorDistributionMode(
  value: ColorDistributionValue,
  mode: ColorDistributionMode,
  cache: ColorDistributionCache = {}
): ColorDistributionValue {
  assertColorDistributionValue(value)
  if (!colorDistributionModes.includes(mode)) throw new TypeError('Unknown color distribution mode.')
  if (mode === value.mode) return copyColorDistributionValue(value)
  const remembered = copyColorDistributionCache(cache)[mode]
  if (remembered) return remembered
  const fallback: ColorValue = { space: 'srgb', r: 0, g: 0, b: 0, a: 1 }
  const colors: readonly [ColorValue, ColorValue] =
    value.mode === 'constant'
      ? [value.color, value.color]
      : value.mode === 'two-constant'
        ? value.colors
        : value.mode === 'gradient'
          ? [sampleColorAlphaRamp(value.ramp, 0) ?? fallback, sampleColorAlphaRamp(value.ramp, 1) ?? fallback]
          : [sampleColorAlphaRamp(value.ramps[0], 0) ?? fallback, sampleColorAlphaRamp(value.ramps[1], 0) ?? fallback]
  const ramps: readonly [ColorAlphaRampValue, ColorAlphaRampValue] =
    value.mode === 'gradient'
      ? [value.ramp, value.ramp]
      : value.mode === 'two-gradient'
        ? value.ramps
        : [constantRamp(colors[0]), constantRamp(colors[1])]
  switch (mode) {
    case 'constant':
      return copyColorDistributionValue({ mode, color: colors[0] })
    case 'two-constant':
      return copyColorDistributionValue({ mode, colors })
    case 'gradient':
      return copyColorDistributionValue({ mode, ramp: ramps[0] })
    case 'two-gradient':
      return copyColorDistributionValue({ mode, ramps })
  }
}

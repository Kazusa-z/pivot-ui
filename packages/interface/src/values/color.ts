export type ColorSpace = 'srgb' | 'linear'
export interface ColorValue {
  readonly space: ColorSpace
  readonly r: number
  readonly g: number
  readonly b: number
  readonly a: number
}
export interface ColorOptions {
  readonly hdr?: boolean
}
/** HSV uses sRGB-encoded RGB. Hue is degrees; saturation and alpha are normalized. */
export interface HsvColor {
  readonly h: number
  readonly s: number
  readonly v: number
  readonly a: number
}
const clamp = (value: number, maximum = 1) => Math.max(0, Math.min(maximum, Number.isFinite(value) ? value : 0))

export function assertColorValue(value: unknown, { hdr = false }: ColorOptions = {}): asserts value is ColorValue {
  if (!value || typeof value !== 'object') throw new TypeError('A color must be an object.')
  const color = value as Partial<ColorValue>
  if (color.space !== 'srgb' && color.space !== 'linear') throw new TypeError('Color space must be srgb or linear.')
  for (const channel of ['r', 'g', 'b', 'a'] as const) {
    const number = color[channel]
    if (
      typeof number !== 'number' ||
      !Number.isFinite(number) ||
      number < 0 ||
      ((channel === 'a' || !hdr) && number > 1)
    )
      throw new RangeError(
        `Color ${channel} must be finite and ${channel === 'a' || !hdr ? 'between 0 and 1' : 'nonnegative'}.`
      )
  }
}

/** 将颜色通道整理到有效范围。接收外部数据时可先调用此函数，再把结果传给颜色控件；space 应为 srgb 或 linear。 */
export function normalizeColor(value: ColorValue, { hdr = false }: ColorOptions = {}): ColorValue {
  if (value.space !== 'srgb' && value.space !== 'linear') throw new TypeError('Color space must be srgb or linear.')
  return Object.freeze({
    space: value.space,
    r: clamp(value.r, hdr ? Number.MAX_VALUE : 1),
    g: clamp(value.g, hdr ? Number.MAX_VALUE : 1),
    b: clamp(value.b, hdr ? Number.MAX_VALUE : 1),
    a: clamp(value.a),
  })
}

export function srgbChannelToLinear(value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new RangeError('Color channels must be finite and nonnegative.')
  const result = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  if (!Number.isFinite(result)) throw new RangeError('The converted HDR channel exceeds the finite number range.')
  return result
}
export function linearChannelToSrgb(value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new RangeError('Color channels must be finite and nonnegative.')
  return value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055
}
export function convertColorSpace(value: ColorValue, space: ColorSpace): ColorValue {
  assertColorValue(value, { hdr: true })
  if (space !== 'srgb' && space !== 'linear') throw new TypeError('Color space must be srgb or linear.')
  if (value.space === space) return Object.freeze({ ...value })
  const convert = space === 'linear' ? srgbChannelToLinear : linearChannelToSrgb
  return Object.freeze({ space, r: convert(value.r), g: convert(value.g), b: convert(value.b), a: value.a })
}
/** 返回适合屏幕预览的 sRGB 颜色，超出范围的通道裁剪至 0–1。应用继续保存原始 HDR 值以供渲染使用。 */
export function getDisplayColor(value: ColorValue): ColorValue {
  return normalizeColor(convertColorSpace(value, 'srgb'))
}
export function areColorsEqual(a: ColorValue, b: ColorValue, epsilon = 1e-10): boolean {
  return (
    a.space === b.space &&
    Math.abs(a.r - b.r) <= epsilon &&
    Math.abs(a.g - b.g) <= epsilon &&
    Math.abs(a.b - b.b) <= epsilon &&
    Math.abs(a.a - b.a) <= epsilon
  )
}
/** HEX strings are sRGB; the result is converted once to the requested storage space. */
export function parseHexColor(text: string, space: ColorSpace = 'srgb'): ColorValue | null {
  const match = /^#?([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.exec(text.trim())
  if (!match) return null
  let digits = match[1]
  if (digits.length <= 4) digits = [...digits].map((digit) => digit + digit).join('')
  return convertColorSpace(
    {
      space: 'srgb',
      r: parseInt(digits.slice(0, 2), 16) / 255,
      g: parseInt(digits.slice(2, 4), 16) / 255,
      b: parseInt(digits.slice(4, 6), 16) / 255,
      a: digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1,
    },
    space
  )
}
export function formatColorHex(value: ColorValue, { alpha = false }: { readonly alpha?: boolean } = {}): string {
  const color = getDisplayColor(value)
  const hex = (channel: number) =>
    Math.round(channel * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase()
  return `#${hex(color.r)}${hex(color.g)}${hex(color.b)}${alpha ? hex(color.a) : ''}`
}
export function rgbToHsv(value: ColorValue): HsvColor {
  const { r, g, b, a } = convertColorSpace(value, 'srgb')
  const maximum = Math.max(r, g, b),
    minimum = Math.min(r, g, b),
    delta = maximum - minimum
  let hue =
    delta === 0 ? 0 : maximum === r ? (g - b) / delta : maximum === g ? (b - r) / delta + 2 : (r - g) / delta + 4
  hue = (((hue * 60) % 360) + 360) % 360
  return Object.freeze({ h: hue, s: maximum === 0 ? 0 : delta / maximum, v: maximum, a })
}
export function hsvToColor(value: HsvColor, space: ColorSpace = 'srgb', options: ColorOptions = {}): ColorValue {
  if (![value.h, value.s, value.v, value.a].every(Number.isFinite))
    throw new RangeError('HSV components must be finite.')
  const h = (((value.h % 360) + 360) % 360) / 60,
    s = clamp(value.s),
    v = clamp(value.v, options.hdr ? Number.MAX_VALUE : 1)
  const chroma = v * s,
    x = chroma * (1 - Math.abs((h % 2) - 1)),
    offset = v - chroma
  const channels =
    h < 1
      ? [chroma, x, 0]
      : h < 2
        ? [x, chroma, 0]
        : h < 3
          ? [0, chroma, x]
          : h < 4
            ? [0, x, chroma]
            : h < 5
              ? [x, 0, chroma]
              : [chroma, 0, x]
  return convertColorSpace(
    { space: 'srgb', r: channels[0] + offset, g: channels[1] + offset, b: channels[2] + offset, a: clamp(value.a) },
    space
  )
}
/** 在指定颜色编码中计算插值。应用根据颜色数据选择 srgb 或 linear，需要转换编码时使用 convertColorSpace。 */
export function mixColors(a: ColorValue, b: ColorValue, amount: number, space: ColorSpace = a.space): ColorValue {
  if (!Number.isFinite(amount)) throw new RangeError('Color interpolation amount must be finite.')
  const first = convertColorSpace(a, space),
    second = convertColorSpace(b, space),
    t = clamp(amount)
  const mix = (x: number, y: number) => x * (1 - t) + y * t
  return Object.freeze({
    space,
    r: mix(first.r, second.r),
    g: mix(first.g, second.g),
    b: mix(first.b, second.b),
    a: mix(first.a, second.a),
  })
}

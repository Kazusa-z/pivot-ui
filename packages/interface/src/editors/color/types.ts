import type { ColorCapabilities } from '../../contracts/color'
import type { ColorEditCallbacks } from '../../interaction/color/types'
import type { ColorSpace, ColorValue } from '../../values/color'

export interface ColorControlProps extends ColorEditCallbacks {
  value: ColorValue
  onValueChange?: (value: ColorValue) => void
  hdr?: boolean
  disabled?: boolean
  readOnly?: boolean
  resetKey?: unknown
  capabilities?: ColorCapabilities
  /** 选择 RGB 字段的显示编码。HEX 和 HSV 以 sRGB 显示；要转换应用保存的颜色编码，请使用 convertColorSpace。 */
  displaySpace?: ColorSpace
  defaultDisplaySpace?: ColorSpace
  onDisplaySpaceChange?: (space: ColorSpace) => void
}

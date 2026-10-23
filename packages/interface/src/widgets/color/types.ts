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
  /** RGB presentation only. Changing this does not change the stored color encoding. HEX and HSV use sRGB. */
  displaySpace?: ColorSpace
  defaultDisplaySpace?: ColorSpace
  onDisplaySpaceChange?: (space: ColorSpace) => void
}

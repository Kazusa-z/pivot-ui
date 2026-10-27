import type { ColorCapabilities } from '../../contracts/color'
import type { ColorEditCallbacks } from '../../interaction/color/types'
import type { ColorSpace, ColorValue } from '../../values/color'

export interface ColorControlProps extends ColorEditCallbacks {
  /** 当前颜色（受控）：`{ space, r, g, b, a }`，通道为 0–1，`space` 是 `srgb` 或 `linear`。 */
  value: ColorValue
  /** 编辑中的预览值，返回完整颜色。 */
  onValueChange?: (value: ColorValue) => void
  /** 允许 RGB 超过 1（HDR 颜色），默认关闭。 */
  hdr?: boolean
  /** 禁用。 */
  disabled?: boolean
  /** 只读：可以查看和复制，不能修改。 */
  readOnly?: boolean
  /** 切换编辑对象时改变，取消正在进行的编辑。 */
  resetKey?: unknown
  /** 应用提供的剪贴板和屏幕取色；提供了哪些方法就显示哪些按钮。 */
  capabilities?: ColorCapabilities
  /** RGB 输入框按哪种编码显示（受控），默认与 `value.space` 相同；HEX 和 HSV 总是 sRGB。转换保存的颜色用 `convertColorSpace`。 */
  displaySpace?: ColorSpace
  /** 非受控时 RGB 输入框的初始显示编码。 */
  defaultDisplaySpace?: ColorSpace
  /** 切换显示编码时调用。 */
  onDisplaySpaceChange?: (space: ColorSpace) => void
}

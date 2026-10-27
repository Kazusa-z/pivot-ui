import { css } from '../../../styled-system/css'
import { getDisplayColor, type ColorValue } from '../../values/color'

/** Shared transparency checkerboard for every swatch, preview and ramp. */
export const checkerboardClass = css({
  backgroundColor: '#fff',
  backgroundImage: 'conic-gradient(#ccc 25%, transparent 0 50%, #ccc 0 75%, transparent 0)',
  backgroundSize: '8px 8px',
})

/** 生成用于界面预览的 CSS 颜色，显示通道限制为 0–1 的 sRGB。应用保存原始 ColorValue 供编辑或渲染使用。 */
export function getColorCss(value: ColorValue): string {
  const color = getDisplayColor(value)
  return `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${color.a})`
}

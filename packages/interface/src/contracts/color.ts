import type { ColorValue } from '../values/color'
import type { HostCapabilities } from './capabilities'

/** 为颜色控件提供复制、粘贴和屏幕取色能力。应用传入浏览器或桌面实现；提供的方法决定可用的操作。 */
export interface ColorCapabilities {
  readonly clipboard?: HostCapabilities['clipboard']
  readonly eyeDropper?: { pick(): Promise<ColorValue | null> }
}

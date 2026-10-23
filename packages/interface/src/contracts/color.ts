import type { ColorValue } from '../values/color'
import type { HostCapabilities } from './capabilities'

/** The application chooses browser, Qt or mock implementations. Absence means unavailable. */
export interface ColorCapabilities {
  readonly clipboard?: HostCapabilities['clipboard']
  readonly eyeDropper?: { pick(): Promise<ColorValue | null> }
}

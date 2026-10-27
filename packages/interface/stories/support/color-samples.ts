import type { ColorCapabilities } from '../../src/contracts/color'
import type { ColorValue } from '../../src/values/color'
import type { ColorAlphaRampValue, ColorRampValue } from '../../src/values/color-ramp'

// Shared sample values for the Editors/Color pages.

export const blue: ColorValue = { space: 'srgb', r: 0.15, g: 0.45, b: 0.85, a: 0.75 }
export const green: ColorValue = { space: 'srgb', r: 0.1, g: 0.8, b: 0.3, a: 1 }
export const orange: ColorValue = { space: 'srgb', r: 1, g: 0.53, b: 0, a: 1 }
/** A linear HDR color whose red channel is 4× the SDR peak. */
export const emissive: ColorValue = { space: 'linear', r: 4, g: 1.2, b: 0.3, a: 1 }

export const ramp: ColorRampValue = {
  interpolation: 'linear',
  stops: [
    { id: 'red', position: 0, color: { space: 'srgb', r: 1, g: 0.1, b: 0.05, a: 1 } },
    { id: 'blue', position: 0.5, color: { space: 'srgb', r: 0.1, g: 0.2, b: 1, a: 1 } },
    { id: 'green', position: 1, color: { space: 'srgb', r: 0.1, g: 1, b: 0.25, a: 0.6 } },
  ],
}

export const alphaRamp: ColorAlphaRampValue = {
  color: {
    interpolation: 'linear',
    stops: [
      { id: 'warm', position: 0, color: { space: 'srgb', r: 1, g: 0.45, b: 0.1, a: 1 } },
      { id: 'cool', position: 1, color: { space: 'srgb', r: 0.1, g: 0.35, b: 1, a: 1 } },
    ],
  },
  alpha: [
    { id: 'fade-in', position: 0, alpha: 0 },
    { id: 'solid', position: 0.5, alpha: 1 },
    { id: 'fade-out', position: 1, alpha: 0 },
  ],
}

/** In-memory clipboard and an eyedropper that always picks green, standing in for host services. */
export function createDemoCapabilities(): ColorCapabilities {
  let clipboard = '#FF8800'
  return {
    clipboard: {
      readText: async () => clipboard,
      writeText: async (text) => {
        clipboard = text
      },
    },
    eyeDropper: { pick: async () => green },
  }
}

/** Cancel reasons after which the application restores the value from before the edit. */
export const rollbackReasons: readonly string[] = ['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only']

import { createContext, isValidElement, useContext, type CSSProperties, type ReactNode } from 'react'
import { useTheme } from '../foundation/theme/react'
import { themeClasses } from '../foundation/theme/browser'
import { css } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'

// React context crosses portals, unlike DOM inheritance. Each content surface owns
// one level, so nested poppers, dialogs and submenus share the same ordering rule.
export const OverlayLayerContext = createContext(40)
type LayerStyle = CSSProperties & { '--pivot-overlay-layer'?: number | string }

function numericLayer(value: unknown): number | undefined {
  if (typeof value !== 'number' && typeof value !== 'string') return undefined
  if (value === '') return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

export function useOverlayLayer(cssProp?: SystemStyleObject, style?: CSSProperties, slotChild?: ReactNode) {
  const parentLayer = useContext(OverlayLayerContext)
  // Radix Slot gives the direct child's style precedence over the slot's style.
  const childStyle = isValidElement<{ style?: LayerStyle }>(slotChild) ? slotChild.props.style : undefined
  const layer =
    numericLayer(childStyle?.zIndex ?? style?.zIndex) ??
    numericLayer(cssProp?.zIndex) ??
    numericLayer(childStyle?.['--pivot-overlay-layer'] ?? (style as LayerStyle)?.['--pivot-overlay-layer']) ??
    parentLayer + 10
  return { layer, style: { '--pivot-overlay-layer': layer, ...style } as LayerStyle }
}

/** Put the inherited theme directly on portal surfaces, including scoped providers. */
export function useOverlayTheme() {
  const { resolvedTheme } = useTheme()
  return { className: themeClasses[resolvedTheme], 'data-theme': resolvedTheme }
}

/** Enter animation shared by non-modal portal surfaces. */
export const overlayEnterStyles = {
  '&[data-state="open"]': {
    animationName: 'overlayFadeIn',
    animationDuration: '150ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  '@media (prefers-reduced-motion: reduce)': {
    '&[data-state="open"]': { animation: 'none' },
  },
} satisfies SystemStyleObject

/** Shared appearance only; each overlay owns its positioning and interaction semantics. */
export function getOverlaySurfaceClass(overrides?: SystemStyleObject) {
  return css(
    {
      boxSizing: 'border-box',
      minWidth: 0,
      zIndex: 'var(--pivot-overlay-layer, 50)',
      backgroundColor: 'var(--colors-surfaceRaised)',
      color: 'var(--colors-text)',
      border: '1px solid var(--colors-border)',
      borderRadius: 'var(--radii-controlMd)',
      boxShadow: 'var(--shadows-overlay)',
      fontFamily: 'var(--fonts-default)',
      fontSize: 'var(--fontSizes-controlLarge)',
      lineHeight: 'var(--lineHeights-2)',
      overflowWrap: 'anywhere',
      outline: 'none',
    },
    overrides
  )
}

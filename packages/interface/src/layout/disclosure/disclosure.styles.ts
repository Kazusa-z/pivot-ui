import { css, cva } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

export type DisclosureSize = 'sm' | 'md'
export type DisclosureVariant = 'surface' | 'subtle' | 'transparent'
export type DisclosureHeadingLevel = 2 | 3 | 4 | 5 | 6

const surfaceRecipe = cva({
  base: {
    boxSizing: 'border-box',
    position: 'relative',
    width: '100%',
    minWidth: 0,
    borderRadius: 'var(--radii-controlMd)',
    color: 'var(--colors-text)',
  },
  variants: {
    variant: {
      surface: { border: '1px solid var(--colors-border)', backgroundColor: 'var(--colors-surface)' },
      subtle: { border: '1px solid transparent', backgroundColor: 'var(--colors-panelBg)' },
      transparent: { border: '1px solid transparent', backgroundColor: 'transparent' },
    },
    connected: {
      true: {
        borderRadius: 0,
        '&:not(:last-child)': { borderBottom: 'none' },
        '&:first-child': {
          borderTopLeftRadius: 'var(--radii-controlMd)',
          borderTopRightRadius: 'var(--radii-controlMd)',
        },
        '&:last-child': {
          borderBottomLeftRadius: 'var(--radii-controlMd)',
          borderBottomRightRadius: 'var(--radii-controlMd)',
        },
      },
    },
  },
  defaultVariants: { variant: 'surface' },
})

const triggerRecipe = cva({
  base: {
    all: 'unset',
    boxSizing: 'border-box',
    display: 'flex',
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: 'var(--space-2)',
    fontFamily: 'inherit',
    fontWeight: 500,
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    borderRadius: 'var(--radii-control)',
    userSelect: 'none',
    transition: 'background-color 120ms ease-out, color 120ms ease-out',
    '&:hover:not(:disabled)': { backgroundColor: 'var(--colors-softBgHover)', color: 'var(--colors-textStrong)' },
    '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '-2px' },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
    '&[data-state="open"] [data-disclosure-chevron]': { transform: 'rotate(90deg)' },
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  },
  variants: {
    size: {
      sm: {
        minHeight: 'var(--sizes-controlSm)',
        padding: '0 var(--space-2)',
        fontSize: 'var(--fontSizes-control)',
        lineHeight: 'var(--lineHeights-1)',
        borderRadius: 'var(--radii-control)',
      },
      md: {
        minHeight: 'var(--sizes-controlMd)',
        padding: '0 var(--space-3)',
        fontSize: 'var(--fontSizes-controlLarge)',
        lineHeight: 'var(--lineHeights-2)',
        borderRadius: 'var(--radii-controlMd)',
      },
    },
    iconOnly: {
      true: {
        width: 'var(--sizes-controlSm)',
        padding: 0,
        flexShrink: 0,
        justifyContent: 'center',
      },
    },
  },
  defaultVariants: { size: 'sm' },
  compoundVariants: [
    {
      size: 'md',
      iconOnly: true,
      css: { width: 'var(--sizes-controlMd)' },
    },
  ],
})

const innerRecipe = cva({
  base: { minWidth: 0, overflowWrap: 'anywhere', color: 'var(--colors-text)' },
  variants: {
    size: {
      sm: {
        padding: 'var(--space-2)',
        fontSize: 'var(--fontSizes-control)',
        lineHeight: 'var(--lineHeights-1)',
      },
      md: {
        padding: 'var(--space-3)',
        fontSize: 'var(--fontSizes-controlLarge)',
        lineHeight: 'var(--lineHeights-2)',
      },
    },
  },
  defaultVariants: { size: 'sm' },
})

export const disclosureClasses = {
  heading: css({ all: 'unset', display: 'block', flex: 1, minWidth: 0 }),
  title: css({ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
  staticHeading: css({
    display: 'block',
    minHeight: 'var(--disclosure-header-height, var(--sizes-controlSm))',
    padding: 'var(--space-1) var(--space-2)',
    boxSizing: 'border-box',
    fontSize: 'var(--disclosure-header-font, var(--fontSizes-control))',
    lineHeight: 'var(--lineHeights-1)',
  }),
  actions: css({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    flexShrink: 0,
    minWidth: 0,
    maxWidth: '60%',
    gap: 'var(--space-1)',
    padding: 'var(--space-0_5) var(--space-2) var(--space-0_5) 0',
    '& > *': { minWidth: 0, maxWidth: '100%' },
  }),
  chevron: css({
    width: 'var(--sizes-iconSm)',
    height: 'var(--sizes-iconSm)',
    flexShrink: 0,
    transform: 'rotate(0deg)',
    transition: 'transform 120ms ease-out',
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  }),
  content: css({
    overflow: 'hidden',
    minWidth: 0,
    '&[data-state="open"]': {
      animationName: 'accordionSlideDown',
      animationDuration: '180ms',
      animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
    '&[data-state="closed"]': {
      animationName: 'accordionSlideUp',
      animationDuration: '180ms',
      animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
    '@media (prefers-reduced-motion: reduce)': {
      '&[data-state="open"], &[data-state="closed"]': { animation: 'none' },
    },
  }),
}

export function getDisclosureSurfaceClass(
  options: { variant?: DisclosureVariant; connected?: boolean },
  overrides?: SystemStyleObject
) {
  return css(surfaceRecipe.raw(options), overrides)
}
export function getDisclosureTriggerClass(size: DisclosureSize, iconOnly = false) {
  return css(triggerRecipe.raw({ size, iconOnly }))
}
export function getDisclosureContentClass(size: DisclosureSize, overrides?: SystemStyleObject) {
  return css(innerRecipe.raw({ size }), overrides)
}
export function getDisclosureRootClass(overrides?: SystemStyleObject) {
  return css({ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }, overrides)
}
export function getDisclosureRowClass(variant: DisclosureVariant, size: DisclosureSize = 'sm') {
  const regular = size === 'md'
  return css(
    {
      display: 'flex',
      alignItems: 'center',
      minWidth: 0,
      '--disclosure-header-height': regular ? 'var(--sizes-controlMd)' : 'var(--sizes-controlSm)',
      '--disclosure-header-font': regular ? 'var(--fontSizes-controlLarge)' : 'var(--fontSizes-control)',
    },
    {
      backgroundColor: variant === 'transparent' ? 'transparent' : 'var(--colors-surfaceSubtle)',
    }
  )
}

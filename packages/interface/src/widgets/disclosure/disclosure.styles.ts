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
    borderRadius: '4px',
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
        '&:first-child': { borderTopLeftRadius: '4px', borderTopRightRadius: '4px' },
        '&:last-child': { borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' },
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
    gap: '8px',
    fontFamily: 'inherit',
    fontWeight: 500,
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    borderRadius: '3px',
    userSelect: 'none',
    transition: 'background-color .2s ease, color .2s ease',
    '&:hover:not(:disabled)': { backgroundColor: 'var(--colors-grayA3)', color: 'var(--colors-textStrong)' },
    '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '-2px' },
    '&:disabled': { cursor: 'not-allowed', color: 'var(--colors-textMuted)' },
    '&[data-state="open"] [data-disclosure-chevron]': { transform: 'rotate(90deg)' },
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  },
  variants: {
    size: {
      sm: { minHeight: '27px', padding: '0 8px', fontSize: '12px', lineHeight: '16px' },
      md: { minHeight: '30px', padding: '0 12px', fontSize: '14px', lineHeight: '20px' },
    },
    iconOnly: { true: { width: '28px', padding: '0 7px', flexShrink: 0, justifyContent: 'center' } },
  },
  defaultVariants: { size: 'sm' },
})

const innerRecipe = cva({
  base: { minWidth: 0, overflowWrap: 'anywhere', color: 'var(--colors-text)' },
  variants: {
    size: {
      sm: { padding: '8px', fontSize: '12px', lineHeight: '16px' },
      md: { padding: '12px', fontSize: '12px', lineHeight: '20px' },
    },
  },
  defaultVariants: { size: 'sm' },
})

export const disclosureClasses = {
  heading: css({ all: 'unset', display: 'block', flex: 1, minWidth: 0 }),
  title: css({ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
  staticHeading: css({
    display: 'block',
    minHeight: '27px',
    padding: '5px 8px',
    boxSizing: 'border-box',
    fontSize: '12px',
    lineHeight: '16px',
  }),
  actions: css({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    flexShrink: 0,
    minWidth: 0,
    maxWidth: '60%',
    gap: '4px',
    padding: '2px 8px 2px 0',
    '& > *': { minWidth: 0, maxWidth: '100%' },
  }),
  chevron: css({
    width: '14px',
    height: '14px',
    flexShrink: 0,
    transform: 'rotate(0deg)',
    transition: 'transform .2s ease',
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  }),
  content: css({
    overflow: 'hidden',
    minWidth: 0,
    '&[data-state="open"]': {
      animationName: 'accordionSlideDown',
      animationDuration: '200ms',
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
export function getDisclosureRowClass(variant: DisclosureVariant) {
  return css(
    { display: 'flex', alignItems: 'center', minWidth: 0 },
    {
      backgroundColor: variant === 'transparent' ? 'transparent' : 'var(--colors-grayA2)',
    }
  )
}

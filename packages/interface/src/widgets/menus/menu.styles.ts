import { css, cva } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { getOverlaySurfaceClass, overlayEnterStyles } from '../overlays/shared'

export type MenuSize = 'xs' | 'sm' | 'md'

const itemRecipe = cva({
  base: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    position: 'relative',
    minWidth: 0,
    padding: 'var(--space-0_5) var(--space-2)',
    borderRadius: 'var(--radii-control)',
    outline: 'none',
    cursor: 'default',
    userSelect: 'none',
    color: 'inherit',
    textDecoration: 'none',
    overflowWrap: 'anywhere',
    '&[data-highlighted]': {
      backgroundColor: 'var(--colors-selectionBg)',
      color: 'var(--colors-selectionText)',
    },
    '&[data-disabled]': { opacity: 0.5, pointerEvents: 'none' },
    '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '-2px' },
  },
  variants: {
    size: {
      xs: {
        minHeight: 'var(--sizes-controlXs)',
        fontSize: 'var(--fontSizes-control)',
        lineHeight: 'var(--lineHeights-1)',
        paddingInline: 'var(--space-1_5)',
      },
      sm: {
        minHeight: 'var(--sizes-controlSm)',
        fontSize: 'var(--fontSizes-control)',
        lineHeight: 'var(--lineHeights-1_5)',
      },
      md: {
        minHeight: 'var(--sizes-controlMd)',
        fontSize: 'var(--fontSizes-controlLarge)',
        lineHeight: 'var(--lineHeights-2)',
        borderRadius: 'var(--radii-controlMd)',
        padding: 'var(--space-1) var(--space-3)',
      },
    },
    critical: {
      true: {
        color: 'var(--colors-dangerText)',
        '&[data-highlighted]': {
          backgroundColor: 'var(--colors-dangerSolid)',
          color: 'var(--colors-selectionText)',
        },
      },
    },
    selection: { true: { paddingInlineStart: 'var(--space-7)' } },
  },
  defaultVariants: { size: 'sm' },
})

export function getMenuItemClass(size: MenuSize, critical: boolean, selection: boolean, overrides?: SystemStyleObject) {
  return css(itemRecipe.raw({ size, critical, selection }), overrides)
}

export function getMenuContentClass(overrides?: SystemStyleObject) {
  return getOverlaySurfaceClass(
    css.raw(
      {
        padding: 'var(--space-1)',
        minWidth: '200px',
        maxWidth: 'min(420px, calc(100vw - 16px))',
        maxHeight: 'var(--radix-popper-available-height, 70vh)',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        transformOrigin: 'var(--radix-popper-transform-origin)',
        ...overlayEnterStyles,
      },
      overrides
    )
  )
}

export function getMenuLabelClass(overrides?: SystemStyleObject) {
  return css(
    {
      padding: 'var(--space-1) var(--space-2)',
      fontSize: 'var(--fontSizes-micro)',
      lineHeight: 'var(--lineHeights-1)',
      color: 'var(--colors-textMuted)',
      overflowWrap: 'anywhere',
    },
    overrides
  )
}
export function getMenuSeparatorClass(overrides?: SystemStyleObject) {
  return css(
    { height: '1px', backgroundColor: 'var(--colors-border)', margin: 'var(--space-1) calc(var(--space-1) * -1)' },
    overrides
  )
}
export function getMenubarClass(overrides?: SystemStyleObject) {
  return css(
    {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      minWidth: 0,
      gap: 'var(--space-0_5)',
      padding: '0 var(--space-1)',
    },
    overrides
  )
}
export function getMenubarTriggerClass(size: MenuSize, overrides?: SystemStyleObject) {
  return css(
    { all: 'unset', fontFamily: 'inherit' },
    itemRecipe.raw({ size }),
    {
      '&[data-state="open"]': { backgroundColor: 'var(--colors-softBgHover)', color: 'var(--colors-textStrong)' },
      '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '-2px' },
    },
    overrides
  )
}

export const menuClasses = {
  label: css({ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }),
  icon: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    '& svg': { width: 'var(--sizes-iconSm)', height: 'var(--sizes-iconSm)' },
  }),
  indicator: css({
    position: 'absolute',
    insetInlineStart: 'var(--space-2)',
    width: 'var(--sizes-iconXs)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  dot: css({ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'currentColor' }),
  chevron: css({
    width: 'var(--sizes-iconXs)',
    height: 'var(--sizes-iconXs)',
    flexShrink: 0,
    '&:dir(rtl)': { transform: 'rotate(180deg)' },
  }),
}

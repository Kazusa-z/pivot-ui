import { css, cva } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { getOverlaySurfaceClass } from '../overlays/shared'

export type MenuSize = 'xs' | 'sm' | 'md'

const itemRecipe = cva({
  base: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    minWidth: 0,
    padding: '2px 8px',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'default',
    userSelect: 'none',
    color: 'inherit',
    textDecoration: 'none',
    overflowWrap: 'anywhere',
    '&[data-highlighted]': { backgroundColor: 'var(--colors-primary)', color: 'white' },
    '&[data-disabled]': { color: 'var(--colors-textMuted)', pointerEvents: 'none' },
  },
  variants: {
    size: {
      xs: { minHeight: '20px', fontSize: '10px', lineHeight: '16px' },
      sm: { minHeight: '24px', fontSize: '12px', lineHeight: '18px' },
      md: { minHeight: '32px', fontSize: '13px', lineHeight: '20px' },
    },
    critical: {
      true: {
        color: 'var(--colors-red11)',
        '&[data-highlighted]': { backgroundColor: 'var(--colors-red9)', color: 'white' },
      },
    },
    selection: { true: { paddingInlineStart: '28px' } },
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
        padding: '4px',
        minWidth: '200px',
        maxWidth: 'min(420px, calc(100vw - 16px))',
        maxHeight: 'var(--radix-popper-available-height, 70vh)',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        transformOrigin: 'var(--radix-popper-transform-origin)',
        '&[data-state="open"]': { animation: 'scaleIn 100ms ease-out' },
        '@media (prefers-reduced-motion: reduce)': { animation: 'none', '&[data-state="open"]': { animation: 'none' } },
      },
      overrides
    )
  )
}

export function getMenuLabelClass(overrides?: SystemStyleObject) {
  return css(
    {
      padding: '4px 8px',
      fontSize: '11px',
      lineHeight: '16px',
      color: 'var(--colors-textMuted)',
      overflowWrap: 'anywhere',
    },
    overrides
  )
}
export function getMenuSeparatorClass(overrides?: SystemStyleObject) {
  return css({ height: '1px', backgroundColor: 'var(--colors-border)', margin: '4px -4px' }, overrides)
}
export function getMenubarClass(overrides?: SystemStyleObject) {
  return css(
    { display: 'flex', alignItems: 'center', flexWrap: 'wrap', minWidth: 0, gap: '2px', padding: '0 4px' },
    overrides
  )
}
export function getMenubarTriggerClass(size: MenuSize, overrides?: SystemStyleObject) {
  return css(
    { all: 'unset', fontFamily: 'inherit' },
    itemRecipe.raw({ size }),
    {
      '&[data-state="open"]': { backgroundColor: 'var(--colors-grayA4)' },
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
    '& svg': { width: '14px', height: '14px' },
  }),
  indicator: css({
    position: 'absolute',
    insetInlineStart: '8px',
    width: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  dot: css({ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'currentColor' }),
  chevron: css({ width: '12px', height: '12px', flexShrink: 0, '&:dir(rtl)': { transform: 'rotate(180deg)' } }),
}

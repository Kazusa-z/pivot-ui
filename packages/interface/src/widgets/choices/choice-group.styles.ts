import { css, cva } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

export interface ChoiceGroupStyleProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'subtle' | 'solid'
}

const rootRecipe = cva({
  base: { display: 'flex', minWidth: 0, gap: '4px' },
  variants: {
    vertical: { true: { flexDirection: 'column', gridAutoFlow: 'row' } },
    segmented: {
      true: {
        display: 'inline-grid',
        gridAutoColumns: 'minmax(0, 1fr)',
        gridAutoFlow: 'column',
        width: '100%',
        gap: 0,
        padding: '2px',
        borderRadius: '4px',
        backgroundColor: 'var(--colors-softBg)',
      },
    },
  },
  compoundVariants: [{ segmented: true, vertical: true, css: { gridAutoFlow: 'row' } }],
})

const itemRecipe = cva({
  base: {
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    flexShrink: 0,
    minWidth: 0,
    gap: '4px',
    padding: '0 6px',
    borderRadius: '4px',
    color: 'var(--colors-text)',
    backgroundColor: 'transparent',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    '&:hover': { backgroundColor: 'var(--colors-softBgHover)' },
    '&:focus-visible': { position: 'relative', outline: '2px solid var(--colors-focusRing)', outlineOffset: '1px' },
    '&:disabled': { color: 'var(--colors-textMuted)', opacity: 0.5, cursor: 'not-allowed' },
    '&[data-readonly]': { cursor: 'default' },
  },
  variants: {
    size: {
      sm: { height: '24px', minWidth: '24px', fontSize: '12px', '& svg': { width: '14px', height: '14px' } },
      md: { height: '32px', minWidth: '32px', fontSize: '14px', '& svg': { width: '16px', height: '16px' } },
      lg: { height: '36px', minWidth: '36px', fontSize: '14px', '& svg': { width: '18px', height: '18px' } },
    },
    variant: {
      subtle: {
        '&:is([data-state=on], [data-state=checked])': {
          color: 'var(--colors-textStrong)',
          backgroundColor: 'var(--colors-surfaceOverlay)',
          boxShadow: 'inset 0 0 0 1px var(--colors-border)',
        },
      },
      solid: {
        '&:is([data-state=on], [data-state=checked])': {
          color: 'var(--colors-selectionText)',
          backgroundColor: 'var(--colors-selectionBg)',
        },
      },
    },
    fancy: { true: { '&:active:not(:disabled):not([data-readonly])': { transform: 'scale(0.96)' } } },
  },
  defaultVariants: { size: 'sm', variant: 'subtle' },
})

export function getChoiceGroupClass(
  segmented: boolean,
  cssProp?: SystemStyleObject,
  orientation?: 'horizontal' | 'vertical'
) {
  return css(rootRecipe.raw({ segmented, vertical: orientation === 'vertical' }), cssProp)
}

export function getChoiceItemClass(props: ChoiceGroupStyleProps & { fancy?: boolean }, cssProp?: SystemStyleObject) {
  return css(itemRecipe.raw(props), cssProp)
}

export const choiceLabelClass = css({ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })

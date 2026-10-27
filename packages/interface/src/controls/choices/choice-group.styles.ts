import { css, cva } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

export interface ChoiceGroupStyleProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'subtle' | 'solid'
}

const rootRecipe = cva({
  base: { display: 'flex', minWidth: 0, gap: 'var(--space-1)' },
  variants: {
    vertical: { true: { flexDirection: 'column', gridAutoFlow: 'row' } },
    segmented: {
      true: {
        display: 'inline-grid',
        gridAutoColumns: 'minmax(0, 1fr)',
        gridAutoFlow: 'column',
        width: '100%',
        gap: 0,
        padding: 'var(--space-0_5)',
        borderRadius: 'var(--radii-control)',
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
    gap: 'var(--space-1)',
    padding: '0 var(--space-1_5)',
    borderRadius: 'var(--radii-control)',
    color: 'var(--colors-text)',
    backgroundColor: 'transparent',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    '&:hover': { backgroundColor: 'var(--colors-softBgHover)' },
    '&:focus-visible': {
      position: 'relative',
      outline: '2px solid var(--colors-focusRing)',
      outlineOffset: '2px',
    },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
    '&[data-readonly]': { cursor: 'default' },
  },
  variants: {
    size: {
      sm: {
        height: 'var(--sizes-controlSm)',
        minWidth: 'var(--sizes-controlSm)',
        fontSize: 'var(--fontSizes-control)',
        borderRadius: 'var(--radii-control)',
        '& svg': { width: '14px', height: '14px' },
      },
      md: {
        height: 'var(--sizes-controlMd)',
        minWidth: 'var(--sizes-controlMd)',
        fontSize: 'var(--fontSizes-controlLarge)',
        borderRadius: 'var(--radii-controlMd)',
        '& svg': { width: '16px', height: '16px' },
      },
      lg: {
        height: 'var(--sizes-controlLg)',
        minWidth: 'var(--sizes-controlLg)',
        fontSize: 'var(--fontSizes-controlLarge)',
        borderRadius: 'var(--radii-controlLg)',
        '& svg': { width: '18px', height: '18px' },
      },
    },
    variant: {
      // subtle lifts the selected item out of the neutral track; solid fills it with the accent.
      subtle: {
        '&:is([data-state=on], [data-state=checked])': {
          color: 'var(--colors-textStrong)',
          backgroundColor: 'var(--colors-controlRaisedBg)',
          boxShadow: 'var(--shadows-raised)',
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

import { css, cva } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

export type TextInputSize = 'xs' | 'sm' | 'md' | 'lg'
export type TextInputVariant = 'outline' | 'soft' | 'subtle'
export type TextInputState = 'valid' | 'invalid'

const inputRootRecipe = cva({
  base: {
    display: 'flex',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    border: '1px solid transparent',
    color: 'var(--colors-text)',
    transition: 'border-color 120ms ease-out, background-color 120ms ease-out, color 120ms ease-out',
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
    '& [data-part="slot"] + [data-part="input"]': { paddingLeft: 0 },
    '&:not([data-disabled]):focus-within': {
      borderColor: 'var(--colors-borderStrong)',
      outline: '2px solid var(--colors-focusRing)',
      outlineOffset: '2px',
      '& [data-part="slot"]': { color: 'var(--colors-text)' },
    },
  },
  variants: {
    size: {
      xs: {
        height: 'var(--sizes-controlXs)',
        lineHeight: 'var(--lineHeights-1)',
        fontSize: 'var(--fontSizes-control)',
        borderRadius: 'var(--radii-control)',
      },
      sm: {
        height: 'var(--sizes-controlSm)',
        lineHeight: 'var(--lineHeights-1)',
        fontSize: 'var(--fontSizes-control)',
        borderRadius: 'var(--radii-control)',
      },
      md: {
        height: 'var(--sizes-controlMd)',
        lineHeight: 'var(--lineHeights-2)',
        fontSize: 'var(--fontSizes-controlLarge)',
        borderRadius: 'var(--radii-controlMd)',
      },
      lg: {
        height: 'var(--sizes-controlLg)',
        lineHeight: 'var(--lineHeights-2)',
        fontSize: 'var(--fontSizes-controlLarge)',
        borderRadius: 'var(--radii-controlLg)',
      },
    },
    variant: {
      outline: {
        backgroundColor: 'var(--colors-surface)',
        borderColor: 'var(--colors-border)',
        '&[data-state="default"]:not([data-disabled]):hover': { borderColor: 'var(--colors-borderStrong)' },
      },
      soft: {
        backgroundColor: 'var(--colors-softBg)',
        '&[data-state="default"]:not([data-disabled]):hover': { backgroundColor: 'var(--colors-softBgHover)' },
      },
      subtle: { backgroundColor: 'transparent' },
    },
    state: {
      valid: {
        borderColor: 'var(--colors-successBorder)',
        color: 'var(--colors-successText)',
        '& [data-part="slot"], & [data-part="input"]': { color: 'var(--colors-successText)' },
      },
      invalid: {
        borderColor: 'var(--colors-dangerBorder)',
        color: 'var(--colors-dangerText)',
        '& [data-part="slot"], & [data-part="input"]': { color: 'var(--colors-dangerText)' },
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
        '& [data-part="input"]': { cursor: 'not-allowed' },
      },
    },
  },
})

const inputRecipe = cva({
  base: {
    appearance: 'none',
    height: '100%',
    border: 0,
    boxSizing: 'border-box',
    outline: 'none',
    flex: 1,
    minWidth: 0,
    width: '100%',
    color: 'inherit',
    borderRadius: 'inherit',
    fontFamily: 'var(--fonts-default)',
    fontWeight: 400,
    lineHeight: 'inherit',
    backgroundColor: 'transparent',
    textAlign: 'inherit',
    '&::placeholder': { color: 'var(--colors-textMuted)' },
    '&[readonly]': { cursor: 'default' },
    '&:disabled': { cursor: 'not-allowed' },
  },
  variants: {
    size: {
      xs: { fontSize: 'var(--fontSizes-control)', padding: '0 var(--space-1_5)' },
      sm: { fontSize: 'var(--fontSizes-control)', padding: '0 var(--space-2)' },
      md: { fontSize: 'var(--fontSizes-controlLarge)', padding: '0 var(--space-3)' },
      lg: { fontSize: 'var(--fontSizes-controlLarge)', padding: '0 var(--space-4)' },
    },
    ellipsis: { true: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
  },
})

const slotRecipe = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--colors-textMuted)',
    userSelect: 'none',
  },
  variants: {
    size: {
      xs: { padding: '0 var(--space-1)', fontSize: 'var(--fontSizes-control)' },
      sm: { padding: '0 var(--space-1_5)', fontSize: 'var(--fontSizes-control)' },
      md: { padding: '0 var(--space-2)', fontSize: 'var(--fontSizes-controlLarge)' },
      lg: { padding: '0 var(--space-3)', fontSize: 'var(--fontSizes-controlLarge)' },
    },
  },
})

const textareaRecipe = cva({
  base: {
    width: '100%',
    minWidth: 0,
    outline: 'none',
    border: '1px solid transparent',
    boxSizing: 'border-box',
    fontFamily: 'var(--fonts-default)',
    color: 'var(--colors-text)',
    resize: 'none',
    transition: 'border-color 120ms ease-out, background-color 120ms ease-out, color 120ms ease-out',
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
    '&::placeholder': { color: 'var(--colors-textMuted)' },
    '&:focus-visible': {
      borderColor: 'var(--colors-borderStrong)',
      outline: '2px solid var(--colors-focusRing)',
      outlineOffset: '2px',
    },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
  variants: {
    size: {
      sm: {
        minHeight: '56px',
        padding: 'var(--space-2)',
        fontSize: 'var(--fontSizes-control)',
        lineHeight: 'var(--lineHeights-1)',
        borderRadius: 'var(--radii-control)',
      },
      md: {
        minHeight: '64px',
        padding: 'var(--space-2) var(--space-3)',
        fontSize: 'var(--fontSizes-controlLarge)',
        lineHeight: 'var(--lineHeights-2)',
        borderRadius: 'var(--radii-controlMd)',
      },
    },
    variant: {
      outline: {
        backgroundColor: 'var(--colors-surface)',
        borderColor: 'var(--colors-border)',
        '&:not(:disabled):hover': { borderColor: 'var(--colors-borderStrong)' },
      },
      soft: {
        backgroundColor: 'var(--colors-softBg)',
        '&:not(:disabled):hover': { backgroundColor: 'var(--colors-softBgHover)' },
      },
      subtle: {
        backgroundColor: 'transparent',
        '&:not(:disabled):hover': { backgroundColor: 'var(--colors-surfaceSubtle)' },
      },
    },
    state: {
      valid: {
        borderColor: 'var(--colors-successBorder)',
        color: 'var(--colors-successText)',
        '&:focus-visible': { borderColor: 'var(--colors-successBorder)' },
      },
      invalid: {
        borderColor: 'var(--colors-dangerBorder)',
        color: 'var(--colors-dangerText)',
        '&:focus-visible': { borderColor: 'var(--colors-dangerBorder)' },
      },
    },
  },
})

export function getInputRootClass(
  variants: { size: TextInputSize; variant: TextInputVariant; state?: TextInputState; disabled?: boolean },
  style?: SystemStyleObject
) {
  return css(inputRootRecipe.raw(variants), style)
}
export function getInputClass(size: TextInputSize, ellipsis?: boolean) {
  return inputRecipe({ size, ellipsis })
}
export function getInputSlotClass(size: TextInputSize) {
  return slotRecipe({ size })
}
export function getTextareaClass(
  variants: { size: 'sm' | 'md'; variant: TextInputVariant; state?: TextInputState; disabled?: boolean },
  style?: SystemStyleObject
) {
  return css(textareaRecipe.raw({ size: variants.size, variant: variants.variant, state: variants.state }), style)
}

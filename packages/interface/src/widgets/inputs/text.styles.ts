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
    color: 'var(--colors-textStrong)',
    transition: 'box-shadow .2s ease, border-color .2s ease, background-color .2s ease',
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
    '& [data-part="slot"] + [data-part="input"]': { paddingLeft: 0 },
    '&:not([data-disabled]):focus-within': {
      borderColor: 'var(--colors-borderStrong)',
      boxShadow: '0 0 0 2px var(--colors-focusRing)',
      '& [data-part="slot"]': { color: 'var(--colors-text)' },
    },
    '&[data-state="valid"]:not([data-disabled]):focus-within': { borderColor: 'var(--colors-successBorder)' },
    '&[data-state="invalid"]:not([data-disabled]):focus-within': { borderColor: 'var(--colors-dangerBorder)' },
  },
  variants: {
    size: {
      xs: { height: '20px', lineHeight: '16px', fontSize: '12px', borderRadius: '4px' },
      sm: { height: '24px', lineHeight: '16px', fontSize: '12px', borderRadius: '4px' },
      md: { height: '32px', lineHeight: '20px', fontSize: '14px', borderRadius: '6px' },
      lg: { height: '36px', lineHeight: '20px', fontSize: '14px', borderRadius: '8px' },
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
        backgroundColor: 'var(--colors-successBg)',
        borderColor: 'var(--colors-successBorder)',
        '& [data-part="slot"], & [data-part="input"]': { color: 'var(--colors-successText)' },
      },
      invalid: {
        backgroundColor: 'var(--colors-dangerBg)',
        borderColor: 'var(--colors-dangerBorder)',
        '& [data-part="slot"], & [data-part="input"]': { color: 'var(--colors-dangerText)' },
      },
    },
    disabled: {
      true: {
        boxShadow: 'none',
        backgroundColor: 'var(--colors-surfaceSubtle)',
        '& [data-part="slot"], & [data-part="input"]': { color: 'var(--colors-textMuted)' },
      },
    },
  },
  compoundVariants: [{ variant: 'subtle', disabled: true, css: { backgroundColor: 'transparent' } }],
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
    color: 'var(--colors-text)',
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
      xs: { fontSize: '12px', padding: '0 6px' },
      sm: { fontSize: '12px', padding: '0 8px' },
      md: { fontSize: '14px', padding: '0 12px' },
      lg: { fontSize: '14px', padding: '0 16px' },
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
      xs: { padding: '0 4px', fontSize: '12px' },
      sm: { padding: '0 6px', fontSize: '12px' },
      md: { padding: '0 8px', fontSize: '13px' },
      lg: { padding: '0 12px', fontSize: '14px' },
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
    transition: 'border-color .2s ease, background-color .2s ease, box-shadow .2s ease, color .2s ease',
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
    '&::placeholder': { color: 'var(--colors-textMuted)' },
    '&:focus-visible': { borderColor: 'var(--colors-borderStrong)', boxShadow: '0 0 0 2px var(--colors-focusRing)' },
    '&:disabled': { color: 'var(--colors-textMuted)', cursor: 'not-allowed' },
  },
  variants: {
    size: {
      sm: { minHeight: '56px', padding: '8px', fontSize: '12px', lineHeight: '16px', borderRadius: '4px' },
      md: { minHeight: '64px', padding: '8px 12px', fontSize: '14px', lineHeight: '20px', borderRadius: '6px' },
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
      valid: { color: 'var(--colors-successText)', '&:focus-visible': { borderColor: 'var(--colors-successBorder)' } },
      invalid: { color: 'var(--colors-dangerText)', '&:focus-visible': { borderColor: 'var(--colors-dangerBorder)' } },
    },
    disabled: { true: { backgroundColor: 'var(--colors-surfaceSubtle)' } },
  },
  compoundVariants: [
    {
      variant: 'outline',
      state: 'valid',
      css: { backgroundColor: 'var(--colors-successBg)', borderColor: 'var(--colors-successBorder)' },
    },
    {
      variant: 'outline',
      state: 'invalid',
      css: { backgroundColor: 'var(--colors-dangerBg)', borderColor: 'var(--colors-dangerBorder)' },
    },
    { variant: 'subtle', disabled: true, css: { backgroundColor: 'transparent' } },
  ],
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
  return css(textareaRecipe.raw(variants), style)
}

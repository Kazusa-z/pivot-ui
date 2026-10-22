import { forwardRef, type ComponentProps } from 'react'
import { styled } from '../../styled-system/jsx'

const StyledTextarea = styled('textarea', {
  base: {
    width: '100%',
    minHeight: '56px',
    padding: '6px 8px',
    borderRadius: '4px',
    transition: 'border-color .2s ease, background-color .2s ease, box-shadow .2s ease, color .2s ease',
    fontSize: '12px',
    lineHeight: '16px',
    outline: 'none',
    border: '1px solid var(--colors-border)',
    color: 'var(--colors-text)',
    resize: 'none',
    boxSizing: 'border-box',
    '&::placeholder': { color: 'var(--colors-textMuted)' },
    '&:focus-visible': {
      borderColor: 'var(--colors-borderStrong)',
      boxShadow: '0 0 0 2px var(--colors-focusRing)',
      color: 'var(--colors-textStrong)',
    },
  },
  variants: {
    variant: {
      outline: {
        backgroundColor: 'var(--colors-surface)',
        borderColor: 'var(--colors-border)',
        '&:hover': { borderColor: 'var(--colors-borderStrong)' },
      },
      soft: {
        backgroundColor: 'var(--colors-softBg)',
        borderColor: 'transparent',
        '&:hover': { backgroundColor: 'var(--colors-softBgHover)' },
      },
      subtle: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        '&:hover': { backgroundColor: 'var(--colors-surfaceSubtle)' },
      },
    },
    size: {
      sm: { minHeight: '56px', padding: '8px', fontSize: '12px', lineHeight: '16px', borderRadius: '4px' },
      md: { minHeight: '64px', padding: '8px 12px', fontSize: '14px', lineHeight: '20px', borderRadius: '6px' },
    },
    state: {
      valid: {
        color: 'var(--colors-successText)',
        '&::placeholder': { color: 'var(--colors-successText)', opacity: 0.8 },
      },
      invalid: {
        color: 'var(--colors-dangerText)',
        '&::placeholder': { color: 'var(--colors-dangerText)', opacity: 0.8 },
      },
    },
    disabledState: {
      true: {
        backgroundColor: 'var(--colors-surfaceSubtle)',
        color: 'var(--colors-textMuted)',
        cursor: 'not-allowed',
      },
    },
  },
  compoundVariants: [
    {
      variant: 'outline',
      state: 'valid',
      css: {
        backgroundColor: 'var(--colors-successBg)',
        borderColor: 'var(--colors-successBorder)',
      },
    },
    {
      variant: 'outline',
      state: 'invalid',
      css: {
        backgroundColor: 'var(--colors-dangerBg)',
        borderColor: 'var(--colors-dangerBorder)',
      },
    },
    {
      state: 'valid',
      css: {
        '&:focus-visible': {
          borderColor: 'var(--colors-successBorder)',
          boxShadow: '0 0 0 2px var(--colors-focusRing)',
          color: 'var(--colors-successText)',
        },
      },
    },
    {
      state: 'invalid',
      css: {
        '&:focus-visible': {
          borderColor: 'var(--colors-dangerBorder)',
          boxShadow: '0 0 0 2px var(--colors-focusRing)',
          color: 'var(--colors-dangerText)',
        },
      },
    },
    {
      variant: 'outline',
      disabledState: true,
      css: { backgroundColor: 'var(--colors-surfaceSubtle)', borderColor: 'var(--colors-border)' },
    },
    {
      variant: 'soft',
      disabledState: true,
      css: { backgroundColor: 'var(--colors-surfaceSubtle)', borderColor: 'transparent' },
    },
    {
      variant: 'subtle',
      disabledState: true,
      css: { backgroundColor: 'transparent', borderColor: 'transparent' },
    },
    {
      state: 'valid',
      disabledState: true,
      css: {
        backgroundColor: 'var(--colors-successBg)',
        borderColor: 'var(--colors-successBorder)',
        color: 'var(--colors-textMuted)',
        '&::placeholder': { color: 'var(--colors-textMuted)', opacity: 1 },
      },
    },
    {
      state: 'invalid',
      disabledState: true,
      css: {
        backgroundColor: 'var(--colors-dangerBg)',
        borderColor: 'var(--colors-dangerBorder)',
        color: 'var(--colors-textMuted)',
        '&::placeholder': { color: 'var(--colors-textMuted)', opacity: 1 },
      },
    },
  ],
  defaultVariants: { variant: 'soft', size: 'sm' },
})

type TextareaProps = Omit<ComponentProps<typeof StyledTextarea>, 'disabledState'>

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ disabled, ...props }, ref) {
  return <StyledTextarea {...props} ref={ref} disabled={disabled} disabledState={disabled} />
})

export { Textarea }

import type { ComponentProps } from 'react'
import { styled } from '../../styled-system/jsx'

/**
 * Phase 0 pilot: intentionally uses the existing Stitches CSS variables so the
 * visual output can be compared against the Stitches Button without a theme
 * migration. This component is not exported from the package yet.
 */
const StyledPandaButton = styled('button', {
  base: {
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    border: '1px solid transparent',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition:
      'box-shadow .2s ease, border-color .2s ease, background-color .2s ease, color .2s ease, opacity .2s ease-out',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    outline: 'none',
    '&:focus-visible': {
      boxShadow: '0 0 0 2px var(--colors-focusRing)',
    },
    '&:disabled': {
      color: 'var(--colors-textMuted)',
      cursor: 'not-allowed',
      boxShadow: 'none',
    },
  },
  variants: {
    size: {
      xs: {
        height: '20px',
        fontSize: '12px',
        lineHeight: '16px',
        fontWeight: 500,
        borderRadius: '4px',
        padding: '0 6px',
      },
      sm: {
        height: '24px',
        fontSize: '12px',
        lineHeight: '16px',
        fontWeight: 500,
        borderRadius: '4px',
        padding: '0 8px',
      },
      md: {
        height: '32px',
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 500,
        borderRadius: '6px',
        padding: '0 12px',
      },
      lg: {
        height: '36px',
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 500,
        borderRadius: '8px',
        padding: '0 16px',
      },
    },
    variant: {
      outline: {
        color: 'var(--colors-text)',
        backgroundColor: 'transparent',
        border: '1px solid var(--colors-border)',
        '&:hover': {
          borderColor: 'var(--colors-borderStrong)',
          backgroundColor: 'var(--colors-surfaceSubtle)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-surfaceStrong)',
        },
        '&:disabled': {
          color: 'var(--colors-textMuted)',
          borderColor: 'var(--colors-border)',
          backgroundColor: 'transparent',
        },
      },
      soft: {
        color: 'var(--colors-text)',
        backgroundColor: 'var(--colors-softBg)',
        borderColor: 'transparent',
        '&:hover': {
          color: 'var(--colors-textStrong)',
          backgroundColor: 'var(--colors-softBgHover)',
          borderColor: 'transparent',
        },
        '&:active': {
          color: 'var(--colors-textStrong)',
          backgroundColor: 'var(--colors-softBgActive)',
          borderColor: 'transparent',
        },
        '&:disabled': {
          color: 'var(--colors-textMuted)',
          backgroundColor: 'var(--colors-surfaceSubtle)',
          borderColor: 'transparent',
        },
      },
      solid: {
        backgroundColor: 'var(--colors-primary)',
        borderColor: 'var(--colors-primary)',
        color: 'var(--colors-white)',
        '&:hover': {
          backgroundColor: 'var(--colors-primaryActive)',
          borderColor: 'var(--colors-primaryActive)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-primaryActive)',
          borderColor: 'var(--colors-primaryActive)',
        },
        '&:disabled': {
          color: 'var(--colors-textMuted)',
          backgroundColor: 'var(--colors-surfaceSubtle)',
          borderColor: 'var(--colors-border)',
        },
      },
      subtle: {
        color: 'var(--colors-text)',
        borderColor: 'transparent',
        '&:hover': {
          backgroundColor: 'var(--colors-surfaceSubtle)',
          color: 'var(--colors-textStrong)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-surfaceStrong)',
        },
        '&:disabled': {
          color: 'var(--colors-textMuted)',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
      },
      inverted: {
        color: 'var(--colors-textInverted)',
        backgroundColor: 'var(--colors-textStrong)',
        borderColor: 'var(--colors-textStrong)',
        '&:hover': {
          backgroundColor: 'var(--colors-textStrong)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-textStrong)',
        },
        '&:disabled': {
          color: 'var(--colors-textMuted)',
          backgroundColor: 'var(--colors-surfaceStrong)',
          borderColor: 'var(--colors-border)',
        },
      },
    },
    fullWidth: {
      true: { width: '100%' },
    },
    uppercase: {
      true: { textTransform: 'uppercase' },
    },
    round: {
      true: { borderRadius: '9999px' },
    },
  },
  defaultVariants: {
    size: 'sm',
    variant: 'soft',
  },
})

export type PandaButtonProps = ComponentProps<typeof StyledPandaButton>

export function PandaButton(props: PandaButtonProps) {
  return <StyledPandaButton {...props} />
}

import React from 'react'

import { styled } from '../../styled-system/jsx'
import type { SystemStyleObject } from '../../styled-system/types'

const StyledInputSlot = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--colors-textMuted)',
    transition: 'color .2s ease',
    userSelect: 'none',
  },
  variants: {
    size: {
      xs: {
        padding: '0 4px',
        fontSize: '12px',
      },
      sm: {
        padding: '0 6px',
        fontSize: '12px',
      },
      md: {
        padding: '0 8px',
        fontSize: '13px',
      },
      lg: {
        padding: '0 12px',
        fontSize: '14px',
      },
    },
  },
})

const StyledInput = styled('input', {
  base: {
    appearance: 'none',
    height: '100%',
    borderWidth: '0',
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
    padding: 0,
    '&:hover': {
      color: 'var(--colors-textStrong)',
    },
    '&:focus-visible': {
      color: 'var(--colors-textStrong)',
    },
    '&::placeholder': {
      color: 'var(--colors-textMuted)',
    },
    '&[readonly]': {
      cursor: 'default',
    },
    '&::read-only::placeholder': {
      color: 'var(--colors-textMuted)',
    },
  },
  variants: {
    code: {
      true: {
        fontFamily: 'var(--fonts-mono)',
      },
    },
    size: {
      xs: {
        fontSize: '12px',
        padding: '0 6px',
      },
      sm: {
        fontSize: '12px',
        padding: '0 8px',
      },
      md: {
        fontSize: '14px',
        padding: '0 12px',
      },
      lg: {
        fontSize: '14px',
        padding: '0 16px',
      },
    },
    ellipsis: {
      true: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },
    cursor: {
      default: {
        cursor: 'default',
        '&:focus': {
          cursor: 'text',
        },
      },
      text: {
        cursor: 'text',
      },
    },
  },
})

export const StyledInputRoot = styled('div', {
  base: {
    display: 'flex',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid transparent',
    color: 'var(--colors-textStrong)',
    transition: 'box-shadow .2s ease, border-color .2s ease, background-color .2s ease',
    '& [data-part="slot"] + [data-part="input"]': {
      paddingLeft: 0,
    },
    '&[data-state="default"]:focus-within': {
      borderColor: 'var(--colors-borderStrong)',
      boxShadow: '0 0 0 2px var(--colors-focusRing)',
      '& [data-part="slot"]': {
        color: 'var(--colors-text)',
      },
    },
    '&[data-state="valid"]:focus-within': {
      borderColor: 'var(--colors-successBorder)',
      boxShadow: '0 0 0 2px var(--colors-focusRing)',
      '& [data-part="slot"]': {
        color: 'var(--colors-successText)',
      },
    },
    '&[data-state="invalid"]:focus-within': {
      borderColor: 'var(--colors-dangerBorder)',
      boxShadow: '0 0 0 2px var(--colors-focusRing)',
      '& [data-part="slot"]': {
        color: 'var(--colors-dangerText)',
      },
    },
  },
  variants: {
    size: {
      xs: {
        height: '20px',
        lineHeight: '16px',
        borderRadius: '4px',
        fontSize: '12px',
      },
      sm: {
        height: '24px',
        lineHeight: '16px',
        fontSize: '12px',
        borderRadius: '4px',
      },
      md: {
        height: '32px',
        fontSize: '14px',
        lineHeight: '20px',
        borderRadius: '6px',
      },
      lg: {
        height: '36px',
        fontSize: '14px',
        lineHeight: '20px',
        borderRadius: '8px',
      },
    },
    disabled: {
      true: {
        backgroundColor: 'var(--colors-surfaceSubtle)',
        borderColor: 'var(--colors-border)',
        boxShadow: 'none',
        '& [data-part="slot"]': {
          color: 'var(--colors-textMuted)',
        },
        '& [data-part="input"]': {
          color: 'var(--colors-textMuted)',
          '&:focus': {
            color: 'var(--colors-textMuted)',
          },
          '&:hover': {
            color: 'var(--colors-textMuted)',
          },
        },
      },
    },
    variant: {
      outline: {
        backgroundColor: 'var(--colors-surface)',
        borderColor: 'var(--colors-border)',
        '&[data-state="default"]:hover': {
          borderColor: 'var(--colors-borderStrong)',
          '& [data-part="slot"]': {
            color: 'var(--colors-text)',
          },
        },
      },
      soft: {
        backgroundColor: 'var(--colors-softBg)',
        borderColor: 'transparent',
        '&[data-state="default"]:hover': {
          backgroundColor: 'var(--colors-softBgHover)',
          '& [data-part="slot"]': {
            color: 'var(--colors-text)',
          },
        },
      },
      subtle: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        '&[data-state="default"]:hover': {
          '& [data-part="slot"]': {
            color: 'var(--colors-text)',
          },
        },
      },
    },
    state: {
      valid: {
        backgroundColor: 'var(--colors-successBg)',
        borderColor: 'var(--colors-successBorder)',
        '& [data-part="slot"]': {
          color: 'var(--colors-successText)',
        },
        '& [data-part="input"], & [data-part="input"]:hover, & [data-part="input"]:focus-visible': {
          color: 'var(--colors-successText)',
        },
        '& [data-part="input"]::placeholder': {
          color: 'var(--colors-successText)',
          opacity: 0.8,
        },
      },
      invalid: {
        backgroundColor: 'var(--colors-dangerBg)',
        borderColor: 'var(--colors-dangerBorder)',
        '& [data-part="slot"]': {
          color: 'var(--colors-dangerText)',
        },
        '& [data-part="input"], & [data-part="input"]:hover, & [data-part="input"]:focus-visible': {
          color: 'var(--colors-dangerText)',
        },
        '& [data-part="input"]::placeholder': {
          color: 'var(--colors-dangerText)',
          opacity: 0.8,
        },
      },
    },
  },
  compoundVariants: [
    {
      variant: 'soft',
      disabled: true,
      css: {
        backgroundColor: 'var(--colors-surfaceSubtle)',
        borderColor: 'transparent',
      },
    },
    {
      variant: 'subtle',
      disabled: true,
      css: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
    },
    {
      state: 'valid',
      disabled: true,
      css: {
        '& [data-part="slot"]': {
          color: 'var(--colors-textMuted)',
        },
        '& [data-part="input"], & [data-part="input"]:hover, & [data-part="input"]:focus-visible': {
          color: 'var(--colors-textMuted)',
        },
        '& [data-part="input"]::placeholder': {
          color: 'var(--colors-textMuted)',
        },
      },
    },
    {
      state: 'invalid',
      disabled: true,
      css: {
        '& [data-part="slot"]': {
          color: 'var(--colors-textMuted)',
        },
        '& [data-part="input"], & [data-part="input"]:hover, & [data-part="input"]:focus-visible': {
          color: 'var(--colors-textMuted)',
        },
        '& [data-part="input"]::placeholder': {
          color: 'var(--colors-textMuted)',
        },
      },
    },
  ],
  defaultVariants: {
    size: 'sm',
    variant: 'soft',
  },
})

export interface InputProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'size'> {
  startSlot?: React.ReactNode
  endSlot?: React.ReactNode
  overrideStartSlotStyle?: boolean
  ellipsis?: boolean
  overrideEndSlotStyle?: boolean
  rootRef?: any
  disabled?: boolean
  css?: SystemStyleObject
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'soft' | 'subtle'
  state?: 'valid' | 'invalid'
}

/**
 * The `<Input />` component lets users enter one of various types of text on a single line.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, forwardedRef) {
  const {
    startSlot,
    endSlot,
    css,
    rootRef,
    disabled,
    size = 'sm',
    variant = 'soft',
    overrideStartSlotStyle,
    overrideEndSlotStyle,
    state,
    ...rest
  } = props

  return (
    <StyledInputRoot
      css={css}
      ref={rootRef}
      size={size}
      variant={variant}
      state={state}
      disabled={disabled}
      data-state={state ?? 'default'}>
      {!!startSlot &&
        (overrideStartSlotStyle ? (
          startSlot
        ) : (
          <StyledInputSlot data-part="slot" size={size}>
            {startSlot}
          </StyledInputSlot>
        ))}
      <StyledInput data-part="input" disabled={disabled} ref={forwardedRef} size={size} {...rest} />
      {!!endSlot &&
        (overrideEndSlotStyle ? (
          endSlot
        ) : (
          <StyledInputSlot data-part="slot" size={size}>
            {endSlot}
          </StyledInputSlot>
        ))}
    </StyledInputRoot>
  )
})

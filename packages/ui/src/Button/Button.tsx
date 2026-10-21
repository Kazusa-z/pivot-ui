import { forwardRef, type ComponentProps, type PropsWithChildren, type ReactNode } from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'

import { styled } from '../../styled-system/jsx'
import { Spin } from '../Spin'
import { useAsyncStatus } from '../hooks/useAsyncStatus'

const StyledButton = styled('button', {
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
      backgroundColor: 'var(--colors-surfaceSubtle)',
      color: 'var(--colors-textMuted)',
      cursor: 'not-allowed',
      boxShadow: 'none',
      '&:hover': {
        color: 'var(--colors-textMuted)',
      },
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
        '& .button-spin': {
          height: '8px',
          width: '8px',
        },
      },
      sm: {
        height: '24px',
        fontSize: '12px',
        lineHeight: '16px',
        fontWeight: 500,
        borderRadius: '4px',
        padding: '0 8px',
        '& .button-spin': {
          height: '14px',
          width: '14px',
        },
      },
      md: {
        height: '32px',
        borderRadius: '6px',
        padding: '0 12px',
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 500,
        '& .button-spin': {
          height: '16px',
          width: '16px',
        },
      },
      lg: {
        height: '36px',
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 500,
        borderRadius: '8px',
        padding: '0 16px',
        '& .button-spin': {
          height: '18px',
          width: '18px',
        },
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
      true: {
        width: '100%',
      },
    },
    uppercase: {
      true: {
        textTransform: 'uppercase',
      },
    },
    critical: {
      true: {
        color: 'var(--colors-dangerText)',
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: 'var(--colors-dangerBg)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-dangerBgHover)',
        },
      },
    },
    positive: {
      true: {
        color: 'var(--colors-successText)',
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: 'var(--colors-successBg)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-successBgHover)',
        },
      },
    },
    loading: {
      true: {
        opacity: '0.6',
        pointerEvents: 'none',
      },
    },
    round: {
      true: {
        borderRadius: '9999px',
      },
    },
  },
  defaultVariants: {
    size: 'sm',
    variant: 'soft',
  },
  compoundVariants: [
    {
      variant: 'outline',
      critical: true,
      css: {
        color: 'var(--colors-dangerText)',
        borderColor: 'var(--colors-dangerBorder)',
        '&:hover': {
          borderColor: 'var(--colors-dangerBorder)',
          backgroundColor: 'var(--colors-dangerBg)',
        },
        '&:active': {
          borderColor: 'var(--colors-dangerBorder)',
          backgroundColor: 'var(--colors-dangerBgHover)',
        },
        '&:disabled': {
          borderColor: 'var(--colors-border)',
        },
      },
    },
    {
      variant: 'outline',
      positive: true,
      css: {
        color: 'var(--colors-successText)',
        borderColor: 'var(--colors-successBorder)',
        '&:hover': {
          borderColor: 'var(--colors-successBorder)',
          backgroundColor: 'var(--colors-successBg)',
        },
        '&:active': {
          borderColor: 'var(--colors-successBorder)',
          backgroundColor: 'var(--colors-successBgHover)',
        },
      },
    },
    {
      variant: 'soft',
      critical: true,
      css: {
        color: 'var(--colors-dangerText)',
        backgroundColor: 'var(--colors-dangerBg)',
        borderColor: 'transparent',
        '&:hover': {
          color: 'var(--colors-dangerText)',
          backgroundColor: 'var(--colors-dangerBgHover)',
          borderColor: 'transparent',
        },
        '&:active': {
          backgroundColor: 'var(--colors-dangerBgHover)',
          borderColor: 'transparent',
        },
      },
    },
    {
      variant: 'soft',
      positive: true,
      css: {
        color: 'var(--colors-successText)',
        backgroundColor: 'var(--colors-successBg)',
        borderColor: 'transparent',
        '&:hover': {
          color: 'var(--colors-successText)',
          backgroundColor: 'var(--colors-successBgHover)',
          borderColor: 'transparent',
        },
        '&:active': {
          backgroundColor: 'var(--colors-successBgHover)',
          borderColor: 'transparent',
        },
      },
    },
    {
      variant: 'solid',
      critical: true,
      css: {
        color: 'var(--colors-white)',
        backgroundColor: 'var(--colors-dangerSolid)',
        borderColor: 'var(--colors-dangerSolid)',
        '&:hover': {
          backgroundColor: 'var(--colors-dangerSolidHover)',
          borderColor: 'var(--colors-dangerSolidHover)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-dangerSolidHover)',
          borderColor: 'var(--colors-dangerSolidHover)',
        },
      },
    },
    {
      variant: 'solid',
      positive: true,
      css: {
        color: 'var(--colors-white)',
        backgroundColor: 'var(--colors-successSolid)',
        borderColor: 'var(--colors-successSolid)',
        '&:hover': {
          backgroundColor: 'var(--colors-successSolidHover)',
          borderColor: 'var(--colors-successSolidHover)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-successSolidHover)',
          borderColor: 'var(--colors-successSolidHover)',
        },
      },
    },
    {
      variant: 'subtle',
      critical: true,
      css: {
        color: 'var(--colors-dangerText)',
        '&:focus-visible': {
          boxShadow: '0 0 0 2px var(--colors-dangerBorder)',
        },
        '&:hover': {
          color: 'var(--colors-dangerText)',
          backgroundColor: 'var(--colors-dangerBg)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-dangerBgHover)',
        },
      },
    },
    {
      variant: 'subtle',
      positive: true,
      css: {
        color: 'var(--colors-successText)',
        '&:focus-visible': {
          boxShadow: '0 0 0 2px var(--colors-successBorder)',
        },
        '&:hover': {
          color: 'var(--colors-successText)',
          backgroundColor: 'var(--colors-successBg)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-successBgHover)',
        },
      },
    },
    {
      variant: 'inverted',
      critical: true,
      css: {
        color: 'var(--colors-textInverted)',
        backgroundColor: 'var(--colors-dangerSolidHover)',
        borderColor: 'var(--colors-dangerSolidHover)',
        '&:hover': {
          backgroundColor: 'var(--colors-dangerText)',
          borderColor: 'var(--colors-dangerText)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-dangerText)',
          borderColor: 'var(--colors-dangerText)',
        },
      },
    },
    {
      variant: 'inverted',
      positive: true,
      css: {
        color: 'var(--colors-textInverted)',
        backgroundColor: 'var(--colors-successSolidHover)',
        borderColor: 'var(--colors-successSolidHover)',
        '&:hover': {
          backgroundColor: 'var(--colors-successText)',
          borderColor: 'var(--colors-successText)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-successText)',
          borderColor: 'var(--colors-successText)',
        },
      },
    },
  ],
})

const SlotContainer = styled('div', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  variants: {
    position: {
      start: {
        marginRight: '4px',
      },
      end: {
        marginLeft: '4px',
      },
    },
    size: {
      xs: {},
      sm: {
        fontSize: '12px',
      },
      md: {
        fontSize: '14px',
      },
      lg: {
        fontSize: '14px',
      },
    },
    gap: {
      xs: {
        '&[data-position="start"]': {
          marginRight: '4px',
        },
        '&[data-position="end"]': {
          marginLeft: '4px',
        },
      },
      sm: {
        '&[data-position="start"]': {
          marginRight: '6px',
        },
        '&[data-position="end"]': {
          marginLeft: '6px',
        },
      },
      md: {
        '&[data-position="start"]': {
          marginRight: '8px',
        },
        '&[data-position="end"]': {
          marginLeft: '8px',
        },
      },
      lg: {
        '&[data-position="start"]': {
          marginRight: '8px',
        },
        '&[data-position="end"]': {
          marginLeft: '8px',
        },
      },
    },
  },
})

type StyledButtonProps = ComponentProps<typeof StyledButton>

export type ButtonProps = PropsWithChildren<
  Omit<StyledButtonProps, 'css'> & {
    // TODO(TD-01): narrow to SystemStyleObject after the consumer css audit.
    css?: any
    startSlot?: ReactNode
    endSlot?: ReactNode
    async?: () => Promise<unknown>
    asChild?: boolean
  }
>

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, forwardedRef) {
  const { children, startSlot, endSlot, async, size, loading: propLoading, onClick, asChild, disabled, ...rest } = props
  const { loading, handleClick } = useAsyncStatus({
    asyncFunction: async,
    propLoading: propLoading as unknown as boolean,
    onClick,
  })

  const resolvedSize = size ?? 'sm'
  const spin = <Spin className="button-spin" color="inherit" size="xs" />
  // Slot and the Panda button have different prop shapes; keep the public behavior unchanged.
  // TODO(TD-08): replace this cast with a typed polymorphic wrapper.
  const Comp = (asChild ? Slot : StyledButton) as any
  const leadingSlot = startSlot ? (loading ? spin : startSlot) : !endSlot && loading ? spin : null
  const trailingSlot = endSlot ? (loading ? spin : endSlot) : null

  return (
    <Comp
      {...rest}
      ref={forwardedRef}
      loading={loading}
      size={resolvedSize}
      onClick={handleClick}
      aria-busy={loading || undefined}
      disabled={asChild ? undefined : disabled || loading}
      aria-disabled={asChild ? disabled || loading || undefined : undefined}>
      {leadingSlot && (
        <SlotContainer position="start" data-position="start" size={resolvedSize} gap={resolvedSize}>
          {leadingSlot}
        </SlotContainer>
      )}
      <Slottable>{children}</Slottable>
      {trailingSlot && (
        <SlotContainer position="end" data-position="end" size={resolvedSize} gap={resolvedSize}>
          {trailingSlot}
        </SlotContainer>
      )}
    </Comp>
  )
})

Button.toString = () => '.editor-button-component'

export { Button }

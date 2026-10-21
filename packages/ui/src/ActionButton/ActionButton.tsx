import { forwardRef, type ComponentProps, type PropsWithChildren } from 'react'

import { styled } from '../../styled-system/jsx'
import { css } from '../../styled-system/css'
import { useAsyncStatus } from '../hooks/useAsyncStatus'
import { Spin } from '../Spin'
import { IconRightBottomCorner } from '../Icons/IconRightBottomCorner'

const StyledActionButton = styled('button', {
  base: {
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    border: '1px solid transparent',
    boxSizing: 'border-box',
    cursor: 'pointer',
    boxShadow: 'var(--shadows-prepend)',
    transition:
      'box-shadow .2s ease, border-color .2s ease, background-color .2s ease, color .2s ease, transform .2s ease',
    borderRadius: '4px',
    color: 'var(--colors-text)',
    flexShrink: 0,
    flexGrow: 0,
    padding: 0,
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
    corner: {
      true: {
        position: 'relative',
      },
    },
    size: {
      xs: {
        height: '20px',
        width: '20px',
        borderRadius: '4px',
        '& > svg': {
          height: '12px',
          width: '12px',
          strokeWidth: 1.5,
        },
        '& .action-button-spin': {
          height: '8px',
          width: '8px',
        },
      },
      sm: {
        height: '24px',
        width: '24px',
        borderRadius: '4px',
        fontSize: '12px',
        '& svg': {
          height: '14px',
          width: '14px',
          strokeWidth: 1.5,
        },
        '& .action-button-spin': {
          height: '14px',
          width: '14px',
        },
      },
      md: {
        height: '32px',
        width: '32px',
        borderRadius: '6px',
        '& svg': {
          height: '16px',
          width: '16px',
        },
        '& .action-button-spin': {
          height: '16px',
          width: '16px',
        },
      },
      lg: {
        height: '36px',
        width: '36px',
        borderRadius: '6px',
        '& svg': {
          height: '18px',
          width: '18px',
        },
        '& .action-button-spin': {
          height: '18px',
          width: '18px',
        },
      },
    },
    variant: {
      outline: {
        border: '1px solid var(--colors-border)',
        borderWidth: '1px',
        borderStyle: 'solid',
        color: 'var(--colors-text)',
        fontSize: '12px',
        backgroundColor: 'transparent',
        '&:hover': {
          color: 'var(--colors-textStrong)',
          borderColor: 'var(--colors-borderStrong)',
          backgroundColor: 'var(--colors-surfaceSubtle)',
        },
        '&:disabled': {
          color: 'var(--colors-textMuted)',
          borderColor: 'var(--colors-border)',
          backgroundColor: 'var(--colors-surfaceSubtle)',
          cursor: 'not-allowed',
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
        '&:disabled': {
          color: 'var(--colors-textMuted)',
          borderColor: 'transparent',
          backgroundColor: 'var(--colors-surfaceSubtle)',
          cursor: 'not-allowed',
        },
      },
      subtle: {
        color: 'CurrentColor',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        '&:hover': {
          color: 'var(--colors-textStrong)',
          backgroundColor: 'var(--colors-surfaceSubtle)',
        },
        '&:disabled': {
          color: 'var(--colors-textMuted)',
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          '&:hover': {
            color: 'var(--colors-textMuted)',
            backgroundColor: 'transparent',
          },
        },
      },
      ghost: {
        color: 'var(--colors-text)',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        '&:hover': {
          color: 'var(--colors-textStrong)',
        },
        '&:disabled': {
          color: 'var(--colors-textMuted)',
          borderColor: 'transparent',
          backgroundColor: 'transparent',
        },
      },
    },
    active: {
      true: {
        backgroundColor: 'var(--colors-selectionBg)',
        borderColor: 'var(--colors-selectionBorder)',
        color: 'var(--colors-selectionText)',
        '&:hover': {
          backgroundColor: 'var(--colors-selectionBgHover)',
          borderColor: 'var(--colors-selectionBorder)',
        },
      },
    },
    fancy: {
      true: {
        '&:active': {
          transform: 'scale(0.94)',
        },
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
      active: true,
      css: {
        color: 'var(--colors-selectionText)',
        backgroundColor: 'var(--colors-selectionBg)',
        borderColor: 'var(--colors-selectionBorder)',
        '&:hover': {
          color: 'var(--colors-selectionText)',
          backgroundColor: 'var(--colors-selectionBgHover)',
          borderColor: 'var(--colors-selectionBorder)',
        },
        '&:disabled': {
          color: 'var(--colors-textMuted)',
          backgroundColor: 'var(--colors-surfaceSubtle)',
          borderColor: 'var(--colors-border)',
        },
      },
    },
    {
      variant: 'subtle',
      active: true,
      css: {
        color: 'var(--colors-selectionText)',
        backgroundColor: 'var(--colors-selectionBg)',
        borderColor: 'transparent',
        '&:hover': {
          color: 'var(--colors-selectionText)',
          backgroundColor: 'var(--colors-selectionBgHover)',
          borderColor: 'transparent',
        },
        '&:disabled': {
          color: 'var(--colors-textMuted)',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
      },
    },
    {
      variant: 'ghost',
      active: true,
      css: {
        color: 'var(--colors-selectionText)',
        backgroundColor: 'var(--colors-selectionBg)',
        borderColor: 'transparent',
        '&:hover': {
          color: 'var(--colors-selectionText)',
          backgroundColor: 'var(--colors-selectionBgHover)',
          borderColor: 'transparent',
        },
        '&:disabled': {
          color: 'var(--colors-textMuted)',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
      },
    },
  ],
})

const StyledActionButtonGroup = styled('div', {
  base: {
    display: 'flex',
  },
  variants: {
    orientation: {
      horizontal: {
        '& [data-action-button]': {
          borderRadius: 0,
        },
        '& [data-action-button]:not(:first-child)': {
          marginLeft: '-1px',
        },
        '& [data-action-button]:hover, & [data-action-button]:focus-visible, & [data-action-button][data-state="open"]':
          {
            position: 'relative',
            zIndex: 1,
          },
        '& [data-action-button]:nth-child(1)': {
          borderRadius: '4px 0 0 4px',
        },
        '& [data-action-button]:nth-last-child(1)': {
          borderRadius: '0 4px 4px 0',
        },
      },
      vertical: {
        flexDirection: 'column',
        '& [data-action-button]': {
          borderRadius: 0,
        },
        '& [data-action-button]:not(:first-child)': {
          marginTop: '-1px',
        },
        '& [data-action-button]:hover, & [data-action-button]:focus-visible, & [data-action-button][data-state="open"]':
          {
            position: 'relative',
            zIndex: 1,
          },
        '& [data-action-button]:nth-child(1)': {
          borderRadius: '4px 4px 0 0',
        },
        '& [data-action-button]:nth-last-child(1)': {
          borderRadius: '0 0 4px 4px',
        },
      },
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
})

const cornerIconClass = css({
  position: 'absolute',
  width: '4px !important',
  height: '4px !important',
  color: 'currentColor',
  bottom: 3,
  right: 3,
})

export interface ActionButtonProps extends ComponentProps<typeof StyledActionButton> {
  /**
   * An async function or a function which should return a Promise
   */
  async?: () => Promise<unknown>
  loading?: boolean
  /**
   * Sometimes the ActionButton is acting as a trigger like opening a modal, in this case, you could set the `corner` prop to `true` to show a corner icon.
   */
  corner?: boolean
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton(props, forwardedRf) {
  const { loading: propLoading, async, onClick, size, corner, disabled, type = 'button', children, ...rest } = props
  const { handleClick, loading } = useAsyncStatus({
    asyncFunction: async,
    propLoading,
    onClick,
  })

  return (
    <StyledActionButton
      {...rest}
      data-action-button
      size={size}
      onClick={handleClick}
      ref={forwardedRf}
      corner={corner}
      type={type}
      aria-busy={loading || undefined}
      disabled={loading || disabled}>
      {loading ? <Spin className="action-button-spin" size="xs" color="inherit" /> : children}
      {corner && <IconRightBottomCorner className={cornerIconClass} />}
    </StyledActionButton>
  )
})

ActionButton.toString = () => '.action-button'

export type ActionButtonGroupProps = Omit<ComponentProps<typeof StyledActionButtonGroup>, 'orientation'> & {
  direction?: 'horizontal' | 'vertical'
}

export const ActionButtonGroup = forwardRef<HTMLDivElement, PropsWithChildren<ActionButtonGroupProps>>(
  function ActionButtonGroup(props, forwardedRef) {
    const { direction, ...rest } = props
    return <StyledActionButtonGroup ref={forwardedRef} orientation={direction} {...rest} />
  }
)

ActionButtonGroup.displayName = 'ActionButtonGroup'

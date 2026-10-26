import { css, cva } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

export const buttonRecipe = cva({
  base: {
    all: 'unset',
    '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:active': { transform: 'none' } },
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    border: '1px solid transparent',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition:
      'border-color 120ms ease-out, background-color 120ms ease-out, color 120ms ease-out, opacity 120ms ease-out',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    outline: 'none',
    '&:focus-visible': {
      outline: '2px solid var(--colors-focusRing)',
      outlineOffset: '2px',
    },
    '&:is(:disabled, [aria-disabled="true"])': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  },
  variants: {
    size: {
      xs: {
        height: 'var(--sizes-controlXs)',
        fontSize: 'var(--fontSizes-control)',
        lineHeight: 'var(--lineHeights-1)',
        fontWeight: 500,
        borderRadius: 'var(--radii-control)',
        padding: '0 var(--space-1_5)',
        '& .button-spin': {
          height: '8px',
          width: '8px',
        },
      },
      sm: {
        height: 'var(--sizes-controlSm)',
        fontSize: 'var(--fontSizes-control)',
        lineHeight: 'var(--lineHeights-1)',
        fontWeight: 500,
        borderRadius: 'var(--radii-control)',
        padding: '0 var(--space-2)',
        '& .button-spin': {
          height: '14px',
          width: '14px',
        },
      },
      md: {
        height: 'var(--sizes-controlMd)',
        borderRadius: 'var(--radii-controlMd)',
        padding: '0 var(--space-3)',
        fontSize: 'var(--fontSizes-controlLarge)',
        lineHeight: 'var(--lineHeights-2)',
        fontWeight: 500,
        '& .button-spin': {
          height: '16px',
          width: '16px',
        },
      },
      lg: {
        height: 'var(--sizes-controlLg)',
        fontSize: 'var(--fontSizes-controlLarge)',
        lineHeight: 'var(--lineHeights-2)',
        fontWeight: 500,
        borderRadius: 'var(--radii-controlLg)',
        padding: '0 var(--space-4)',
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
      },
      solid: {
        backgroundColor: 'var(--colors-primarySolid)',
        borderColor: 'var(--colors-primarySolid)',
        color: 'var(--colors-selectionText)',
        '&:hover': {
          backgroundColor: 'var(--colors-primarySolidHover)',
          borderColor: 'var(--colors-primarySolidHover)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-primarySolidHover)',
          borderColor: 'var(--colors-primarySolidHover)',
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
      },
      inverted: {
        color: 'var(--colors-textInverted)',
        backgroundColor: 'var(--colors-textStrong)',
        borderColor: 'var(--colors-textStrong)',
        '&:hover': {
          opacity: 0.9,
        },
        '&:active': {
          opacity: 0.8,
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
        borderRadius: 'var(--radii-pill)',
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
        color: 'var(--colors-selectionText)',
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
        color: 'var(--colors-selectionText)',
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
        color: 'var(--colors-selectionText)',
        backgroundColor: 'var(--colors-dangerSolidHover)',
        borderColor: 'var(--colors-dangerSolidHover)',
        '&:hover': {
          backgroundColor: 'var(--colors-dangerSolid)',
          borderColor: 'var(--colors-dangerSolid)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-dangerSolid)',
          borderColor: 'var(--colors-dangerSolid)',
        },
      },
    },
    {
      variant: 'inverted',
      positive: true,
      css: {
        color: 'var(--colors-selectionText)',
        backgroundColor: 'var(--colors-successSolidHover)',
        borderColor: 'var(--colors-successSolidHover)',
        '&:hover': {
          backgroundColor: 'var(--colors-successSolid)',
          borderColor: 'var(--colors-successSolid)',
        },
        '&:active': {
          backgroundColor: 'var(--colors-successSolid)',
          borderColor: 'var(--colors-successSolid)',
        },
      },
    },
  ],
})

export const slotRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  variants: {
    position: {
      start: {
        marginRight: 'var(--space-1)',
      },
      end: {
        marginLeft: 'var(--space-1)',
      },
    },
    size: {
      xs: {},
      sm: {
        fontSize: 'var(--fontSizes-control)',
      },
      md: {
        fontSize: 'var(--fontSizes-controlLarge)',
      },
      lg: {
        fontSize: 'var(--fontSizes-controlLarge)',
      },
    },
    gap: {
      xs: {
        '&[data-position="start"]': {
          marginRight: 'var(--space-1)',
        },
        '&[data-position="end"]': {
          marginLeft: 'var(--space-1)',
        },
      },
      sm: {
        '&[data-position="start"]': {
          marginRight: 'var(--space-1_5)',
        },
        '&[data-position="end"]': {
          marginLeft: 'var(--space-1_5)',
        },
      },
      md: {
        '&[data-position="start"]': {
          marginRight: 'var(--space-2)',
        },
        '&[data-position="end"]': {
          marginLeft: 'var(--space-2)',
        },
      },
      lg: {
        '&[data-position="start"]': {
          marginRight: 'var(--space-2)',
        },
        '&[data-position="end"]': {
          marginLeft: 'var(--space-2)',
        },
      },
    },
  },
})

export const actionButtonRecipe = cva({
  base: {
    all: 'unset',
    '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:active': { transform: 'none' } },
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    border: '1px solid transparent',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition:
      'border-color 120ms ease-out, background-color 120ms ease-out, color 120ms ease-out, transform 120ms ease-out',
    borderRadius: 'var(--radii-control)',
    color: 'var(--colors-text)',
    flexShrink: 0,
    flexGrow: 0,
    padding: 0,
    '&:focus-visible': {
      outline: '2px solid var(--colors-focusRing)',
      outlineOffset: '2px',
    },
    '&:is(:disabled, [aria-disabled="true"])': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
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
        height: 'var(--sizes-controlXs)',
        width: 'var(--sizes-controlXs)',
        borderRadius: 'var(--radii-control)',
        fontSize: 'var(--fontSizes-control)',
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
        height: 'var(--sizes-controlSm)',
        width: 'var(--sizes-controlSm)',
        borderRadius: 'var(--radii-control)',
        fontSize: 'var(--fontSizes-control)',
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
        height: 'var(--sizes-controlMd)',
        width: 'var(--sizes-controlMd)',
        borderRadius: 'var(--radii-controlMd)',
        fontSize: 'var(--fontSizes-controlLarge)',
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
        height: 'var(--sizes-controlLg)',
        width: 'var(--sizes-controlLg)',
        borderRadius: 'var(--radii-controlLg)',
        fontSize: 'var(--fontSizes-controlLarge)',
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
        backgroundColor: 'transparent',
        '&:hover': {
          color: 'var(--colors-textStrong)',
          borderColor: 'var(--colors-borderStrong)',
          backgroundColor: 'var(--colors-surfaceSubtle)',
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
      },
      subtle: {
        color: 'currentColor',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        '&:hover': {
          color: 'var(--colors-textStrong)',
          backgroundColor: 'var(--colors-surfaceSubtle)',
        },
      },
      ghost: {
        color: 'var(--colors-text)',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        '&:hover': {
          color: 'var(--colors-textStrong)',
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
      },
    },
  ],
})

export const actionButtonGroupRecipe = cva({
  base: {
    display: 'flex',
    '--group-radius': 'var(--radii-control)',
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
          borderTopLeftRadius: 'var(--group-radius)',
          borderBottomLeftRadius: 'var(--group-radius)',
        },
        '& [data-action-button]:nth-last-child(1)': {
          borderTopRightRadius: 'var(--group-radius)',
          borderBottomRightRadius: 'var(--group-radius)',
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
          borderTopLeftRadius: 'var(--group-radius)',
          borderTopRightRadius: 'var(--group-radius)',
        },
        '& [data-action-button]:nth-last-child(1)': {
          borderBottomLeftRadius: 'var(--group-radius)',
          borderBottomRightRadius: 'var(--group-radius)',
        },
      },
    },
    size: {
      xs: { '--group-radius': 'var(--radii-control)' },
      sm: { '--group-radius': 'var(--radii-control)' },
      md: { '--group-radius': 'var(--radii-controlMd)' },
      lg: { '--group-radius': 'var(--radii-controlLg)' },
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    size: 'sm',
  },
})

export const cornerIconClass = css({
  position: 'absolute',
  width: 'var(--space-1) !important',
  height: 'var(--space-1) !important',
  color: 'currentColor',
  bottom: 'var(--space-1)',
  right: 'var(--space-1)',
})

// Compose beside the recipes so Panda can extract dynamic variants from raw().
export function getButtonClassName(variants: Parameters<typeof buttonRecipe>[0], overrides?: SystemStyleObject) {
  return css(buttonRecipe.raw(variants), overrides)
}

export function getActionButtonClassName(
  variants: Parameters<typeof actionButtonRecipe>[0],
  overrides?: SystemStyleObject
) {
  return css(actionButtonRecipe.raw(variants), overrides)
}

export function getActionButtonGroupClassName(
  variants: Parameters<typeof actionButtonGroupRecipe>[0],
  overrides?: SystemStyleObject
) {
  return css(actionButtonGroupRecipe.raw(variants), overrides)
}

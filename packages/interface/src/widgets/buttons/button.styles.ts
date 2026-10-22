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
      'box-shadow .2s ease, border-color .2s ease, background-color .2s ease, color .2s ease, opacity .2s ease-out',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    outline: 'none',
    '&:focus-visible': {
      boxShadow: '0 0 0 2px var(--colors-focusRing)',
    },
    '&:is(:disabled, [aria-disabled="true"])': {
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
        '&:is(:disabled, [aria-disabled="true"])': {
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
        '&:is(:disabled, [aria-disabled="true"])': {
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
        '&:is(:disabled, [aria-disabled="true"])': {
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
        '&:is(:disabled, [aria-disabled="true"])': {
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
        '&:is(:disabled, [aria-disabled="true"])': {
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
        '&:is(:disabled, [aria-disabled="true"])': {
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
    '&:is(:disabled, [aria-disabled="true"])': {
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
        '&:is(:disabled, [aria-disabled="true"])': {
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
        '&:is(:disabled, [aria-disabled="true"])': {
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
        '&:is(:disabled, [aria-disabled="true"])': {
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
        '&:is(:disabled, [aria-disabled="true"])': {
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
        '&:is(:disabled, [aria-disabled="true"])': {
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
        '&:is(:disabled, [aria-disabled="true"])': {
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
        '&:is(:disabled, [aria-disabled="true"])': {
          color: 'var(--colors-textMuted)',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
      },
    },
  ],
})

export const actionButtonGroupRecipe = cva({
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

export const cornerIconClass = css({
  position: 'absolute',
  width: '4px !important',
  height: '4px !important',
  color: 'currentColor',
  bottom: 3,
  right: 3,
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

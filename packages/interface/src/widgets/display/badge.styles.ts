import { css, cva } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'

export const badgeInnerRecipe = cva({
  base: {
    all: 'unset',
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    color: 'var(--badge-color)',
    backgroundColor: 'var(--badge-bg-color)',
    padding: 'var(--space-0_5) var(--space-1_5)',
    gap: 'var(--space-1)',
    borderRadius: 'var(--radii-control)',
    border: 'var(--badge-border)',
  },
  variants: {
    closable: {
      true: {
        borderRadius: 'var(--radii-control) 0 0 var(--radii-control)',
        padding: '0 var(--space-1)',
      },
    },
  },
})

export const badgeRemoveRecipe = cva({
  base: {
    all: 'unset',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    padding: '0 var(--space-0_5)',
    borderRadius: '0 var(--radii-control) var(--radii-control) 0',
    textAlign: 'center',
    color: 'var(--badge-color)',
    backgroundColor: 'var(--badge-bg-color)',
    border: 'var(--badge-border)',
    cursor: 'pointer',
    '&:hover': {
      color: 'var(--badge-highlight-color)',
      backgroundColor: 'var(--badge-highlight-bg-color)',
    },
  },
  variants: {
    pill: {
      true: {
        borderRadius: 'var(--radii-pill)',
      },
    },
  },
})

export const badgeRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: 'var(--lineHeights-1)',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    fontWeight: 500,
    fontSize: 'var(--fontSizes-control)',
    // Inside a solid selected row (Table, Tree) a tinted badge loses contrast; switch to a
    // translucent white chip that follows the row's selection text color.
    '[data-selected]:not([data-selected=false]) &': {
      '--badge-color': 'currentColor',
      '--badge-highlight-color': 'currentColor',
      '--badge-bg-color': 'rgba(255, 255, 255, 0.16)',
      '--badge-highlight-bg-color': 'rgba(255, 255, 255, 0.24)',
      '--badge-border-color': 'rgba(255, 255, 255, 0.32)',
    },
  },
  variants: {
    size: {
      xs: {
        fontSize: 'var(--fontSizes-micro)',
        height: 'var(--sizes-iconMd)',
        '& [data-part="inner"]': {
          padding: '0 var(--space-1)',
        },
      },
      sm: {
        height: 'var(--sizes-controlXs)',
        fontSize: 'var(--fontSizes-control)',
        '& [data-part="inner"]': {
          padding: '0 var(--space-1_5)',
        },
      },
    },
    closable: {
      true: {
        paddingRight: 'var(--space-1)',
      },
    },
    pill: {
      true: {
        '& [data-part="inner"]': {
          borderRadius: 'var(--radii-pill)',
          padding: '0 var(--space-2)',
        },
      },
    },
    active: {
      true: {
        '--badge-bg-color': 'var(--colors-primarySolid)',
        '--badge-color': 'var(--colors-selectionText)',
        '--badge-highlight-color': 'var(--colors-selectionText)',
        '--badge-highlight-bg-color': 'var(--colors-primarySolidHover)',
      },
    },
    dot: {
      true: {
        height: '8px',
        width: '8px',
        borderRadius: 'var(--radii-pill)',
        padding: 0,
      },
    },
    code: {
      true: {
        fontFamily: 'var(--fonts-mono)',
      },
    },
    variant: {
      solid: {
        '--badge-border': 'none',
      },
      surface: {
        '--badge-border': '1px solid var(--badge-border-color)',
      },
    },
    color: {
      gray: {
        '--badge-color': 'var(--colors-text)',
        '--badge-bg-color': 'var(--colors-softBg)',
        '--badge-highlight-color': 'var(--colors-textStrong)',
        '--badge-highlight-bg-color': 'var(--colors-softBgHover)',
        '--badge-border-color': 'var(--colors-border)',
      },
      green: {
        '--badge-color': 'var(--colors-successText)',
        '--badge-bg-color': 'var(--colors-successBg)',
        '--badge-highlight-color': 'var(--colors-successText)',
        '--badge-highlight-bg-color': 'var(--colors-successBgHover)',
        '--badge-border-color': 'var(--colors-successBorder)',
      },
      red: {
        '--badge-color': 'var(--colors-dangerText)',
        '--badge-bg-color': 'var(--colors-dangerBg)',
        '--badge-highlight-color': 'var(--colors-dangerText)',
        '--badge-highlight-bg-color': 'var(--colors-dangerBgHover)',
        '--badge-border-color': 'var(--colors-dangerBorder)',
      },
      blue: {
        '--badge-color': 'var(--colors-infoText)',
        '--badge-bg-color': 'var(--colors-infoBg)',
        '--badge-highlight-color': 'var(--colors-infoText)',
        '--badge-highlight-bg-color': 'var(--colors-infoBgHover)',
        '--badge-border-color': 'var(--colors-infoBorder)',
      },
      amber: {
        '--badge-color': 'var(--colors-warningText)',
        '--badge-bg-color': 'var(--colors-warningBg)',
        '--badge-highlight-color': 'var(--colors-warningText)',
        '--badge-highlight-bg-color': 'var(--colors-warningBgHover)',
        '--badge-border-color': 'var(--colors-warningBorder)',
      },
      violet: {
        // The single categorical accent; it mirrors the status tint/border steps.
        '--badge-color': 'var(--colors-violet12)',
        '--badge-bg-color': 'var(--colors-violetA3)',
        '--badge-highlight-color': 'var(--colors-violet12)',
        '--badge-highlight-bg-color': 'var(--colors-violetA4)',
        '--badge-border-color': 'var(--colors-violetA7)',
      },
    },
  },
  defaultVariants: {
    color: 'gray',
    size: 'sm',
    variant: 'solid',
  },
  compoundVariants: [
    {
      pill: true,
      size: 'xs',
      css: {
        '& [data-part="inner"]': {
          padding: '0 var(--space-1_5)',
        },
      },
    },
    {
      pill: true,
      closable: true,
      size: 'sm',
      css: {
        '& [data-part="inner"]': {
          borderRadius: 'var(--radii-pill) 0 0 var(--radii-pill)',
        },
        '& [data-part="close"]': {
          borderRadius: '0 var(--radii-pill) var(--radii-pill) 0',
        },
      },
    },
    {
      pill: true,
      closable: true,
      size: 'xs',
      css: {
        '& [data-part="inner"]': {
          borderRadius: 'var(--radii-pill) 0 0 var(--radii-pill)',
        },
        '& [data-part="close"]': {
          borderRadius: '0 var(--radii-pill) var(--radii-pill) 0',
        },
      },
    },
  ],
})

// Compose beside the recipes so Panda can extract dynamic variants from raw().
export function getBadgeClassName(variants: Parameters<typeof badgeRecipe>[0], overrides?: SystemStyleObject) {
  return css(badgeRecipe.raw(variants), overrides)
}

export function getBadgeRemoveClassName(pill: boolean | undefined) {
  return css(badgeRemoveRecipe.raw({ pill }), {
    flexShrink: 0,
    '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '2px' },
    '&:disabled': { cursor: 'not-allowed', opacity: 0.5 },
  })
}

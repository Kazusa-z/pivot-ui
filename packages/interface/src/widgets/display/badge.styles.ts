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
    padding: '2px 6px',
    gap: '4px',
    borderRadius: '4px',
    border: 'var(--badge-border)',
  },
  variants: {
    closable: {
      true: {
        borderRadius: '4px 0 0 4px',
        padding: '0 4px',
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
    padding: '0 2px',
    lineHeight: '14px',
    borderRadius: '0 4px 4px 0',
    marginLeft: '0.5px',
    textAlign: 'center',
    color: 'var(--badge-color)',
    backgroundColor: 'var(--badge-bg-color)',
    border: 'var(--badge-border)',
    backdropFilter: 'var(--badge-backdrop-filter)',
    cursor: 'pointer',
    '&:hover': {
      color: 'var(--badge-highlight-color)',
      backgroundColor: 'var(--badge-highlight-bg-color)',
    },
  },
  variants: {
    pill: {
      true: {
        borderRadius: '9999px',
      },
    },
  },
})

export const badgeRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: '16px',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    fontWeight: 500,
    fontSize: 'var(--fontSizes-sm)',
  },
  variants: {
    size: {
      xs: {
        fontSize: 'var(--fontSizes-0_5)',
        height: '16px',
        '& [data-part="inner"]': {
          padding: '0 4px',
        },
      },
      sm: {
        height: '20px',
        fontSize: 'var(--fontSizes-1)',
        '& [data-part="inner"]': {
          padding: '0 6px',
        },
      },
    },
    closable: {
      true: {
        paddingRight: '4px',
      },
    },
    pill: {
      true: {
        '& [data-part="inner"]': {
          borderRadius: '9999px',
          padding: '0 8px',
        },
      },
    },
    active: {
      true: {
        '--badge-bg-color': 'var(--colors-blue10)',
        '--badge-color': 'var(--colors-white)',
        '--badge-highlight-color': 'var(--colors-blueA12)',
      },
    },
    dot: {
      true: {
        height: '8px',
        width: '8px',
        borderRadius: '9999px',
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
        '--badge-backdrop-filter': 'none',
      },
      surface: {
        '--badge-border': '1px solid var(--badge-border-color)',
        '--badge-backdrop-filter': 'blur(8px)',
      },
    },
    color: {
      gray: {
        '--badge-color': 'var(--colors-grayA11)',
        '--badge-bg-color': 'var(--colors-grayA3)',
        '--badge-highlight-color': 'var(--colors-grayA12)',
        '--badge-highlight-bg-color': 'var(--colors-grayA5)',
        '--badge-border-color': 'var(--colors-grayA9)',
      },
      green: {
        '--badge-color': 'var(--colors-greenA11)',
        '--badge-bg-color': 'var(--colors-greenA3)',
        '--badge-highlight-color': 'var(--colors-greenA12)',
        '--badge-highlight-bg-color': 'var(--colors-greenA5)',
        '--badge-border-color': 'var(--colors-greenA9)',
      },
      red: {
        '--badge-color': 'var(--colors-redA11)',
        '--badge-bg-color': 'var(--colors-redA3)',
        '--badge-highlight-color': 'var(--colors-redA12)',
        '--badge-highlight-bg-color': 'var(--colors-redA5)',
        '--badge-border-color': 'var(--colors-redA9)',
      },
      blue: {
        '--badge-color': 'var(--colors-blueA11)',
        '--badge-bg-color': 'var(--colors-blueA3)',
        '--badge-highlight-color': 'var(--colors-blueA12)',
        '--badge-highlight-bg-color': 'var(--colors-blueA5)',
        '--badge-border-color': 'var(--colors-blueA9)',
      },
      orange: {
        '--badge-color': 'var(--colors-orangeA11)',
        '--badge-bg-color': 'var(--colors-orangeA3)',
        '--badge-highlight-color': 'var(--colors-orangeA12)',
        '--badge-highlight-bg-color': 'var(--colors-orangeA5)',
        '--badge-border-color': 'var(--colors-orangeA9)',
      },
      amber: {
        '--badge-color': 'var(--colors-amberA11)',
        '--badge-bg-color': 'var(--colors-amberA3)',
        '--badge-highlight-color': 'var(--colors-amberA12)',
        '--badge-highlight-bg-color': 'var(--colors-amberA5)',
        '--badge-border-color': 'var(--colors-amberA9)',
      },
      gold: {
        '--badge-color': 'var(--colors-goldA11)',
        '--badge-bg-color': 'var(--colors-goldA3)',
        '--badge-highlight-color': 'var(--colors-goldA12)',
        '--badge-highlight-bg-color': 'var(--colors-goldA5)',
        '--badge-border-color': 'var(--colors-goldA9)',
      },
      violet: {
        '--badge-color': 'var(--colors-violetA11)',
        '--badge-bg-color': 'var(--colors-violetA3)',
        '--badge-highlight-color': 'var(--colors-violetA12)',
        '--badge-highlight-bg-color': 'var(--colors-violetA5)',
        '--badge-border-color': 'var(--colors-violetA9)',
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
          padding: '0 6px',
        },
      },
    },
    {
      pill: true,
      closable: true,
      size: 'sm',
      css: {
        '& [data-part="inner"]': {
          borderRadius: '9999px 0 0 9999px',
        },
        '& [data-part="close"]': {
          borderRadius: '0 9999px 9999px 0',
        },
      },
    },
    {
      pill: true,
      closable: true,
      size: 'xs',
      css: {
        '& [data-part="inner"]': {
          borderRadius: '9999px 0 0 9999px',
        },
        '& [data-part="close"]': {
          borderRadius: '0 9999px 9999px 0',
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

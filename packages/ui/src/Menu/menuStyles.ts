export const contentBase = {
  position: 'relative',
  backgroundColor: 'var(--colors-overlayBg)',
  borderRadius: '6px',
  padding: '4px',
  boxShadow: 'var(--shadows-popContainer)',
  transformOrigin: 'var(--radix-context-menu-content-transform-origin)',
  border: '1px solid var(--colors-border)',
  minWidth: '200px',
  animationName: 'scaleIn',
  animationDuration: '300ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  willChange: 'transform, opacity',
  '&[data-side="top"]': { animationName: 'slideDownAndFade' },
  '&[data-side="bottom"]': { animationName: 'slideUpAndFade' },
  '&[data-side="left"]': { animationName: 'slideRightAndFade' },
  '&[data-side="right"]': { animationName: 'slideLeftAndFade' },
}

export const contentVariants = {
  size: {
    xs: { minWidth: 'max-content' },
    sm: { borderRadius: '6px' },
    md: { borderRadius: '8px' },
  },
}

export const contentDefaults = { size: 'sm' }

export const dropdownContentBase = {
  ...contentBase,
  maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
  transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
  padding: 0,
}

export const contextContentBase = {
  ...contentBase,
  maxHeight: 'var(--radix-context-menu-content-available-height)',
  transformOrigin: 'var(--radix-context-menu-content-transform-origin)',
  padding: 0,
}

export const itemBase = {
  all: 'unset',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  lineHeight: 1,
  fontSize: '12px',
  borderRadius: '4px',
  color: 'var(--colors-text)',
  padding: '4px 8px',
  userSelect: 'none',
  boxSizing: 'border-box',
  minWidth: 'max-content',
  cursor: 'default',
  '&[data-disabled]': {
    color: 'var(--colors-textMuted)',
    pointerEvents: 'none',
  },
  '&:focus': {
    backgroundColor: 'var(--colors-primary)',
    color: 'var(--colors-white)',
  },
}

export const itemVariants = {
  size: {
    xs: {
      height: '20px',
      fontSize: '10px',
      borderRadius: '4px',
      padding: '0 6px',
      minWidth: 'min-content',
    },
    sm: {
      height: '24px',
      borderRadius: '4px',
      fontSize: '12px',
      padding: '0 8px',
    },
    md: {
      height: '32px',
      borderRadius: '6px',
      fontSize: '13px',
      padding: '0 12px',
    },
    lg: {
      height: '36px',
      borderRadius: '6px',
      fontSize: '14px',
      padding: '0 16px',
    },
  },
  critical: {
    true: {
      color: 'var(--colors-red10)',
      '& > .kbd-item': {
        backgroundColor: 'var(--colors-redA3)',
      },
      '&:focus': {
        color: 'var(--colors-white)',
        backgroundColor: 'var(--colors-red10)',
      },
    },
  },
}

export const itemDefaults = { size: 'sm' }

export const labelBase = {
  color: 'var(--colors-textMuted)',
  userSelect: 'none',
}

export const labelVariants = {
  size: {
    xs: { fontSize: '10px', padding: '4px 6px' },
    sm: { fontSize: '10px', padding: '4px 8px' },
    md: { fontSize: '12px', padding: '6px 12px' },
  },
}

export const labelDefaults = { size: 'sm' }

export const separatorStyle = {
  base: {
    height: '1px',
    backgroundColor: 'var(--colors-border)',
    margin: '4px',
  },
}

export const indicatorBase = {
  position: 'absolute',
  top: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: 'translateY(-50%)',
}

export const indicatorVariants = {
  size: {
    xs: {
      left: '4px',
      width: '12px',
      height: '12px',
      marginRight: '4px',
      '& > svg': { width: '12px', height: '12px' },
    },
    sm: {
      left: '4px',
      width: '16px',
      height: '16px',
      marginRight: '6px',
      '& > svg': { width: '14px', height: '14px' },
    },
    md: {
      left: '8px',
      width: '16px',
      height: '16px',
      marginRight: '8px',
      '& > svg': { width: '16px', height: '16px' },
    },
  },
}

export const indicatorDefaults = { size: 'sm' }

export const radioGroupVariants = {
  size: {
    xs: { '& [data-menu-label]': { paddingLeft: '20px' } },
    sm: { '& [data-menu-label]': { paddingLeft: '24px' } },
    md: { '& [data-menu-label]': { paddingLeft: '28px' } },
  },
}

export const checkboxItemBase = {
  ...itemBase,
  position: 'relative !important',
  paddingLeft: '24px !important',
  '&[data-state=checked]': {
    display: 'flex',
    justifyContent: 'initial',
  },
}

export const checkboxItemVariants = {
  ...itemVariants,
  size: {
    ...itemVariants.size,
    xs: { ...itemVariants.size.xs, paddingLeft: '20px !important' },
    md: { ...itemVariants.size.md, paddingLeft: '28px !important' },
  },
}

export const subMenuItemBase = {
  ...itemBase,
  position: 'relative',
  '& > svg': {
    width: '12px',
    height: '12px',
  },
}

export const menuItemContentStyle = {
  base: {
    display: 'flex',
    alignItems: 'center',
    '& > svg': {
      marginRight: '6px',
      width: '16px',
      height: '16px',
    },
  },
}

export const dotStyle = {
  base: {
    height: '4px',
    width: '4px',
    borderRadius: '9999px',
    backgroundColor: 'currentColor',
  },
}

export const menubarTriggerStyle = {
  base: {
    all: 'unset',
    display: 'flex',
    height: '24px',
    alignItems: 'center',
    padding: '0 8px',
    fontSize: '12px',
    outline: 'none',
    cursor: 'default',
    userSelect: 'none',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'var(--colors-grayA4)',
      color: 'var(--colors-gray12)',
    },
    '&:focus': {
      backgroundColor: 'var(--colors-grayA4)',
      color: 'var(--colors-gray12)',
    },
    '&[data-state=open]': {
      backgroundColor: 'var(--colors-grayA4)',
      color: 'var(--colors-gray12)',
    },
  },
}

export const menubarRootStyle = {
  base: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    padding: '0 8px',
    flexWrap: 'nowrap',
  },
}

export const contentConfig = { base: contentBase, variants: contentVariants, defaultVariants: contentDefaults } as any
export const dropdownContentConfig = {
  base: dropdownContentBase,
  variants: contentVariants,
  defaultVariants: contentDefaults,
} as any
export const contextContentConfig = {
  base: contextContentBase,
  variants: contentVariants,
  defaultVariants: contentDefaults,
} as any
export const itemConfig = { base: itemBase, variants: itemVariants, defaultVariants: itemDefaults } as any
export const labelConfig = { base: labelBase, variants: labelVariants, defaultVariants: labelDefaults } as any
export const separatorConfig = separatorStyle as any
export const indicatorConfig = {
  base: indicatorBase,
  variants: indicatorVariants,
  defaultVariants: indicatorDefaults,
} as any
export const radioGroupConfig = { variants: radioGroupVariants, defaultVariants: { size: 'sm' } } as any
export const checkboxItemConfig = {
  base: checkboxItemBase,
  variants: checkboxItemVariants,
  defaultVariants: itemDefaults,
} as any
export const subMenuItemConfig = {
  base: subMenuItemBase,
  variants: itemVariants,
  defaultVariants: itemDefaults,
} as any
export const menuItemContentConfig = menuItemContentStyle as any
export const dotConfig = dotStyle as any
export const menubarTriggerConfig = menubarTriggerStyle as any
export const menubarRootConfig = menubarRootStyle as any

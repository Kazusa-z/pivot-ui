import {
  checkboxItemConfig,
  indicatorConfig,
  itemBase,
  itemDefaults,
  itemVariants,
  labelConfig,
} from '../Menu/menuStyles'

export const selectTriggerConfig = {
  base: {
    all: 'unset',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    color: 'var(--colors-text)',
    border: '1px solid transparent',
    transition: 'border-color .2s ease, background-color .2s ease, color .2s ease, box-shadow .2s ease',
    userSelect: 'none',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
    '&:disabled': {
      backgroundColor: 'var(--colors-surfaceSubtle)',
      borderColor: 'var(--colors-border)',
      color: 'var(--colors-textMuted)',
      '&:hover': {
        backgroundColor: 'var(--colors-surfaceSubtle)',
        color: 'var(--colors-textMuted)',
        cursor: 'default',
      },
    },
    '&:hover': {
      backgroundColor: 'var(--colors-softBgHover)',
      borderColor: 'var(--colors-borderStrong)',
    },
    '&[data-placeholder]': {
      color: 'var(--colors-textMuted)',
    },
    '&:focus-visible': {
      borderColor: 'var(--colors-borderStrong)',
      boxShadow: '0 0 0 2px var(--colors-focusRing)',
    },
  },
  variants: {
    size: {
      xs: { height: '20px', borderRadius: '4px', padding: '0 20px 0 6px', fontSize: '12px' },
      sm: { height: '24px', borderRadius: '4px', padding: '0 20px 0 8px', fontSize: '12px' },
      md: { height: '32px', borderRadius: '6px', padding: '0 24px 0 12px', fontSize: '14px' },
    },
    variant: {
      outline: {
        backgroundColor: 'var(--colors-surface)',
        borderColor: 'var(--colors-border)',
        '&:hover': { backgroundColor: 'var(--colors-surfaceSubtle)', borderColor: 'var(--colors-borderStrong)' },
      },
      soft: {
        backgroundColor: 'var(--colors-softBg)',
        borderColor: 'transparent',
        '&:hover': { backgroundColor: 'var(--colors-softBgHover)', borderColor: 'transparent' },
      },
      subtle: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        '&:hover': { backgroundColor: 'var(--colors-surfaceSubtle)', borderColor: 'transparent' },
      },
    },
  },
  defaultVariants: { size: 'sm', variant: 'soft' },
} as any

export const selectIconConfig = {
  base: {
    position: 'absolute',
    height: '100%',
    display: 'inline-flex',
    color: 'CurrentColor',
    alignItems: 'center',
    right: 4,
    lineHeight: 1,
    '& > svg': { height: '12px', width: '12px' },
  },
  variants: {
    size: {
      xs: { '& > svg': { height: '12px', width: '12px' } },
      sm: { '& > svg': { height: '14px', width: '14px' } },
      md: { '& > svg': { height: '16px', width: '16px' } },
    },
  },
} as any

export const triggerContentConfig = {
  base: { display: 'flex', flex: 1, minWidth: 0, height: '100%', alignItems: 'center', gap: '4px' },
} as any

export const selectValueConfig = {
  base: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    height: '100%',
    alignItems: 'center',
    lineHeight: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'inherit',
  },
} as any

export const cornerIconClass = {
  position: 'absolute',
  width: '4px !important',
  height: '4px !important',
  color: 'currentColor',
  bottom: 1,
  right: 1,
}

export const selectContentConfig = {
  base: {
    overflow: 'auto',
    maxHeight: 'min(300px, var(--radix-select-content-available-height))',
    backgroundColor: 'var(--colors-surfaceOverlay)',
    minWidth: 'var(--radix-select-trigger-width)',
    borderRadius: '6px',
    boxShadow: 'var(--shadows-popContainer)',
    border: '1px solid var(--colors-border)',
  },
} as any

export const selectViewportConfig = {
  base: {
    padding: '4px',
    maxHeight: '300px',
    overflowY: 'auto',
    '@media (prefers-reduced-motion: no-preference)': { scrollBehavior: 'smooth' },
  },
} as any

export const selectScrollButtonConfig = {
  base: {
    display: 'flex',
    height: '16px',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    color: 'var(--colors-textMuted)',
    cursor: 'default',
  },
} as any

export const selectItemContentConfig = {
  base: {
    display: 'flex',
    alignItems: 'center',
    '& > svg': { marginRight: '6px', width: '16px', height: '16px' },
  },
} as any

export const selectSlotConfig = {
  base: { flexShrink: 0, userSelect: 'none', color: 'var(--colors-textMuted)' },
  variants: {
    size: {
      xs: { paddingRight: '4px', fontSize: '12px' },
      sm: { paddingRight: '4px', fontSize: '12px' },
      md: { paddingRight: '8px', fontSize: '14px' },
    },
  },
} as any

export const comboboxTriggerConfig = {
  base: {
    all: 'unset',
    position: 'relative',
    display: 'flex',
    width: '100%',
    gap: '4px',
    alignItems: 'center',
    justifyContent: 'flex-start',
    boxSizing: 'border-box',
    color: 'var(--colors-text)',
    border: '1px solid transparent',
    transition: 'border-color .2s ease, background-color .2s ease, color .2s ease, box-shadow .2s ease',
    cursor: 'pointer',
  },
  variants: {
    size: {
      xs: { height: '20px', borderRadius: '4px', padding: '0 20px 0 6px' },
      sm: { height: '24px', borderRadius: '4px', padding: '0 20px 0 2px' },
      md: { height: '32px', borderRadius: '6px', padding: '0 24px 0 12px' },
    },
    variant: {
      outline: {
        backgroundColor: 'var(--colors-surface)',
        borderColor: 'var(--colors-border)',
        '&:hover': { backgroundColor: 'var(--colors-surfaceSubtle)', borderColor: 'var(--colors-borderStrong)' },
      },
      soft: {
        backgroundColor: 'var(--colors-softBg)',
        borderColor: 'transparent',
        '&:hover': { backgroundColor: 'var(--colors-softBgHover)', borderColor: 'transparent' },
      },
      subtle: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        '&:hover': { backgroundColor: 'var(--colors-surfaceSubtle)', borderColor: 'transparent' },
      },
    },
  },
  defaultVariants: { size: 'sm', variant: 'soft' },
} as any

export const chevronConfig = {
  base: {
    height: '12px',
    width: '12px',
    color: 'var(--colors-textMuted)',
    flexShrink: 0,
    position: 'absolute',
    right: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  variants: {
    size: {
      xs: { height: '12px', width: '12px' },
      sm: { height: '14px', width: '14px' },
      md: { height: '16px', width: '16px' },
    },
  },
} as any

export const searchIconConfig = {
  base: { height: '14px', width: '14px', color: 'var(--colors-textMuted)', strokeWidth: 1.5, flexShrink: 0 },
} as any

export const placeholderConfig = {
  base: {
    all: 'unset',
    fontSize: '12px',
    color: 'var(--colors-textMuted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
} as any

export const comboboxContentConfig = {
  base: {
    padding: '4px',
    minHeight: '60px',
    maxHeight: '300px',
    overflowY: 'auto',
    position: 'relative',
    flex: 1,
    flexWrap: 'nowrap !important',
    backgroundColor: 'var(--colors-surfaceOverlay)',
    '&[data-state="open"]': { animation: 'none' },
    '&::-webkit-scrollbar': { width: '2px' },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': { background: 'var(--colors-scrollbarThumb)', borderRadius: '4px' },
    '&::-webkit-scrollbar-thumb:hover': { background: 'var(--colors-scrollbarTrackHover)' },
  },
} as any

export const comboboxSearchInputConfig = {
  base: {
    all: 'unset',
    width: '100%',
    padding: '4px',
    fontSize: '12px',
    color: 'var(--colors-text)',
    boxSizing: 'border-box',
    '&::placeholder': { color: 'var(--colors-textMuted)' },
  },
} as any

export const comboItemConfig = {
  base: {
    ...itemBase,
    userSelect: 'none',
    width: '100%',
    flexShrink: 0,
    '&:focus': { backgroundColor: 'transparent', color: 'var(--colors-text)' },
    '&:hover': { color: 'var(--colors-textStrong)', backgroundColor: 'var(--colors-surfaceSubtle)' },
  },
  variants: {
    ...itemVariants,
    focused: { true: {} },
    selected: {
      true: {
        backgroundColor: 'var(--colors-selectionBg)',
        color: 'var(--colors-selectionText)',
        borderRadius: 0,
        '&:focus': { backgroundColor: 'var(--colors-selectionBg)', color: 'var(--colors-selectionText)' },
        '&:hover': { backgroundColor: 'var(--colors-selectionBgHover)', color: 'var(--colors-selectionText)' },
      },
    },
    selectedStart: {
      true: { borderTopLeftRadius: '4px', borderTopRightRadius: '4px' },
    },
    selectedEnd: {
      true: { borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' },
    },
  },
  defaultVariants: itemDefaults,
} as any

export const comboboxHeaderConfig = {
  base: { borderBottom: '1px solid var(--colors-border)', padding: '4px 8px', flexShrink: 0, gap: '8px' },
} as any

export const selectAllWrapperConfig = {
  base: { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 0', cursor: 'pointer' },
} as any

export const selectAllTextConfig = {
  base: { fontSize: '12px', color: 'var(--colors-text)', cursor: 'pointer', userSelect: 'none' },
} as any

export const comboboxSlotConfig = {
  base: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--colors-textMuted)',
    transition: 'color 0.2s ease',
    userSelect: 'none',
  },
  variants: {
    size: {
      xs: { paddingRight: '4px', fontSize: '12px' },
      sm: { paddingRight: '6px', fontSize: '12px' },
      md: { paddingRight: '8px', fontSize: '14px' },
    },
  },
} as any

export const comboboxTriggerContentConfig = {
  base: { display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, height: '100%', gap: '4px' },
} as any

export const comboboxValueNodeConfig = {
  base: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    '& > *': { minWidth: 0 },
  },
} as any

export const selectItemConfig = checkboxItemConfig

export const selectIndicatorConfig = indicatorConfig
export const selectLabelConfig = labelConfig

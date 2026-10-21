import React, {
  createContext,
  useContext,
  forwardRef,
  PropsWithChildren,
  ReactNode,
  isValidElement,
  Fragment,
} from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import * as MenubarPrimitive from '@radix-ui/react-menubar'
import { IconChevronRight, IconCheck } from '@tabler/icons-react'
import type {
  ContextMenuCheckboxItemProps,
  ContextMenuRadioItemProps,
  ContextMenuRadioGroupProps,
  ContextMenuGroupProps,
  ContextMenuProps,
  ContextMenuContentProps as ContextMenuContentProps,
} from '@radix-ui/react-context-menu'
import type {
  DropdownMenuProps,
  DropdownMenuContentProps,
  DropdownMenuCheckboxItemProps,
} from '@radix-ui/react-dropdown-menu'

import { styled } from '../../styled-system/jsx'
import { KbdGroup } from '../Kbd'
import { ScrollArea } from '../ScrollArea'

type MenuType = 'context' | 'dropdown' | 'menubar'
type MenuSize = 'xs' | 'sm' | 'md'
type PickedContentProps = 'side' | 'sideOffset' | 'align' | 'alignOffset'

const StyledMenuItemContent = styled('span', {
  base: {
    display: 'flex',
    alignItems: 'center',
    '& > svg': {
      marginRight: '6px',
      width: '16px',
      height: '16px',
    },
  },
})

const anatomy = {
  context: {
    Root: ContextMenuPrimitive.Root,
    Group: ContextMenuPrimitive.Group,
    Sub: ContextMenuPrimitive.Sub,
    Portal: ContextMenuPrimitive.Portal,
    RadioGroup: styled(ContextMenuPrimitive.RadioGroup, {
      variants: {
        size: {
          xs: {
            '& [data-menu-label]': {
              paddingLeft: '20px',
            },
          },
          sm: {
            '& [data-menu-label]': {
              paddingLeft: '24px',
            },
          },
          md: {
            '& [data-menu-label]': {
              paddingLeft: '28px',
            },
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    MenuLabel: styled(ContextMenuPrimitive.Label, {
      base: {
        color: 'var(--colors-textMuted)',
        userSelect: 'none',
      },
      variants: {
        size: {
          xs: {
            fontSize: '10px',
            padding: '4px 6px',
          },
          sm: {
            fontSize: '10px',
            padding: '4px 8px',
          },
          md: {
            fontSize: '12px',
            padding: '6px 12px',
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    MenuItem: styled(ContextMenuPrimitive.Item, {
      base: {
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
      },
      variants: {
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
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    Content: styled(ContextMenuPrimitive.Content, {
      base: {
        position: 'relative',
        backgroundColor: 'var(--colors-overlayBg)',
        borderRadius: '6px',
        padding: 0,
        boxShadow: 'var(--shadows-popContainer)',
        transformOrigin: 'var(--radix-context-menu-content-transform-origin)',
        border: '1px solid var(--colors-border)',
        minWidth: '200px',
        animationName: 'scaleIn',
        animationDuration: '300ms',
        animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, opacity',
        '&[data-side="top"]': {
          animationName: 'slideDownAndFade',
        },
        '&[data-side="bottom"]': {
          animationName: 'slideUpAndFade',
        },
        '&[data-side="left"]': {
          animationName: 'slideRightAndFade',
        },
        '&[data-side="right"]': {
          animationName: 'slideLeftAndFade',
        },
        maxHeight: 'var(--radix-context-menu-content-available-height)',
      },
      variants: {
        size: {
          xs: {
            minWidth: 'max-content',
          },
          sm: {
            borderRadius: '6px',
          },
          md: {
            borderRadius: '8px',
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    SubContent: styled(ContextMenuPrimitive.SubContent, {
      base: {
        position: 'relative',
        backgroundColor: 'var(--colors-overlayBg)',
        borderRadius: '6px',
        padding: 0,
        boxShadow: 'var(--shadows-popContainer)',
        transformOrigin: 'var(--radix-context-menu-content-transform-origin)',
        border: '1px solid var(--colors-border)',
        minWidth: '200px',
        animationName: 'scaleIn',
        animationDuration: '300ms',
        animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, opacity',
        '&[data-side="top"]': {
          animationName: 'slideDownAndFade',
        },
        '&[data-side="bottom"]': {
          animationName: 'slideUpAndFade',
        },
        '&[data-side="left"]': {
          animationName: 'slideRightAndFade',
        },
        '&[data-side="right"]': {
          animationName: 'slideLeftAndFade',
        },
        maxHeight: 'var(--radix-context-menu-content-available-height)',
      },
      variants: {
        size: {
          xs: {
            minWidth: 'max-content',
          },
          sm: {
            borderRadius: '6px',
          },
          md: {
            borderRadius: '8px',
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    SubMenuItem: styled(ContextMenuPrimitive.SubTrigger, {
      base: {
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
        '& > svg': {
          width: '12px',
          height: '12px',
        },
      },
      variants: {
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
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    Separator: styled(ContextMenuPrimitive.Separator, {
      base: {
        height: '1px',
        backgroundColor: 'var(--colors-border)',
        margin: '4px',
      },
    }),
    CheckboxItem: styled(ContextMenuPrimitive.CheckboxItem, {
      base: {
        all: 'unset',
        position: 'relative !important',
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
        paddingLeft: '24px !important',
        '&[data-state=checked]': {
          display: 'flex',
          justifyContent: 'initial',
        },
      },
      variants: {
        size: {
          xs: {
            height: '20px',
            fontSize: '10px',
            borderRadius: '4px',
            padding: '0 6px',
            minWidth: 'min-content',
            paddingLeft: '20px !important',
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
            paddingLeft: '28px !important',
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
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    RadioItem: styled(ContextMenuPrimitive.RadioItem, {
      base: {
        all: 'unset',
        position: 'relative !important',
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
        paddingLeft: '24px !important',
        '&[data-state=checked]': {
          display: 'flex',
          justifyContent: 'initial',
        },
      },
      variants: {
        size: {
          xs: {
            height: '20px',
            fontSize: '10px',
            borderRadius: '4px',
            padding: '0 6px',
            minWidth: 'min-content',
            paddingLeft: '20px !important',
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
            paddingLeft: '28px !important',
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
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    ItemIndicator: styled(ContextMenuPrimitive.ItemIndicator, {
      base: {
        position: 'absolute',
        top: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translateY(-50%)',
      },
      variants: {
        size: {
          xs: {
            left: '4px',
            width: '12px',
            height: '12px',
            marginRight: '4px',
            '& > svg': {
              width: '12px',
              height: '12px',
            },
          },
          sm: {
            left: '4px',
            width: '16px',
            height: '16px',
            marginRight: '6px',
            '& > svg': {
              width: '14px',
              height: '14px',
            },
          },
          md: {
            left: '8px',
            width: '16px',
            height: '16px',
            marginRight: '8px',
            '& > svg': {
              width: '16px',
              height: '16px',
            },
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
  },
  dropdown: {
    Root: DropdownMenuPrimitive.Root,
    Group: DropdownMenuPrimitive.Group,
    RadioGroup: styled(DropdownMenuPrimitive.RadioGroup, {
      variants: {
        size: {
          xs: {
            '& [data-menu-label]': {
              paddingLeft: '20px',
            },
          },
          sm: {
            '& [data-menu-label]': {
              paddingLeft: '24px',
            },
          },
          md: {
            '& [data-menu-label]': {
              paddingLeft: '28px',
            },
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    Sub: DropdownMenuPrimitive.Sub,
    Portal: DropdownMenuPrimitive.Portal,
    MenuLabel: styled(DropdownMenuPrimitive.Label, {
      base: {
        color: 'var(--colors-textMuted)',
        userSelect: 'none',
      },
      variants: {
        size: {
          xs: {
            fontSize: '10px',
            padding: '4px 6px',
          },
          sm: {
            fontSize: '10px',
            padding: '4px 8px',
          },
          md: {
            fontSize: '12px',
            padding: '6px 12px',
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    MenuItem: styled(DropdownMenuPrimitive.Item, {
      base: {
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
      },
      variants: {
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
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    Content: styled(DropdownMenuPrimitive.Content, {
      base: {
        position: 'relative',
        backgroundColor: 'var(--colors-overlayBg)',
        borderRadius: '6px',
        padding: 0,
        boxShadow: 'var(--shadows-popContainer)',
        transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
        border: '1px solid var(--colors-border)',
        minWidth: '200px',
        animationName: 'scaleIn',
        animationDuration: '300ms',
        animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, opacity',
        '&[data-side="top"]': {
          animationName: 'slideDownAndFade',
        },
        '&[data-side="bottom"]': {
          animationName: 'slideUpAndFade',
        },
        '&[data-side="left"]': {
          animationName: 'slideRightAndFade',
        },
        '&[data-side="right"]': {
          animationName: 'slideLeftAndFade',
        },
        maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
      },
      variants: {
        size: {
          xs: {
            minWidth: 'max-content',
          },
          sm: {
            borderRadius: '6px',
          },
          md: {
            borderRadius: '8px',
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    SubContent: styled(DropdownMenuPrimitive.SubContent, {
      base: {
        position: 'relative',
        backgroundColor: 'var(--colors-overlayBg)',
        borderRadius: '6px',
        padding: 0,
        boxShadow: 'var(--shadows-popContainer)',
        transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
        border: '1px solid var(--colors-border)',
        minWidth: '200px',
        animationName: 'scaleIn',
        animationDuration: '300ms',
        animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, opacity',
        '&[data-side="top"]': {
          animationName: 'slideDownAndFade',
        },
        '&[data-side="bottom"]': {
          animationName: 'slideUpAndFade',
        },
        '&[data-side="left"]': {
          animationName: 'slideRightAndFade',
        },
        '&[data-side="right"]': {
          animationName: 'slideLeftAndFade',
        },
        maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
      },
      variants: {
        size: {
          xs: {
            minWidth: 'max-content',
          },
          sm: {
            borderRadius: '6px',
          },
          md: {
            borderRadius: '8px',
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    SubMenuItem: styled(DropdownMenuPrimitive.SubTrigger, {
      base: {
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
        '& > svg': {
          width: '12px',
          height: '12px',
        },
      },
      variants: {
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
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    Separator: styled(DropdownMenuPrimitive.Separator, {
      base: {
        height: '1px',
        backgroundColor: 'var(--colors-border)',
        margin: '4px',
      },
    }),
    CheckboxItem: styled(DropdownMenuPrimitive.CheckboxItem, {
      base: {
        all: 'unset',
        position: 'relative !important',
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
        paddingLeft: '24px !important',
        '&[data-state=checked]': {
          display: 'flex',
          justifyContent: 'initial',
        },
      },
      variants: {
        size: {
          xs: {
            height: '20px',
            fontSize: '10px',
            borderRadius: '4px',
            padding: '0 6px',
            minWidth: 'min-content',
            paddingLeft: '20px !important',
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
            paddingLeft: '28px !important',
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
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    RadioItem: styled(DropdownMenuPrimitive.RadioItem, {
      base: {
        all: 'unset',
        position: 'relative !important',
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
        paddingLeft: '24px !important',
        '&[data-state=checked]': {
          display: 'flex',
          justifyContent: 'initial',
        },
      },
      variants: {
        size: {
          xs: {
            height: '20px',
            fontSize: '10px',
            borderRadius: '4px',
            padding: '0 6px',
            minWidth: 'min-content',
            paddingLeft: '20px !important',
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
            paddingLeft: '28px !important',
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
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    ItemIndicator: styled(DropdownMenuPrimitive.ItemIndicator, {
      base: {
        position: 'absolute',
        top: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translateY(-50%)',
      },
      variants: {
        size: {
          xs: {
            left: '4px',
            width: '12px',
            height: '12px',
            marginRight: '4px',
            '& > svg': {
              width: '12px',
              height: '12px',
            },
          },
          sm: {
            left: '4px',
            width: '16px',
            height: '16px',
            marginRight: '6px',
            '& > svg': {
              width: '14px',
              height: '14px',
            },
          },
          md: {
            left: '8px',
            width: '16px',
            height: '16px',
            marginRight: '8px',
            '& > svg': {
              width: '16px',
              height: '16px',
            },
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
  },
  menubar: {
    Root: MenubarPrimitive.Root,
    Group: MenubarPrimitive.Group,
    RadioGroup: styled(MenubarPrimitive.RadioGroup, {
      variants: {
        size: {
          xs: {
            '& [data-menu-label]': {
              paddingLeft: '20px',
            },
          },
          sm: {
            '& [data-menu-label]': {
              paddingLeft: '24px',
            },
          },
          md: {
            '& [data-menu-label]': {
              paddingLeft: '28px',
            },
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    Sub: MenubarPrimitive.Sub,
    Portal: MenubarPrimitive.Portal,
    MenuLabel: styled(MenubarPrimitive.Label, {
      base: {
        color: 'var(--colors-textMuted)',
        userSelect: 'none',
      },
      variants: {
        size: {
          xs: {
            fontSize: '10px',
            padding: '4px 6px',
          },
          sm: {
            fontSize: '10px',
            padding: '4px 8px',
          },
          md: {
            fontSize: '12px',
            padding: '6px 12px',
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    MenuItem: styled(MenubarPrimitive.Item, {
      base: {
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
      },
      variants: {
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
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    Content: styled(MenubarPrimitive.Content, {
      base: {
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
        '&[data-side="top"]': {
          animationName: 'slideDownAndFade',
        },
        '&[data-side="bottom"]': {
          animationName: 'slideUpAndFade',
        },
        '&[data-side="left"]': {
          animationName: 'slideRightAndFade',
        },
        '&[data-side="right"]': {
          animationName: 'slideLeftAndFade',
        },
      },
      variants: {
        size: {
          xs: {
            minWidth: 'max-content',
          },
          sm: {
            borderRadius: '6px',
          },
          md: {
            borderRadius: '8px',
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    SubContent: styled(MenubarPrimitive.SubContent, {
      base: {
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
        '&[data-side="top"]': {
          animationName: 'slideDownAndFade',
        },
        '&[data-side="bottom"]': {
          animationName: 'slideUpAndFade',
        },
        '&[data-side="left"]': {
          animationName: 'slideRightAndFade',
        },
        '&[data-side="right"]': {
          animationName: 'slideLeftAndFade',
        },
      },
      variants: {
        size: {
          xs: {
            minWidth: 'max-content',
          },
          sm: {
            borderRadius: '6px',
          },
          md: {
            borderRadius: '8px',
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    SubMenuItem: styled(MenubarPrimitive.SubTrigger, {
      base: {
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
        '& > svg': {
          width: '12px',
          height: '12px',
        },
      },
      variants: {
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
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    Separator: styled(MenubarPrimitive.Separator, {
      base: {
        height: '1px',
        backgroundColor: 'var(--colors-border)',
        margin: '4px',
      },
    }),
    CheckboxItem: styled(MenubarPrimitive.CheckboxItem, {
      base: {
        all: 'unset',
        position: 'relative !important',
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
        paddingLeft: '24px !important',
        '&[data-state=checked]': {
          display: 'flex',
          justifyContent: 'initial',
        },
      },
      variants: {
        size: {
          xs: {
            height: '20px',
            fontSize: '10px',
            borderRadius: '4px',
            padding: '0 6px',
            minWidth: 'min-content',
            paddingLeft: '20px !important',
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
            paddingLeft: '28px !important',
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
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    RadioItem: styled(MenubarPrimitive.RadioItem, {
      base: {
        all: 'unset',
        position: 'relative !important',
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
        paddingLeft: '24px !important',
        '&[data-state=checked]': {
          display: 'flex',
          justifyContent: 'initial',
        },
      },
      variants: {
        size: {
          xs: {
            height: '20px',
            fontSize: '10px',
            borderRadius: '4px',
            padding: '0 6px',
            minWidth: 'min-content',
            paddingLeft: '20px !important',
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
            paddingLeft: '28px !important',
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
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
    ItemIndicator: styled(MenubarPrimitive.ItemIndicator, {
      base: {
        position: 'absolute',
        top: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translateY(-50%)',
      },
      variants: {
        size: {
          xs: {
            left: '4px',
            width: '12px',
            height: '12px',
            marginRight: '4px',
            '& > svg': {
              width: '12px',
              height: '12px',
            },
          },
          sm: {
            left: '4px',
            width: '16px',
            height: '16px',
            marginRight: '6px',
            '& > svg': {
              width: '14px',
              height: '14px',
            },
          },
          md: {
            left: '8px',
            width: '16px',
            height: '16px',
            marginRight: '8px',
            '& > svg': {
              width: '16px',
              height: '16px',
            },
          },
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    }),
  },
} as const

function useResolveMenuAnatomy() {
  const ctx = useContext(MenuContext)
  const ret = anatomy[ctx.type]

  if (!ret) {
    throw new Error(`Cannot resolve Primitive Component by type ${ctx.type}`)
  }

  return ret
}

const MenuContext = createContext<{ type: MenuType; size: MenuSize }>({
  type: 'dropdown',
  size: 'sm',
})
MenuContext.displayName = 'MenuContext'

const MenuProvider = function MenuProvider(props: PropsWithChildren<{ type: MenuType; size: MenuSize }>) {
  return <MenuContext.Provider value={{ type: props.type, size: props.size }}>{props.children}</MenuContext.Provider>
}

export interface MenuItemProps {
  icon?: ReactNode
  name?: string
  label?: string
  shortcuts?: string[] | string
  disabled?: boolean
  onClick?: (e: React.MouseEvent) => void
  onSelect?: (e: Event) => void
  critical?: boolean
  children?: ReactNode
  asChild?: boolean
}

const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(props, forwardedRef) {
  const { icon, name, shortcuts, label, disabled, onSelect, onClick, asChild, critical, children, ...rest } = props
  const { size } = useContext(MenuContext)
  const { MenuItem: Item } = useResolveMenuAnatomy()

  return (
    <Item
      ref={forwardedRef}
      disabled={disabled}
      onSelect={onSelect}
      onClick={onClick}
      size={size}
      critical={critical}
      asChild={asChild}
      {...rest}>
      {isValidElement(children) ? (
        children
      ) : (
        <Fragment>
          <StyledMenuItemContent>
            {icon}
            {name}
          </StyledMenuItemContent>
          <KbdGroup shortcuts={shortcuts} />
        </Fragment>
      )}
    </Item>
  )
})

type ISubMenuItemProps = {
  name: string
  icon?: ReactNode
  disabled?: boolean
}

interface MenuContentProps
  extends ContextMenuContentProps, DropdownMenuContentProps, MenubarPrimitive.MenubarContentProps {
  hidden?: boolean
}

const Content = forwardRef<HTMLDivElement, MenuContentProps>(function Content(props: MenuContentProps, ref) {
  const { Content: PrimitiveContent } = useResolveMenuAnatomy()
  const { size } = useContext(MenuContext)
  return <PrimitiveContent size={size} ref={ref} {...props} />
})

/* -------------------------------------------------------------------------- */
/*                                 SubMenuItem                                */
/* -------------------------------------------------------------------------- */

function SubMenuItem(props: PropsWithChildren<ISubMenuItemProps>) {
  const { name, icon, disabled, children } = props
  const { size } = useContext(MenuContext)
  const { SubMenuItem: SubItem, SubContent, Sub, Portal } = useResolveMenuAnatomy()

  return (
    <Sub>
      <SubItem size={size} disabled={disabled}>
        <StyledMenuItemContent>
          {icon}
          {name}
        </StyledMenuItemContent>
        <IconChevronRight size="12px" />
      </SubItem>
      <Portal>
        <SubContent>
          <ScrollArea type="always" subtle={false} asContainer>
            {children}
          </ScrollArea>
        </SubContent>
      </Portal>
    </Sub>
  )
}

interface GroupProps extends ContextMenuGroupProps {
  label?: string
  divider?: 'top' | 'both' | 'bottom' | boolean
}

function MenuGroup(props: GroupProps) {
  const { Group, MenuLabel } = useResolveMenuAnatomy()
  const { label, divider, children, ...rest } = props
  const dividerVal = typeof divider === 'boolean' && divider ? 'bottom' : divider
  const showTopDivider = dividerVal === 'top' || dividerVal === 'both'
  const showBottomDivider = dividerVal === 'bottom' || dividerVal === 'both'

  return (
    <React.Fragment>
      {showTopDivider && <MenuSeparator />}
      <Group {...rest}>
        {label && <MenuLabel data-menu-label>{label}</MenuLabel>}
        {children}
      </Group>
      {showBottomDivider && <MenuSeparator />}
    </React.Fragment>
  )
}

interface ICheckboxItemProps extends ContextMenuCheckboxItemProps, DropdownMenuCheckboxItemProps {
  name: string
  icon?: ReactNode
}

function MenuCheckboxItem(props: ICheckboxItemProps) {
  const { name, icon, ...rest } = props
  const { size } = useContext(MenuContext)
  const { CheckboxItem: StyledCheckboxItem, ItemIndicator } = useResolveMenuAnatomy()

  return (
    <StyledCheckboxItem {...rest} size={size}>
      <ItemIndicator>
        <IconCheck />
      </ItemIndicator>
      <StyledMenuItemContent>
        {icon}
        {name}
      </StyledMenuItemContent>
    </StyledCheckboxItem>
  )
}

interface RadioItemProps extends ContextMenuRadioItemProps {
  name: string
}

const DotIndicator = styled('div', {
  base: {
    height: '4px',
    width: '4px',
    borderRadius: '9999px',
    backgroundColor: 'currentColor',
  },
})

function RadioItem(props: RadioItemProps) {
  const { value, onSelect, name } = props
  const { RadioItem: StyledRadioItem, ItemIndicator } = useResolveMenuAnatomy()

  return (
    <StyledRadioItem value={value} onSelect={onSelect}>
      <ItemIndicator>
        <DotIndicator />
      </ItemIndicator>
      {name}
    </StyledRadioItem>
  )
}

interface RadioGroupProps extends ContextMenuRadioGroupProps {
  items: RadioItemProps[]
  label?: string
}

function MenuRadioGroup(props: RadioGroupProps) {
  const { items, label, ...rest } = props
  const { RadioGroup: RadioGroupPrimitive, MenuLabel } = useResolveMenuAnatomy()
  const { size } = useContext(MenuContext)

  return (
    <RadioGroupPrimitive {...rest} size={size}>
      {label && <MenuLabel data-menu-label>{label}</MenuLabel>}
      {items.map((item, index) => (
        <RadioItem key={index} {...item} />
      ))}
    </RadioGroupPrimitive>
  )
}

function MenuSeparator() {
  const { Separator: StyledSeparator } = useResolveMenuAnatomy()
  return <StyledSeparator />
}

type IDropdownMenuProps = Pick<DropdownMenuContentProps, PickedContentProps> &
  DropdownMenuProps & {
    trigger: React.ReactNode
    size?: MenuSize
    sideOffset?: number
    disabled?: boolean
    portal?: Element | boolean
  }

function DropdownMenu(props: PropsWithChildren<IDropdownMenuProps>) {
  const {
    children,
    portal = true,
    size = 'sm',
    side,
    sideOffset = 4,
    align = 'start',
    alignOffset,
    disabled = false,
    ...rest
  } = props

  let Portal: any = Fragment
  let container: Element

  if (portal) {
    Portal = DropdownMenuPrimitive.Portal
    if (typeof portal === 'object') {
      container = portal
    }
  }

  const portalProps = Portal === Fragment ? {} : { container }

  return (
    <MenuProvider type="dropdown" size={size}>
      <DropdownMenuPrimitive.Root modal={false} {...rest}>
        <DropdownMenuPrimitive.Trigger disabled={disabled} asChild>
          {props.trigger}
        </DropdownMenuPrimitive.Trigger>
        <Portal {...portalProps}>
          <Content side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset}>
            <ScrollArea type="always" subtle={false} asContainer>
              {children}
            </ScrollArea>
          </Content>
        </Portal>
      </DropdownMenuPrimitive.Root>
    </MenuProvider>
  )
}

type IContextMenuProps = ContextMenuProps & {
  trigger: React.ReactNode
  size?: MenuSize
  asChild?: boolean
  onPointerDownOutside?: (e: any) => void
  hidden?: boolean
  portal?: Element | boolean
  disabled?: boolean
}

function ContextMenu(props: IContextMenuProps) {
  const {
    trigger,
    size = 'sm',
    children,
    onOpenChange,
    onPointerDownOutside,
    portal = true,
    asChild,
    disabled = false,
    hidden,
  } = props

  let Portal: any = Fragment
  let container: Element

  if (portal) {
    Portal = ContextMenuPrimitive.Portal
    if (typeof portal === 'object') {
      container = portal
    }
  }

  return (
    <MenuProvider type="context" size={size}>
      <ContextMenuPrimitive.Root onOpenChange={onOpenChange}>
        <ContextMenuPrimitive.Trigger disabled={disabled} asChild={asChild}>
          {trigger}
        </ContextMenuPrimitive.Trigger>
        <Portal container={container}>
          <Content hidden={hidden} onPointerDownOutside={onPointerDownOutside}>
            <ScrollArea type="always" subtle={false} asContainer>
              {children}
            </ScrollArea>
          </Content>
        </Portal>
      </ContextMenuPrimitive.Root>
    </MenuProvider>
  )
}

const StyledMenubarTrigger = styled(MenubarPrimitive.Trigger, {
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
})

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>((props, ref) => <StyledMenubarTrigger ref={ref} {...props} />)
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

interface MenubarItemProps {
  name: string
  children?: ReactNode
}

function MenubarItem(props: MenubarItemProps) {
  const { name } = props
  return (
    <MenubarPrimitive.Menu>
      <MenubarTrigger>{name}</MenubarTrigger>
      <MenubarPrimitive.Portal>
        <Content align="start" alignOffset={-4} sideOffset={4}>
          {props.children}
        </Content>
      </MenubarPrimitive.Portal>
    </MenubarPrimitive.Menu>
  )
}

const StyledMenubarRoot = styled(MenubarPrimitive.Root, {
  base: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    padding: '0 8px',
    flexWrap: 'nowrap',
  },
})

function Menubar(props: PropsWithChildren<{ size?: MenuSize }>) {
  const { size = 'sm' } = props
  return (
    <MenuProvider type="menubar" size={size}>
      <StyledMenubarRoot>{props.children}</StyledMenubarRoot>
    </MenuProvider>
  )
}

export {
  Menubar,
  MenubarItem,
  DropdownMenu,
  ContextMenu,
  MenuItem,
  SubMenuItem,
  MenuSeparator,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuGroup,
}

import type {
  SelectGroupProps as PrimitiveSelectGroupProps,
  SelectProps as PrimitiveSelectProps,
  SelectContentProps,
} from '@radix-ui/react-select'
import * as SelectPrimitive from '@radix-ui/react-select'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { IconCheck, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import React, { forwardRef } from 'react'

import { styled } from '../../styled-system/jsx'
import { css } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'
import { IconRightBottomCorner } from '../Icons'
import { Flex } from '../Flex'

const SelectTrigger = styled(SelectPrimitive.SelectTrigger, {
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
      xs: {
        height: '20px',
        borderRadius: '4px',
        padding: '0 20px 0 6px',
        fontSize: '12px',
      },
      sm: {
        height: '24px',
        borderRadius: '4px',
        padding: '0 20px 0 8px',
        fontSize: '12px',
      },
      md: {
        height: '32px',
        borderRadius: '6px',
        padding: '0 24px 0 12px',
        fontSize: '14px',
      },
    },
    variant: {
      outline: {
        backgroundColor: 'var(--colors-surface)',
        borderColor: 'var(--colors-border)',
        '&:hover': {
          backgroundColor: 'var(--colors-surfaceSubtle)',
          borderColor: 'var(--colors-borderStrong)',
        },
      },
      soft: {
        backgroundColor: 'var(--colors-softBg)',
        borderColor: 'transparent',
        '&:hover': {
          backgroundColor: 'var(--colors-softBgHover)',
          borderColor: 'transparent',
        },
      },
      subtle: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        '&:hover': {
          backgroundColor: 'var(--colors-surfaceSubtle)',
          borderColor: 'transparent',
        },
      },
    },
  },
  defaultVariants: {
    size: 'sm',
    variant: 'soft',
  },
})

const SelectIcon = styled(SelectPrimitive.SelectIcon, {
  base: {
    position: 'absolute',
    height: '100%',
    display: 'inline-flex',
    color: 'CurrentColor',
    alignItems: 'center',
    right: 4,
    lineHeight: 1,
    '& > svg': {
      height: '12px',
      width: '12px',
    },
  },
  variants: {
    size: {
      xs: {
        '& > svg': {
          height: '12px',
          width: '12px',
        },
      },
      sm: {
        '& > svg': {
          height: '14px',
          width: '14px',
        },
      },
      md: {
        '& > svg': {
          height: '16px',
          width: '16px',
        },
      },
    },
  },
})

const StyledTriggerContent = styled('div', {
  base: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    height: '100%',
    alignItems: 'center',
    gap: '4px',
  },
})

const SelectValue = styled(SelectPrimitive.Value, {
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
})

const cornerIconClass = css({
  position: 'absolute',
  width: '4px !important',
  height: '4px !important',
  color: 'currentColor',
  bottom: 1,
  right: 1,
})

const SelectContent = styled(SelectPrimitive.Content, {
  base: {
    overflow: 'auto',
    maxHeight: 'min(300px, var(--radix-select-content-available-height))',
    backgroundColor: 'var(--colors-surfaceOverlay)',
    minWidth: 'var(--radix-select-trigger-width)',
    borderRadius: '6px',
    boxShadow: 'var(--shadows-popContainer)',
    border: '1px solid var(--colors-border)',
  },
})

const SelectViewport = styled(SelectPrimitive.Viewport, {
  base: {
    padding: '4px',
    maxHeight: '300px',
    overflowY: 'auto',
    '@media (prefers-reduced-motion: no-preference)': {
      scrollBehavior: 'smooth',
    },
  },
})

const StyledItem = styled(SelectPrimitive.Item, {
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
})

const SelectLabel = styled(SelectPrimitive.Label, {
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
})

const StyledItemIndicator = styled(SelectPrimitive.ItemIndicator, {
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
})

const SelectScrollUpButton = styled(SelectPrimitive.ScrollUpButton, {
  base: {
    display: 'flex',
    height: '16px',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    color: 'var(--colors-textMuted)',
    cursor: 'default',
  },
})

const SelectScrollDownButton = styled(SelectPrimitive.ScrollDownButton, {
  base: {
    display: 'flex',
    height: '16px',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    color: 'var(--colors-textMuted)',
    cursor: 'default',
  },
})

type SelectContextProps = {
  size: 'xs' | 'sm' | 'md'
  valueType: 'string' | 'number'
  valueRenderer?: (value: string | number, location?: 'item' | 'trigger') => React.ReactNode
}

const SelectContext = React.createContext<SelectContextProps>({
  size: 'sm',
  valueType: 'string',
  valueRenderer: undefined,
})

const StyledSelectItemContent = styled('span', {
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

const StyledSelectSlot = styled(Flex, {
  base: {
    flexShrink: 0,
    userSelect: 'none',
    color: 'var(--colors-textMuted)',
  },
  variants: {
    size: {
      xs: {
        paddingRight: '4px',
        fontSize: '12px',
      },
      sm: {
        paddingRight: '4px',
        fontSize: '12px',
      },
      md: {
        paddingRight: '8px',
        fontSize: '14px',
      },
    },
  },
})

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: any
  children?: React.ReactNode
  icon?: React.ReactNode
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(function SelectItem(
  { children, value, icon, ...props },
  forwardedRef
) {
  const { size, valueType, valueRenderer } = React.useContext(SelectContext)

  const renderedValue = valueRenderer ? valueRenderer(value, 'item') : children

  return (
    <StyledItem {...props} value={valueType === 'number' ? String(value) : value} ref={forwardedRef} size={size}>
      <StyledItemIndicator>
        <IconCheck />
      </StyledItemIndicator>
      <StyledSelectItemContent>
        {icon}
        <SelectPrimitive.ItemText>{renderedValue ?? children}</SelectPrimitive.ItemText>
      </StyledSelectItemContent>
    </StyledItem>
  )
})

interface SelectGroupProps extends PrimitiveSelectGroupProps {
  label: string
  children: React.ReactNode
  divider?: boolean
  dividerPosition?: 'top' | 'bottom'
}

function SelectGroup(props: SelectGroupProps) {
  const { label, children, ...rest } = props

  return (
    <React.Fragment>
      <SelectPrimitive.Group {...rest}>
        {label && <SelectLabel>{label}</SelectLabel>}
        {children}
      </SelectPrimitive.Group>
    </React.Fragment>
  )
}

export interface SelectProps extends Omit<PrimitiveSelectProps, 'value' | 'defaultValue'> {
  placeholder?: string
  position?: SelectContentProps['position']
  size?: 'xs' | 'sm' | 'md'
  variant?: 'outline' | 'soft' | 'subtle'
  width?: 'initial'
  valueType?: 'string' | 'number'
  value?: string | number
  valueRenderer?: (value: string | number, location?: 'item' | 'trigger') => React.ReactNode
  defaultValue?: string | number
  onValueChange?: (value: any) => void
  id?: string
  sideOffset?: number
  children?: React.ReactNode
  arrow?: boolean
  cornerArrow?: boolean
  triggerCss?: SystemStyleObject
  startSlot?: React.ReactNode
}

function Select(props: SelectProps) {
  const {
    placeholder,
    value: propValue,
    defaultValue: propDefaultValue,
    valueType: propValueType,
    position = 'popper',
    valueRenderer,
    size = 'sm',
    variant = 'soft',
    arrow = true,
    cornerArrow = false,
    width,
    id,
    sideOffset = 4,
    triggerCss,
    startSlot,
    ...rest
  } = props

  let valueType = 'string'
  if (propValueType) {
    valueType = propValueType
  } else {
    if (typeof propValue === 'number') {
      valueType = 'number'
    } else if (typeof propValue === 'string') {
      valueType = 'string'
    } else if (typeof propDefaultValue === 'number') {
      valueType = 'number'
    } else if (typeof propDefaultValue === 'string') {
      valueType = 'string'
    }
  }

  const [value, setValue] = useControllableState<string>({
    prop: propValue !== undefined && propValue !== null ? String(propValue) : undefined,
    defaultProp: propDefaultValue !== undefined && propDefaultValue !== null ? String(propDefaultValue) : undefined,
    onChange: (val) => {
      if (props.onValueChange) {
        if (valueType === 'number') {
          return props.onValueChange(Number(val))
        }
        props.onValueChange(val)
      }
    },
  })

  const triggerValue =
    valueType === 'number' && value !== undefined && value !== ''
      ? Number(value)
      : (value as string | number | undefined)
  const renderedValue =
    valueRenderer && triggerValue !== undefined ? valueRenderer(triggerValue as string | number, 'trigger') : undefined

  return (
    <SelectContext.Provider value={{ size, valueType: valueType as unknown as 'string' | 'number', valueRenderer }}>
      <SelectPrimitive.Root {...rest} value={value} onValueChange={setValue}>
        <SelectTrigger size={size} variant={variant} id={id} css={triggerCss}>
          <StyledTriggerContent>
            {!!startSlot && (
              <StyledSelectSlot align="both" size={size}>
                {startSlot}
              </StyledSelectSlot>
            )}
            <SelectValue placeholder={placeholder}>{renderedValue}</SelectValue>
          </StyledTriggerContent>
          {arrow && (
            <SelectIcon size={size}>
              {cornerArrow ? <IconRightBottomCorner className={cornerIconClass} /> : <IconChevronDown />}
            </SelectIcon>
          )}
        </SelectTrigger>
        <SelectPrimitive.Portal>
          <SelectContent position={position} sideOffset={sideOffset} collisionPadding={4}>
            <SelectScrollUpButton>
              <IconChevronUp size="14px" />
            </SelectScrollUpButton>
            <SelectViewport>{props.children}</SelectViewport>
            <SelectScrollDownButton>
              <IconChevronDown size="14px" />
            </SelectScrollDownButton>
          </SelectContent>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </SelectContext.Provider>
  )
}

export { Select, SelectGroup, SelectItem, SelectLabel }

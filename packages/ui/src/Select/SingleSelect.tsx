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
import {
  selectContentConfig,
  selectIconConfig,
  selectIndicatorConfig,
  selectItemConfig,
  selectLabelConfig,
  selectScrollButtonConfig,
  selectSlotConfig,
  selectTriggerConfig,
  selectValueConfig,
  selectViewportConfig,
  selectItemContentConfig,
  selectItemContentConfig as itemContentConfig,
  triggerContentConfig,
} from './selectStyles'
import { IconRightBottomCorner } from '../Icons'
import { Flex } from '../Flex'

const SelectTrigger = styled(SelectPrimitive.SelectTrigger, selectTriggerConfig)

const SelectIcon = styled(SelectPrimitive.SelectIcon, selectIconConfig)

const StyledTriggerContent = styled('div', triggerContentConfig)

const SelectValue = styled(SelectPrimitive.Value, selectValueConfig)

const cornerIconClass = css({
  position: 'absolute',
  width: '4px !important',
  height: '4px !important',
  color: 'currentColor',
  bottom: 1,
  right: 1,
})

const SelectContent = styled(SelectPrimitive.Content, selectContentConfig)

const SelectViewport = styled(SelectPrimitive.Viewport, selectViewportConfig)

const StyledItem = styled(SelectPrimitive.Item, selectItemConfig)

const SelectLabel = styled(SelectPrimitive.Label, selectLabelConfig)

const StyledItemIndicator = styled(SelectPrimitive.ItemIndicator, selectIndicatorConfig)

const SelectScrollUpButton = styled(SelectPrimitive.ScrollUpButton, selectScrollButtonConfig)

const SelectScrollDownButton = styled(SelectPrimitive.ScrollDownButton, selectScrollButtonConfig)

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

const StyledSelectItemContent = styled('span', selectItemContentConfig)

const StyledSelectSlot = styled(Flex, selectSlotConfig)

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

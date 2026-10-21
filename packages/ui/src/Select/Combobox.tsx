import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { IconCheck, IconChevronDown, IconSearch, IconX } from '@tabler/icons-react'
import React, { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Badge } from '../Badge'
import { Checkbox } from '../Checkbox'
import { styled } from '../../styled-system/jsx'
import { Flex } from '../Flex'
import { Popover, PopoverCloseTrigger } from '../Popover'
import { Text } from '../Typography'

const SELECT_ALL_VALUE = '$$SELECT_ALL$$'

const StyledComboboxTrigger = styled('button', {
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
      xs: {
        height: '20px',
        borderRadius: '4px',
        padding: '0 20px 0 6px',
      },
      sm: {
        height: '24px',
        borderRadius: '4px',
        padding: '0 20px 0 2px',
      },
      md: {
        height: '32px',
        borderRadius: '6px',
        padding: '0 24px 0 12px',
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

const StyledChevronDown = styled(IconChevronDown, {
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
      xs: {
        height: '12px',
        width: '12px',
      },
      sm: {
        height: '14px',
        width: '14px',
      },
      md: {
        height: '16px',
        width: '16px',
      },
    },
  },
})

const SearchIcon = styled(IconSearch, {
  base: {
    height: '14px',
    width: '14px',
    color: 'var(--colors-textMuted)',
    strokeWidth: 1.5,
    flexShrink: 0,
  },
})

const StyledPlaceholder = styled('span', {
  base: {
    all: 'unset',
    fontSize: '12px',
    color: 'var(--colors-textMuted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})

const StyledComboboxContent = styled(Flex, {
  base: {
    padding: '4px',
    minHeight: '60px',
    maxHeight: '300px',
    overflowY: 'auto',
    position: 'relative',
    flex: 1,
    flexWrap: 'nowrap !important',
    backgroundColor: 'var(--colors-surfaceOverlay)',
    '&[data-state="open"]': {
      animation: 'none',
    },
    '&::-webkit-scrollbar': {
      width: '2px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'var(--colors-scrollbarThumb)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: 'var(--colors-scrollbarTrackHover)',
    },
  },
})

const StyledComboboxSearchInput = styled('input', {
  base: {
    all: 'unset',
    width: '100%',
    padding: '4px',
    fontSize: '12px',
    color: 'var(--colors-text)',
    boxSizing: 'border-box',
    '&::placeholder': {
      color: 'var(--colors-textMuted)',
    },
  },
})

const StyledComboBoxItem = styled('button', {
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
      backgroundColor: 'transparent',
      color: 'var(--colors-text)',
    },
    width: '100%',
    flexShrink: 0,
    '&:hover': {
      color: 'var(--colors-textStrong)',
      backgroundColor: 'var(--colors-surfaceSubtle)',
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
    focused: {
      true: {},
    },
    selected: {
      true: {
        backgroundColor: 'var(--colors-selectionBg)',
        color: 'var(--colors-selectionText)',
        borderRadius: 0,
        '&:focus': {
          backgroundColor: 'var(--colors-selectionBg)',
          color: 'var(--colors-selectionText)',
        },
        '&:hover': {
          backgroundColor: 'var(--colors-selectionBgHover)',
          color: 'var(--colors-selectionText)',
        },
      },
    },
    selectedStart: {
      true: {
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
      },
    },
    selectedEnd: {
      true: {
        borderBottomLeftRadius: '4px',
        borderBottomRightRadius: '4px',
      },
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

const StyledComboboxHeader = styled(Flex, {
  base: {
    borderBottom: '1px solid var(--colors-border)',
    padding: '4px 8px',
    flexShrink: 0,
    gap: '8px',
  },
})

const StyledSelectAllWrapper = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 0',
    cursor: 'pointer',
  },
})

const SelectAllText = styled('span', {
  base: {
    fontSize: '12px',
    color: 'var(--colors-text)',
    cursor: 'pointer',
    userSelect: 'none',
  },
})

const StyledComboboxSlot = styled('div', {
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
      xs: {
        paddingRight: '4px',
        fontSize: '12px',
      },
      sm: {
        paddingRight: '6px',
        fontSize: '12px',
      },
      md: {
        paddingRight: '8px',
        fontSize: '14px',
      },
    },
  },
})

const StyledComboboxTriggerContent = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    height: '100%',
    gap: '4px',
  },
})

const StyledComboboxValueNode = styled(Flex, {
  base: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    '& > *': {
      minWidth: 0,
    },
  },
})

interface ComboboxContextProps {
  autoClose: boolean
  placeholder?: string
  valueRenderer?: (value: string, location?: 'item' | 'trigger') => React.ReactNode

  value: string[]
  selectValue?: (val: string) => void

  open: boolean
  setOpen: (open: boolean) => void

  focusedIndex?: number
  setFocusedIndex?: (val: number) => void

  close?: () => void

  searchValue?: string
  setSearchValue?: (val: string) => void

  valueNode: any
  onValueNodeChange: (valueNode: any) => void
  maxDisplayCount?: number
  maxDisplayText?: string
  noneText?: string
  options: string[]
}

const ComboboxContext = createContext<ComboboxContextProps>({
  autoClose: true,
  value: [],
  open: false,
  setOpen: () => {},

  valueNode: null,
  onValueNodeChange: () => {},
  maxDisplayCount: 0,
  maxDisplayText: '{count} items selected',
  noneText: '',
  options: [],
})

export interface ComboboxTriggerProps {
  placeholder?: string
  children?: React.ReactNode
  valueRenderer?: (value: string) => React.ReactNode
  startSlot?: React.ReactNode
  size?: 'xs' | 'sm' | 'md'
  variant?: 'outline' | 'soft' | 'subtle'
}

export const ComboboxTrigger = forwardRef<HTMLButtonElement, ComboboxTriggerProps>(
  function ComboboxTrigger(props, forwardedRef) {
    const { value, onValueNodeChange, placeholder, maxDisplayCount, maxDisplayText, noneText } =
      useContext(ComboboxContext)
    const { valueRenderer, startSlot, size, variant, ...rest } = props

    const valueArray = Array.isArray(value) ? value : value ? [value] : []

    const shouldShowSummary = maxDisplayCount > 0 && valueArray.length > maxDisplayCount
    const shouldShowNoneText = valueArray.length === 0 && noneText

    const summaryText = maxDisplayText.replace('{count}', valueArray.length.toString())

    return (
      <StyledComboboxTrigger {...rest} ref={forwardedRef} size={size} variant={variant}>
        <StyledComboboxTriggerContent>
          {startSlot && <StyledComboboxSlot size={size}>{startSlot}</StyledComboboxSlot>}
          <StyledComboboxValueNode spacing="xxs" wrap={false} ref={onValueNodeChange}>
            {shouldShowSummary && (
              <Text size="sm" css={{ padding: '0 6px' }}>
                {summaryText}
              </Text>
            )}
            {shouldShowNoneText && (
              <Text size="sm" css={{ padding: '0 6px' }}>
                {noneText}
              </Text>
            )}
            {valueArray.length === 0 && !noneText && <StyledPlaceholder>{placeholder}</StyledPlaceholder>}
          </StyledComboboxValueNode>
        </StyledComboboxTriggerContent>
        <StyledChevronDown size={size} />
      </StyledComboboxTrigger>
    )
  }
)

export interface ComboboxSearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void
}

function ComboboxSearchInput(props: ComboboxSearchInputProps) {
  const { close, searchValue, setSearchValue, selectValue, focusedIndex, setFocusedIndex } = useContext(ComboboxContext)
  const { onSearch, ...rest } = props

  const handleOnChange = (e) => {
    if (setSearchValue) {
      setSearchValue(e.target.value as string)
    }
    if (onSearch) {
      onSearch(e.target.value)
    }
  }

  return (
    <Flex wrap={false} align="v" style={{ flex: 1 }}>
      <SearchIcon />
      <StyledComboboxSearchInput {...rest} value={searchValue} onChange={handleOnChange} />
      <IconX size="12px" />
    </Flex>
  )
}

export interface ComboboxItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string
  label?: string
  textValue?: string
  index?: number
  disabled?: boolean
  children: React.ReactNode
}

export function ComboboxItem(props: ComboboxItemProps) {
  const { value, children, index, ...rest } = props
  const {
    value: selectedValue,
    maxDisplayCount,
    focusedIndex,
    selectValue,
    close,
    setFocusedIndex,
    valueRenderer,
    valueNode,
    searchValue,
    autoClose,
    options,
  } = useContext(ComboboxContext)
  const selectedValueArray = Array.isArray(selectedValue) ? selectedValue : selectedValue ? [selectedValue] : []
  const isSelected = selectedValue.indexOf(value) !== -1
  const ivVisible = searchValue ? value.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1 : true
  const optionIndex = options.indexOf(value)
  const prevValue = optionIndex > 0 ? options[optionIndex - 1] : undefined
  const nextValue = optionIndex >= 0 && optionIndex < options.length - 1 ? options[optionIndex + 1] : undefined
  const hasPrevSelected = !!prevValue && selectedValueArray.includes(prevValue)
  const hasNextSelected = !!nextValue && selectedValueArray.includes(nextValue)

  const preventDefault = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleRemove = () => {
    if (selectValue) {
      selectValue(value)
    }
  }

  function handleSelect(e) {
    e.preventDefault()
    e.stopPropagation()
    selectValue && selectValue(value)
    e.currentTarget.blur()
    autoClose && close && close()
  }

  const shouldCreateBadge =
    isSelected && valueNode && (maxDisplayCount === 0 || selectedValueArray.length <= maxDisplayCount)

  return (
    <>
      {ivVisible && (
        <StyledComboBoxItem
          role="option"
          tabIndex={-1}
          {...rest}
          selected={isSelected}
          selectedStart={isSelected && !hasPrevSelected}
          selectedEnd={isSelected && !hasNextSelected}
          onPointerUp={handleSelect}
          focused={focusedIndex === index}>
          {valueRenderer ? valueRenderer(value) : children}
          {isSelected && <IconCheck size="12px" />}
        </StyledComboBoxItem>
      )}
      {shouldCreateBadge
        ? createPortal(
            <Badge onClick={preventDefault} closable onClose={handleRemove}>
              {valueRenderer ? valueRenderer(value, 'trigger') : children}
            </Badge>,
            valueNode
          )
        : null}
    </>
  )
}

export interface ComboboxProps {
  /**
   * indicates if the select is multiple
   */
  multiple?: boolean
  /**
   * The placeholder for the combobox
   */
  placeholder?: string
  /**
   * If true, the combobox will display a search input
   *
   * @default true
   */
  searchable?: boolean

  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void

  children?: React.ReactNode

  onSearch?: (value: string) => void

  valueRenderer?: (value: string) => React.ReactNode

  /**
   * If true, the popover will close when an item is selected
   *
   * @default true
   */
  autoClose?: boolean

  /**
   * Maximum number of selected items to display in the trigger.
   * If more items are selected, a summary badge will be shown instead.
   * Set to 0 or null to always show all selected items.
   *
   * @default 0
   */
  maxDisplayCount?: number

  /**
   * Text to display when more items are selected than maxDisplayCount
   * Use {count} as a placeholder for the number of selected items
   *
   * @default "{count} items selected"
   */
  maxDisplayText?: string

  /**
   * Text to display when no items are selected
   * @default ""
   */
  noneText?: string

  /**
   * Text to display for the select all option
   * @default "Select All"
   */
  selectAllText?: string

  /**
   * If true, the select all option will be shown
   * @default false
   */
  showSelectAll?: boolean

  /**
   * Content to display at the start of the trigger
   */
  startSlot?: React.ReactNode
  size?: 'xs' | 'sm' | 'md'
  variant?: 'outline' | 'soft' | 'subtle'
}

export function Combobox(props: ComboboxProps) {
  const {
    searchable = false,
    multiple = false,
    autoClose = multiple ? false : true,
    children,
    onSearch,
    valueRenderer,
    placeholder,
    maxDisplayCount = 0,
    maxDisplayText = '{count} items selected',
    noneText = '',
    size,
    variant = 'soft',
    showSelectAll = false,
    selectAllText = 'Select All',
  } = props
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [valueNode, setValueNode] = React.useState(null)
  const [focusedIndex, setFocusedIndex] = React.useState(-1)
  const [searchValue, setSearchValue] = React.useState('')

  const [value, setValue] = useControllableState({
    prop: props.value,
    defaultProp: props.defaultValue ?? [],
    onChange: props.onValueChange,
  })

  // Get all available options from children
  const options = React.useMemo(() => {
    const options: string[] = []
    React.Children.forEach(children, (child) => {
      if (React.isValidElement<{ value?: string }>(child) && child.props.value) {
        options.push(child.props.value)
      }
    })
    return options
  }, [children])

  const selectValue = (val) => {
    if (!value) return
    if (val === SELECT_ALL_VALUE) {
      // If all options are selected, unselect all
      if (value.length === options.length) {
        setValue([])
      } else {
        // Otherwise select all options
        setValue([...options])
      }
    } else {
      if (value.includes(val)) {
        setValue(value.filter((v) => v !== val))
      } else {
        setValue([...value, val])
      }
    }
  }

  function close() {
    closeRef.current && closeRef.current.click()
  }

  useEffect(() => {
    if (contentRef.current) {
      const content = contentRef.current
      if (content.scrollHeight > content.clientHeight) {
        content.style.overflowY = 'auto'
      }
    }
  }, [children])

  return (
    <ComboboxContext.Provider
      value={{
        value: value!,
        selectValue,
        valueRenderer,

        focusedIndex,
        setFocusedIndex,

        searchValue,
        setSearchValue,

        open,
        setOpen,
        close,

        valueNode,
        onValueNodeChange: setValueNode,
        autoClose,
        placeholder,
        maxDisplayCount,
        maxDisplayText,
        noneText,
        options,
      }}>
      <Popover
        compact
        sideOffset={4}
        forceRender
        constrainSize
        css={{
          maxHeight: 'var(--radix-popover-content-available-height)',
          display: 'flex',
          flexDirection: 'column',
        }}
        trigger={
          <ComboboxTrigger placeholder={placeholder} startSlot={props.startSlot} size={size} variant={variant} />
        }
        onOpenChange={setOpen}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            maxHeight: 'inherit',
          }}>
          <div style={{ flexShrink: 0 }}>
            {searchable ||
              (options.length > 0 && showSelectAll && (
                <StyledComboboxHeader wrap={false} align="v">
                  {searchable && <ComboboxSearchInput onSearch={onSearch} />}
                  {options.length > 0 && showSelectAll && (
                    <StyledSelectAllWrapper
                      onClick={() => {
                        selectValue(SELECT_ALL_VALUE)
                      }}>
                      <Checkbox
                        checked={value.length === options.length}
                        onCheckedChange={() => {
                          selectValue(SELECT_ALL_VALUE)
                        }}
                      />
                      <SelectAllText>{selectAllText}</SelectAllText>
                    </StyledSelectAllWrapper>
                  )}
                </StyledComboboxHeader>
              ))}
          </div>
          <StyledComboboxContent ref={contentRef} orientation="column" role="listbox">
            {children}
          </StyledComboboxContent>
        </div>
        <PopoverCloseTrigger ref={closeRef} style={{ display: 'none' }} />
      </Popover>
    </ComboboxContext.Provider>
  )
}

import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { IconCheck, IconChevronDown, IconSearch } from '@tabler/icons-react'
import React, { createContext, forwardRef, useContext, useEffect, useRef, useState } from 'react'
import { Tag } from '@pivot-ui/react'

import { Checkbox } from '../Checkbox'
import { styled } from '../../styled-system/jsx'
import { Flex } from '../Flex'
import { Popover } from '../Popover'
import { Text } from '../Typography'

const SELECT_ALL_VALUE = '$$SELECT_ALL$$'

const StyledComboboxControl = styled('div', {
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
    '&[data-disabled]': { opacity: 0.5, cursor: 'not-allowed' },
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

const StyledComboboxTrigger = styled('button', {
  base: {
    all: 'unset',
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    borderRadius: 'inherit',
    cursor: 'pointer',
    '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '1px' },
    '&:disabled': { cursor: 'not-allowed' },
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
    '&:focus-visible': {
      outline: '2px solid var(--colors-focusRing)',
      outlineOffset: '-2px',
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

const SelectAllText = styled('label', {
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
    position: 'relative',
    pointerEvents: 'none',
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
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    '& button': { pointerEvents: 'auto' },
    '& > *': {
      minWidth: 0,
      flexShrink: 0,
    },
  },
})

interface ComboboxContextProps {
  autoClose: boolean
  disabled: boolean
  placeholder?: string
  valueRenderer?: (value: string, location?: 'item' | 'trigger') => React.ReactNode

  value: string[]
  selectValue?: (val: string) => void

  open: boolean
  setOpen: (open: boolean) => void

  focusedIndex?: number
  setFocusedIndex?: (val: number) => void

  close?: () => void
  focusTrigger: () => void

  searchValue?: string
  setSearchValue?: (val: string) => void

  maxDisplayCount?: number
  maxDisplayText?: string
  noneText?: string
  options: string[]
}

const ComboboxContext = createContext<ComboboxContextProps>({
  autoClose: true,
  disabled: false,
  focusTrigger: () => {},
  value: [],
  open: false,
  setOpen: () => {},

  maxDisplayCount: 0,
  maxDisplayText: '{count} items selected',
  noneText: '',
  options: [],
})

export interface ComboboxTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string
  children?: React.ReactNode
  valueRenderer?: (value: string) => React.ReactNode
  startSlot?: React.ReactNode
  size?: 'xs' | 'sm' | 'md'
  variant?: 'outline' | 'soft' | 'subtle'
}

export const ComboboxTrigger = forwardRef<HTMLButtonElement, ComboboxTriggerProps>(
  function ComboboxTrigger(props, forwardedRef) {
    const { value, placeholder, maxDisplayCount, maxDisplayText, noneText } = useContext(ComboboxContext)
    const { valueRenderer, children, startSlot, size, variant, disabled, ...rest } = props
    const valueDescriptionId = React.useId()

    const valueArray = Array.isArray(value) ? value : value ? [value] : []

    const shouldShowSummary = maxDisplayCount > 0 && valueArray.length > maxDisplayCount
    const shouldShowNoneText = valueArray.length === 0 && noneText

    const summaryText = maxDisplayText.replace('{count}', valueArray.length.toString())

    return (
      <StyledComboboxControl size={size} variant={variant} data-disabled={disabled ? '' : undefined}>
        <StyledComboboxTrigger
          type="button"
          aria-label={placeholder || 'Select options'}
          {...rest}
          aria-describedby={[rest['aria-describedby'], valueDescriptionId].filter(Boolean).join(' ')}
          disabled={disabled}
          ref={forwardedRef}>
          <StyledChevronDown aria-hidden="true" size={size} />
        </StyledComboboxTrigger>
        <StyledComboboxTriggerContent>
          {startSlot && <StyledComboboxSlot size={size}>{startSlot}</StyledComboboxSlot>}
          <StyledComboboxValueNode id={valueDescriptionId} spacing="xxs" wrap={false}>
            {children}
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
      </StyledComboboxControl>
    )
  }
)

export interface ComboboxSearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void
  inputRef?: React.Ref<HTMLInputElement>
}

function ComboboxSearchInput(props: ComboboxSearchInputProps) {
  const { searchValue, setSearchValue } = useContext(ComboboxContext)
  const { onSearch, inputRef, ...rest } = props

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
      <StyledComboboxSearchInput
        aria-label="Search options"
        type="search"
        {...rest}
        ref={inputRef}
        value={searchValue}
        onChange={handleOnChange}
      />
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

function collectComboboxItems(children: React.ReactNode): React.ReactElement<ComboboxItemProps>[] {
  const items: React.ReactElement<ComboboxItemProps>[] = []
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<ComboboxItemProps>(child)) return
    if (child.type === React.Fragment) items.push(...collectComboboxItems(child.props.children))
    else if (typeof child.props.value === 'string') items.push(child)
  })
  return items
}

// Selected labels belong to the trigger, outside the hidden dropdown lifecycle.
// Keeping them here also avoids coupling value display to option mount effects.
function ComboboxSelectedValue({ option }: { option: ComboboxItemProps }) {
  const { value, valueRenderer, maxDisplayCount, disabled, selectValue, focusTrigger } = useContext(ComboboxContext)
  if (!value.includes(option.value) || (maxDisplayCount > 0 && value.length > maxDisplayCount)) return null
  const isDisabled = disabled || option.disabled
  const text =
    option.textValue ?? option.label ?? (typeof option.children === 'string' ? option.children : option.value)
  return (
    <Tag
      disabled={isDisabled}
      removeLabel={`Remove ${text}`}
      onRemove={() => {
        if (isDisabled) return
        selectValue?.(option.value)
        focusTrigger()
      }}>
      {valueRenderer ? valueRenderer(option.value, 'trigger') : option.children}
    </Tag>
  )
}

export function ComboboxItem(props: ComboboxItemProps) {
  const { value, children, index, label, textValue, disabled, onClick, onFocus, ...rest } = props
  const {
    value: selectedValue,
    focusedIndex,
    selectValue,
    close,
    setFocusedIndex,
    valueRenderer,
    searchValue,
    autoClose,
    options,
    disabled: controlDisabled,
  } = useContext(ComboboxContext)
  const isDisabled = disabled || controlDisabled
  const selectedValueArray = Array.isArray(selectedValue) ? selectedValue : selectedValue ? [selectedValue] : []
  const isSelected = selectedValue.indexOf(value) !== -1
  const searchableText = textValue ?? label ?? (typeof children === 'string' ? children : value)
  const isVisible = !searchValue || searchableText.toLowerCase().includes(searchValue.toLowerCase())
  const optionIndex = options.indexOf(value)
  const prevValue = optionIndex > 0 ? options[optionIndex - 1] : undefined
  const nextValue = optionIndex >= 0 && optionIndex < options.length - 1 ? options[optionIndex + 1] : undefined
  const hasPrevSelected = !!prevValue && selectedValueArray.includes(prevValue)
  const hasNextSelected = !!nextValue && selectedValueArray.includes(nextValue)

  function handleSelect(e) {
    onClick?.(e)
    if (isDisabled || e.defaultPrevented) return
    e.preventDefault()
    e.stopPropagation()
    selectValue && selectValue(value)
    autoClose && close && close()
  }

  return (
    <>
      {isVisible && (
        <StyledComboBoxItem
          type="button"
          role="option"
          {...rest}
          disabled={isDisabled}
          data-disabled={isDisabled ? '' : undefined}
          data-option-index={optionIndex}
          data-text-value={searchableText}
          aria-selected={isSelected}
          aria-disabled={isDisabled || undefined}
          tabIndex={!isDisabled && focusedIndex === optionIndex ? 0 : -1}
          selected={isSelected}
          selectedStart={isSelected && !hasPrevSelected}
          selectedEnd={isSelected && !hasNextSelected}
          onClick={handleSelect}
          onFocus={(event) => {
            setFocusedIndex?.(optionIndex)
            onFocus?.(event)
          }}
          focused={focusedIndex === optionIndex}>
          {valueRenderer ? valueRenderer(value) : children}
          {isSelected && <IconCheck size="12px" />}
        </StyledComboBoxItem>
      )}
    </>
  )
}

export interface ComboboxProps {
  disabled?: boolean
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
    disabled = false,
  } = props
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const openingFocusRef = useRef<'first' | 'last' | undefined>(undefined)
  const typeaheadRef = useRef({ text: '', time: 0 })
  const selectAllId = React.useId()
  const [focusedIndex, setFocusedIndex] = React.useState(-1)
  const [searchValue, setSearchValue] = React.useState('')

  const [value, setValue] = useControllableState({
    prop: props.value,
    defaultProp: props.defaultValue ?? [],
    onChange: props.onValueChange,
  })

  // Fragments are transparent for value labels, keyboard indices and select-all alike.
  const optionElements = React.useMemo(() => collectComboboxItems(children), [children])
  const options = React.useMemo(() => optionElements.map((item) => item.props.value), [optionElements])
  const enabledOptions = React.useMemo(
    () => optionElements.filter((item) => !item.props.disabled).map((item) => item.props.value),
    [optionElements]
  )
  const allSelected = enabledOptions.length > 0 && enabledOptions.every((option) => value.includes(option))

  const selectValue = (val) => {
    if (!value || disabled) return
    if (val === SELECT_ALL_VALUE) {
      // If all options are selected, unselect all
      if (allSelected) {
        setValue(value.filter((option) => !enabledOptions.includes(option)))
      } else {
        setValue(Array.from(new Set([...value, ...enabledOptions])))
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
    setOpen(false)
  }

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  function getEnabledItems() {
    return Array.from(contentRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]:not(:disabled)') ?? [])
  }

  function handleOpenAutoFocus(event: Event) {
    event.preventDefault()
    const items = getEnabledItems()
    const edge = openingFocusRef.current
    openingFocusRef.current = undefined
    const selectedItem = items.find((item) => item.getAttribute('aria-selected') === 'true')
    const item = edge === 'last' ? items[items.length - 1] : edge === 'first' ? items[0] : (selectedItem ?? items[0])
    if (!edge && searchable) searchRef.current?.focus()
    else if (item) item.focus()
    else contentRef.current?.focus()
    if (item) setFocusedIndex(Number(item.dataset.optionIndex))
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.defaultPrevented || event.nativeEvent.isComposing) return
    const items = getEnabledItems()
    const target = event.target as HTMLElement
    const isSearchInput = target === searchRef.current
    const currentIndex = items.indexOf(target as HTMLButtonElement)
    // Keep text editing and the select-all checkbox's native keys intact.
    if (!isSearchInput && currentIndex === -1 && target !== contentRef.current) return
    let nextItem: HTMLButtonElement | undefined
    if (event.key === 'ArrowDown') nextItem = items[(currentIndex + 1) % items.length]
    else if (event.key === 'ArrowUp')
      nextItem = currentIndex < 0 ? items[items.length - 1] : items[(currentIndex - 1 + items.length) % items.length]
    else if (!isSearchInput && event.key === 'Home') nextItem = items[0]
    else if (!isSearchInput && event.key === 'End') nextItem = items[items.length - 1]
    else if (isSearchInput && event.key === 'Enter') {
      event.preventDefault()
      items[0]?.click()
      return
    } else if (
      !isSearchInput &&
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const now = Date.now()
      const previous = now - typeaheadRef.current.time < 700 ? typeaheadRef.current.text : ''
      const text = previous + event.key.toLowerCase()
      typeaheadRef.current = { text, time: now }
      const query = Array.from(text).every((character) => character === text[0]) ? text[0] : text
      const candidates = [...items.slice(currentIndex + 1), ...items.slice(0, currentIndex + 1)]
      nextItem = candidates.find((item) => item.dataset.textValue?.toLowerCase().startsWith(query))
    } else return

    event.preventDefault()
    nextItem?.focus()
    nextItem?.scrollIntoView({ block: 'nearest' })
  }

  useEffect(() => {
    const items = getEnabledItems()
    if (!items.some((item) => Number(item.dataset.optionIndex) === focusedIndex)) {
      setFocusedIndex(items.length ? Number(items[0].dataset.optionIndex) : -1)
    }
  }, [searchValue, children, open, focusedIndex])

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

        autoClose,
        disabled,
        focusTrigger: () => triggerRef.current?.focus(),
        placeholder,
        maxDisplayCount,
        maxDisplayText,
        noneText,
        options,
      }}>
      <Popover
        open={open && !disabled}
        disabled={disabled}
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
          <ComboboxTrigger
            ref={triggerRef}
            disabled={disabled}
            placeholder={placeholder}
            startSlot={props.startSlot}
            size={size}
            variant={variant}
            aria-haspopup="listbox"
            onKeyDown={(event) => {
              if (disabled) return
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault()
                openingFocusRef.current = event.key === 'ArrowUp' ? 'last' : 'first'
                setOpen(true)
              }
            }}>
            {optionElements.map((child) => (
              <ComboboxSelectedValue key={child.props.value} option={child.props} />
            ))}
          </ComboboxTrigger>
        }
        onOpenAutoFocus={handleOpenAutoFocus}
        onKeyDown={handleKeyDown}
        onOpenChange={setOpen}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            maxHeight: 'inherit',
          }}>
          <div style={{ flexShrink: 0 }}>
            {(searchable || (options.length > 0 && showSelectAll)) && (
              <StyledComboboxHeader wrap={false} align="v">
                {searchable && <ComboboxSearchInput onSearch={onSearch} inputRef={searchRef} />}
                {options.length > 0 && showSelectAll && (
                  <StyledSelectAllWrapper>
                    <Checkbox
                      id={selectAllId}
                      checked={allSelected}
                      disabled={disabled || enabledOptions.length === 0}
                      onCheckedChange={() => {
                        selectValue(SELECT_ALL_VALUE)
                      }}
                    />
                    <SelectAllText htmlFor={selectAllId}>{selectAllText}</SelectAllText>
                  </StyledSelectAllWrapper>
                )}
              </StyledComboboxHeader>
            )}
          </div>
          <StyledComboboxContent
            ref={contentRef}
            orientation="column"
            role="listbox"
            aria-label={placeholder || 'Options'}
            aria-multiselectable={multiple || undefined}
            tabIndex={-1}>
            {children}
          </StyledComboboxContent>
        </div>
      </Popover>
    </ComboboxContext.Provider>
  )
}

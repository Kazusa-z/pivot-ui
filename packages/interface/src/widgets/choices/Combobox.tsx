import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from 'react'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { IconCheck, IconChevronDown } from '@tabler/icons-react'
import type { ChoiceOption, ChoiceValue } from '../../values'
import { createChoiceCollection } from '../../values/choice-options'
import { Tag } from '../display/Badge'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  type PopoverContentProps,
  type PopoverPortalProps,
} from '../overlays/Popover'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { choiceClasses, getChoiceControlClass, type ChoiceSize, type ChoiceVariant } from './choice.styles'

interface ComboboxBaseProps<T extends ChoiceValue> extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'defaultValue' | 'onChange' | 'children'
> {
  options: readonly ChoiceOption<T>[]
  readOnly?: boolean
  placeholder?: string
  emptyText?: string
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (search: string) => void
  size?: ChoiceSize
  variant?: ChoiceVariant
  css?: SystemStyleObject
  startSlot?: ReactNode
  renderOption?: (option: ChoiceOption<T>) => ReactNode
  renderValue?: (option: ChoiceOption<T>) => ReactNode
  autoClose?: boolean
  maxDisplayCount?: number
  maxDisplayText?: string
  showSelectAll?: boolean
  selectAllText?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  keepMounted?: boolean
  portalProps?: Omit<PopoverPortalProps, 'children'>
  contentProps?: Omit<PopoverContentProps, 'children'>
}
export interface SingleComboboxProps<T extends ChoiceValue = ChoiceValue> extends ComboboxBaseProps<T> {
  multiple?: false
  value?: T | null
  defaultValue?: T | null
  onValueChange?: (value: T | null) => void
}
export interface MultipleComboboxProps<T extends ChoiceValue = ChoiceValue> extends ComboboxBaseProps<T> {
  multiple: true
  value?: readonly T[]
  defaultValue?: readonly T[]
  onValueChange?: (value: readonly T[]) => void
}
export type ComboboxProps<T extends ChoiceValue = ChoiceValue> = SingleComboboxProps<T> | MultipleComboboxProps<T>

function ComboboxImpl<T extends ChoiceValue>(props: ComboboxProps<T>, ref: ForwardedRef<HTMLButtonElement>) {
  const {
    options,
    multiple = false,
    value: controlledValue,
    defaultValue,
    onValueChange: _onValueChange,
    disabled,
    readOnly,
    placeholder = 'Select options',
    emptyText = 'No options',
    searchable = true,
    searchPlaceholder = 'Search options',
    onSearch,
    size = 'sm',
    variant = 'soft',
    css: cssProp,
    startSlot,
    renderOption,
    renderValue,
    autoClose = !multiple,
    maxDisplayCount = Infinity,
    maxDisplayText = '{count} items selected',
    showSelectAll = false,
    selectAllText = 'Select all',
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    keepMounted,
    portalProps,
    contentProps,
    className,
    onKeyDown,
    name,
    form,
    'aria-describedby': describedBy,
    ...triggerProps
  } = props
  const collection = useMemo(() => createChoiceCollection(options), [options])
  const [value, setValue] = useControllableState<T | null | readonly T[]>({
    prop: controlledValue,
    defaultProp: defaultValue ?? (multiple ? [] : null),
    onChange(next) {
      if (props.multiple) props.onValueChange?.(next as readonly T[])
      else (props as SingleComboboxProps<T>).onValueChange?.(next as T | null)
    },
  })
  const [open, setOpen] = useControllableState({
    prop: controlledOpen,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  })
  const [search, setSearch] = useState('')
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef(new Map<string, HTMLDivElement>())
  const baseId = useId()
  const listId = `${baseId}-list`
  const valueId = `${baseId}-value`
  const locked = Boolean(disabled || readOnly)
  const actualOpen = open && !locked
  const selectedValues: readonly T[] = multiple ? (value as readonly T[]) : value === null ? [] : [value as T]
  const visible = collection.options.filter(
    (option) => !searchable || option.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  )
  const enabled = visible.filter((option) => !option.disabled)
  const active =
    enabled.find((option) => option.key === activeKey) ??
    enabled.find((option) => selectedValues.includes(option.value)) ??
    enabled[0]
  const optionId = (key: string) => `${baseId}-option-${encodeURIComponent(key)}`
  useEffect(() => {
    if (actualOpen && active) optionRefs.current.get(active.key)?.scrollIntoView({ block: 'nearest' })
  }, [actualOpen, active?.key])
  function changeOpen(next: boolean) {
    if (locked) return
    if (next) {
      setSearch('')
      setActiveKey(null)
    }
    setOpen(next)
  }
  function choose(key: string) {
    const option = collection.optionForKey(key)
    if (locked || !option || option.disabled) return
    if (multiple)
      setValue(
        selectedValues.includes(option.value)
          ? selectedValues.filter((value) => !Object.is(value, option.value))
          : [...selectedValues, option.value]
      )
    else if (!Object.is(value, option.value)) setValue(option.value)
    if (autoClose) setOpen(false)
  }
  function handleListKey(event: KeyboardEvent<HTMLElement>) {
    if (event.nativeEvent.isComposing) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const index = active ? enabled.findIndex((option) => option.key === active.key) : -1
      const next = enabled[(index + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length]
      if (next) setActiveKey(next.key)
    } else if (!searchable && (event.key === 'Home' || event.key === 'End')) {
      event.preventDefault()
      setActiveKey((event.key === 'Home' ? enabled[0] : enabled[enabled.length - 1])?.key ?? null)
    } else if (event.key === 'Enter' || (!searchable && event.key === ' ')) {
      event.preventDefault()
      if (active) choose(active.key)
    } else if (event.key === 'Tab') setOpen(false)
  }
  const allVisibleSelected = enabled.length > 0 && enabled.every((option) => selectedValues.includes(option.value))
  return (
    <PopoverRoot open={actualOpen} onOpenChange={changeOpen} keepMounted={keepMounted}>
      {name &&
        selectedValues.map((value) => (
          <input
            key={`${typeof value}:${value}`}
            type="hidden"
            name={name}
            form={form}
            value={String(value)}
            disabled={disabled}
          />
        ))}
      <div
        className={cx(getChoiceControlClass(size, variant, cssProp), className)}
        data-disabled={disabled ? '' : undefined}
        aria-readonly={readOnly || undefined}>
        <PopoverTrigger asChild>
          <button
            {...triggerProps}
            ref={ref}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={actualOpen}
            aria-controls={actualOpen ? listId : undefined}
            aria-readonly={readOnly || undefined}
            aria-label={
              triggerProps['aria-label'] ??
              (triggerProps.id || triggerProps['aria-labelledby'] ? undefined : placeholder)
            }
            aria-describedby={[describedBy, valueId].filter(Boolean).join(' ')}
            disabled={disabled}
            className={choiceClasses.comboButton}
            onKeyDown={(event) => {
              onKeyDown?.(event)
              if (!event.defaultPrevented && !locked && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
                event.preventDefault()
                changeOpen(true)
              }
            }}
          />
        </PopoverTrigger>
        <div id={valueId} className={choiceClasses.comboValue}>
          {startSlot}
          {selectedValues.length === 0 ? (
            <span className={cx(choiceClasses.value, choiceClasses.placeholder)}>{placeholder}</span>
          ) : multiple ? (
            <span className={choiceClasses.tags}>
              {selectedValues.length > maxDisplayCount
                ? maxDisplayText.replace('{count}', String(selectedValues.length))
                : selectedValues.map((selectedValue) => {
                    const key = collection.keyForValue(selectedValue)
                    const option = key ? collection.optionForKey(key) : undefined
                    const label = option?.label ?? String(selectedValue)
                    return (
                      <Tag
                        key={key ?? `${typeof selectedValue}:${selectedValue}`}
                        size="xs"
                        removeLabel={`Remove ${label}`}
                        disabled={locked || option?.disabled}
                        title={option?.disabledReason}
                        onRemove={() => {
                          if (!locked && !option?.disabled)
                            setValue(selectedValues.filter((value) => !Object.is(value, selectedValue)))
                        }}>
                        {option ? (renderValue?.(option) ?? option.label) : label}
                      </Tag>
                    )
                  })}
            </span>
          ) : (
            <span className={choiceClasses.value}>
              {(() => {
                const key = collection.keyForValue(selectedValues[0])
                const option = key ? collection.optionForKey(key) : undefined
                return option ? (renderValue?.(option) ?? option.label) : String(selectedValues[0])
              })()}
            </span>
          )}
          <IconChevronDown className={choiceClasses.chevron} />
        </div>
      </div>
      <PopoverPortal {...portalProps}>
        <PopoverContent
          {...contentProps}
          constrainSize
          css={css.raw(
            {
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'min(320px, var(--radix-popover-content-available-height))',
            },
            contentProps?.css
          )}
          onOpenAutoFocus={(event) => {
            contentProps?.onOpenAutoFocus?.(event)
            if (!event.defaultPrevented) {
              event.preventDefault()
              ;(searchable ? inputRef.current : listRef.current)?.focus()
            }
          }}>
          {searchable && (
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-label={searchPlaceholder}
              aria-autocomplete="list"
              aria-expanded={actualOpen}
              aria-controls={listId}
              aria-activedescendant={active ? optionId(active.key) : undefined}
              placeholder={searchPlaceholder}
              value={search}
              className={choiceClasses.search}
              onChange={(event) => {
                setSearch(event.target.value)
                setActiveKey(null)
                onSearch?.(event.target.value)
              }}
              onKeyDown={handleListKey}
            />
          )}
          {multiple && showSelectAll && (
            <button
              type="button"
              disabled={locked || enabled.length === 0}
              aria-pressed={allVisibleSelected}
              onClick={() => {
                if (locked) return
                const next = allVisibleSelected
                  ? selectedValues.filter((value) => !enabled.some((option) => Object.is(option.value, value)))
                  : [
                      ...selectedValues,
                      ...enabled
                        .filter((option) => !selectedValues.includes(option.value))
                        .map((option) => option.value),
                    ]
                if (
                  next.length !== selectedValues.length ||
                  next.some((value, index) => !Object.is(value, selectedValues[index]))
                )
                  setValue(next)
              }}>
              {selectAllText}
            </button>
          )}
          <div
            id={listId}
            ref={listRef}
            role="listbox"
            aria-label={triggerProps['aria-label'] ?? placeholder}
            aria-labelledby={triggerProps['aria-labelledby']}
            aria-multiselectable={multiple || undefined}
            tabIndex={searchable ? undefined : 0}
            aria-activedescendant={!searchable && active ? optionId(active.key) : undefined}
            className={choiceClasses.list}
            onKeyDown={searchable ? undefined : handleListKey}>
            {visible.length ? (
              visible.map((option) => (
                <div
                  key={option.key}
                  id={optionId(option.key)}
                  ref={(element) => {
                    if (element) optionRefs.current.set(option.key, element)
                    else optionRefs.current.delete(option.key)
                  }}
                  role="option"
                  aria-selected={selectedValues.includes(option.value)}
                  aria-disabled={option.disabled || undefined}
                  aria-description={option.disabledReason}
                  title={option.disabledReason}
                  data-active={option.key === active?.key ? '' : undefined}
                  className={choiceClasses.option}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => {
                    if (!option.disabled) setActiveKey(option.key)
                  }}
                  onClick={() => choose(option.key)}>
                  <span className={choiceClasses.indicator}>
                    {selectedValues.includes(option.value) && <IconCheck size={14} />}
                  </span>
                  {renderOption?.(option) ?? option.label}
                </div>
              ))
            ) : (
              <div className={choiceClasses.empty}>{emptyText}</div>
            )}
          </div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  )
}
export const Combobox = forwardRef(ComboboxImpl) as <T extends ChoiceValue = ChoiceValue>(
  props: ComboboxProps<T> & RefAttributes<HTMLButtonElement>
) => ReactElement

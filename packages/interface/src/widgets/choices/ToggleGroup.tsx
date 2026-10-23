import { createContext, forwardRef, useContext, type Ref } from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle-group'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import type { ChoiceOption, ChoiceValue } from '../../values'
import { createChoiceCollection } from '../../values/choice-options'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import {
  choiceLabelClass,
  getChoiceGroupClass,
  getChoiceItemClass,
  type ChoiceGroupStyleProps,
} from './choice-group.styles'

interface ToggleGroupStyleProps extends ChoiceGroupStyleProps {
  readOnly?: boolean
  css?: SystemStyleObject
}
export interface ToggleGroupRootSingleProps extends TogglePrimitive.ToggleGroupSingleProps, ToggleGroupStyleProps {}
export interface ToggleGroupRootMultipleProps extends TogglePrimitive.ToggleGroupMultipleProps, ToggleGroupStyleProps {}
export type ToggleGroupRootProps = ToggleGroupRootSingleProps | ToggleGroupRootMultipleProps

const ToggleContext = createContext<
  (ChoiceGroupStyleProps & { readOnly: boolean; selected: readonly string[] }) | null
>(null)

function SingleRoot({
  value,
  defaultValue = '',
  onValueChange,
  readOnly = false,
  size = 'sm',
  variant = 'solid',
  css: cssProp,
  className,
  children,
  ...props
}: ToggleGroupRootSingleProps & { ref?: Ref<HTMLDivElement> }) {
  const [current, setCurrent] = useControllableState({
    prop: value,
    defaultProp: defaultValue,
    onChange: onValueChange,
    caller: 'ToggleGroup',
  })
  return (
    <ToggleContext.Provider value={{ size, variant, readOnly, selected: current ? [current] : [] }}>
      <TogglePrimitive.Root
        {...props}
        role="toolbar"
        value={current}
        onValueChange={(next: string) => {
          if (!readOnly) setCurrent(next)
        }}
        data-readonly={readOnly ? '' : undefined}
        className={cx(getChoiceGroupClass(false, cssProp, props.orientation), className)}>
        {children}
      </TogglePrimitive.Root>
    </ToggleContext.Provider>
  )
}

function MultipleRoot({
  value,
  defaultValue = [],
  onValueChange,
  readOnly = false,
  size = 'sm',
  variant = 'solid',
  css: cssProp,
  className,
  children,
  ...props
}: ToggleGroupRootMultipleProps & { ref?: Ref<HTMLDivElement> }) {
  const [current, setCurrent] = useControllableState({
    prop: value,
    defaultProp: defaultValue,
    onChange: onValueChange,
    caller: 'ToggleGroup',
  })
  return (
    <ToggleContext.Provider value={{ size, variant, readOnly, selected: current }}>
      <TogglePrimitive.Root
        {...props}
        value={current}
        onValueChange={(next: string[]) => {
          if (!readOnly) setCurrent(next)
        }}
        data-readonly={readOnly ? '' : undefined}
        className={cx(getChoiceGroupClass(false, cssProp, props.orientation), className)}>
        {children}
      </TogglePrimitive.Root>
    </ToggleContext.Provider>
  )
}

/** Key-based composition primitive. Toggle buttons remain cancellable in both modes. */
export const ToggleGroupRoot = forwardRef<HTMLDivElement, ToggleGroupRootProps>(function ToggleGroupRoot(props, ref) {
  return props.type === 'single' ? <SingleRoot {...props} ref={ref} /> : <MultipleRoot {...props} ref={ref} />
})

export interface ToggleGroupItemProps
  extends Omit<TogglePrimitive.ToggleGroupItemProps, 'asChild'>, ChoiceGroupStyleProps {
  fancy?: boolean
  css?: SystemStyleObject
}

export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(function ToggleGroupItem(
  { value, children, title, size, variant, fancy, css: cssProp, className, onClick, ...props },
  ref
) {
  const context = useContext(ToggleContext)
  if (!context) throw new Error('ToggleGroupItem must be used within ToggleGroupRoot.')
  return (
    <TogglePrimitive.Item
      {...props}
      ref={ref}
      value={value}
      role="button"
      aria-checked={undefined}
      aria-pressed={context.selected.includes(value)}
      title={title ?? (typeof children === 'string' ? children : undefined)}
      data-readonly={context.readOnly ? '' : undefined}
      onClick={(event) => {
        onClick?.(event)
        if (context.readOnly) event.preventDefault()
      }}
      className={cx(
        getChoiceItemClass({ size: size ?? context.size, variant: variant ?? context.variant, fancy }, cssProp),
        className
      )}>
      <span className={choiceLabelClass}>{children}</span>
    </TogglePrimitive.Item>
  )
})

type OptionProps<T extends ChoiceValue> = { options: readonly ChoiceOption<T>[]; ref?: Ref<HTMLDivElement> }
export interface ToggleGroupSingleProps<T extends ChoiceValue = ChoiceValue>
  extends
    Omit<ToggleGroupRootSingleProps, 'value' | 'defaultValue' | 'onValueChange' | 'children' | 'asChild'>,
    OptionProps<T> {
  value?: T | null
  defaultValue?: T | null
  onValueChange?: (value: T | null) => void
}
export interface ToggleGroupMultipleProps<T extends ChoiceValue = ChoiceValue>
  extends
    Omit<ToggleGroupRootMultipleProps, 'value' | 'defaultValue' | 'onValueChange' | 'children' | 'asChild'>,
    OptionProps<T> {
  value?: readonly T[]
  defaultValue?: readonly T[]
  onValueChange?: (value: T[]) => void
}
export type ToggleGroupProps<T extends ChoiceValue = ChoiceValue> =
  ToggleGroupSingleProps<T> | ToggleGroupMultipleProps<T>

function SingleOptions<T extends ChoiceValue>({
  options,
  value,
  defaultValue = null,
  onValueChange,
  ...props
}: ToggleGroupSingleProps<T>) {
  const collection = createChoiceCollection(options)
  const [current, setCurrent] = useControllableState<T | null>({
    prop: value,
    defaultProp: defaultValue,
    onChange: onValueChange,
    caller: 'ToggleGroup',
  })
  return (
    <ToggleGroupRoot
      {...props}
      value={current === null ? '' : (collection.keyForValue(current) ?? '')}
      onValueChange={(key: string) => {
        const option = collection.optionForKey(key)
        if (key === '') setCurrent(null)
        else if (option && !option.disabled) setCurrent(option.value)
      }}>
      {collection.options.map((option) => (
        <ToggleGroupItem
          key={option.key}
          value={option.key}
          disabled={option.disabled}
          title={option.disabledReason ?? option.label}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroupRoot>
  )
}

function MultipleOptions<T extends ChoiceValue>({
  options,
  value,
  defaultValue = [],
  onValueChange,
  ...props
}: ToggleGroupMultipleProps<T>) {
  const collection = createChoiceCollection(options)
  const [current, setCurrent] = useControllableState<readonly T[]>({
    prop: value,
    defaultProp: defaultValue,
    onChange: (next) => onValueChange?.([...next]),
    caller: 'ToggleGroup',
  })
  const keys = current.flatMap((item) => {
    const key = collection.keyForValue(item)
    return key === undefined ? [] : [key]
  })
  return (
    <ToggleGroupRoot
      {...props}
      value={keys}
      onValueChange={(next: string[]) => {
        const selectedValues = next.flatMap((key) => {
          const option = collection.optionForKey(key)
          return option ? [option.value] : []
        })
        // Options may load asynchronously. An unrelated toggle must not delete hidden values.
        setCurrent([
          ...current.filter((value) => collection.keyForValue(value) === undefined || selectedValues.includes(value)),
          ...selectedValues.filter((value) => !current.includes(value)),
        ])
      }}>
      {collection.options.map((option) => (
        <ToggleGroupItem
          key={option.key}
          value={option.key}
          disabled={option.disabled}
          title={option.disabledReason ?? option.label}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroupRoot>
  )
}

export function ToggleGroup<T extends ChoiceValue>(props: ToggleGroupProps<T>) {
  return props.type === 'single' ? <SingleOptions {...props} /> : <MultipleOptions {...props} />
}

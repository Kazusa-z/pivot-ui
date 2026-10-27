import { createContext, forwardRef, useContext, type Ref } from 'react'
import * as RadioPrimitive from '@radix-ui/react-radio-group'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import type { ChoiceOption, ChoiceValue } from '../../values'
import { createChoiceCollection } from '../../values/choice-options'
import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import {
  choiceLabelClass,
  getChoiceGroupClass,
  getChoiceItemClass,
  type ChoiceGroupStyleProps,
} from './choice-group.styles'

export interface SegmentControlRootProps extends RadioPrimitive.RadioGroupProps, ChoiceGroupStyleProps {
  readOnly?: boolean
  css?: SystemStyleObject
}

const SegmentContext = createContext<(ChoiceGroupStyleProps & { readOnly: boolean }) | null>(null)

/** Key-based composition primitive; use SegmentControl for typed ChoiceOption values. */
export const SegmentControlRoot = forwardRef<HTMLDivElement, SegmentControlRootProps>(function SegmentControlRoot(
  {
    value,
    defaultValue = '',
    onValueChange,
    readOnly = false,
    size = 'sm',
    variant = 'subtle',
    css: cssProp,
    className,
    children,
    ...props
  },
  ref
) {
  const [current, setCurrent] = useControllableState({
    prop: value === null ? '' : value,
    defaultProp: defaultValue,
    onChange: onValueChange,
    caller: 'SegmentControl',
  })
  return (
    <SegmentContext.Provider value={{ size, variant, readOnly }}>
      <RadioPrimitive.Root
        {...props}
        ref={ref}
        value={current}
        onValueChange={(next) => {
          if (!readOnly) setCurrent(next)
        }}
        aria-readonly={readOnly || undefined}
        data-readonly={readOnly ? '' : undefined}
        className={cx(getChoiceGroupClass(true, cssProp, props.orientation), className)}>
        {children}
      </RadioPrimitive.Root>
    </SegmentContext.Provider>
  )
})

export interface SegmentControlItemProps extends Omit<RadioPrimitive.RadioGroupItemProps, 'asChild'> {
  css?: SystemStyleObject
}

export const SegmentControlItem = forwardRef<HTMLButtonElement, SegmentControlItemProps>(function SegmentControlItem(
  { children, title, css: cssProp, className, onClick, ...props },
  ref
) {
  const context = useContext(SegmentContext)
  if (!context) throw new Error('SegmentControlItem must be used within SegmentControlRoot.')
  return (
    <RadioPrimitive.Item
      {...props}
      ref={ref}
      title={title ?? (typeof children === 'string' ? children : undefined)}
      data-readonly={context.readOnly ? '' : undefined}
      onClick={(event) => {
        onClick?.(event)
        if (context.readOnly) event.preventDefault()
      }}
      className={cx(getChoiceItemClass(context, cssProp), className)}>
      <span className={choiceLabelClass}>{children}</span>
    </RadioPrimitive.Item>
  )
})

export interface SegmentControlProps<T extends ChoiceValue = ChoiceValue> extends Omit<
  SegmentControlRootProps,
  'value' | 'defaultValue' | 'onValueChange' | 'children' | 'asChild'
> {
  options: readonly ChoiceOption<T>[]
  value?: T | null
  defaultValue?: T | null
  onValueChange?: (value: T) => void
  ref?: Ref<HTMLDivElement>
}

export function SegmentControl<T extends ChoiceValue>({
  options,
  value,
  defaultValue = null,
  onValueChange,
  name,
  form,
  required,
  ...props
}: SegmentControlProps<T>) {
  const collection = createChoiceCollection(options)
  const [current, setCurrent] = useControllableState<T | null>({
    prop: value,
    defaultProp: defaultValue,
    onChange: (next) => {
      if (next !== null) onValueChange?.(next)
    },
    caller: 'SegmentControl',
  })
  return (
    <SegmentControlRoot
      {...props}
      form={form}
      required={false}
      aria-required={required || undefined}
      value={current === null ? '' : (collection.keyForValue(current) ?? '')}
      onValueChange={(key) => {
        const option = collection.optionForKey(key)
        if (key === '') setCurrent(null)
        else if (option && !option.disabled) setCurrent(option.value)
      }}>
      {(name || required) && (
        <input
          type="radio"
          tabIndex={-1}
          aria-hidden="true"
          className={css({ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' })}
          name={name}
          form={form}
          value={current === null ? '' : String(current)}
          checked={current !== null}
          readOnly
          required={required}
          disabled={props.disabled}
          onInvalid={(event) => {
            event.preventDefault()
            event.currentTarget.parentElement?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
          }}
        />
      )}
      {collection.options.map((option) => (
        <SegmentControlItem
          key={option.key}
          value={option.key}
          disabled={option.disabled}
          title={option.disabledReason ?? option.label}>
          {option.label}
        </SegmentControlItem>
      ))}
    </SegmentControlRoot>
  )
}

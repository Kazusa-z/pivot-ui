import {
  forwardRef,
  useMemo,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from 'react'
import * as Primitive from '@radix-ui/react-select'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { IconCheck, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import type { ChoiceOption, ChoiceValue } from '../../values'
import { createChoiceCollection } from '../../values/choice-options'
import { OverlayLayer } from '../overlays/OverlayLayer'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { choiceClasses, getChoiceControlClass, type ChoiceSize, type ChoiceVariant } from './choice.styles'

export interface SelectProps<T extends ChoiceValue = ChoiceValue> extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'defaultValue' | 'onChange' | 'children'
> {
  options: readonly ChoiceOption<T>[]
  value?: T | null
  defaultValue?: T | null
  onValueChange?: (value: T | null) => void
  readOnly?: boolean
  placeholder?: string
  emptyText?: string
  size?: ChoiceSize
  variant?: ChoiceVariant
  css?: SystemStyleObject
  startSlot?: ReactNode
  indicator?: ReactNode
  renderOption?: (option: ChoiceOption<T>) => ReactNode
  renderValue?: (option: ChoiceOption<T>) => ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  portalProps?: Omit<Primitive.SelectPortalProps, 'children'>
  contentProps?: Omit<Primitive.SelectContentProps, 'children'>
}

function SelectImpl<T extends ChoiceValue>(
  {
    options,
    value: controlledValue,
    defaultValue = null,
    onValueChange,
    disabled,
    readOnly,
    placeholder = 'Select an option',
    emptyText = 'No options',
    size = 'sm',
    variant = 'soft',
    css,
    startSlot,
    indicator = <IconChevronDown className={choiceClasses.chevron} />,
    renderOption,
    renderValue,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    portalProps,
    contentProps,
    className,
    name,
    form,
    ...triggerProps
  }: SelectProps<T>,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const collection = useMemo(() => createChoiceCollection(options), [options])
  const [value, setValue] = useControllableState<T | null>({
    prop: controlledValue,
    defaultProp: defaultValue,
    onChange: onValueChange,
  })
  const [open, setOpen] = useControllableState({
    prop: controlledOpen,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  })
  const selectedKey = value === null ? '' : (collection.keyForValue(value) ?? '')
  const selected = selectedKey ? collection.optionForKey(selectedKey) : undefined
  const locked = disabled || readOnly
  return (
    <Primitive.Root
      value={selectedKey}
      open={!locked && open}
      disabled={disabled}
      onOpenChange={(next) => {
        if (!locked) setOpen(next)
      }}
      onValueChange={(key) => {
        const option = collection.optionForKey(key)
        if (!locked && option && !option.disabled && !Object.is(option.value, value)) setValue(option.value)
      }}>
      {name && value !== null && (
        <input type="hidden" name={name} form={form} value={String(value)} disabled={disabled} />
      )}
      <Primitive.Trigger
        {...triggerProps}
        ref={ref}
        disabled={disabled}
        aria-readonly={readOnly || undefined}
        className={cx(getChoiceControlClass(size, variant, css), className)}>
        {startSlot}
        <span className={cx(choiceClasses.value, value === null && choiceClasses.placeholder)}>
          <Primitive.Value placeholder={placeholder}>
            {selected ? (renderValue?.(selected) ?? selected.label) : value === null ? undefined : String(value)}
          </Primitive.Value>
        </span>
        {indicator !== null && <Primitive.Icon>{indicator}</Primitive.Icon>}
      </Primitive.Trigger>
      <Primitive.Portal {...portalProps}>
        <OverlayLayer asChild>
          <Primitive.Content
            position="popper"
            sideOffset={4}
            collisionPadding={4}
            {...contentProps}
            className={cx(choiceClasses.content, contentProps?.className)}>
            <Primitive.ScrollUpButton className={choiceClasses.scrollButton}>
              <IconChevronUp size={14} />
            </Primitive.ScrollUpButton>
            <Primitive.Viewport className={choiceClasses.viewport}>
              {collection.options.length ? (
                collection.options.map((option) => (
                  <Primitive.Item
                    key={option.key}
                    value={option.key}
                    disabled={option.disabled}
                    title={option.disabledReason}
                    aria-description={option.disabledReason}
                    textValue={option.label}
                    className={choiceClasses.option}>
                    <span className={choiceClasses.indicator}>
                      <Primitive.ItemIndicator>
                        <IconCheck size={14} />
                      </Primitive.ItemIndicator>
                    </span>
                    <Primitive.ItemText>{renderOption?.(option) ?? option.label}</Primitive.ItemText>
                  </Primitive.Item>
                ))
              ) : (
                <div className={choiceClasses.empty}>{emptyText}</div>
              )}
            </Primitive.Viewport>
            <Primitive.ScrollDownButton className={choiceClasses.scrollButton}>
              <IconChevronDown size={14} />
            </Primitive.ScrollDownButton>
          </Primitive.Content>
        </OverlayLayer>
      </Primitive.Portal>
    </Primitive.Root>
  )
}
export const Select = forwardRef(SelectImpl) as <T extends ChoiceValue = ChoiceValue>(
  props: SelectProps<T> & RefAttributes<HTMLButtonElement>
) => ReactElement

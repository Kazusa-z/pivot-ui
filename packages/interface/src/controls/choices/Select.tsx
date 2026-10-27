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
import { OverlayLayer } from '../../overlays/OverlayLayer'
import { cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { choiceClasses, getChoiceControlClass, type ChoiceSize, type ChoiceVariant } from './choice.styles'

export interface SelectProps<T extends ChoiceValue = ChoiceValue> extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'defaultValue' | 'onChange' | 'children'
> {
  /** 选项列表：`key` 稳定标识，`label` 显示文字，`value` 原样回传的业务值；`disabled` + `disabledReason` 显示不可选原因。 */
  options: readonly ChoiceOption<T>[]
  /** 当前选中的值（受控）；`null` 表示未选择。 */
  value?: T | null
  /** 非受控时的初始值。 */
  defaultValue?: T | null
  /** 选择请求；受控使用时由应用更新 `value`。 */
  onValueChange?: (value: T | null) => void
  /** 只读：可以打开查看选项，但不能修改。 */
  readOnly?: boolean
  /** 未选择时显示的文字。 */
  placeholder?: string
  /** 没有选项时列表里显示的文字。 */
  emptyText?: string
  /** 高度：`xs` 20、`sm` 24、`md` 32。 */
  size?: ChoiceSize
  /** 与 `Input` 相同的 `soft` / `outline` / `subtle`。 */
  variant?: ChoiceVariant
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
  /** 触发器左侧的图标。 */
  startSlot?: ReactNode
  /** 替换右侧的下拉箭头。 */
  indicator?: ReactNode
  /** 自定义列表中每个选项的内容。 */
  renderOption?: (option: ChoiceOption<T>) => ReactNode
  /** 自定义触发器里显示的已选内容。 */
  renderValue?: (option: ChoiceOption<T>) => ReactNode
  /** 列表是否展开（受控）。 */
  open?: boolean
  /** 非受控时初始是否展开。 */
  defaultOpen?: boolean
  /** 展开或收起时调用。 */
  onOpenChange?: (open: boolean) => void
  /** 传给浮层 Portal 的属性，例如 `container`。 */
  portalProps?: Omit<Primitive.SelectPortalProps, 'children'>
  /** 传给浮层内容的属性，例如 `side`、`align`。 */
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
  let selectedKey = value === null ? '' : collection.keyForValue(value)
  const selected = selectedKey ? collection.optionForKey(selectedKey) : undefined
  if (selectedKey === undefined) {
    // Radix treats an empty key as an absent value and hides children behind the placeholder.
    selectedKey = '__pivot_ui_unavailable__'
    while (collection.optionForKey(selectedKey)) selectedKey += '_'
  }
  const optionSizeClass = size === 'md' ? choiceClasses.optionMd : size === 'xs' ? choiceClasses.optionXs : undefined
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
                    className={cx(choiceClasses.option, optionSizeClass)}>
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

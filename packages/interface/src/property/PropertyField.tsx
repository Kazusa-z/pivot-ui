import { useId, useRef, type ReactNode } from 'react'
import type { EditResult, PropertyAccess, PropertyDescriptorSchema } from '../contracts/property'
import type { ChoiceValue, PropertyValue } from '../values'
import { usePropertyBinding, type PropertyBinding } from './usePropertyBinding'
import {
  PropertyRow,
  PropertyLabel,
  PropertyControl,
  PropertyDescription,
  type PropertyRowProps,
} from '../layout/PropertyRow'
import { Input } from '../widgets/inputs/Input'
import { Textarea } from '../widgets/inputs/Textarea'
import { useTextEdit } from '../widgets/inputs/useTextEdit'
import { Checkbox } from '../widgets/choices/Checkbox'
import { Select } from '../widgets/choices/Select'
import { Combobox } from '../widgets/choices/Combobox'
import { InputNumber } from '../widgets/inputs/InputNumber'
import { NumericSlider } from '../templates/numeric/NumericSlider'

export type PropertyFieldWidget =
  'input' | 'textarea' | 'checkbox' | 'select' | 'combobox' | 'input-number' | 'numeric-slider'

export interface PropertyFieldControlProps {
  id: string
  'aria-labelledby': string
  'aria-describedby'?: string
  'aria-errormessage'?: string
  'aria-invalid': boolean
  'aria-busy': boolean
}

export interface PropertyFieldRenderProps<T> extends PropertyBinding<T> {
  /** Matches the row density so custom editors can choose 24/32 controls. */
  density: 'compact' | 'regular'
  /** 传给实际输入或控件组，使字段标签、帮助文字、错误和忙碌状态与控件关联。 */
  controlProps: PropertyFieldControlProps
  /** 可直接传给数值、颜色或曲线组件，连接显示值、可用状态以及预览、提交和取消回调。 */
  editProps: PropertyFieldControlProps & {
    value: T
    resetKey: object
    disabled: boolean
    readOnly: boolean
    onEditStart(): boolean
    onValueChange(value: T): void
    onValueCommit(value: T): Promise<void>
    onEditCancel: PropertyBinding<T>['cancel']
  }
}

export interface PropertyFieldProps<T = PropertyValue> extends Omit<PropertyRowProps, 'children'> {
  access: PropertyAccess<T>
  /** 选择字段的输入方式；默认根据属性类型使用 input、input-number、checkbox 或 select。 */
  widget?: PropertyFieldWidget
  controlId?: string
  label?: ReactNode
  description?: ReactNode
  placeholder?: string
  /** 展示多个选中对象具有不同值的状态。应用计算是否混合，并在接受统一的新值后将它设为 false。 */
  mixed?: boolean
  onEditResult?: (result: EditResult<T>) => void
  /** 自定义字段内容，例如向量、颜色或资源选择器。参数提供当前值、控件关联属性和编辑方法。 */
  render?: (field: PropertyFieldRenderProps<T>) => ReactNode
  /** 自定义内容默认使用 group 关联标签；内容是单个可标记输入时可选 control。 */
  association?: 'control' | 'group'
}

/** 显示一个带标签、帮助文字和保存反馈的属性字段。通过 access 连接应用数据，使用 render 组合复杂控件；多个字段可放入 Section 构成面板。 */
export function PropertyField<T>({
  access,
  widget,
  controlId,
  label,
  description,
  placeholder,
  mixed = false,
  onEditResult,
  render,
  association = render ? 'group' : 'control',
  density = 'compact',
  ...rowProps
}: PropertyFieldProps<T>) {
  const binding = usePropertyBinding({ access, mixed, onEditResult })
  const { snapshot, resetKey, begin, change, commit, cancel } = binding
  const controlSize = density === 'regular' ? 'md' : 'sm'
  const generatedId = useId()
  const id = controlId ?? generatedId
  const textChanged = useRef(false)
  const numericChanged = useRef(false)
  const descriptor = snapshot.descriptor as PropertyDescriptorSchema
  const selectedWidget =
    widget ??
    (descriptor.kind === 'number'
      ? 'input-number'
      : descriptor.kind === 'boolean'
        ? 'checkbox'
        : descriptor.kind === 'enum'
          ? 'select'
          : 'input')
  const validWidget =
    descriptor.kind === 'string'
      ? selectedWidget === 'input' || selectedWidget === 'textarea'
      : descriptor.kind === 'number'
        ? selectedWidget === 'input-number' || selectedWidget === 'numeric-slider'
        : descriptor.kind === 'boolean'
          ? selectedWidget === 'checkbox'
          : descriptor.kind === 'enum' && (selectedWidget === 'select' || selectedWidget === 'combobox')

  const editor = useTextEdit({
    value: descriptor.kind === 'string' ? (mixed ? '' : String(snapshot.value)) : '',
    resetKey,
    disabled: snapshot.disabled,
    readOnly: snapshot.readOnly,
    multiline: selectedWidget === 'textarea',
    onBegin: () => {
      textChanged.current = false
      return begin()
    },
    onDraftChange: (value) => {
      textChanged.current = true
      change(value as T)
    },
    onCommit: (value) => {
      // A mixed field displays an empty draft, not an actual empty property value.
      // Merely focusing and leaving it must not replace every selected value with ''.
      if (mixed && !textChanged.current) {
        cancel('reset')
        return
      }
      return commit(value as T).then(() => {})
    },
    onCancel: cancel,
  })

  if (!render && !validWidget) throw new Error(`PropertyField cannot render ${descriptor.kind} with ${selectedWidget}.`)
  const pending = binding.pending || editor.phase === 'pending'
  const error = snapshot.error?.message ?? editor.error
  const help = description ?? descriptor.description
  const describedBy =
    [help && `${id}-help`, snapshot.unavailableReason && `${id}-unavailable`, error && `${id}-error`]
      .filter(Boolean)
      .join(' ') || undefined
  const common = {
    id,
    'aria-labelledby': `${id}-label`,
    'aria-describedby': describedBy,
    'aria-errormessage': error ? `${id}-error` : undefined,
    'aria-invalid': !!error,
    'aria-busy': pending,
    disabled: snapshot.disabled,
    readOnly: snapshot.readOnly || pending,
  }
  const choose = (value: T | null) => {
    if (value !== null)
      void binding.submit(value).catch(() => {
        /* The access snapshot owns the displayed host rejection. */
      })
  }
  const numberProps = {
    ...common,
    ...(descriptor.kind === 'number' ? descriptor.constraints : {}),
    // The widget owns its pending state. A submitted request must not invalidate
    // itself merely because its host publishes a pending snapshot.
    readOnly: snapshot.readOnly || (pending && !binding.ownsPending),
    value: binding.value as number,
    resetKey,
    mixed,
    placeholder: mixed ? 'Multiple values' : placeholder,
    onEditStart: () => {
      numericChanged.current = false
      return begin()
    },
    onValueChange: (value: number) => {
      numericChanged.current = true
      change(value as T)
    },
    onValueCommit: (value: number) => {
      if (mixed && !numericChanged.current) {
        cancel('reset')
        return
      }
      return commit(value as T).then(() => {})
    },
    onEditCancel: cancel,
  }
  const controlProps: PropertyFieldControlProps = {
    id,
    'aria-labelledby': common['aria-labelledby'],
    'aria-describedby': common['aria-describedby'],
    'aria-errormessage': common['aria-errormessage'],
    'aria-invalid': common['aria-invalid'],
    'aria-busy': common['aria-busy'],
  }
  const customField: PropertyFieldRenderProps<T> = {
    ...binding,
    density,
    controlProps,
    editProps: {
      ...controlProps,
      value: binding.value,
      resetKey,
      disabled: snapshot.disabled,
      readOnly: snapshot.readOnly || (pending && !binding.ownsPending),
      onEditStart: begin,
      onValueChange: (next) => {
        change(next)
      },
      onValueCommit: async (next) => {
        await commit(next)
      },
      onEditCancel: cancel,
    },
  }

  return (
    <PropertyRow
      {...rowProps}
      density={density}
      data-property-kind={descriptor.kind}
      data-edit-phase={pending ? 'pending' : (snapshot.edit?.phase ?? editor.phase)}>
      <PropertyLabel id={`${id}-label`} htmlFor={association === 'control' ? id : undefined}>
        {label ?? descriptor.label}
      </PropertyLabel>
      <PropertyControl {...(association === 'group' ? { association, labelledBy: `${id}-label` } : { association })}>
        {render?.(customField)}
        {!render &&
          descriptor.kind === 'number' &&
          (selectedWidget === 'numeric-slider' ? (
            <NumericSlider {...numberProps} size={controlSize} label={descriptor.label} unit={descriptor.unit} />
          ) : (
            <InputNumber {...numberProps} size={controlSize} endSlot={descriptor.unit} />
          ))}
        {!render &&
          descriptor.kind === 'string' &&
          (selectedWidget === 'textarea' ? (
            <Textarea
              {...common}
              {...editor.inputProps}
              size={controlSize}
              value={editor.draft}
              placeholder={mixed ? 'Multiple values' : placeholder}
            />
          ) : (
            <Input
              {...common}
              {...editor.inputProps}
              size={controlSize}
              value={editor.draft}
              placeholder={mixed ? 'Multiple values' : placeholder}
            />
          ))}
        {!render && descriptor.kind === 'boolean' && (
          <Checkbox
            {...common}
            size={density === 'regular' ? 'md' : 'sm'}
            disabled={snapshot.disabled || pending}
            checked={mixed ? 'indeterminate' : (snapshot.value as boolean)}
            onCheckedChange={(value) => choose(value as T)}
          />
        )}
        {!render &&
          descriptor.kind === 'enum' &&
          (selectedWidget === 'combobox' ? (
            <Combobox<ChoiceValue>
              {...common}
              size={controlSize}
              options={descriptor.options}
              value={mixed ? null : (snapshot.value as ChoiceValue)}
              placeholder={mixed ? 'Multiple values' : placeholder}
              onValueChange={(value) => choose(value as T | null)}
            />
          ) : (
            <Select<ChoiceValue>
              {...common}
              size={controlSize}
              options={descriptor.options}
              value={mixed ? null : (snapshot.value as ChoiceValue)}
              placeholder={mixed ? 'Multiple values' : placeholder}
              onValueChange={(value) => choose(value as T | null)}
            />
          ))}
      </PropertyControl>
      {help && <PropertyDescription id={`${id}-help`}>{help}</PropertyDescription>}
      {snapshot.unavailableReason && (
        <PropertyDescription id={`${id}-unavailable`}>{snapshot.unavailableReason}</PropertyDescription>
      )}
      {error && (
        <PropertyDescription id={`${id}-error`} role="alert" tone="danger">
          {error}
        </PropertyDescription>
      )}
    </PropertyRow>
  )
}

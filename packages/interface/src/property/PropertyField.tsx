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
  /** Put these on the real control/group, not an arbitrary layout wrapper. */
  controlProps: PropertyFieldControlProps
  /** Standard preview/commit/cancel adapter shared by numeric, color and curve templates. */
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
  /** Defaults to input / input-number / checkbox / select according to the descriptor. */
  widget?: PropertyFieldWidget
  controlId?: string
  label?: ReactNode
  description?: ReactNode
  placeholder?: string
  /** Presentation of a mixed selection; the application owns aggregation and clears this after accepting a value. */
  mixed?: boolean
  onEditResult?: (result: EditResult<T>) => void
  /** Complex properties are explicitly composed; this function receives one typed property session. */
  render?: (field: PropertyFieldRenderProps<T>) => ReactNode
  /** Custom compositions are groups by default. Use control only for a single labelable input. */
  association?: 'control' | 'group'
}

/** Connects exactly one property to one widget. It does not build panels or own application data. */
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
  ...rowProps
}: PropertyFieldProps<T>) {
  const binding = usePropertyBinding({ access, mixed, onEditResult })
  const { snapshot, resetKey, begin, change, commit, cancel } = binding
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
            <NumericSlider {...numberProps} label={descriptor.label} unit={descriptor.unit} />
          ) : (
            <InputNumber {...numberProps} endSlot={descriptor.unit} />
          ))}
        {!render &&
          descriptor.kind === 'string' &&
          (selectedWidget === 'textarea' ? (
            <Textarea
              {...common}
              {...editor.inputProps}
              value={editor.draft}
              placeholder={mixed ? 'Multiple values' : placeholder}
            />
          ) : (
            <Input
              {...common}
              {...editor.inputProps}
              value={editor.draft}
              placeholder={mixed ? 'Multiple values' : placeholder}
            />
          ))}
        {!render && descriptor.kind === 'boolean' && (
          <Checkbox
            {...common}
            checked={mixed ? 'indeterminate' : (snapshot.value as boolean)}
            onCheckedChange={(value) => choose(value as T)}
          />
        )}
        {!render &&
          descriptor.kind === 'enum' &&
          (selectedWidget === 'combobox' ? (
            <Combobox<ChoiceValue>
              {...common}
              options={descriptor.options}
              value={mixed ? null : (snapshot.value as ChoiceValue)}
              placeholder={mixed ? 'Multiple values' : placeholder}
              onValueChange={(value) => choose(value as T | null)}
            />
          ) : (
            <Select<ChoiceValue>
              {...common}
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
        <PropertyDescription id={`${id}-error`} role="alert">
          {error}
        </PropertyDescription>
      )}
    </PropertyRow>
  )
}

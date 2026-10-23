import { useEffect, useId, useMemo, useRef, useSyncExternalStore, type ReactNode } from 'react'
import type { EditCancelReason, EditResult, EditSession, PropertyAccess, PropertyDescriptor } from '../contracts'
import type { ChoiceValue, PropertyValue } from '../values'
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

export type PropertyFieldWidget = 'input' | 'textarea' | 'checkbox' | 'select' | 'combobox'

export interface PropertyFieldProps<T extends PropertyValue = PropertyValue> extends Omit<
  PropertyRowProps,
  'children'
> {
  access: PropertyAccess<T>
  /** Defaults to input / checkbox / select according to the descriptor. Numeric fields arrive in B06. */
  widget?: PropertyFieldWidget
  controlId?: string
  label?: ReactNode
  description?: ReactNode
  placeholder?: string
  /** Presentation of a mixed selection; the application owns aggregation and clears this after accepting a value. */
  mixed?: boolean
  onEditResult?: (result: EditResult<T>) => void
}

/** Connects exactly one property to one widget. It does not build panels or own application data. */
export function PropertyField<T extends PropertyValue>({
  access,
  widget,
  controlId,
  label,
  description,
  placeholder,
  mixed = false,
  onEditResult,
  ...rowProps
}: PropertyFieldProps<T>) {
  const snapshot = useSyncExternalStore(access.subscribe, access.getSnapshot, access.getSnapshot)
  const generatedId = useId()
  const id = controlId ?? generatedId
  const session = useRef<{ access: PropertyAccess<T>; edit: EditSession<T>; submitted: boolean } | null>(null)
  const textChanged = useRef(false)
  const resultCallback = useRef(onEditResult)
  resultCallback.current = onEditResult
  const resetKey = useMemo(() => ({}), [access, snapshot.revision, mixed])
  const descriptor = snapshot.descriptor as PropertyDescriptor
  const selectedWidget =
    widget ?? (descriptor.kind === 'boolean' ? 'checkbox' : descriptor.kind === 'enum' ? 'select' : 'input')
  const validWidget =
    descriptor.kind === 'string'
      ? selectedWidget === 'input' || selectedWidget === 'textarea'
      : descriptor.kind === 'boolean'
        ? selectedWidget === 'checkbox'
        : descriptor.kind === 'enum' && (selectedWidget === 'select' || selectedWidget === 'combobox')

  const cancel = (reason: EditCancelReason) => {
    const current = session.current
    // A successful host acknowledgement also advances revision. Let its reserved request
    // report the result; resetting the local draft must not swallow that acknowledgement.
    if (current?.submitted) return
    session.current = null
    if (current) void current.edit.cancel(reason)
  }

  useEffect(
    () => () => {
      const current = session.current
      if (current?.access === access) {
        session.current = null
        if (!current.submitted) void current.edit.cancel('unmount')
      }
    },
    [access]
  )

  const begin = () => {
    const latest = access.getSnapshot()
    const current = session.current
    if (current?.access === access && current.edit.id === latest.edit?.sessionId && !current.submitted) return true
    if (latest.readOnly || latest.disabled || latest.edit?.phase === 'pending') return false
    const result = access.begin()
    if (result.status !== 'started') return false
    session.current = { access, edit: result.session, submitted: false }
    return true
  }

  const change = (value: T) => {
    if (!begin()) return null
    return session.current!.edit.change(value)
  }

  const commit = async (value: T) => {
    const changed = change(value)
    if (!changed || changed.status === 'ignored') return
    if (changed.status === 'invalid') throw new Error(changed.error.message)
    const current = session.current!
    current.submitted = true
    const result = await current.edit.commit()
    // Target changes and external updates never allow an old response to write UI state.
    if (session.current !== current) return
    session.current = null
    resultCallback.current?.(result)
    if (result.status === 'rejected') throw new Error(result.error.message)
  }

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
      return commit(value as T)
    },
    onCancel: cancel,
  })

  if (!validWidget) throw new Error(`PropertyField cannot render ${descriptor.kind} with ${selectedWidget}.`)
  const pending = snapshot.edit?.phase === 'pending' || editor.phase === 'pending'
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
    'aria-invalid': !!error,
    'aria-busy': pending,
    disabled: snapshot.disabled,
    readOnly: snapshot.readOnly || pending,
  }
  const choose = (value: T | null) => {
    if (value !== null)
      void commit(value).catch(() => {
        /* The access snapshot owns the displayed host rejection. */
      })
  }

  return (
    <PropertyRow
      {...rowProps}
      data-property-kind={descriptor.kind}
      data-edit-phase={pending ? 'pending' : editor.phase}>
      <PropertyLabel id={`${id}-label`} htmlFor={id}>
        {label ?? descriptor.label}
      </PropertyLabel>
      <PropertyControl association="control">
        {descriptor.kind === 'string' &&
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
        {descriptor.kind === 'boolean' && (
          <Checkbox
            {...common}
            checked={mixed ? 'indeterminate' : (snapshot.value as boolean)}
            onCheckedChange={(value) => choose(value as T)}
          />
        )}
        {descriptor.kind === 'enum' &&
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

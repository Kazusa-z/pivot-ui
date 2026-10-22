import type {
  BeginEditResult,
  EditCancelReason,
  EditChangeResult,
  EditResult,
  EditSession,
  PropertyAccess,
  PropertyDescriptor,
  PropertyError,
  PropertySnapshot,
  PropertyTarget,
} from '../../src/contracts'
import type { PropertyValue } from '../../src/values'

export interface MockPropertyOptions<T extends PropertyValue> {
  readonly target: PropertyTarget
  readonly descriptor: PropertyDescriptor<T>
  readonly value: T
  readonly revision?: number
  readonly delayMs?: number
}

export interface MockPropertySnapshot<T extends PropertyValue> extends PropertySnapshot<T> {
  readonly historyCount: number
}

export interface MockHistoryEntry<T extends PropertyValue> {
  readonly transactionId: string
  readonly sessionId: string
  readonly target: PropertyTarget
  readonly previousValue: T
  readonly value: T
  readonly revision: number
}

export interface MockPropertyAccess<T extends PropertyValue> extends PropertyAccess<T> {
  getSnapshot(): MockPropertySnapshot<T>
  getHistory(): readonly MockHistoryEntry<T>[]
  setDelay(milliseconds: number): void
  rejectNext(message?: string): void
  /** Older or duplicate revisions are ignored. The default revision is the current revision + 1. */
  externalUpdate(value: T, revision?: number): boolean
  setAvailability(state: { readOnly?: boolean; disabled?: boolean; reason?: string | null }): void
  /** Restores initial availability, clears history/errors, and advances the revision. Delay is retained. */
  reset(value?: T): void
}

interface SessionRecord<T extends PropertyValue> {
  readonly id: string
  readonly generation: number
  readonly epoch: number
  readonly baseRevision: number
  readonly initialValue: T
  previewValue: T
  phase: 'editing' | 'pending' | 'ended'
  promise: Promise<EditResult<T>> | null
  resolve: ((result: EditResult<T>) => void) | null
  result: EditResult<T> | null
}

let nextAccessId = 0

function copyDescriptor<T extends PropertyValue>(descriptor: PropertyDescriptor<T>): PropertyDescriptor<T> {
  const source = descriptor as PropertyDescriptor
  const base = {
    id: source.id,
    label: source.label,
    description: source.description,
    readOnly: source.readOnly,
    disabled: source.disabled,
    unavailableReason: source.unavailableReason,
  }
  switch (source.kind) {
    case 'number': {
      const rules = source.constraints
      const constraints = rules
        ? Object.freeze({
            min: rules.min,
            max: rules.max,
            softMin: rules.softMin,
            softMax: rules.softMax,
            step: rules.step,
            dragStep: rules.dragStep,
            precision: rules.precision,
          })
        : undefined
      if (
        (rules?.min !== undefined && !Number.isFinite(rules.min)) ||
        (rules?.max !== undefined && !Number.isFinite(rules.max)) ||
        (rules?.min !== undefined && rules.max !== undefined && rules.min > rules.max)
      ) {
        throw new Error('Numeric hard limits must be finite and min must not exceed max.')
      }
      return Object.freeze({ ...base, kind: 'number', unit: source.unit, constraints }) as PropertyDescriptor<T>
    }
    case 'enum': {
      const keys = new Set<string>()
      const values = new Set<PropertyValue>()
      const options = source.options.map((option) => {
        if (!option.key || keys.has(option.key) || values.has(option.value)) {
          throw new Error('Enum options require unique nonempty keys and unique values.')
        }
        if (
          (typeof option.value !== 'string' && typeof option.value !== 'number') ||
          (typeof option.value === 'number' && !Number.isFinite(option.value))
        ) {
          throw new Error('Enum option values must be strings or finite numbers.')
        }
        keys.add(option.key)
        values.add(option.value)
        return Object.freeze({
          key: option.key,
          label: option.label,
          value: option.value,
          disabled: option.disabled,
          disabledReason: option.disabledReason,
        })
      })
      return Object.freeze({ ...base, kind: 'enum', options: Object.freeze(options) }) as PropertyDescriptor<T>
    }
    case 'boolean':
    case 'string':
      return Object.freeze({ ...base, kind: source.kind }) as PropertyDescriptor<T>
  }
}

function validateValue(
  descriptor: PropertyDescriptor,
  value: PropertyValue,
  allowDisabledOption = false
): string | null {
  switch (descriptor.kind) {
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) return 'Expected a finite number.'
      if (descriptor.constraints?.min !== undefined && value < descriptor.constraints.min) {
        return `Value must be at least ${descriptor.constraints.min}.`
      }
      if (descriptor.constraints?.max !== undefined && value > descriptor.constraints.max) {
        return `Value must be at most ${descriptor.constraints.max}.`
      }
      return null
    case 'string':
      return typeof value === 'string' ? null : 'Expected a string.'
    case 'boolean':
      return typeof value === 'boolean' ? null : 'Expected a boolean.'
    case 'enum': {
      const option = descriptor.options.find((item) => Object.is(item.value, value))
      if (!option) return 'Value does not match an enum option.'
      if (option.disabled && !allowDisabledOption) return option.disabledReason ?? 'This option is disabled.'
      return null
    }
  }
}

function assertRevision(revision: number): void {
  if (!Number.isSafeInteger(revision) || revision < 0) throw new Error('Revision must be a nonnegative safe integer.')
}

function assertDelay(delay: number): void {
  if (!Number.isInteger(delay) || delay < 0 || delay > 2_147_483_647) {
    throw new Error('Delay must be an integer between 0 and 2147483647 milliseconds.')
  }
}

/** Story-only in-memory host. It is deliberately absent from the component package exports. */
export function createMockPropertyAccess<T extends PropertyValue>(
  options: MockPropertyOptions<T>
): MockPropertyAccess<T> {
  const target = Object.freeze({ objectId: options.target.objectId, propertyId: options.target.propertyId })
  if (target.propertyId !== options.descriptor.id) throw new Error('Descriptor id must match target.propertyId.')
  const descriptor = copyDescriptor(options.descriptor)
  const validationDescriptor = descriptor as PropertyDescriptor
  const assertValue = (value: T) => {
    const message = validateValue(validationDescriptor, value, true)
    if (message) throw new Error(message)
  }
  assertValue(options.value)

  const accessId = ++nextAccessId
  const initialValue = options.value
  const initialAvailability = Object.freeze({
    readOnly: descriptor.readOnly ?? false,
    disabled: descriptor.disabled ?? false,
    reason: descriptor.unavailableReason ?? null,
  })
  let authoritativeValue = initialValue
  let revision = options.revision ?? 0
  let delay = options.delayMs ?? 0
  assertRevision(revision)
  assertDelay(delay)
  let readOnly = initialAvailability.readOnly
  let disabled = initialAvailability.disabled
  let unavailableReason = initialAvailability.reason
  let generation = 0
  let epoch = 0
  let active: SessionRecord<T> | null = null
  let error: PropertyError | null = null
  let nextRejection: PropertyError | null = null
  let history: readonly MockHistoryEntry<T>[] = Object.freeze([])
  const listeners = new Set<() => void>()

  const makeSnapshot = (): MockPropertySnapshot<T> =>
    Object.freeze({
      target,
      descriptor,
      value: authoritativeValue,
      revision,
      readOnly,
      disabled,
      unavailableReason,
      edit:
        active && active.phase !== 'ended'
          ? Object.freeze({ sessionId: active.id, phase: active.phase, previewValue: active.previewValue })
          : null,
      error,
      historyCount: history.length,
    })

  let snapshot = makeSnapshot()
  const publish = () => {
    snapshot = makeSnapshot()
    for (const listener of [...listeners]) listener()
  }

  const resultBase = (record: SessionRecord<T>) => ({
    target,
    sessionId: record.id,
    value: authoritativeValue,
    revision,
  })

  const terminalPromise = (record: SessionRecord<T>): Promise<EditResult<T>> => {
    if (record.promise) return record.promise
    record.promise = new Promise<EditResult<T>>((resolve) => {
      record.resolve = resolve
    })
    return record.promise
  }

  const settle = (record: SessionRecord<T>, result: EditResult<T>, notify = true): Promise<EditResult<T>> => {
    const promise = terminalPromise(record)
    if (record.result) return promise
    record.result = Object.freeze(result)
    record.phase = 'ended'
    const wasActive = active === record
    if (wasActive) active = null
    try {
      if (notify && wasActive) publish()
    } finally {
      record.resolve?.(record.result)
    }
    return promise
  }

  const cancel = (
    record: SessionRecord<T>,
    reason: EditCancelReason = 'escape',
    notify = true
  ): Promise<EditResult<T>> => {
    // A submitted request survives UI teardown. Its original promise remains the only terminal result.
    if (record.promise) return record.promise
    return settle(record, { ...resultBase(record), status: 'cancelled', reason }, notify)
  }

  const change = (record: SessionRecord<T>, value: T): EditChangeResult<T> => {
    if (record.phase !== 'editing') {
      return Object.freeze({ status: 'ignored', reason: record.phase === 'pending' ? 'pending' : 'ended' })
    }
    const message = validateValue(validationDescriptor, value)
    if (message) {
      const validationError: PropertyError = Object.freeze({ code: 'invalid-value', message })
      error = validationError
      publish()
      return Object.freeze({ status: 'invalid', error: validationError })
    }
    const unchanged = Object.is(record.previewValue, value)
    const hadError = error !== null
    record.previewValue = value
    error = null
    if (!unchanged || hadError) publish()
    return Object.freeze({ status: unchanged ? 'unchanged' : 'changed', value })
  }

  const commit = (record: SessionRecord<T>): Promise<EditResult<T>> => {
    if (record.promise) return record.promise
    // Reserve the terminal promise before any publish: a synchronous listener can call commit again.
    const promise = terminalPromise(record)
    record.phase = 'pending'
    if (Object.is(record.previewValue, record.initialValue)) {
      settle(record, { ...resultBase(record), status: 'unchanged' })
      return promise
    }
    const rejection = nextRejection
    nextRejection = null
    const acknowledge = () => {
      if (record.epoch !== epoch) {
        settle(record, { ...resultBase(record), status: 'superseded', reason: 'reset' })
      } else if (record.baseRevision !== revision) {
        settle(record, { ...resultBase(record), status: 'superseded', reason: 'external-update' })
      } else if (record.generation !== generation) {
        settle(record, { ...resultBase(record), status: 'superseded', reason: 'new-session' })
      } else if (rejection) {
        error = rejection
        settle(record, { ...resultBase(record), status: 'rejected', error: rejection })
      } else {
        const message = validateValue(validationDescriptor, record.previewValue)
        if (message) {
          error = Object.freeze({ code: 'invalid-value', message })
          settle(record, { ...resultBase(record), status: 'rejected', error })
          return
        }
        const transactionId = `${record.id}:commit`
        const previousValue = authoritativeValue
        if (!Number.isSafeInteger(revision + 1)) {
          error = Object.freeze({ code: 'rejected', message: 'The mock revision counter is exhausted.' })
          settle(record, { ...resultBase(record), status: 'rejected', error })
          return
        }
        authoritativeValue = record.previewValue
        revision += 1
        error = null
        history = Object.freeze([
          ...history,
          Object.freeze({
            transactionId,
            sessionId: record.id,
            target,
            previousValue,
            value: authoritativeValue,
            revision,
          }),
        ])
        settle(record, { ...resultBase(record), status: 'committed', transactionId })
      }
    }
    if (delay === 0) {
      acknowledge()
    } else {
      setTimeout(acknowledge, delay)
      publish()
    }
    return promise
  }

  const begin = (): BeginEditResult<T> => {
    if (disabled || readOnly) {
      const reason = disabled ? 'disabled' : 'read-only'
      return Object.freeze({ status: 'unavailable', reason, message: unavailableReason ?? `Property is ${reason}.` })
    }
    if (active?.phase === 'editing') cancel(active, 'superseded', false)
    generation += 1
    const record: SessionRecord<T> = {
      id: `mock-${accessId}-edit-${generation}`,
      generation,
      epoch,
      baseRevision: revision,
      initialValue: authoritativeValue,
      previewValue: authoritativeValue,
      phase: 'editing',
      promise: null,
      resolve: null,
      result: null,
    }
    active = record
    error = null
    const session: EditSession<T> = Object.freeze({
      id: record.id,
      target,
      baseRevision: record.baseRevision,
      initialValue: record.initialValue,
      change: (value: T) => change(record, value),
      commit: () => commit(record),
      cancel: (reason?: EditCancelReason) => cancel(record, reason),
    })
    publish()
    return Object.freeze({ status: 'started', session })
  }

  return Object.freeze({
    getSnapshot: () => snapshot,
    getHistory: () => history,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    begin,
    setDelay(milliseconds: number) {
      assertDelay(milliseconds)
      delay = milliseconds
    },
    rejectNext(message = 'The mock host rejected this edit.') {
      nextRejection = Object.freeze({ code: 'rejected', message })
    },
    externalUpdate(value: T, nextRevision = revision + 1) {
      assertRevision(nextRevision)
      if (nextRevision <= revision) return false
      assertValue(value)
      authoritativeValue = value
      revision = nextRevision
      if (active?.phase === 'editing') cancel(active, 'external-update', false)
      active = null
      error = null
      publish()
      return true
    },
    setAvailability(state: { readOnly?: boolean; disabled?: boolean; reason?: string | null }) {
      const nextReadOnly = state.readOnly ?? readOnly
      const nextDisabled = state.disabled ?? disabled
      const nextReason = state.reason === undefined ? unavailableReason : state.reason
      if (nextReadOnly === readOnly && nextDisabled === disabled && nextReason === unavailableReason) return
      readOnly = nextReadOnly
      disabled = nextDisabled
      unavailableReason = nextReason
      if (active?.phase === 'editing' && (readOnly || disabled)) {
        cancel(active, disabled ? 'disabled' : 'read-only', false)
      }
      publish()
    },
    reset(value = initialValue) {
      assertValue(value)
      assertRevision(revision + 1)
      epoch += 1
      authoritativeValue = value
      revision += 1
      if (active?.phase === 'editing') cancel(active, 'reset', false)
      active = null
      readOnly = initialAvailability.readOnly
      disabled = initialAvailability.disabled
      unavailableReason = initialAvailability.reason
      history = Object.freeze([])
      error = null
      nextRejection = null
      publish()
    },
  })
}

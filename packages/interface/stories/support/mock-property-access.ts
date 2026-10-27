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
import type { PropertyDescriptorSchema, PropertyNumericAxis, PropertyValueAdapter } from '../../src/contracts/property'
import { clonePropertyData, arePropertyDataEqual } from '../../src/values/property-data'
import type { NumericConstraints } from '../../src/values/numeric'
import { validatePartition } from '../../src/values/partition'
import { assertColorValue } from '../../src/values/color'
import { assertColorRampValue, assertColorAlphaRampValue } from '../../src/values/color-ramp'
import { assertColorDistributionValue } from '../../src/values/color-distribution'
import { assertCurveValue } from '../../src/values/curve'
import { assertNumericDistributionValue } from '../../src/values/numeric-distribution'

interface MockPropertyOptionsBase<T> {
  readonly target: PropertyTarget
  readonly value: T
  readonly revision?: number
  readonly delayMs?: number
}
export type MockPropertyOptions<T> = MockPropertyOptionsBase<T> &
  (
    | {
        readonly descriptor: Exclude<PropertyDescriptor<T>, { kind: 'custom' }>
        readonly adapter?: PropertyValueAdapter<T>
      }
    | {
        readonly descriptor: Extract<PropertyDescriptor<T>, { kind: 'custom' }>
        readonly adapter: PropertyValueAdapter<T>
      }
  )

export interface MockPropertySnapshot<T> extends PropertySnapshot<T> {
  readonly historyCount: number
}

export interface MockHistoryEntry<T> {
  readonly transactionId: string
  readonly sessionId: string
  readonly target: PropertyTarget
  readonly previousValue: T
  readonly value: T
  readonly revision: number
}

export interface MockPropertyAccess<T> extends PropertyAccess<T> {
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

interface SessionRecord<T> {
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

function assertNumericRules(rules: NumericConstraints = {}): void {
  for (const key of ['min', 'max', 'softMin', 'softMax', 'step', 'dragStep', 'precision'] as const) {
    const value = rules[key]
    if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value)))
      throw new TypeError('Numeric constraints must be finite numbers.')
  }
  if ((rules.min ?? -Infinity) > (rules.max ?? Infinity) || (rules.softMin ?? -Infinity) > (rules.softMax ?? Infinity))
    throw new RangeError('Numeric limits must be ordered.')
  for (const step of [rules.step, rules.dragStep])
    if (step !== undefined && step <= 0) throw new RangeError('Numeric steps must be positive.')
  if (
    rules.precision !== undefined &&
    (!Number.isInteger(rules.precision) || rules.precision < 0 || rules.precision > 15)
  )
    throw new RangeError('Numeric precision must be an integer between 0 and 15.')
}

function geometryFields(kind: 'vector2' | 'vector3' | 'vector4' | 'rect'): readonly string[] {
  switch (kind) {
    case 'vector2':
      return ['x', 'y']
    case 'vector3':
      return ['x', 'y', 'z']
    case 'vector4':
      return ['x', 'y', 'z', 'w']
    case 'rect':
      return ['x', 'y', 'width', 'height']
  }
}

function copyDescriptor<T>(descriptor: PropertyDescriptor<T>): PropertyDescriptor<T> {
  const snapshot = clonePropertyData(descriptor)
  const source = snapshot as PropertyDescriptorSchema
  if (!source.id?.trim() || typeof source.label !== 'string')
    throw new TypeError('Property descriptors require a nonempty id and a text label.')
  for (const text of [source.description, source.unavailableReason])
    if (text !== undefined && typeof text !== 'string')
      throw new TypeError('Property descriptor labels and descriptions must be text.')
  for (const flag of [source.readOnly, source.disabled])
    if (flag !== undefined && typeof flag !== 'boolean')
      throw new TypeError('Property descriptor availability must be boolean.')
  function axes(items: readonly (Partial<PropertyNumericAxis> & { readonly key: string })[], geometry = false) {
    if (
      !Array.isArray(items) ||
      (!geometry && !items.length) ||
      new Set(items.map((axis) => axis.key)).size !== items.length ||
      items.some(
        (axis) => !axis.key?.trim() || (typeof axis.label !== 'string' && (!geometry || axis.label !== undefined))
      )
    )
      throw new TypeError('Numeric axes require unique nonempty keys and text labels.')
    for (const axis of items) {
      assertNumericRules(axis)
      if (axis.unit !== undefined && typeof axis.unit !== 'string')
        throw new TypeError('Numeric axis units must be text.')
      for (const flag of [axis.disabled, axis.readOnly])
        if (flag !== undefined && typeof flag !== 'boolean')
          throw new TypeError('Numeric axis availability must be boolean.')
    }
  }
  switch (source.kind) {
    case 'number':
    case 'numeric-distribution':
      assertNumericRules(source.constraints)
      break
    case 'vector2':
    case 'vector3':
    case 'vector4':
    case 'rect':
      assertNumericRules(source.constraints)
      if (source.axes !== undefined) {
        axes(source.axes, true)
        const fields = geometryFields(source.kind)
        if (source.axes.some((axis) => !fields.includes(axis.key)))
          throw new TypeError('Geometry axes must name fields in the value shape.')
      }
      break
    case 'numeric-tuple':
      assertNumericRules(source.constraints)
      axes(source.axes)
      break
    case 'partition':
      for (const number of [source.constraints?.total, source.constraints?.minSegment])
        if (number !== undefined && (!Number.isFinite(number) || number < 0))
          throw new TypeError('Partition constraints must be finite and nonnegative.')
      break
    case 'enum':
    case 'multi-enum': {
      if (!Array.isArray(source.options)) throw new TypeError('Enum options must be an array.')
      const keys = new Set<string>(),
        values = new Set<string | number>()
      for (const option of source.options) {
        if (!option.key?.trim() || keys.has(option.key) || values.has(option.value))
          throw new Error('Enum options require unique nonempty keys and unique values.')
        if (
          typeof option.label !== 'string' ||
          (typeof option.value !== 'string' && (typeof option.value !== 'number' || !Number.isFinite(option.value)))
        )
          throw new Error('Enum options require text labels and strings or finite number values.')
        keys.add(option.key)
        values.add(option.value)
      }
      break
    }
    case 'color':
    case 'color-ramp':
    case 'color-alpha-ramp':
    case 'color-distribution':
      if (source.hdr !== undefined && typeof source.hdr !== 'boolean')
        throw new TypeError('HDR metadata must be boolean.')
      break
    case 'curve':
      if (source.bounds) {
        for (const value of Object.values(source.bounds))
          if (value !== undefined && !Number.isFinite(value))
            throw new TypeError('Curve editing bounds must be finite.')
        if (
          (source.bounds.xMin ?? -Infinity) > (source.bounds.xMax ?? Infinity) ||
          (source.bounds.yMin ?? -Infinity) > (source.bounds.yMax ?? Infinity)
        )
          throw new TypeError('Curve editing bounds must be ordered.')
      }
      break
    case 'resource':
      if (
        source.kinds !== undefined &&
        (!Array.isArray(source.kinds) || source.kinds.some((kind) => typeof kind !== 'string' || !kind.trim()))
      )
        throw new TypeError('Resource kinds must be nonempty strings.')
      if (source.groupId !== undefined && (typeof source.groupId !== 'string' || !source.groupId.trim()))
        throw new TypeError('Resource group ID must be a nonempty string.')
      break
    case 'collection':
      for (const count of [source.minItems, source.maxItems])
        if (count !== undefined && (!Number.isSafeInteger(count) || count < 0))
          throw new TypeError('Collection limits must be nonnegative safe integers.')
      if ((source.minItems ?? 0) > (source.maxItems ?? Infinity))
        throw new TypeError('Collection limits must be ordered.')
      for (const field of [source.keyField, source.labelField])
        if (field !== undefined && (typeof field !== 'string' || !field.trim()))
          throw new TypeError('Collection fields must be nonempty strings.')
      break
    case 'custom':
      if (typeof source.schema !== 'string' || !source.schema.trim())
        throw new TypeError('Custom properties require an explicit schema name.')
      break
    case 'boolean':
    case 'string':
      break
    default:
      throw new TypeError('Unknown property descriptor kind.')
  }
  return snapshot
}

function validateValue(
  descriptor: PropertyDescriptorSchema,
  value: unknown,
  allowDisabledOption = false
): string | null {
  function number(candidate: unknown, constraints: NumericConstraints = {}) {
    if (typeof candidate !== 'number' || !Number.isFinite(candidate)) throw new TypeError('Expected a finite number.')
    if (constraints.min !== undefined && candidate < constraints.min)
      throw new RangeError(`Value must be at least ${constraints.min}.`)
    if (constraints.max !== undefined && candidate > constraints.max)
      throw new RangeError(`Value must be at most ${constraints.max}.`)
  }
  try {
    switch (descriptor.kind) {
      case 'number':
        number(value, descriptor.constraints)
        break
      case 'string':
        if (typeof value !== 'string') return 'Expected a string.'
        break
      case 'boolean':
        if (typeof value !== 'boolean') return 'Expected a boolean.'
        break
      case 'enum':
      case 'multi-enum': {
        const values = descriptor.kind === 'multi-enum' ? value : [value]
        if (!Array.isArray(values)) return 'Expected an array of enum values.'
        if (new Set(values).size !== values.length) return 'Selected enum values must be unique.'
        for (const value of values) {
          const option = descriptor.options.find((item) => Object.is(item.value, value))
          if (!option) return 'Value does not match an enum option.'
          if (option.disabled && !allowDisabledOption) return option.disabledReason ?? 'This option is disabled.'
        }
        break
      }
      case 'vector2':
      case 'vector3':
      case 'vector4':
      case 'rect': {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Expected a geometry object.'
        geometryFields(descriptor.kind).forEach((key) =>
          number((value as Record<string, unknown>)[key], {
            ...descriptor.constraints,
            ...descriptor.axes?.find((axis) => axis.key === key),
          })
        )
        break
      }
      case 'numeric-tuple':
        if (!Array.isArray(value) || value.length !== descriptor.axes.length)
          return 'Numeric tuple length must match its axes.'
        value.forEach((item, index) => number(item, { ...descriptor.constraints, ...descriptor.axes[index] }))
        break
      case 'partition':
        if (!Array.isArray(value) || value.length < 2) return 'A partition requires at least two numeric segments.'
        value.forEach((item) => number(item))
        validatePartition(value as number[], descriptor.constraints)
        break
      case 'color':
        assertColorValue(value, { hdr: descriptor.hdr })
        break
      case 'color-ramp':
        assertColorRampValue(value, { hdr: descriptor.hdr })
        break
      case 'color-alpha-ramp':
        assertColorAlphaRampValue(value, { hdr: descriptor.hdr })
        break
      case 'color-distribution':
        assertColorDistributionValue(value, { hdr: descriptor.hdr })
        break
      case 'curve':
        assertCurveValue(value)
        break
      case 'numeric-distribution':
        assertNumericDistributionValue(value)
        if (value.mode === 'constant') number(value.value, descriptor.constraints)
        if (value.mode === 'two-constant') value.values.forEach((item) => number(item, descriptor.constraints))
        break
      case 'resource':
        if (value !== null && (typeof value !== 'string' || !value.trim()))
          return 'Expected a nonempty asset ID or null.'
        break
      case 'collection': {
        if (!Array.isArray(value)) return 'Expected a collection array.'
        if (value.length < (descriptor.minItems ?? 0) || value.length > (descriptor.maxItems ?? Infinity))
          return 'Collection size is outside its allowed range.'
        const keys = new Set<string | number>()
        for (const item of value) {
          const key: unknown = descriptor.keyField
            ? item && typeof item === 'object'
              ? item[descriptor.keyField]
              : undefined
            : item
          if (
            (typeof key !== 'string' && typeof key !== 'number') ||
            (typeof key === 'string' && !key.length) ||
            (typeof key === 'number' && !Number.isFinite(key))
          )
            return 'Collection items need stable nonempty string or finite number keys.'
          if (keys.has(key)) return 'Collection item keys must be unique.'
          keys.add(key)
          if (
            descriptor.labelField &&
            (!item || typeof item !== 'object' || typeof item[descriptor.labelField] !== 'string')
          )
            return 'Collection labels must be strings.'
        }
        break
      }
      case 'custom':
        break
    }
    return null
  } catch (cause) {
    return cause instanceof Error ? cause.message : String(cause)
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

/** 为 Storybook 提供可订阅的内存属性数据，演示预览、保存、拒绝和外部更新。生产应用可按 PropertyAccess 接口实现自己的数据服务。 */
export function createMockPropertyAccess<T>(options: MockPropertyOptions<T>): MockPropertyAccess<T> {
  const target = Object.freeze({ objectId: options.target.objectId, propertyId: options.target.propertyId })
  if (!target.objectId?.trim() || !target.propertyId?.trim())
    throw new TypeError('Property targets require nonempty object and property IDs.')
  if (target.propertyId !== options.descriptor.id) throw new Error('Descriptor id must match target.propertyId.')
  const descriptor = copyDescriptor(options.descriptor)
  const validationDescriptor = descriptor as PropertyDescriptorSchema
  if (validationDescriptor.kind === 'custom' && !options.adapter)
    throw new TypeError('Custom properties require an explicit host value adapter.')
  const copyValue = (value: T): T => clonePropertyData(options.adapter?.clone ? options.adapter.clone(value) : value)
  const equalValues = (first: T, second: T) => {
    const result = options.adapter?.equals ? options.adapter.equals(first, second) : arePropertyDataEqual(first, second)
    if (typeof result !== 'boolean') throw new TypeError('A property equality adapter must return a boolean.')
    return result
  }
  const valueError = (value: T, allowDisabled = false): string | null => {
    try {
      return validateValue(validationDescriptor, value, allowDisabled) ?? options.adapter?.validate?.(value) ?? null
    } catch (cause) {
      return cause instanceof Error ? cause.message : String(cause)
    }
  }
  const assertValue = (value: T) => {
    const message = valueError(value, true)
    if (message) throw new Error(message)
  }

  const accessId = ++nextAccessId
  const initialValue = copyValue(options.value)
  assertValue(initialValue)
  const initialAvailability = Object.freeze({
    readOnly: descriptor.readOnly ?? false,
    disabled: descriptor.disabled ?? false,
    reason: descriptor.unavailableReason ?? null,
  })
  let authoritativeValue = initialValue
  let revision = options.revision ?? 0
  let committedSessionId: string | undefined
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
      committedSessionId,
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
    let copied: T
    let message: string | null
    let unchanged = false
    try {
      copied = copyValue(value)
      message = valueError(copied)
      if (!message) unchanged = equalValues(record.previewValue, copied)
    } catch (cause) {
      message = cause instanceof Error ? cause.message : String(cause)
    }
    if (message) {
      const validationError: PropertyError = Object.freeze({ code: 'invalid-value', message })
      error = validationError
      publish()
      return Object.freeze({ status: 'invalid', error: validationError })
    }
    const hadError = error !== null
    if (!unchanged) record.previewValue = copied!
    error = null
    if (!unchanged || hadError) publish()
    return Object.freeze({ status: unchanged ? 'unchanged' : 'changed', value: record.previewValue })
  }

  const commit = (record: SessionRecord<T>): Promise<EditResult<T>> => {
    if (record.promise) return record.promise
    // Reserve the terminal promise before any publish: a synchronous listener can call commit again.
    const promise = terminalPromise(record)
    record.phase = 'pending'
    let unchanged: boolean
    try {
      unchanged = equalValues(record.previewValue, record.initialValue)
    } catch (cause) {
      error = Object.freeze({ code: 'invalid-value', message: cause instanceof Error ? cause.message : String(cause) })
      settle(record, { ...resultBase(record), status: 'rejected', error })
      return promise
    }
    if (unchanged) {
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
        const message = valueError(record.previewValue)
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
        committedSessionId = record.id
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
      const copied = copyValue(value)
      assertValue(copied)
      authoritativeValue = copied
      revision = nextRevision
      committedSessionId = undefined
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
      const copied = copyValue(value)
      assertValue(copied)
      assertRevision(revision + 1)
      epoch += 1
      authoritativeValue = copied
      revision += 1
      committedSessionId = undefined
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

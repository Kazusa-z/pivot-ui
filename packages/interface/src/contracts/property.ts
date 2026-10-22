import type { ChoiceOption, ChoiceValue, NumericConstraints, PropertyValue } from '../values'

export interface PropertyTarget {
  readonly objectId: string
  readonly propertyId: string
}

interface PropertyDescriptorBase {
  readonly id: string
  readonly label: string
  readonly description?: string
  readonly readOnly?: boolean
  readonly disabled?: boolean
  readonly unavailableReason?: string
}

/** Describes data; labels are plain text and contain no rendering or host implementation. */
export type PropertyDescriptor<T extends PropertyValue = PropertyValue> = PropertyDescriptorBase &
  (
    | (Extract<T, number> extends never
        ? never
        : { readonly kind: 'number'; readonly constraints?: NumericConstraints; readonly unit?: string })
    | (Extract<T, string> extends never ? never : { readonly kind: 'string' })
    | (Extract<T, boolean> extends never ? never : { readonly kind: 'boolean' })
    | (Extract<T, ChoiceValue> extends never
        ? never
        : { readonly kind: 'enum'; readonly options: readonly ChoiceOption<Extract<T, ChoiceValue>>[] })
  )

export interface PropertyError {
  readonly code: 'invalid-value' | 'rejected'
  readonly message: string
}

export interface PropertyEditPreview<T extends PropertyValue> {
  readonly sessionId: string
  readonly phase: 'editing' | 'pending'
  readonly previewValue: T
}

/** value/revision are authoritative. A preview never advances the authoritative revision. */
export interface PropertySnapshot<T extends PropertyValue = PropertyValue> {
  readonly target: PropertyTarget
  readonly descriptor: PropertyDescriptor<T>
  readonly value: T
  readonly revision: number
  readonly readOnly: boolean
  readonly disabled: boolean
  readonly unavailableReason: string | null
  readonly edit: PropertyEditPreview<T> | null
  readonly error: PropertyError | null
}

export type EditCancelReason =
  | 'escape'
  | 'pointer-cancel'
  | 'window-blur'
  | 'target-change'
  | 'unmount'
  | 'read-only'
  | 'disabled'
  | 'superseded'
  | 'external-update'
  | 'reset'

export type EditEndReason = 'enter' | 'blur' | 'pointer-up' | 'step' | EditCancelReason

export function getEditEndAction(reason: EditEndReason): 'commit' | 'cancel' {
  switch (reason) {
    case 'enter':
    case 'blur':
    case 'pointer-up':
    case 'step':
      return 'commit'
    default:
      return 'cancel'
  }
}

interface EditResultBase<T extends PropertyValue> {
  readonly sessionId: string
  readonly target: PropertyTarget
  /** Latest authoritative value and revision at the time this result was settled. */
  readonly value: T
  readonly revision: number
}

export type EditResult<T extends PropertyValue = PropertyValue> = EditResultBase<T> &
  (
    | { readonly status: 'committed'; readonly transactionId: string }
    | { readonly status: 'unchanged' }
    | { readonly status: 'cancelled'; readonly reason: EditCancelReason }
    | { readonly status: 'rejected'; readonly error: PropertyError }
    | { readonly status: 'superseded'; readonly reason: 'external-update' | 'new-session' | 'reset' }
  )

export type EditChangeResult<T extends PropertyValue = PropertyValue> =
  | { readonly status: 'changed' | 'unchanged'; readonly value: T }
  | { readonly status: 'invalid'; readonly error: PropertyError }
  | { readonly status: 'ignored'; readonly reason: 'pending' | 'ended' }

export interface EditSession<T extends PropertyValue = PropertyValue> {
  readonly id: string
  readonly target: PropertyTarget
  readonly baseRevision: number
  readonly initialValue: T
  change(value: T): EditChangeResult<T>
  /** The first terminal request wins. Every later commit/cancel returns the identical promise. */
  commit(): Promise<EditResult<T>>
  /** After commit starts, cancellation cannot retract the submitted request. */
  cancel(reason?: EditCancelReason): Promise<EditResult<T>>
}

export type BeginEditResult<T extends PropertyValue = PropertyValue> =
  | { readonly status: 'started'; readonly session: EditSession<T> }
  | { readonly status: 'unavailable'; readonly reason: 'read-only' | 'disabled'; readonly message: string }

export interface PropertyAccess<T extends PropertyValue = PropertyValue> {
  /** Returns the same immutable object until observable state changes. */
  getSnapshot(): PropertySnapshot<T>
  subscribe(listener: () => void): () => void
  /** Captures this access object's target and current revision for the entire session. */
  begin(): BeginEditResult<T>
}

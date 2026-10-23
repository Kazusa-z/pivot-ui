import type { ChoiceOption, ChoiceValue, NumericConstraints, PropertyValue } from '../values'
import type { Vector2, Vector3, Vector4, Rect } from '../values/geometry'
import type { DistributionConstraints } from '../values/distribution'
import type { ColorValue } from '../values/color'
import type { ColorRampValue, ColorRampChannelsValue } from '../values/color-ramp'
import type { ColorDistributionValue } from '../values/color-distribution'
import type { CurveValue, CurveViewport } from '../values/curve'
import type { NumericDistributionValue } from '../values/numeric-distribution'
import type { PropertyData } from '../values/property-data'

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
export interface PropertyNumericAxis extends NumericConstraints {
  readonly key: string
  readonly label: string
  readonly unit?: string
  readonly disabled?: boolean
  readonly readOnly?: boolean
}
type NumericShapeDescriptor<Key extends string> = {
  readonly constraints?: NumericConstraints
  /** Optional per-field overrides; order is irrelevant and omitted axes use the shared constraints. */
  readonly axes?: readonly (Partial<PropertyNumericAxis> & { readonly key: Key })[]
}
type DescriptorSchemas =
  | { readonly kind: 'number'; readonly constraints?: NumericConstraints; readonly unit?: string }
  | { readonly kind: 'string' }
  | { readonly kind: 'boolean' }
  | { readonly kind: 'enum'; readonly options: readonly ChoiceOption[] }
  | { readonly kind: 'multi-enum'; readonly options: readonly ChoiceOption[] }
  | ({ readonly kind: 'vector2' } & NumericShapeDescriptor<keyof Vector2>)
  | ({ readonly kind: 'vector3' } & NumericShapeDescriptor<keyof Vector3>)
  | ({ readonly kind: 'vector4' } & NumericShapeDescriptor<keyof Vector4>)
  | ({ readonly kind: 'rect' } & NumericShapeDescriptor<keyof Rect>)
  | {
      readonly kind: 'numeric-tuple'
      readonly axes: readonly PropertyNumericAxis[]
      readonly constraints?: NumericConstraints
    }
  | { readonly kind: 'distribution'; readonly constraints?: DistributionConstraints }
  | { readonly kind: 'color' | 'color-ramp' | 'color-ramp-channels' | 'color-distribution'; readonly hdr?: boolean }
  | { readonly kind: 'curve'; readonly bounds?: Partial<CurveViewport> }
  | { readonly kind: 'numeric-distribution'; readonly constraints?: NumericConstraints }
  | { readonly kind: 'resource'; readonly kinds?: readonly string[]; readonly groupId?: string }
  | {
      readonly kind: 'collection'
      readonly keyField?: string
      readonly labelField?: string
      readonly minItems?: number
      readonly maxItems?: number
    }
  | { readonly kind: 'custom'; readonly schema: string; readonly metadata?: PropertyData }

/** Runtime schema union for rendering/validation. Metadata is plain data, never React nodes or callbacks. */
export type PropertyDescriptorSchema = PropertyDescriptorBase & DescriptorSchemas
type SchemaKind<K extends DescriptorSchemas['kind']> =
  Extract<DescriptorSchemas, { kind: K }> extends never
    ? Extract<DescriptorSchemas, { kind: string }> & { readonly kind: K }
    : Extract<DescriptorSchemas, { kind: K }>
type Match<T, Shape, Schema> = Extract<T, Shape> extends never ? never : Schema

/** T is inferred from the access value, not widened to unknown. Custom models opt in with an explicit schema. */
export type PropertyDescriptor<T = PropertyValue> = PropertyDescriptorBase &
  (
    | Match<T, number, SchemaKind<'number'>>
    | Match<T, string, SchemaKind<'string'>>
    | Match<T, boolean, SchemaKind<'boolean'>>
    | Match<
        T,
        ChoiceValue,
        { readonly kind: 'enum'; readonly options: readonly ChoiceOption<Extract<T, ChoiceValue>>[] }
      >
    | Match<
        T,
        readonly ChoiceValue[],
        {
          readonly kind: 'multi-enum'
          readonly options: readonly ChoiceOption<
            Extract<T extends readonly (infer Item)[] ? Item : never, ChoiceValue>
          >[]
        }
      >
    | Match<T, Vector2, SchemaKind<'vector2'>>
    | Match<T, Vector3, SchemaKind<'vector3'>>
    | Match<T, Vector4, SchemaKind<'vector4'>>
    | Match<T, Rect, SchemaKind<'rect'>>
    | Match<T, readonly number[], SchemaKind<'numeric-tuple'> | SchemaKind<'distribution'>>
    | Match<T, ColorValue, SchemaKind<'color'>>
    | Match<T, ColorRampValue, SchemaKind<'color-ramp'>>
    | Match<T, ColorRampChannelsValue, SchemaKind<'color-ramp-channels'>>
    | Match<T, ColorDistributionValue, SchemaKind<'color-distribution'>>
    | Match<T, CurveValue, SchemaKind<'curve'>>
    | Match<T, NumericDistributionValue, SchemaKind<'numeric-distribution'>>
    | Match<T, string | null, SchemaKind<'resource'>>
    | (T extends readonly (infer Item)[]
        ? {
            readonly kind: 'collection'
            readonly keyField?: Extract<keyof Item, string>
            readonly labelField?: Extract<keyof Item, string>
            readonly minItems?: number
            readonly maxItems?: number
          }
        : never)
    | SchemaKind<'custom'>
  )

/** Host-side value behavior, separate from the serializable descriptor. Mock copies remain plain and deeply frozen. */
export interface PropertyValueAdapter<T> {
  clone?: (value: T) => T
  equals?: (first: T, second: T) => boolean
  validate?: (value: T) => string | null
}

export interface PropertyError {
  readonly code: 'invalid-value' | 'rejected'
  readonly message: string
}

export interface PropertyEditPreview<T> {
  readonly sessionId: string
  readonly phase: 'editing' | 'pending'
  readonly previewValue: T
}

/** value/revision are authoritative. A preview never advances the authoritative revision. */
export interface PropertySnapshot<T = PropertyValue> {
  readonly target: PropertyTarget
  readonly descriptor: PropertyDescriptor<T>
  readonly value: T
  readonly revision: number
  /** Set only when the current authoritative revision came from this session's successful commit. External updates/reset clear it. */
  readonly committedSessionId?: string
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

interface EditResultBase<T> {
  readonly sessionId: string
  readonly target: PropertyTarget
  /** Latest authoritative value and revision at the time this result was settled. */
  readonly value: T
  readonly revision: number
}

export type EditResult<T = PropertyValue> = EditResultBase<T> &
  (
    | { readonly status: 'committed'; readonly transactionId: string }
    | { readonly status: 'unchanged' }
    | { readonly status: 'cancelled'; readonly reason: EditCancelReason }
    | { readonly status: 'rejected'; readonly error: PropertyError }
    | { readonly status: 'superseded'; readonly reason: 'external-update' | 'new-session' | 'reset' }
  )

export type EditChangeResult<T = PropertyValue> =
  | { readonly status: 'changed' | 'unchanged'; readonly value: T }
  | { readonly status: 'invalid'; readonly error: PropertyError }
  | { readonly status: 'ignored'; readonly reason: 'pending' | 'ended' }

export interface EditSession<T = PropertyValue> {
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

export type BeginEditResult<T = PropertyValue> =
  | { readonly status: 'started'; readonly session: EditSession<T> }
  | { readonly status: 'unavailable'; readonly reason: 'read-only' | 'disabled'; readonly message: string }

export interface PropertyAccess<T = PropertyValue> {
  /** Returns the same immutable object until observable state changes. */
  getSnapshot(): PropertySnapshot<T>
  subscribe(listener: () => void): () => void
  /** Captures this access object's target and current revision for the entire session. */
  begin(): BeginEditResult<T>
}

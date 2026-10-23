import { useEffect, useRef, useSyncExternalStore } from 'react'
import type {
  EditCancelReason,
  EditChangeResult,
  EditResult,
  EditSession,
  PropertyAccess,
  PropertySnapshot,
} from '../contracts/property'

export interface PropertyBindingOptions<T> {
  access: PropertyAccess<T>
  mixed?: boolean
  onEditResult?: (result: EditResult<T>) => void
}

export interface PropertyBinding<T> {
  readonly snapshot: PropertySnapshot<T>
  /** Preview is separate from the authoritative snapshot.value. */
  readonly value: T
  readonly mixed: boolean
  readonly pending: boolean
  readonly ownsPending: boolean
  readonly resetKey: object
  begin(): boolean
  change(value: T): EditChangeResult<T> | null
  commit(value: T): Promise<EditResult<T> | undefined>
  /** Atomic controls use this instead of publishing a separate preview. Rejections throw for their retry UI. */
  submit(value: T): Promise<boolean>
  cancel(reason: EditCancelReason): void
}

/** One property session shared by scalar and explicitly composed controls. No widget or application state lives here. */
export function usePropertyBinding<T>({
  access,
  mixed = false,
  onEditResult,
}: PropertyBindingOptions<T>): PropertyBinding<T> {
  const snapshot = useSyncExternalStore(access.subscribe, access.getSnapshot, access.getSnapshot)
  const session = useRef<{
    access: PropertyAccess<T>
    edit: EditSession<T>
    submitted: boolean
    changed: boolean
  } | null>(null)
  const latest = useRef({ access, onEditResult })
  const mounted = useRef(true)
  latest.current = { access, onEditResult }
  const committedSession = useRef<string | undefined>(undefined)
  const identity = useRef({ access, target: snapshot.target, revision: snapshot.revision, mixed, key: {} })
  const previous = identity.current
  const sameTarget =
    previous.access === access &&
    previous.target.objectId === snapshot.target.objectId &&
    previous.target.propertyId === snapshot.target.propertyId
  const ownedAcknowledgement =
    snapshot.committedSessionId !== undefined &&
    (snapshot.committedSessionId === session.current?.edit.id ||
      snapshot.committedSessionId === committedSession.current)
  const invalidate =
    !sameTarget || previous.mixed !== mixed || (previous.revision !== snapshot.revision && !ownedAcknowledgement)
  identity.current = {
    access,
    target: snapshot.target,
    revision: snapshot.revision,
    mixed,
    key: invalidate ? {} : previous.key,
  }
  const resetKey = identity.current.key

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      const current = session.current
      if (current?.access === access) {
        session.current = null
        if (!current.submitted) void current.edit.cancel('unmount')
      }
    }
  }, [access])

  function begin() {
    if (!mounted.current || latest.current.access !== access) return false
    const current = session.current
    const now = access.getSnapshot()
    if (
      current?.access === access &&
      current.submitted &&
      (current.edit.baseRevision === now.revision || now.committedSessionId === current.edit.id)
    )
      return false
    if (current?.access === access && current.edit.id === now.edit?.sessionId && !current.submitted) return true
    if (now.disabled || now.readOnly || now.edit?.phase === 'pending') return false
    const result = access.begin()
    if (result.status !== 'started') return false
    session.current = { access, edit: result.session, submitted: false, changed: false }
    return true
  }

  function change(value: T) {
    if (!begin()) return null
    const current = session.current!
    const result = current.edit.change(value)
    if (result.status === 'changed' || result.status === 'unchanged') current.changed = true
    return result
  }

  function cancel(reason: EditCancelReason) {
    const current = session.current
    if (current?.access !== access) return
    // A submitted command belongs to its captured host target. UI cancellation cannot retract it.
    if (current?.submitted) return
    session.current = null
    if (current) void current.edit.cancel(reason)
  }

  async function commit(value: T) {
    const existing = session.current
    if (mixed && existing && !existing.changed) {
      cancel('reset')
      return
    }
    const changed = change(value)
    if (!changed || changed.status === 'ignored') return
    if (changed.status === 'invalid') throw new Error(changed.error.message)
    const current = session.current!
    current.submitted = true
    const result = await current.edit.commit()
    if (session.current !== current || latest.current.access !== access) return
    if (result.status === 'committed') committedSession.current = result.sessionId
    session.current = null
    const now = access.getSnapshot()
    if (
      now.target.objectId !== current.edit.target.objectId ||
      now.target.propertyId !== current.edit.target.propertyId
    )
      return
    latest.current.onEditResult?.(result)
    if (result.status === 'rejected') throw new Error(result.error.message)
    return result
  }

  async function submit(value: T) {
    // Atomic actions are deliberate changes even when they start from a mixed selection.
    const changed = change(value)
    if (!changed || changed.status === 'ignored') return false
    if (changed.status === 'invalid') throw new Error(changed.error.message)
    const result = await commit(value)
    return result?.status === 'committed' || result?.status === 'unchanged'
  }

  return {
    snapshot,
    value: snapshot.edit ? snapshot.edit.previewValue : snapshot.value,
    mixed,
    pending: snapshot.edit?.phase === 'pending',
    ownsPending:
      session.current?.access === access &&
      session.current.edit.id === snapshot.edit?.sessionId &&
      !!session.current.submitted,
    resetKey,
    begin,
    change,
    commit,
    submit,
    cancel,
  }
}

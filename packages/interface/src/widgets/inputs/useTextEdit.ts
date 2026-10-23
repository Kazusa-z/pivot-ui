import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent,
  type FocusEvent,
  type KeyboardEvent,
} from 'react'

export type TextEditPhase = 'idle' | 'editing' | 'pending'
export type TextEditCommitReason = 'enter' | 'blur' | 'programmatic'
export type TextEditCancelReason =
  'escape' | 'external-update' | 'disabled' | 'read-only' | 'unmount' | 'reset' | 'target-change'

export interface UseTextEditOptions {
  value: string
  /** Change this when the target or authoritative revision changes, including equal-valued updates. */
  resetKey?: unknown
  disabled?: boolean
  readOnly?: boolean
  /** Plain Enter inserts a newline; Ctrl/Meta+Enter commits. */
  multiline?: boolean
  onBegin?: () => boolean | void
  onDraftChange?: (draft: string) => void
  /** Resolve after acceptance; reject to retain the draft and display an error. The owner updates value. */
  onCommit: (draft: string, reason: TextEditCommitReason) => void | Promise<void>
  /** Called only before submission or after rejection returns to editing. Pending invalidation cannot cancel the host operation. */
  onCancel?: (reason: TextEditCancelReason) => void
}

type TextElement = HTMLInputElement | HTMLTextAreaElement
type EditState = { phase: TextEditPhase; draft: string; error: string | null }
type Session = {
  value: string
  resetKey: unknown
  onCancel: UseTextEditOptions['onCancel']
  terminal?: Promise<void>
}

/**
 * Local text draft only. It neither owns an authoritative value nor creates a property transaction.
 * Cancelling a pending edit ignores its completion; it cannot retract an already submitted host operation.
 */
export function useTextEdit(options: UseTextEditOptions) {
  const latest = useRef(options)
  latest.current = options
  const [state, setState] = useState<EditState>({ phase: 'idle', draft: options.value, error: null })
  const stateRef = useRef(state)
  const session = useRef<Session | null>(null)
  const mounted = useRef(true)
  const composing = useRef(false)

  const publish = useCallback((next: EditState) => {
    stateRef.current = next
    if (mounted.current) setState(next)
  }, [])

  const cancel = useCallback(
    (reason: TextEditCancelReason = 'escape') => {
      const previous = session.current
      const canCancel = stateRef.current.phase !== 'pending'
      session.current = null
      composing.current = false
      publish({ phase: 'idle', draft: latest.current.value, error: null })
      if (canCancel) previous?.onCancel?.(reason)
    },
    [publish]
  )

  const isAvailable = useCallback(() => {
    const current = latest.current
    const active = session.current
    if (current.disabled || current.readOnly) {
      if (active) cancel(current.disabled ? 'disabled' : 'read-only')
      return false
    }
    if (active && (active.value !== current.value || !Object.is(active.resetKey, current.resetKey))) {
      cancel('external-update')
      return false
    }
    return true
  }, [cancel])

  const begin = useCallback(() => {
    if (!mounted.current || !isAvailable() || stateRef.current.phase === 'pending') return false
    if (session.current) return true
    const current = latest.current
    const active: Session = { value: current.value, resetKey: current.resetKey, onCancel: current.onCancel }
    session.current = active
    publish({ phase: 'editing', draft: current.value, error: null })
    try {
      if (current.onBegin?.() === false) {
        if (session.current === active) {
          session.current = null
          publish({ phase: 'idle', draft: latest.current.value, error: null })
        }
        return false
      }
    } catch (error) {
      if (session.current === active) {
        session.current = null
        publish({
          phase: 'idle',
          draft: latest.current.value,
          error: error instanceof Error ? error.message : String(error),
        })
      }
      return false
    }
    return session.current === active && isAvailable()
  }, [isAvailable, publish])

  const change = useCallback(
    (draft: string) => {
      if (!begin()) return
      if (session.current) session.current.terminal = undefined
      publish({ phase: 'editing', draft, error: null })
      latest.current.onDraftChange?.(draft)
    },
    [begin, publish]
  )

  const commit = useCallback(
    (reason: TextEditCommitReason = 'programmatic'): Promise<void> => {
      const active = session.current
      if (!active || !isAvailable()) return Promise.resolve()
      if (active.terminal) {
        // A failed Enter followed by blur is still one submission. Editing or explicitly retrying can submit again.
        if (stateRef.current.phase === 'editing' && stateRef.current.error !== null && reason !== 'blur')
          active.terminal = undefined
        else return active.terminal
      }
      const draft = stateRef.current.draft
      let settle!: () => void
      // Install the terminal promise before calling user code, including synchronous/reentrant callbacks.
      const terminal = new Promise<void>((resolve) => {
        settle = resolve
      })
      active.terminal = terminal
      publish({ phase: 'pending', draft, error: null })
      const finish = (error?: unknown) => {
        if (mounted.current && session.current === active && isAvailable()) {
          if (error !== undefined) {
            publish({ phase: 'editing', draft, error: error instanceof Error ? error.message : String(error) })
          } else {
            session.current = null
            publish({ phase: 'idle', draft: latest.current.value, error: null })
          }
        }
        settle()
      }
      try {
        Promise.resolve(latest.current.onCommit(draft, reason)).then(
          () => finish(),
          (error: unknown) => finish(error ?? new Error('Edit rejected'))
        )
      } catch (error) {
        finish(error ?? new Error('Edit rejected'))
      }
      return terminal
    },
    [isAvailable, publish]
  )

  useLayoutEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      const active = session.current
      session.current = null
      if (stateRef.current.phase !== 'pending') active?.onCancel?.('unmount')
    }
  }, [])

  useLayoutEffect(() => {
    if (session.current) isAvailable()
    else publish({ phase: 'idle', draft: options.value, error: null })
  }, [options.value, options.resetKey, options.disabled, options.readOnly, isAvailable, publish])

  const inputProps = {
    onFocus: (_event: FocusEvent<TextElement>) => {
      begin()
    },
    onChange: (event: ChangeEvent<TextElement>) => {
      change(event.currentTarget.value)
    },
    onBlur: (_event: FocusEvent<TextElement>) => {
      composing.current = false
      void commit('blur')
    },
    onKeyDown: (event: KeyboardEvent<TextElement>) => {
      if (event.defaultPrevented || composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        cancel('escape')
      } else if (event.key === 'Enter' && (!latest.current.multiline || event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        event.stopPropagation()
        void commit('enter')
      }
    },
    onCompositionStart: (_event: CompositionEvent<TextElement>) => {
      composing.current = true
    },
    onCompositionEnd: (_event: CompositionEvent<TextElement>) => {
      composing.current = false
    },
  }

  return { ...state, begin, change, commit, cancel, inputProps }
}

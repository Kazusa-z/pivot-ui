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

/** Editing callbacks shared by every text editor; EditableText exposes exactly these. */
export interface TextEditValueOptions {
  /** 应用当前接受的文本。 */
  value: string
  /** 切换编辑对象或收到外部数据版本时更新此值，以重新开始草稿；即使文本相同也可重置。 */
  resetKey?: unknown
  /** 禁用：不可聚焦、不可编辑。 */
  disabled?: boolean
  /** 只读：可以聚焦和选中文字，但不能进入编辑。 */
  readOnly?: boolean
  /** 开始编辑时调用；返回 `false` 拒绝进入编辑。 */
  onBegin?: () => boolean | void
  /** 草稿每次变化时调用，可用于实时预览；此时尚未提交。 */
  onDraftChange?: (draft: string) => void
  /** 接收完成的草稿。应用保存并更新 value 后完成 Promise；抛出错误可保留草稿并显示错误，方便用户修正或重试。 */
  onCommit: (draft: string, reason: TextEditCommitReason) => void | Promise<void>
  /** 未提交或保存失败后取消编辑时接收原因。已发送的保存请求由应用继续处理，需要撤销时调用应用的撤销操作。 */
  onCancel?: (reason: TextEditCancelReason) => void
}

export interface UseTextEditOptions extends TextEditValueOptions {
  /** Plain Enter inserts a newline; Ctrl/Meta+Enter commits. */
  multiline?: boolean
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
 * 为文本输入提供草稿、提交、取消和错误提示，适合重命名或完成后保存的字段。
 * 应用通过 onCommit 保存文本并更新 value；保存失败时可保留草稿供用户重试。
 * 需要统一管理属性的校验与撤销时，可使用 PropertyField 连接应用数据服务。
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

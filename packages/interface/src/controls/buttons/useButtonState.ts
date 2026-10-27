import { useEffect, useRef, useState, type MouseEvent } from 'react'

export interface ButtonStateOptions {
  /** 禁用按钮：半透明显示，不响应点击和键盘。 */
  disabled?: boolean
  /** 显示加载指示并阻止再次点击；由应用控制何时结束。 */
  loading?: boolean
  /** 点击后执行的异步操作；等待期间自动显示加载状态并阻止重复点击。 */
  async?: () => Promise<unknown>
  /** `async` 失败时调用；不提供时错误输出到 console。两种情况下按钮都会恢复可用。 */
  onAsyncError?: (error: unknown) => void
}

/** Shared by both button variants. The synchronous lock also blocks reentrant clicks. */
export function useButtonState(options: ButtonStateOptions) {
  const [pending, setPending] = useState(false)
  const locked = useRef(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const loading = Boolean(options.loading || pending)
  const disabled = Boolean(options.disabled || loading)
  const isBlocked = () => disabled || locked.current

  function activate(event: MouseEvent<HTMLButtonElement>, onClick: () => void) {
    if (isBlocked()) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    const action = options.async
    if (action) locked.current = true
    try {
      onClick()
    } catch (error) {
      locked.current = false
      throw error
    }
    if (!action || event.defaultPrevented) {
      locked.current = false
      return
    }
    setPending(true)
    void (async () => {
      try {
        await action()
      } catch (error) {
        if (options.onAsyncError) options.onAsyncError(error)
        else console.error(error)
      } finally {
        locked.current = false
        if (mounted.current) setPending(false)
      }
    })()
  }

  return { loading, disabled, isBlocked, activate }
}

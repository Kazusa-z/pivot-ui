import { useEffect, useRef, useState, type MouseEvent } from 'react'

export interface ButtonStateOptions {
  disabled?: boolean
  loading?: boolean
  async?: () => Promise<unknown>
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

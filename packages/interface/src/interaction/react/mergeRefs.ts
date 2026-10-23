import type { Ref, RefCallback } from 'react'

/** Compose object and callback refs, including React callback-ref cleanup. */
export function mergeRefs<T>(refs: readonly (Ref<T> | undefined)[]): RefCallback<T> {
  const targets = [...refs]
  return (value) => {
    const cleanups = targets.map((ref) => {
      if (typeof ref === 'function') return ref(value)
      if (ref != null) ref.current = value
    })

    if (cleanups.some((cleanup) => typeof cleanup === 'function')) {
      let detached = false
      return () => {
        if (detached) return
        detached = true
        targets.forEach((ref, index) => {
          const cleanup = cleanups[index]
          if (typeof cleanup === 'function') cleanup()
          else if (typeof ref === 'function') ref(null)
          else if (ref != null) ref.current = null
        })
      }
    }
  }
}

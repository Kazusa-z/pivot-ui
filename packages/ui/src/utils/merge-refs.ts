import type { Ref, RefCallback } from 'react'

export function mergeRefs<T = any>(refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (value) => {
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') {
        return ref(value)
      } else if (ref != null) {
        ref.current = value
      }
    })

    // React 19 calls the returned cleanup instead of invoking the ref with null.
    if (cleanups.some((cleanup) => typeof cleanup === 'function')) {
      return () => {
        refs.forEach((ref, index) => {
          const cleanup = cleanups[index]
          if (typeof cleanup === 'function') {
            cleanup()
          } else if (typeof ref === 'function') {
            ref(null)
          } else if (ref != null) {
            ref.current = null
          }
        })
      }
    }
  }
}

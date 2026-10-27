import type { ReactNode } from 'react'

export interface ConfirmationOptions {
  readonly title: ReactNode
  readonly description?: ReactNode
  readonly confirmLabel?: string
  readonly cancelLabel?: string
  readonly critical?: boolean
}

export type ConfirmationStatus = 'confirmed' | 'cancelled' | 'closed' | 'unmounted' | 'unavailable'
export type ConfirmationResult = {
  [Status in ConfirmationStatus]: Readonly<{ id: number; status: Status }>
}[ConfirmationStatus]

export interface ConfirmationRequest {
  readonly id: number
  readonly options: Readonly<ConfirmationOptions>
  readonly result: Promise<ConfirmationResult>
  /** Every terminal method returns result, including repeated or competing calls. */
  confirm(): Promise<ConfirmationResult>
  cancel(): Promise<ConfirmationResult>
  close(): Promise<ConfirmationResult>
}

export interface ConfirmationSnapshot {
  readonly connected: boolean
  readonly requests: readonly ConfirmationRequest[]
}

export interface ConfirmationService {
  request(options: ConfirmationOptions): ConfirmationRequest
  getSnapshot(): ConfirmationSnapshot
  subscribe(listener: () => void): () => void
  /** Provider lifecycle: one mounted host per service. Cleanup is idempotent. */
  connect(owner: object): () => void
}

interface PendingRequest {
  request: ConfirmationRequest
  resolve(result: ConfirmationResult): void
}

/** An application owns this queue and injects it into exactly one ConfirmationProvider. */
export function createConfirmationService(): ConfirmationService {
  let nextId = 0
  let owner: object | undefined
  let connections = 0
  let generation = 0
  let pending: PendingRequest[] = []
  const listeners = new Set<() => void>()
  let snapshot: ConfirmationSnapshot = Object.freeze({ connected: false, requests: Object.freeze([]) })

  const publish = () => {
    snapshot = Object.freeze({
      connected: connections > 0,
      requests: Object.freeze(pending.map(({ request }) => request)),
    })
    for (const listener of [...listeners]) listener()
  }

  const service: ConfirmationService = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    request(options) {
      const id = ++nextId
      let resolve!: (result: ConfirmationResult) => void
      const result = new Promise<ConfirmationResult>((settle) => {
        resolve = settle
      })
      let settled = false
      const finish = (status: ConfirmationStatus) => {
        if (settled) return result
        settled = true
        const index = pending.findIndex((entry) => entry.request.id === id)
        if (index !== -1) pending = pending.filter((entry) => entry.request.id !== id)
        resolve(Object.freeze({ id, status }))
        if (index !== -1) publish()
        return result
      }
      const request: ConfirmationRequest = Object.freeze({
        id,
        options: Object.freeze({ ...options }),
        result,
        confirm: () => finish('confirmed'),
        cancel: () => finish('cancelled'),
        close: () => finish('closed'),
      })
      if (!connections) finish('unavailable')
      else {
        pending.push({
          request,
          resolve: (value) => {
            if (settled) return
            settled = true
            resolve(value)
          },
        })
        publish()
      }
      return request
    },
    connect(nextOwner) {
      // Reject a second host before touching the existing owner's queue or connection count.
      if (connections && owner !== nextOwner) {
        throw new Error(
          'A ConfirmationService supports one mounted ConfirmationProvider. Create a separate service for another host.'
        )
      }
      owner = nextOwner
      connections++
      generation++
      publish()
      let disconnected = false
      return () => {
        if (disconnected) return
        disconnected = true
        connections--
        const disconnectGeneration = ++generation
        if (connections) return
        // React StrictMode reconnects effects before this microtask. A real unmount settles every request.
        queueMicrotask(() => {
          if (connections || generation !== disconnectGeneration) return
          owner = undefined
          const abandoned = pending
          pending = []
          for (const entry of abandoned) entry.resolve(Object.freeze({ id: entry.request.id, status: 'unmounted' }))
          publish()
        })
      }
    },
  }
  return Object.freeze(service)
}

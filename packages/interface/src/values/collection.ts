export type CollectionKey = string | number

export interface Collection<T> {
  readonly items: readonly T[]
  readonly keys: readonly CollectionKey[]
  readonly size: number
  get(key: CollectionKey): T | undefined
  has(key: CollectionKey): boolean
  indexOf(key: CollectionKey): number
}

/** Validates stable identities without coercing number and string keys into one namespace. */
export function createCollection<T>(items: readonly T[], getKey: (item: T) => CollectionKey): Collection<T> {
  const snapshot = Object.freeze([...items])
  const indices = new Map<CollectionKey, number>()
  const keys = snapshot.map((item, index) => {
    const key = getKey(item)
    if ((typeof key !== 'string' || !key.length) && (typeof key !== 'number' || !Number.isFinite(key))) {
      throw new TypeError('Collection keys must be nonempty strings or finite numbers.')
    }
    if (indices.has(key)) throw new Error(`Duplicate collection key: ${typeof key}:${String(key)}`)
    indices.set(key, index)
    return key
  })
  return Object.freeze({
    items: snapshot,
    keys: Object.freeze(keys),
    size: snapshot.length,
    get: (key: CollectionKey) => {
      const index = indices.get(key)
      return index === undefined ? undefined : snapshot[index]
    },
    has: (key: CollectionKey) => indices.has(key),
    indexOf: (key: CollectionKey) => indices.get(key) ?? -1,
  })
}

/** 属性描述中可保存的普通元数据。属性的实际值类型通过 PropertyAccess<T> 的 T 指定。 */
export type PropertyData =
  null | boolean | string | number | undefined | readonly PropertyData[] | { readonly [key: string]: PropertyData }

/** 深拷贝普通属性数据，生成可共享的快照。传入由基础值、数组和普通对象组成的无环数据；自定义实例请先由应用转换。 */
export function clonePropertyData<T>(value: T): T {
  const active = new Set<object>()
  function copy(input: unknown): unknown {
    if (input === null || input === undefined || typeof input === 'string' || typeof input === 'boolean') return input
    if (typeof input === 'number') {
      if (!Number.isFinite(input)) throw new TypeError('Property data numbers must be finite.')
      return input
    }
    if (typeof input !== 'object') throw new TypeError('Property data cannot contain functions, symbols or bigint.')
    if (active.has(input)) throw new TypeError('Property data cannot contain cycles.')
    const array = Array.isArray(input)
    if (!array && Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)
      throw new TypeError('Property data must use plain objects and arrays, not host instances.')
    active.add(input)
    const result: unknown[] | Record<string, unknown> = array ? [] : {}
    if (array) {
      for (let index = 0; index < input.length; index++)
        if (!Object.prototype.hasOwnProperty.call(input, index))
          throw new TypeError('Property arrays must not contain holes.')
    }
    for (const key of Reflect.ownKeys(input)) {
      if (array && key === 'length') continue
      if (typeof key !== 'string') throw new TypeError('Property data keys must be strings.')
      if (array && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= input.length))
        throw new TypeError('Property arrays cannot carry named metadata.')
      const descriptor = Object.getOwnPropertyDescriptor(input, key)!
      if (!('value' in descriptor) || !descriptor.enumerable)
        throw new TypeError('Property data cannot contain accessors or hidden fields.')
      Object.defineProperty(result, key, {
        value: copy(descriptor.value),
        enumerable: true,
        configurable: true,
        writable: true,
      })
    }
    active.delete(input)
    return Object.freeze(result)
  }
  return copy(value) as T
}

/** Structural equality for already validated plain snapshots. Object key insertion order is irrelevant. */
export function arePropertyDataEqual<T>(first: T, second: T): boolean {
  function equal(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b))
      return false
    if (Array.isArray(a) && Array.isArray(b) && a.length !== b.length) return false
    const keys = Object.keys(a),
      other = Object.keys(b)
    return (
      keys.length === other.length &&
      keys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(b, key) &&
          equal((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
      )
    )
  }
  return equal(first, second)
}

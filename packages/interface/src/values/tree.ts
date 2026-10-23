import { createCollection, type Collection, type CollectionKey } from './collection'
import type { DropPosition } from './drag-drop'

export interface TreeNode<T> {
  readonly key: CollectionKey
  readonly item: T
  readonly parentKey: CollectionKey | null
  readonly childrenKeys: readonly CollectionKey[]
  readonly level: number
  readonly position: number
  readonly setSize: number
  readonly textValue: string
  readonly disabled: boolean
}

export interface TreeCollectionOptions<T> {
  getKey(item: T): CollectionKey
  getChildren?(item: T): readonly T[] | undefined
  getTextValue?(item: T): string
  isDisabled?(item: T): boolean
}

export interface TreeCollection<T> extends Collection<T> {
  readonly rootKeys: readonly CollectionKey[]
  getNode(key: CollectionKey): TreeNode<T> | undefined
  getVisibleKeys(expandedKeys: readonly CollectionKey[]): readonly CollectionKey[]
}

/** A data-only preorder snapshot. Duplicate keys also reject cycles and shared child identities. */
export function createTreeCollection<T>(items: readonly T[], options: TreeCollectionOptions<T>): TreeCollection<T> {
  const nodes = new Map<CollectionKey, TreeNode<T>>()
  const flatItems: T[] = []
  const flatKeys: CollectionKey[] = []
  const visit = (siblings: readonly T[], parentKey: CollectionKey | null, level: number): readonly CollectionKey[] => {
    const collection = createCollection(siblings, options.getKey)
    collection.items.forEach((item, index) => {
      const key = collection.keys[index]
      if (nodes.has(key)) throw new Error(`Duplicate tree key or cyclic tree: ${typeof key}:${String(key)}`)
      const node: TreeNode<T> = {
        key,
        item,
        parentKey,
        level,
        position: index + 1,
        setSize: siblings.length,
        textValue: options.getTextValue?.(item) ?? String(key),
        disabled: options.isDisabled?.(item) ?? false,
        childrenKeys: [],
      }
      nodes.set(key, node)
      flatItems.push(item)
      flatKeys.push(key)
      const childrenKeys = visit(options.getChildren?.(item) ?? [], key, level + 1)
      nodes.set(key, Object.freeze({ ...node, childrenKeys }))
    })
    return collection.keys
  }
  const rootKeys = visit(items, null, 1)
  let index = 0
  const collection = createCollection(flatItems, () => flatKeys[index++])
  return Object.freeze({
    ...collection,
    rootKeys,
    getNode: (key: CollectionKey) => nodes.get(key),
    getVisibleKeys: (expandedKeys: readonly CollectionKey[]) => {
      const expanded = new Set(expandedKeys)
      const visible: CollectionKey[] = []
      const append = (keys: readonly CollectionKey[]) => {
        for (const key of keys) {
          visible.push(key)
          if (expanded.has(key)) append(nodes.get(key)!.childrenKeys)
        }
      }
      append(rootKeys)
      return Object.freeze(visible)
    },
  })
}

export type TreeDropPosition = DropPosition

/** Rejects moves onto a dragged node or any of its descendants. The host owns the actual data update. */
export function canMoveTreeItems<T>(
  collection: TreeCollection<T>,
  keys: readonly CollectionKey[],
  targetKey: CollectionKey
): boolean {
  if (!keys.length || !collection.has(targetKey) || keys.some((key) => !collection.has(key))) return false
  const moving = new Set(keys)
  let node = collection.getNode(targetKey)
  while (node) {
    if (moving.has(node.key)) return false
    node = node.parentKey === null ? undefined : collection.getNode(node.parentKey)
  }
  return true
}

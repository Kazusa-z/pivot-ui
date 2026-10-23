export type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis'

export interface PaginationOptions {
  totalCount: number
  pageSize: number
  page?: number
  siblingCount?: number
  boundaryCount?: number
}

export interface PaginationState {
  readonly page: number
  readonly pageCount: number
  readonly items: readonly PaginationItem[]
}

function integer(value: number, minimum: number, label: string) {
  if (!Number.isSafeInteger(value) || value < minimum)
    throw new RangeError(`${label} must be a safe integer >= ${minimum}.`)
  return value
}

export function getPageCount(totalCount: number, pageSize: number): number {
  return Math.ceil(integer(totalCount, 0, 'totalCount') / integer(pageSize, 1, 'pageSize'))
}

/** Page 0 means no results. A nonempty result always has a page within 1..pageCount. */
export function clampPage(page: number, pageCount: number): number {
  integer(pageCount, 0, 'pageCount')
  if (!Number.isSafeInteger(page)) throw new RangeError('page must be a safe integer.')
  return pageCount === 0 ? 0 : Math.max(1, Math.min(pageCount, page))
}

/** Bounded work regardless of result count. Window counts are intentionally limited to 100. */
export function getPaginationState({
  totalCount,
  pageSize,
  page = 1,
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationOptions): PaginationState {
  const pageCount = getPageCount(totalCount, pageSize)
  const current = clampPage(page, pageCount)
  integer(siblingCount, 0, 'siblingCount')
  integer(boundaryCount, 1, 'boundaryCount')
  if (siblingCount > 100 || boundaryCount > 100) throw new RangeError('Pagination window counts cannot exceed 100.')
  const pages = new Set<number>()
  const add = (from: number, to: number) => {
    for (let value = Math.max(1, from); value <= Math.min(pageCount, to); value++) pages.add(value)
  }
  add(1, boundaryCount)
  add(pageCount - boundaryCount + 1, pageCount)
  add(current - siblingCount, current + siblingCount)
  const ordered = [...pages].sort((a, b) => a - b)
  const items: PaginationItem[] = []
  for (const value of ordered) {
    const previous = items[items.length - 1]
    if (typeof previous === 'number' && value - previous === 2) items.push(previous + 1)
    else if (typeof previous === 'number' && value - previous > 2)
      items.push(value <= current ? 'start-ellipsis' : 'end-ellipsis')
    items.push(value)
  }
  return Object.freeze({ page: current, pageCount, items: Object.freeze(items) })
}

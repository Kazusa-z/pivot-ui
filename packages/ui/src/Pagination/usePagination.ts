import { getPaginationState } from '@pivot-ui/react/values'
export const DOTS = '...' as const
export interface UsePaginationOptions {
  totalCount: number
  pageSize: number
  siblingCount?: number
  currentPage: number
}
/** Transitional deep import; all page arithmetic lives in the pure unified module. */
export function usePagination({ currentPage, ...options }: UsePaginationOptions) {
  return getPaginationState({ ...options, page: currentPage }).items.map((item) =>
    typeof item === 'number' ? item : DOTS
  )
}

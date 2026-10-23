import { forwardRef } from 'react'
import { Pagination as NewPagination, type PaginationProps as NewPaginationProps } from '@pivot-ui/react'

export interface PaginationProps extends Omit<NewPaginationProps, 'page'> {
  currentPage?: number
}
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination({ currentPage, ...props }, ref) {
  return <NewPagination {...props} ref={ref} page={currentPage} />
})

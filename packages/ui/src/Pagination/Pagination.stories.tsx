import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination, type PaginationProps } from './'
import { Button } from '../Button'

function PaginationExample({ size = 'sm' }: Pick<PaginationProps, 'size'>) {
  const [currentPage, setCurrentPage] = useState(1)
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Pagination totalCount={100} pageSize={10} currentPage={currentPage} onPageChange={setCurrentPage} size={size} />
      <output>Page: {currentPage}</output>
      <Button onClick={() => setCurrentPage(1)}>Reset</Button>
    </div>
  )
}
export default { title: 'Navigation/Pagination' } satisfies Meta
export const Overview: StoryObj = { render: () => <PaginationExample /> }
export const Sizes: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <PaginationExample />
      <PaginationExample size="md" />
    </div>
  ),
}

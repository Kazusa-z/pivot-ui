import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumbs, type BreadcrumbProps } from './'
import { Button } from '../Button'

const items = [
  { id: 'assets', label: 'Assets' },
  { id: 'materials', label: 'Materials' },
  { id: 'car-paint', label: 'Car Paint' },
]
function BreadcrumbExample({ size = 'sm' }: Pick<BreadcrumbProps, 'size'>) {
  const [path, setPath] = useState(items)
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Breadcrumbs
        items={path}
        size={size}
        onNavigate={(id) => setPath((current) => current.slice(0, current.findIndex((item) => item.id === id) + 1))}
      />
      <output>{path.map((item) => item.label).join(' / ')}</output>
      <Button onClick={() => setPath(items)}>Reset</Button>
    </div>
  )
}
export default { title: 'Navigation/Breadcrumbs' } satisfies Meta
export const Overview: StoryObj = { render: () => <BreadcrumbExample /> }
export const Sizes: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <BreadcrumbExample />
      <BreadcrumbExample size="md" />
    </div>
  ),
}

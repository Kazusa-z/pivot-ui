import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumbs } from '../src/widgets/navigation/Breadcrumbs'
import { ContractFrame, StatePanel, contractStyles } from './support/ContractFrame'

const path = [
  { key: 'assets', label: 'Assets' },
  { key: 'materials', label: 'Materials' },
  { key: 'paint', label: 'Car paint' },
]
function NavigationExample() {
  const [depth, setDepth] = useState(3)
  return (
    <ContractFrame
      title="Breadcrumb navigation"
      description="nav/ol/li保持层级；上级为原生按钮，当前页是aria-current文本。父级决定请求后的路径。"
      onReset={() => setDepth(3)}>
      <Breadcrumbs
        items={path.slice(0, depth)}
        onNavigate={(key) => setDepth(path.findIndex((item) => item.key === key) + 1)}
      />
      <StatePanel label="Current path" value={path.slice(0, depth).map((item) => item.key)} />
    </ContractFrame>
  )
}
function Variations() {
  const [requests, setRequests] = useState<unknown[]>([])
  return (
    <ContractFrame
      title="Links, disabled and empty paths"
      description="href保留原生链接语义；禁用项不触发导航，固定路径可拒绝请求。空列表仍是具名导航区域。"
      onReset={() => setRequests([])}>
      <div className={contractStyles.stack}>
        <Breadcrumbs
          size="md"
          aria-label="Linked path"
          items={path.map((item) => ({ ...item, href: `#${item.key}` }))}
        />
        <Breadcrumbs
          aria-label="Controlled refusal"
          items={path}
          onNavigate={(key) => setRequests((current) => [...current, key])}
        />
        <Breadcrumbs
          aria-label="Disabled path"
          items={path}
          disabled
          onNavigate={(key) => setRequests((current) => [...current, key])}
        />
        <Breadcrumbs
          aria-label="Partially disabled path"
          items={path.map((item) => ({ ...item, disabled: item.key === 'materials' }))}
          onNavigate={(key) => setRequests((current) => [...current, key])}
        />
        <Breadcrumbs aria-label="Empty path" items={[]} />
      </div>
      <StatePanel label="Navigation requests" value={requests} />
    </ContractFrame>
  )
}
export default { title: 'Widgets/Navigation/Breadcrumbs' } satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <NavigationExample /> }
export const LinksDisabledEmpty: Story = { render: () => <Variations /> }

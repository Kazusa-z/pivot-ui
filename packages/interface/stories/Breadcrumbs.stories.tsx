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
      title="沿层级返回上级位置"
      description="点击上级位置可返回对应层级；当前页显示为带 aria-current 的文字。onNavigate 将目标项交给应用，本例接受请求后缩短路径。"
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
      title="链接、不可用位置与空路径"
      description="带 href 的项使用浏览器链接行为。应用可通过 disabled 标出不可到达的位置，也可仅记录 onNavigate 请求而保留当前路径；空路径仍保留导航区域名称。"
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
export default {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Breadcrumbs 显示当前位置的层级路径，适合文件目录或多层页面导航。上级项可以使用 href 导航，也可以通过 onNavigate 请求应用切换路径；当前项带有 aria-current。应用决定导航后的路径数据，禁用项用于表示当前无法到达的位置。',
      },
    },
  },
  title: 'Widgets/Navigation/Breadcrumbs',
} satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <NavigationExample /> }
export const LinksDisabledEmpty: Story = { render: () => <Variations /> }

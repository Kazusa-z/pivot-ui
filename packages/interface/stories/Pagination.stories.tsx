import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from '../src/widgets/navigation/Pagination'
import { ContractFrame, StatePanel, ControlButton, contractStyles } from './support/ContractFrame'

function PagesExample() {
  const [page, setPage] = useState(5)
  const [count, setCount] = useState(250)
  return (
    <ContractFrame
      title="由应用加载并显示指定页"
      description="点击页码后，onPageChange 将请求交给应用，本例回写 page。缩小结果总量时组件显示有效范围内的页码；应用可同步调整自己的查询状态。结果为零时显示 labels.empty。"
      onReset={() => {
        setPage(5)
        setCount(250)
      }}>
      <Pagination totalCount={count} pageSize={10} page={page} onPageChange={setPage} />
      <div className={contractStyles.row}>
        <ControlButton onClick={() => setCount(23)}>Shrink to 23</ControlButton>
        <ControlButton onClick={() => setCount(0)}>Zero results</ControlButton>
        <ControlButton onClick={() => setCount(250)}>Restore results</ControlButton>
      </div>
      <StatePanel label="Parent state" value={{ page, count }} />
    </ContractFrame>
  )
}
function PageModes() {
  const [requests, setRequests] = useState<number[]>([])
  const [epoch, setEpoch] = useState(0)
  return (
    <ContractFrame
      title="页码请求与可用状态"
      description="页码按钮可通过 Tab、Enter 和 Space 操作。固定传入 page 的示例会记录请求并保留当前页；大结果使用有限的页码窗口，让导航保持紧凑。"
      onReset={() => {
        setRequests([])
        setEpoch((next) => next + 1)
      }}>
      <div key={epoch} className={contractStyles.stack}>
        <Pagination aria-label="Uncontrolled pages" totalCount={100} pageSize={10} defaultPage={3} size="md" />
        <Pagination
          aria-label="Rejected pages"
          totalCount={100}
          pageSize={10}
          page={3}
          onPageChange={(page) => setRequests((current) => [...current, page])}
        />
        <Pagination
          aria-label="Disabled pages"
          totalCount={100}
          pageSize={10}
          page={3}
          disabled
          onPageChange={(page) => setRequests((current) => [...current, page])}
        />
        <Pagination aria-label="Huge result" totalCount={Number.MAX_SAFE_INTEGER} pageSize={1} defaultPage={400} />
      </div>
      <StatePanel label="Requested pages" value={requests} />
    </ContractFrame>
  )
}
function Localization() {
  const [epoch, setEpoch] = useState(0)
  const labels = {
    navigation: '分页',
    previous: '上一页',
    next: '下一页',
    page: (page: number) => `第${page}页`,
    ellipsis: '更多页码',
    empty: '暂无结果',
  }
  return (
    <ContractFrame
      title="自定义名称与空结果"
      description="只有一页时显示当前页，前后翻页按钮为禁用状态；空结果显示提示文字。应用可以按界面语言提供页码按钮名称和空态内容。"
      onReset={() => setEpoch((next) => next + 1)}>
      <div key={epoch} className={contractStyles.stack}>
        <Pagination totalCount={60} pageSize={10} labels={labels} />
        <Pagination totalCount={1} pageSize={10} labels={labels} />
        <Pagination totalCount={0} pageSize={10} labels={labels} />
      </div>
    </ContractFrame>
  )
}
export default {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Pagination 用于在分批结果之间导航。传入 totalCount 和 pageSize 后，它显示有效页码范围，并通过 onPageChange 请求新的页码；页码从 1 开始。应用负责加载该页数据并回写 page，通过 labels 配置空态文字与各按钮名称。',
      },
    },
  },
  title: 'Widgets/Navigation/Pagination',
} satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <PagesExample /> }
export const ModesAndLargeResults: Story = { render: () => <PageModes /> }
export const LocalizedZeroAndOnePage: Story = { render: () => <Localization /> }

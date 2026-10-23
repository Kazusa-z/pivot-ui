import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from '../src/widgets/navigation/Pagination'
import { ContractFrame, StatePanel, ControlButton, contractStyles } from './support/ContractFrame'

function PagesExample() {
  const [page, setPage] = useState(5)
  const [count, setCount] = useState(250)
  return (
    <ContractFrame
      title="Controlled pages"
      description="页码请求由父级回传。缩小结果时显示钳制后的有效页，不伪造onPageChange；零结果显示可本地化的空态。"
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
      title="Uncontrolled, rejected and disabled"
      description="原生button提供Tab/Enter/Space；固定page记录请求但保持显示。大结果只生成有界页码窗口。"
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
      title="Labels and boundary results"
      description="一页仍显示当前页及禁用前后按钮；空结果没有虚构的第1页。所有可访问名称可本地化。"
      onReset={() => setEpoch((next) => next + 1)}>
      <div key={epoch} className={contractStyles.stack}>
        <Pagination totalCount={60} pageSize={10} labels={labels} />
        <Pagination totalCount={1} pageSize={10} labels={labels} />
        <Pagination totalCount={0} pageSize={10} labels={labels} />
      </div>
    </ContractFrame>
  )
}
export default { title: 'Widgets/Navigation/Pagination' } satisfies Meta
type Story = StoryObj
export const Overview: Story = { render: () => <PagesExample /> }
export const ModesAndLargeResults: Story = { render: () => <PageModes /> }
export const LocalizedZeroAndOnePage: Story = { render: () => <Localization /> }

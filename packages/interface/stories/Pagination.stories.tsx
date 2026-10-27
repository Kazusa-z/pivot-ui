import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from '../src/collections/navigation/Pagination'
import { Button } from '../src/controls/buttons'
import { describeComponent } from './support/describe'
import { Column, Item, Row, StateView } from './support/layout'

const meta = {
  title: 'Collections/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '在分页结果之间切换；根据总数和每页数量计算页码，结果多时用省略号收起。',
    use: ['资源库、搜索结果等需要分批加载的列表'],
    avoid: ['可以一次加载完的少量数据 → 直接滚动', '连续加载更多 → 在列表末尾放一个按钮'],
    related: ['`DataTable`：分页后的结果交给它显示', '`ResourceBrowser`：内置了分页'],
    notes: [
      '页码从 1 开始；受控时应用加载对应页后再回写 `page`',
      '`totalCount` 变小时，当前页会收拢到有效范围',
      '加载中可以设置 `disabled`；所有文字通过 `labels` 本地化',
    ],
    keyboard: [
      ['Tab', '在上一页、页码和下一页之间移动'],
      ['Enter / Space', '切换到该页'],
    ],
  }),
  args: { totalCount: 250, pageSize: 10, defaultPage: 5 },
  argTypes: { labels: { control: false } },
} satisfies Meta<typeof Pagination>
export default meta
type Story = StoryObj<typeof meta>

/** 250 条、每页 10 条；当前页两侧各显示 `siblingCount` 个页码。 */
export const Basic: Story = {}

/** `sm` 24（面板默认），`md` 32。 */
export const Sizes: Story = {
  render: () => (
    <Column>
      {(['sm', 'md'] as const).map((size) => (
        <Item key={size} label={size}>
          <Pagination totalCount={250} pageSize={10} defaultPage={5} size={size} aria-label={`${size} pages`} />
        </Item>
      ))}
    </Column>
  ),
}

/** 禁用、没有结果、只有一页。 */
export const States: Story = {
  render: () => (
    <Column>
      <Item label="disabled">
        <Pagination totalCount={100} pageSize={10} defaultPage={3} disabled aria-label="Disabled pages" />
      </Item>
      <Item label="totalCount = 0">
        <Pagination totalCount={0} pageSize={10} labels={{ empty: 'No matching assets' }} />
      </Item>
      <Item label="只有一页">
        <Pagination totalCount={8} pageSize={10} aria-label="Single page" />
      </Item>
    </Column>
  ),
}

/** 所有可见和无障碍文字都可以替换。 */
export const Localized: Story = {
  render: () => (
    <Pagination
      totalCount={60}
      pageSize={10}
      defaultPage={4}
      labels={{
        navigation: '分页',
        previous: '上一页',
        next: '下一页',
        page: (value) => `第 ${value} 页`,
        ellipsis: '更多页码',
        empty: '暂无结果',
      }}
    />
  ),
}

/** 受控页码，以及结果数量变化后页码收拢；固定 `page` 时请求只被记录。 */
export const BehaviorControlled: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [page, setPage] = useState(5)
    const [count, setCount] = useState(250)
    const [requests, setRequests] = useState<number[]>([])
    return (
      <Column width={560}>
        <Pagination
          totalCount={count}
          pageSize={10}
          page={page}
          onPageChange={(next) => {
            setRequests((current) => [...current, next])
            setPage(next)
          }}
          aria-label="Accepted pages"
        />
        <Row>
          <Button size="sm" variant="outline" onClick={() => setCount(23)}>
            Shrink to 23
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCount(0)}>
            Zero results
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCount(250)}>
            Restore
          </Button>
        </Row>
        <Pagination
          totalCount={100}
          pageSize={10}
          page={3}
          onPageChange={(next) => setRequests((current) => [...current, next])}
          aria-label="Refused pages"
        />
        <StateView value={{ page, count, requests }} />
      </Column>
    )
  },
}

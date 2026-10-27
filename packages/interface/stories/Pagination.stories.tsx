import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from '../src/collections/navigation/Pagination'
import { Button } from '../src/controls/buttons/Button'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryField,
  StoryCode,
  StoryProps,
  StoryState,
  StoryKeyboard,
  StoryNote,
} from './support/StoryPage'

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Pagination 用于在分批结果之间导航。传入 totalCount 和 pageSize 后，它显示有效页码范围，并通过 onPageChange 请求新页码；页码从 1 开始。应用负责加载对应页并回写 page，labels 可配置空态、页码名称和前后翻页名称。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Navigation/Pagination',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function PaginationExample() {
  const [page, setPage] = useState(5)
  const [count, setCount] = useState(250)
  const [requests, setRequests] = useState<number[]>([])
  return (
    <StoryPage
      eyebrow="Navigation"
      title="Pagination"
      summary="在结果页之间移动。紧凑档 24、常规档 32；当前页是实心按钮，页码窗口会随结果量收缩。"
      meta={
        <>
          <span>page 5 / 25</span>
          <span>·</span>
          <span>2 sizes</span>
          <span>·</span>
          <span>可控请求</span>
        </>
      }
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setPage(5)
            setCount(250)
            setRequests([])
          }}>
          Reset
        </Button>
      }>
      <StorySection title="Sizes" description="紧凑 24 用于工具栏和属性面板，常规 32 用于页面主体。">
        <StoryGrid>
          <StoryField label="Compact · 24">
            <StoryCard>
              <Pagination totalCount={250} pageSize={10} page={page} onPageChange={setPage} size="sm" />
            </StoryCard>
          </StoryField>
          <StoryField label="Regular · 32">
            <StoryCard>
              <Pagination totalCount={250} pageSize={10} page={page} onPageChange={setPage} size="md" />
            </StoryCard>
          </StoryField>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Behavior"
        description="点击页码只发出请求；接受时由父组件写回 page。缩小结果时，未受控页码会自动回到有效范围。">
        <StoryCard>
          <StoryRow>
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
          </StoryRow>
          <StoryRow>
            <Button size="sm" onClick={() => setCount(23)}>
              Shrink to 23
            </Button>
            <Button size="sm" onClick={() => setCount(0)}>
              Zero results
            </Button>
            <Button size="sm" onClick={() => setCount(250)}>
              Restore results
            </Button>
            <Button size="sm" variant="subtle" onClick={() => setPage(1)}>
              First page
            </Button>
          </StoryRow>
        </StoryCard>
        <StoryCard title="Controlled refusal" description="固定 page 时页码请求被记录，但显示页保持不变。">
          <Pagination
            totalCount={100}
            pageSize={10}
            page={3}
            onPageChange={(next) => setRequests((current) => [...current, next])}
            aria-label="Refused pages"
          />
        </StoryCard>
        <StoryCard title="Uncontrolled" description="只传 defaultPage 时组件自行翻页；结果减少时自动收敛到有效页。">
          <Pagination totalCount={100} pageSize={10} defaultPage={3} aria-label="Uncontrolled pages" />
        </StoryCard>
      </StorySection>

      <StorySection title="States" description="禁用、空结果和只有一页时，保留可读状态，不制造无效页码。">
        <StoryGrid>
          <StoryCard title="Disabled">
            <Pagination totalCount={100} pageSize={10} page={3} disabled aria-label="Disabled pages" />
          </StoryCard>
          <StoryCard title="Empty">
            <Pagination totalCount={0} pageSize={10} labels={{ empty: 'No matching assets' }} />
          </StoryCard>
          <StoryCard title="Single page">
            <Pagination totalCount={10} pageSize={10} aria-label="Single page" />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection title="Localization" description="所有按钮名称、空态和省略号说明都可以替换。">
        <StoryCard>
          <Pagination
            totalCount={60}
            pageSize={10}
            defaultPage={4}
            labels={{
              navigation: '分页',
              previous: '上一页',
              next: '下一页',
              page: (value) => `第${value}页`,
              ellipsis: '更多页码',
              empty: '暂无结果',
            }}
          />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Keyboard and accessibility"
        description="页码是原生按钮；当前页用 aria-current 标记，省略号有可读名称。">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '在上一个、页码、下一个之间移动。' },
            { keys: ['Enter', 'Space'], action: '请求该页；禁用页不响应。' },
            { keys: 'Shift + Tab', action: '反向移动；禁用按钮不进入 Tab 顺序。' },
          ]}
        />
        <StoryNote>
          页码从 1 开始。受控模式下，只有父组件接受并回写 <code>page</code>{' '}
          后显示页才改变；不要依赖组件内部状态保存查询结果。
        </StoryNote>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<Pagination
  totalCount={250}
  pageSize={10}
  page={page}
  onPageChange={setPage}
/>

<Pagination
  totalCount={total}
  pageSize={50}
  labels={{ empty: 'No results', page: (n) => \`Page \${n}\` }}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'totalCount', type: 'number', description: '结果总数；为 0 时显示空态。' },
              { name: 'pageSize', type: 'number', description: '每页数量，必须大于 0。' },
              { name: 'page', type: 'number', description: '受控当前页；不接受请求时不回写。' },
              { name: 'defaultPage', type: 'number', defaultValue: '1', description: '非受控初始页。' },
              { name: 'onPageChange', type: '(page: number) => void', description: '请求新页码。' },
              { name: 'size', type: "'sm' | 'md'", defaultValue: "'sm'", description: '24 或 32。' },
              {
                name: 'labels',
                type: 'Partial<PaginationLabels>',
                description: '导航、前后页、页码、省略号和空态文案。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>

      <StoryState label="Pagination state" value={{ page, count, requests }} />
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <PaginationExample /> }

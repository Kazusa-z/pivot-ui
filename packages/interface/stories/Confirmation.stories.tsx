import { useState, useSyncExternalStore } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  createConfirmationService,
  ConfirmationProvider,
  useConfirmation,
  type ConfirmationOptions,
  type ConfirmationResult,
} from '../src/dialogs'
import { Button } from '../src/controls/buttons'
import { Badge } from '../src/display/Badge'
import { Text } from '../src/foundation/typography'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryCode,
  StoryKeyboard,
  StoryProps,
  StoryState,
  StoryNote,
} from './support/StoryPage'

function resultColor(status: ConfirmationResult['status']) {
  if (status === 'confirmed') return 'green' as const
  if (status === 'cancelled') return 'gray' as const
  return 'red' as const
}

function RequestButtons({ onResult }: { onResult: (result: ConfirmationResult) => void }) {
  const service = useConfirmation()
  const enqueue = (options: ConfirmationOptions) => {
    const request = service.request(options)
    void request.result.then(onResult)
    return request
  }
  return (
    <StoryRow>
      <Button
        variant="solid"
        onClick={() =>
          enqueue({
            title: 'Apply settings?',
            description: '确认后应用当前设置。这个请求由 ConfirmationProvider 展示。',
          })
        }>
        Request confirmation
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          enqueue({ title: 'First request', description: '确认请求按发起顺序依次显示。' })
          enqueue({ title: 'Second request', description: '第一个请求完成后才会显示。' })
        }}>
        Queue two requests
      </Button>
      <Button
        critical
        onClick={() =>
          enqueue({
            title: 'Delete 3 objects?',
            description: '删除后无法撤销；critical 会把确认按钮切换为危险实心样式。',
            confirmLabel: 'Delete',
            critical: true,
          })
        }>
        Request critical
      </Button>
    </StoryRow>
  )
}

function ConfirmationPage() {
  const service = useConfirmation()
  const snapshot = useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot)
  const [results, setResults] = useState<ConfirmationResult[]>([])
  const record = (result: ConfirmationResult) => setResults((values) => [...values, result])
  return (
    <StoryPage
      eyebrow="Overlays"
      title="Confirmation"
      summary="确认服务把删除、覆盖等需要明确决定的操作变成可等待的 Promise。应用创建 service，用一个 ConfirmationProvider 展示请求；多个请求按顺序显示，用户完成后焦点回到发起位置。"
      meta={
        <>
          <Badge variant="surface" color={snapshot.connected ? 'green' : 'gray'}>
            {snapshot.connected ? 'connected' : 'disconnected'}
          </Badge>
          <span>·</span>
          <span>{snapshot.requests.length} pending</span>
        </>
      }
      actions={
        <Badge variant="surface" color="gray">
          {results.length} settled
        </Badge>
      }>
      <StorySection
        title="Request and decide"
        description="request(...).result 解析为 confirmed、cancelled、closed、unmounted 或 unavailable；应用只在 confirmed 时执行变更。">
        <StoryCard
          title="Requests"
          description="连续点击 Queue two requests 可以观察队列；critical 请求使用危险确认按钮。">
          <RequestButtons onResult={record} />
          <StoryNote>
            确认框没有 size 或 variant 变体：它沿用 Dialog 的 regular 表面，确认/取消按钮为 32px。critical
            只改变确认按钮的危险语义。
          </StoryNote>
          <StoryNote>
            Escape 关闭当前确认框时结果是 closed，不是 cancelled；Cancel 按钮才是
            cancelled。需要区分“明确取消”和“直接关闭”时检查 status。
          </StoryNote>
        </StoryCard>
      </StorySection>

      <StorySection title="States and queue" description="同一时间只显示队首；结果按完成顺序追加。">
        <StoryGrid>
          <StoryCard title="Pending queue" description="请求按发起顺序排列。">
            {snapshot.requests.length === 0 ? (
              <Text size="sm" tone="muted">
                No pending requests.
              </Text>
            ) : (
              snapshot.requests.map((request) => (
                <StoryRow key={request.id}>
                  <Badge variant="surface" color="blue">
                    #{request.id}
                  </Badge>
                  <Text size="sm">{request.options.title}</Text>
                </StoryRow>
              ))
            )}
          </StoryCard>
          <StoryCard title="Settled results" description="结果包含请求 id 与最终状态。">
            {results.length === 0 ? (
              <Text size="sm" tone="muted">
                No results yet.
              </Text>
            ) : (
              results.map((result) => (
                <StoryRow key={result.id}>
                  <Badge variant="surface" color={resultColor(result.status)}>
                    {result.status}
                  </Badge>
                  <Text size="sm" tone="muted">
                    Request #{result.id}
                  </Text>
                </StoryRow>
              ))
            )}
          </StoryCard>
        </StoryGrid>
        <StoryState
          label="Confirmation state"
          value={{
            connected: snapshot.connected,
            pending: snapshot.requests.map((request) => ({ id: request.id, title: request.options.title })),
            results,
          }}
        />
      </StorySection>

      <StorySection title="Keyboard and accessibility" description="确认框由 AlertDialog 承载，打开时优先聚焦 Cancel。">
        <StoryCard>
          <StoryKeyboard
            rows={[
              { keys: ['Enter', 'Space'], action: '激活当前聚焦的确认/取消按钮' },
              { keys: 'Tab', action: '在确认框内循环焦点，不进入背景页面' },
              { keys: 'Escape', action: '关闭当前请求，结果为 closed，焦点回到发起位置' },
              { keys: ['Enter'], action: '在 Cancel 聚焦时触发 cancelled；在 Delete 聚焦时触发 confirmed' },
            ]}
          />
          <StoryNote>
            一个 service 只能挂载一个 Provider；Provider 卸载时未完成请求以 unmounted 结束。应用应在 confirmed
            后再执行删除等不可逆操作。
          </StoryNote>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const service = createConfirmationService()

<ConfirmationProvider service={service}>
  <App />
</ConfirmationProvider>

const request = service.request({
  title: 'Delete 3 objects?',
  description: 'This cannot be undone.',
  critical: true,
  confirmLabel: 'Delete',
})
const result = await request.result
if (result.status === 'confirmed') removeObjects()`}
          />
          <StoryProps
            rows={[
              {
                name: 'service',
                type: 'ConfirmationService',
                description: '应用创建并注入；一个 service 对应一个 Provider。',
              },
              { name: 'title', type: 'ReactNode', description: '必填，确认框的可访问名称。' },
              { name: 'description', type: 'ReactNode', description: '可选说明，解释操作后果。' },
              { name: 'critical', type: 'boolean', defaultValue: 'false', description: '确认按钮使用危险实心样式。' },
              {
                name: 'confirmLabel / cancelLabel',
                type: 'string',
                defaultValue: "'Confirm' / 'Cancel'",
                description: '决定按钮文案。',
              },
              {
                name: 'result.status',
                type: "'confirmed' | 'cancelled' | 'closed' | 'unmounted' | 'unavailable'",
                description: '请求的最终状态。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

function ConfirmationStory() {
  const [service] = useState(createConfirmationService)
  return (
    <ConfirmationProvider service={service}>
      <ConfirmationPage />
    </ConfirmationProvider>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '确认服务适合删除、覆盖等需要明确决定的操作。应用创建 createConfirmationService，并通过 ConfirmationProvider 展示请求；request(...).result 返回 confirmed、cancelled、closed 等结果。多个请求按顺序显示，应用收到 confirmed 后再执行不可逆操作。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Overlays/Confirmation',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => <ConfirmationStory />,
}

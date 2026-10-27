import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  ConfirmationProvider,
  createConfirmationService,
  useConfirmation,
  type ConfirmationResult,
} from '../src/dialogs'
import { Button } from '../src/controls/buttons'
import { Badge } from '../src/display/Badge'
import { describeComponent } from './support/describe'
import { Column, Row } from './support/layout'

function DeleteCommand({ onResult }: { onResult: (result: ConfirmationResult) => void }) {
  const confirmation = useConfirmation()
  return (
    <Row>
      <Button
        critical
        onClick={async () => {
          const { result } = confirmation.request({
            title: 'Delete "Camera 001"?',
            description: '对象会从场景中移除。',
            confirmLabel: 'Delete',
            critical: true,
          })
          onResult(await result)
        }}>
        Delete camera
      </Button>
      <Button
        onClick={async () => {
          const first = confirmation.request({ title: 'Save "Main.scene"?', confirmLabel: 'Save' })
          const second = confirmation.request({ title: 'Save "Lighting.scene"?', confirmLabel: 'Save' })
          onResult(await first.result)
          onResult(await second.result)
        }}>
        Two requests in a row
      </Button>
    </Row>
  )
}

const meta = {
  title: 'Dialogs/ConfirmationProvider',
  component: ConfirmationProvider,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '用代码发起确认：`request()` 弹出确认对话框并返回一个 Promise，等待用户的回答。',
    use: ['命令、快捷键处理函数里需要先确认再执行：`await confirmation.request(...).result`', '多个确认按顺序排队显示'],
    avoid: ['确认对话框和某个按钮直接绑定 → 用 `AlertDialog` 更简单'],
    related: ['`AlertDialog`：声明式的确认对话框，本组件内部也使用它'],
    notes: [
      '应用启动时 `createConfirmationService()` 创建一次，用 `ConfirmationProvider` 放在根部；组件里用 `useConfirmation()`',
      '`result` 的 `status`：`confirmed`、`cancelled`（点了取消）、`closed`（Escape 关闭）、`unmounted`、`unavailable`（没有 Provider）',
      '只在 `status === "confirmed"` 时执行操作',
    ],
  }),
  args: { service: createConfirmationService() },
  argTypes: { service: { control: false }, children: { control: false } },
} satisfies Meta<typeof ConfirmationProvider>
export default meta
type Story = StoryObj<typeof meta>

/** 点击按钮发起确认，回答结果显示在下方；连续发起的两个请求会依次显示。 */
export const Basic: Story = {
  render: function Render() {
    const [service] = useState(createConfirmationService)
    const [results, setResults] = useState<ConfirmationResult[]>([])
    return (
      <ConfirmationProvider service={service}>
        <Column>
          <DeleteCommand onResult={(result) => setResults((items) => [...items.slice(-3), result])} />
          <Row>
            {results.map((result) => (
              <Badge key={result.id} color={result.status === 'confirmed' ? 'green' : 'gray'}>
                #{result.id} {result.status}
              </Badge>
            ))}
          </Row>
        </Column>
      </ConfirmationProvider>
    )
  },
}

import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { EditableText } from '../src/controls/inputs'
import { Button } from '../src/controls/buttons'
import { describeComponent } from './support/describe'
import { Column, Item, Row, StateView } from './support/layout'

const meta = {
  title: 'Controls/EditableText',
  component: EditableText,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '平时显示为文字，点击后进入编辑；Enter 或失焦提交，Escape 取消。',
    use: [
      '对象、图层、资源的名称：大多数时候只看、偶尔改',
      '需要异步保存的改名：`onCommit` 返回 Promise，失败时保留草稿和错误',
    ],
    avoid: ['一直处于可编辑状态的字段 → 用 `Input`', '属性面板里接应用数据服务的字段 → 用 `PropertyField`'],
    related: ['`Input`：始终可编辑', '`TreeRoot`、`CollectionEditor` 的改名使用同样的编辑流程（`useTextEdit`）'],
    keyboard: [
      ['点击 / Enter / Space', '进入编辑'],
      ['Enter', '提交'],
      ['Escape', '取消，恢复原值'],
    ],
  }),
  args: { label: 'Object name', value: 'Camera 001', onCommit: fn() },
} satisfies Meta<typeof EditableText>
export default meta
type Story = StoryObj<typeof meta>

/** 受控使用时，在 `onCommit` 里更新 `value`。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <EditableText
        {...args}
        value={value}
        onCommit={(draft, reason) => {
          args.onCommit(draft, reason)
          setValue(draft)
        }}
      />
    )
  },
}

/** `showIcon` 显示编辑图标；空值显示 `emptyText`；只读可以聚焦但不能进入编辑。 */
export const States: Story = {
  render: (args) => (
    <Row>
      <Item label="showIcon">
        <EditableText {...args} showIcon />
      </Item>
      <Item label="empty">
        <EditableText {...args} value="" emptyText="Untitled" />
      </Item>
      <Item label="readOnly">
        <EditableText {...args} readOnly />
      </Item>
      <Item label="disabled">
        <EditableText {...args} disabled />
      </Item>
    </Row>
  ),
}

/** 记录 begin / draft / commit / cancel 的顺序；外部更新会取消正在进行的编辑。 */
export const BehaviorCommitAndCancel: Story = {
  tags: ['!autodocs'],
  render: () => <EditableBehaviorCard />,
}

/** 保存 Promise 未完成时显示 Saving；拒绝后保留草稿和错误，可修改后重试。 */
export const BehaviorAsyncCommit: Story = {
  tags: ['!autodocs'],
  render: () => <AsyncEditableBehaviorCard />,
}

function EditableBehaviorCard() {
  const [name, setName] = useState('Camera 001')
  const [events, setEvents] = useState<string[]>([])
  const record = (message: string) => setEvents((items) => [...items.slice(-9), message])
  return (
    <Column width={320}>
      <EditableText
        label="Object name"
        value={name}
        showIcon
        onBegin={() => record('begin')}
        onDraftChange={(draft) => record(`draft: ${draft}`)}
        onCommit={(draft, reason) => {
          record(`commit (${reason}): ${draft}`)
          setName(draft)
        }}
        onCancel={(reason) => record(`cancel: ${reason}`)}
      />
      <Row>
        <Button size="sm" variant="outline">
          Blur target
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setName('Externally updated')
            record('external update')
          }}>
          External update
        </Button>
      </Row>
      <StateView value={{ value: name, events }} />
    </Column>
  )
}

function AsyncEditableBehaviorCard() {
  const [name, setName] = useState('Accepted name')
  const [pending, setPending] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const request = useRef<{ resolve: () => void; reject: (error: Error) => void } | null>(null)
  const record = (message: string) => setEvents((items) => [...items.slice(-9), message])
  return (
    <Column width={320}>
      <EditableText
        label="Async name"
        value={name}
        onBegin={() => record('begin')}
        onCommit={async (draft) => {
          record(`request: ${draft}`)
          setPending(true)
          try {
            await new Promise<void>((resolve, reject) => {
              request.current = { resolve, reject }
            })
            setName(draft)
            record(`accepted: ${draft}`)
          } catch (error) {
            record(`rejected: ${error instanceof Error ? error.message : String(error)}`)
            throw error
          } finally {
            request.current = null
            setPending(false)
          }
        }}
        onCancel={(reason) => record(`cancel: ${reason}`)}
      />
      <Row>
        <Button
          size="sm"
          variant="outline"
          disabled={!pending}
          onClick={() => {
            const current = request.current
            request.current = null
            current?.resolve()
          }}>
          Accept request
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!pending}
          onClick={() => {
            const current = request.current
            request.current = null
            current?.reject(new Error('Name rejected. Edit the draft or retry.'))
          }}>
          Reject request
        </Button>
      </Row>
      <StateView value={{ value: name, pending, events }} />
    </Column>
  )
}

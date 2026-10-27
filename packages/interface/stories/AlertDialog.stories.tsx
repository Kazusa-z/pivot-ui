import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { AlertDialog } from '../src/dialogs'
import { Button } from '../src/controls/buttons'
import { describeComponent } from './support/describe'
import { Column, StateView } from './support/layout'

const meta = {
  title: 'Dialogs/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '必须明确回答的确认对话框：一个问题、一段后果说明、取消和确认两个按钮。',
    use: ['删除、覆盖、丢弃未保存修改等不可逆操作之前'],
    avoid: ['可以撤销的普通操作 → 直接执行，并提供撤销', '需要填写内容 → 用 `Dialog`'],
    related: ['`ConfirmationProvider`：用代码发起确认、等待结果，适合在命令里调用', '`Dialog`：表单和详细内容'],
    notes: [
      '确认按钮写具体动作（"Delete"、"Discard"），不要只写 "OK"',
      '`critical` 让确认按钮使用危险色；点击遮罩不会关闭，用户必须选择一个按钮或按 Escape',
    ],
    keyboard: [
      ['Tab', '在取消和确认之间切换（默认聚焦取消）'],
      ['Escape', '等同于取消'],
    ],
  }),
  args: {
    title: 'Delete 3 objects?',
    description: '这些对象和它们的子对象会从场景中移除，无法撤销。',
    confirmLabel: 'Delete',
    critical: true,
    trigger: <Button critical>Delete…</Button>,
    onConfirm: fn(),
    onCancel: fn(),
  },
  argTypes: { trigger: { control: false } },
} satisfies Meta<typeof AlertDialog>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** 非危险的确认：确认按钮使用普通的主色。 */
export const NonCritical: Story = {
  args: {
    title: 'Apply import settings?',
    description: '12 个资源会按新的设置重新导入。',
    confirmLabel: 'Reimport',
    critical: false,
    trigger: <Button>Apply…</Button>,
  },
}

/** 受控：在确认回调里执行操作，结果记录在下方。 */
export const BehaviorControlled: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [open, setOpen] = useState(false)
    const [events, setEvents] = useState<string[]>([])
    const record = (event: string) => setEvents((items) => [...items.slice(-5), event])
    return (
      <Column>
        <AlertDialog
          title="Discard changes?"
          description="未保存的修改会丢失。"
          confirmLabel="Discard"
          critical
          trigger={<Button>Close scene</Button>}
          rootProps={{ open, onOpenChange: setOpen }}
          onConfirm={() => record('confirm')}
          onCancel={() => record('cancel')}
        />
        <StateView value={{ open, events }} />
      </Column>
    )
  },
}

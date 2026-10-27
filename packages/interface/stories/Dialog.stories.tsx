import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Dialog, DialogClose } from '../src/dialogs'
import { Button } from '../src/controls/buttons'
import { Input } from '../src/controls/inputs/Input'
import { Select } from '../src/controls/choices/Select'
import { PropertyControl, PropertyLabel, PropertyRow } from '../src/layout/PropertyRow'
import { describeComponent } from './support/describe'
import { Column, Row, StateView } from './support/layout'

const formats = [
  { key: 'gltf', label: 'glTF', value: 'gltf' },
  { key: 'fbx', label: 'FBX', value: 'fbx' },
]

function ExportForm() {
  return (
    <Column>
      <PropertyRow density="regular">
        <PropertyLabel htmlFor="export-name">File name</PropertyLabel>
        <PropertyControl association="control">
          <Input id="export-name" size="md" defaultValue="Main.scene" />
        </PropertyControl>
      </PropertyRow>
      <PropertyRow density="regular">
        <PropertyLabel htmlFor="export-format">Format</PropertyLabel>
        <PropertyControl association="control">
          <Select id="export-format" size="md" options={formats} defaultValue="gltf" />
        </PropertyControl>
      </PropertyRow>
      <Row>
        <DialogClose asChild>
          <Button size="md" variant="solid">
            Export
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button size="md">Cancel</Button>
        </DialogClose>
      </Row>
    </Column>
  )
}

const meta = {
  title: 'Dialogs/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '模态对话框：打开时遮住页面，焦点限制在对话框内，用于表单和详细操作。',
    use: ['导出、导入、新建项目等需要填写几项参数的流程', '需要用户专注完成、完成前不应操作页面其他部分的任务'],
    avoid: [
      '只需要回答"是 / 否"的确认 → 用 `AlertDialog` 或 `ConfirmationProvider`',
      '就地修改一两个值 → 用 `Popover`',
      '可以和页面同时使用的面板 → 用侧栏或 `ResizableSplit`',
    ],
    related: ['`AlertDialog`：必须明确回答的确认', '`Popover`：非模态的就地浮层'],
    notes: [
      '`title` 必填，也是对话框的无障碍名称；视觉上不需要时用 `titleHidden`',
      '对话框使用常规档尺寸：控件 `size="md"`、`PropertyRow density="regular"`',
      '用 `DialogClose asChild` 包住按钮来关闭；受控使用时通过 `rootProps.open` / `onOpenChange`',
    ],
    keyboard: [
      ['Tab / Shift + Tab', '在对话框内循环'],
      ['Escape', '关闭，焦点回到触发按钮'],
    ],
  }),
  args: {
    title: 'Export scene',
    description: '导出当前场景和它引用的资源。',
    trigger: <Button>Export…</Button>,
    children: <ExportForm />,
  },
  argTypes: { trigger: { control: false }, children: { control: false } },
} satisfies Meta<typeof Dialog>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** 内容较长时，对话框高度限制在视口内，内容整体滚动。 */
export const LongContent: Story = {
  args: {
    title: 'Release notes',
    description: undefined,
    trigger: <Button variant="outline">Open release notes</Button>,
    children: (
      <Column>
        {Array.from({ length: 30 }, (_, index) => (
          <p key={index} style={{ margin: 0 }}>
            {index + 1}. Improved import performance for large scenes.
          </p>
        ))}
      </Column>
    ),
  },
}

/** 受控：应用决定何时打开和关闭，例如保存成功后关闭。 */
export const BehaviorControlled: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <Column>
        <Row>
          <Dialog title="Controlled dialog" trigger={<Button>Open</Button>} rootProps={{ open, onOpenChange: setOpen }}>
            <Button size="md" variant="outline" onClick={() => setOpen(false)}>
              Close from content
            </Button>
          </Dialog>
          <Button variant="subtle" onClick={() => setOpen(true)}>
            Open from outside
          </Button>
        </Row>
        <StateView value={{ open }} />
      </Column>
    )
  },
}

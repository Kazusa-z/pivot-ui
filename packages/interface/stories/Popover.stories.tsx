import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IconDots, IconCopy, IconTrash } from '@tabler/icons-react'
import { Popover, PopoverClose, PopoverDescription, PopoverTitle } from '../src/overlays'
import { Button, IconButton } from '../src/controls/buttons'
import { Input } from '../src/controls/inputs'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { css } from '../styled-system/css'
import { describeComponent } from './support/describe'
import { Column, Row, StateView } from './support/layout'

const stack = css({ display: 'grid', gap: 'var(--space-2)', width: '220px' })
const title = css({
  margin: 0,
  fontSize: 'var(--fontSizes-controlLarge)',
  fontWeight: 600,
  color: 'var(--colors-textStrong)',
})
const description = css({ margin: 0, fontSize: 'var(--fontSizes-control)', color: 'var(--colors-textMuted)' })

function RenameForm() {
  return (
    <div className={stack}>
      <PopoverTitle className={title}>Rename object</PopoverTitle>
      <PopoverDescription className={description}>名称会在场景层级中显示。</PopoverDescription>
      <Input aria-label="Object name" defaultValue="Camera 001" autoFocus />
      <Row>
        <PopoverClose asChild>
          <Button variant="solid">Rename</Button>
        </PopoverClose>
        <PopoverClose asChild>
          <Button>Cancel</Button>
        </PopoverClose>
      </Row>
    </div>
  )
}

const meta = {
  title: 'Overlays/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '点击触发元素后在旁边打开的浮层，可以放表单和其他可交互内容。',
    use: ['小型就地编辑：改名、设置几个参数', '筛选条件、视图选项', '颜色、曲线等 `*Picker` 组件的浮层都基于它'],
    avoid: [
      '只有一句说明文字 → 用 `Tooltip`',
      '一组命令 → 用 `DropdownMenu`，它有菜单语义和键盘导航',
      '需要用户必须处理的任务 → 用 `Dialog`',
    ],
    related: ['`Tooltip`：悬停提示，不可交互', '`HoverCard`：悬停预览', '`Dialog`：模态'],
    notes: [
      '简单场景用 `Popover`（trigger + children）；需要锚点、箭头或自定义结构时组合 `PopoverRoot` / `PopoverTrigger` / `PopoverContent` 等部件',
      '浮层通过 Portal 渲染，并继承所属 `ThemeProvider` 的主题',
    ],
    keyboard: [
      ['Enter / Space', '在触发元素上打开'],
      ['Escape', '关闭并把焦点还给触发元素'],
      ['Tab', '在浮层内容中移动'],
    ],
  }),
  argTypes: { trigger: { control: false } },
  args: { trigger: <Button>Rename…</Button>, children: <RenameForm /> },
} satisfies Meta<typeof Popover>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** `compact` 去掉内边距，适合内容自带内边距的操作列表。 */
export const Compact: Story = {
  render: () => (
    <Popover
      trigger={
        <IconButton aria-label="More actions" variant="subtle">
          <IconDots />
        </IconButton>
      }
      contentProps={{ compact: true, align: 'start' }}>
      <div className={css({ display: 'grid', padding: 'var(--space-1)' })}>
        <Button variant="subtle" startSlot={<IconCopy />} css={{ justifyContent: 'flex-start' }}>
          Duplicate
        </Button>
        <Button variant="subtle" critical startSlot={<IconTrash />} css={{ justifyContent: 'flex-start' }}>
          Delete
        </Button>
      </div>
    </Popover>
  ),
}

/** `contentProps.side` / `align` 控制方向；空间不够时会自动翻转。 */
export const Placement: Story = {
  render: () => (
    <Row>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover key={side} trigger={<Button variant="outline">{side}</Button>} contentProps={{ side }}>
          <span className={description}>Opens to the {side}.</span>
        </Popover>
      ))}
    </Row>
  ),
}

/** 受控开关：应用可以接受或拒绝每次开关请求；`keepMounted` 关闭后保留输入的草稿。 */
export const BehaviorControlledAndRetained: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [open, setOpen] = useState(false)
    const [reject, setReject] = useState(false)
    const [requests, setRequests] = useState<boolean[]>([])
    return (
      <Column>
        <Popover
          trigger={<Button>Open retained form</Button>}
          rootProps={{
            open,
            keepMounted: true,
            onOpenChange: (next) => {
              setRequests((items) => [...items.slice(-5), next])
              if (!reject) setOpen(next)
            },
          }}>
          <RenameForm />
        </Popover>
        <Checkbox label="Reject open-change requests" checked={reject} onCheckedChange={setReject} />
        <StateView value={{ open, requests }} />
      </Column>
    )
  },
}

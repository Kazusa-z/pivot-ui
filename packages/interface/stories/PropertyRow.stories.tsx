import { useId } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IconRestore } from '@tabler/icons-react'
import { PropertyControl, PropertyDescription, PropertyLabel, PropertyRow } from '../src/layout/PropertyRow'
import { Button, IconButton } from '../src/controls/buttons'
import { Input } from '../src/controls/inputs/Input'
import { NumberInput } from '../src/controls/inputs/NumberInput'
import { Select } from '../src/controls/choices/Select'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { describeComponent } from './support/describe'
import { Column, Item, Panel, Row } from './support/layout'

const modes = [
  { key: 'opaque', label: 'Opaque', value: 'opaque' },
  { key: 'transparent', label: 'Transparent', value: 'transparent' },
]

const meta = {
  title: 'Layout/PropertyRow',
  component: PropertyRow,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary:
      '属性面板的一行：左边标签、右边控件，下面可选的说明或错误。由 `PropertyLabel`、`PropertyControl`、`PropertyDescription` 组合。',
    use: ['手动排版属性面板，自己连接控件和数据', '一行放一组操作按钮或多个控件'],
    avoid: ['接应用数据服务、需要保存 / 错误 / 撤销 → 用 `PropertyField`，它内部就是 PropertyRow'],
    related: ['`PropertyField`：带数据绑定的属性行', '`Section`：把多行属性分组'],
    notes: [
      '单个控件：`PropertyLabel htmlFor={id}` + `PropertyControl association="control"`，并把 id 给控件',
      '一组控件或按钮：`PropertyLabel id={labelId}` + `PropertyControl association="group" labelledBy={labelId}`',
      '只读内容：`PropertyControl association="none"`',
    ],
  }),
  args: { density: 'compact' },
} satisfies Meta<typeof PropertyRow>
export default meta
type Story = StoryObj<typeof meta>

/** 单个控件：标签通过 `htmlFor` 关联到输入框，说明文字在控件下方对齐。 */
export const Basic: Story = {
  render: function Render(args) {
    const id = useId()
    return (
      <Panel>
        <PropertyRow {...args}>
          <PropertyLabel htmlFor={id}>Name</PropertyLabel>
          <PropertyControl association="control">
            <Input id={id} defaultValue="Camera 001" aria-describedby={`${id}-help`} />
          </PropertyControl>
          <PropertyDescription id={`${id}-help`}>显示在场景层级中。</PropertyDescription>
        </PropertyRow>
      </Panel>
    )
  },
}

/** 多行组成一个面板：标签列宽度一致，控件左缘对齐。 */
export const MultipleRows: Story = {
  render: () => (
    <Panel>
      <Column>
        <PropertyRow>
          <PropertyLabel htmlFor="pr-mode">Render mode</PropertyLabel>
          <PropertyControl association="control">
            <Select id="pr-mode" options={modes} defaultValue="opaque" />
          </PropertyControl>
        </PropertyRow>
        <PropertyRow>
          <PropertyLabel htmlFor="pr-intensity">Intensity</PropertyLabel>
          <PropertyControl association="control">
            <NumberInput id="pr-intensity" defaultValue={1.5} step={0.1} />
          </PropertyControl>
        </PropertyRow>
        <PropertyRow>
          <PropertyLabel htmlFor="pr-shadows">Cast shadows</PropertyLabel>
          <PropertyControl association="control">
            <Checkbox id="pr-shadows" defaultChecked />
          </PropertyControl>
        </PropertyRow>
      </Column>
    </Panel>
  ),
}

/** 一组按钮：用 `association="group"` 让标签成为这一组的名称；标签旁的 `endSlot` 可以放重置按钮。 */
export const Actions: Story = {
  render: function Render() {
    const labelId = useId()
    return (
      <Panel>
        <PropertyRow>
          <PropertyLabel
            id={labelId}
            endSlot={
              <IconButton size="xs" variant="subtle" aria-label="Reset preview">
                <IconRestore />
              </IconButton>
            }>
            Preview
          </PropertyLabel>
          <PropertyControl association="group" labelledBy={labelId}>
            <Row>
              <Button>Refresh</Button>
              <Button variant="subtle">Open renderer</Button>
            </Row>
          </PropertyControl>
        </PropertyRow>
      </Panel>
    )
  },
}

/** 错误说明使用 `tone="danger"`，同时给控件设置 `state="invalid"`。 */
export const ErrorMessage: Story = {
  render: () => (
    <Panel>
      <PropertyRow>
        <PropertyLabel htmlFor="pr-name-error">Name</PropertyLabel>
        <PropertyControl association="control">
          <Input
            id="pr-name-error"
            state="invalid"
            aria-invalid
            aria-errormessage="pr-name-error-text"
            defaultValue="Camera Main"
          />
        </PropertyControl>
        <PropertyDescription id="pr-name-error-text" tone="danger">
          名称不能包含空格。
        </PropertyDescription>
      </PropertyRow>
    </Panel>
  ),
}

/** `compact`（24px 行）用于面板，`regular`（32px 行）用于对话框；`direction="column"` 标签在上。 */
export const Layouts: Story = {
  render: () => (
    <Row>
      {(
        [
          ['compact', 'row'],
          ['regular', 'row'],
          ['compact', 'column'],
        ] as const
      ).map(([density, direction]) => (
        <Item key={`${density}-${direction}`} label={`${density} · ${direction}`}>
          <Panel width={280}>
            <PropertyRow density={density} direction={direction}>
              <PropertyLabel htmlFor={`pr-${density}-${direction}`}>Distance</PropertyLabel>
              <PropertyControl association="control">
                <NumberInput
                  id={`pr-${density}-${direction}`}
                  defaultValue={2}
                  endSlot="m"
                  size={density === 'regular' ? 'md' : 'sm'}
                />
              </PropertyControl>
            </PropertyRow>
          </Panel>
        </Item>
      ))}
    </Row>
  ),
}

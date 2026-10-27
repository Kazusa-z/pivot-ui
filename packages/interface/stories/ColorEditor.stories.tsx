import { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { ColorEditor } from '../src/editors/color/ColorEditor'
import { convertColorSpace, type ColorValue } from '../src/values/color'
import { Button } from '../src/controls/buttons'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { blue, createDemoCapabilities, emissive, green, rollbackReasons } from './support/color-samples'
import { describeComponent } from './support/describe'
import { Column, Grid, Item, Row, StateView } from './support/layout'

const meta = {
  title: 'Editors/Color/ColorEditor',
  component: ColorEditor,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '完整展开的颜色编辑器：色彩平面、色相和透明度滑块，以及 RGB / HSV / HEX 输入。',
    use: ['侧栏或独立面板里需要持续调色', '`ColorPicker`、`ColorField` 的浮层内容就是它'],
    avoid: ['属性面板的一行 → 用 `ColorField` 或 `ColorPicker`', '渐变 → 用 `ColorRampEditor`'],
    related: ['`ColorField`：一行的紧凑字段', '`ColorPicker`：色块按钮打开浮层', '`HDRColorField`：带强度的 HDR 颜色'],
    notes: [
      '`value` 是 `{ space, r, g, b, a }`，通道为 0–1；`space` 是保存的编码（`srgb` / `linear`），组件不会改变它',
      'RGB 输入框可以切换按 sRGB 或 Linear 显示（`displaySpace`），HEX 和 HSV 总是 sRGB',
      '`hdr` 打开后 RGB 可以超过 1；`capabilities` 提供剪贴板和屏幕取色',
    ],
    keyboard: [
      ['方向键（色相 / 透明度滑块）', '按步长移动；Shift 或 PageUp / PageDown 为 10 倍'],
      ['Tab', '在滑块和输入框之间移动；色彩平面只能用指针操作，键盘用输入框'],
      ['Enter', '提交输入框的值'],
      ['Escape', '取消当前编辑'],
    ],
  }),
  args: { value: blue, onValueChange: fn(), onValueCommit: fn() },
  argTypes: { value: { control: false }, capabilities: { control: false } },
} satisfies Meta<typeof ColorEditor>
export default meta
type Story = StoryObj<typeof meta>

/** 受控使用：在 `onValueChange` 里更新 `value`。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <Column width={280}>
        <ColorEditor
          {...args}
          value={value}
          onValueChange={(next) => {
            args.onValueChange?.(next)
            setValue(next)
          }}
        />
      </Column>
    )
  },
}

/** `defaultModel="hsv"` 以色相、饱和度、明度输入；用户也可以在编辑器里切换。 */
export const HSV: Story = {
  args: { defaultModel: 'hsv' },
  render: Basic.render,
}

/** 保存为 Linear 的颜色：RGB 按 Linear 显示，HEX 仍是 sRGB。 */
export const LinearColor: Story = {
  args: { value: convertColorSpace(blue, 'linear') },
  render: Basic.render,
}

/** `hdr` 允许通道超过 1，用于发光颜色。 */
export const HDR: Story = {
  args: { value: emissive, hdr: true },
  render: Basic.render,
}

/** 提供 `capabilities` 后显示复制、粘贴和屏幕取色按钮（这里的取色总是返回绿色）。 */
export const WithCapabilities: Story = {
  render: function Render(args) {
    const capabilities = useMemo(createDemoCapabilities, [])
    const [value, setValue] = useState<ColorValue>(blue)
    return (
      <Column width={280}>
        <ColorEditor
          {...args}
          value={value}
          capabilities={capabilities}
          onValueChange={setValue}
          onValueCommit={setValue}
        />
      </Column>
    )
  },
}

/** 只读可以查看和复制，禁用不能操作。 */
export const States: Story = {
  render: () => (
    <Grid>
      <Item label="readOnly">
        <ColorEditor label="Read only color" value={blue} readOnly />
      </Item>
      <Item label="disabled">
        <ColorEditor label="Disabled color" value={blue} disabled />
      </Item>
    </Grid>
  ),
}

/** 完整的编辑生命周期：外部更新、异步提交被拒绝后恢复。 */
export const BehaviorEditLifecycle: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const capabilities = useMemo(createDemoCapabilities, [])
    const [value, setValue] = useState<ColorValue>(blue)
    const [revision, setRevision] = useState(0)
    const [reject, setReject] = useState(false)
    const [events, setEvents] = useState<string[]>([])
    const start = useRef(value)
    const record = (event: string) => setEvents((current) => [...current.slice(-9), event])
    return (
      <Column width={320}>
        <Row>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setValue(green)
              setRevision((current) => current + 1)
              record('external update')
            }}>
            External update
          </Button>
          <Checkbox
            checked={reject}
            onCheckedChange={(checked) => setReject(checked === true)}
            label="Reject next commit"
          />
        </Row>
        <ColorEditor
          label="Behavior color"
          value={value}
          resetKey={revision}
          capabilities={capabilities}
          onEditStart={(source) => {
            start.current = value
            record(`begin:${source}`)
          }}
          onValueChange={setValue}
          onValueCommit={async (next, reason) => {
            record(`commit:${reason}`)
            await new Promise((resolve) => setTimeout(resolve, 220))
            if (reject) {
              setReject(false)
              setValue(start.current)
              record('rejected')
              throw new Error('颜色未保存：请调整后重试。')
            }
            setValue(next)
          }}
          onEditCancel={(reason) => {
            record(`cancel:${reason}`)
            if (rollbackReasons.includes(reason)) setValue(start.current)
          }}
        />
        <StateView value={{ value, events }} />
      </Column>
    )
  },
}

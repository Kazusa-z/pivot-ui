import type { Meta, StoryObj } from '@storybook/react'
import { Kbd, KbdGroup } from '../src/display/Kbd'
import { Text } from '../src/foundation/typography'
import { describeComponent } from './support/describe'
import { Column, Item, Row } from './support/layout'

const meta = {
  title: 'Display/Kbd',
  component: KbdGroup,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '显示快捷键和鼠标手势：`KbdGroup` 从字符串解析出一组按键，`Kbd` 显示单个按键。',
    use: ['菜单项、按钮、Tooltip 里的快捷键提示', '视口操作说明：Shift + 左键拖动'],
    notes: [
      '`shortcuts` 支持 `ctrl`、`cmd`、`alt`、`shift`、方向键等名称，显示为对应符号；`mld` / `mrd` / `mdd` 是鼠标左键 / 右键 / 双击',
      '这里只负责显示；快捷键的注册和平台差异（Ctrl 或 ⌘）由应用处理',
    ],
  }),
  args: { shortcuts: 'ctrl+shift+s' },
} satisfies Meta<typeof KbdGroup>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** 常见写法：字符串用 `+` 或 `,` 分隔，也可以传数组。 */
export const Formats: Story = {
  render: () => (
    <Column>
      {['cmd+k', 'alt+arrowup', 'shift+enter', 'ctrl++'].map((shortcut) => (
        <Row key={shortcut}>
          <KbdGroup shortcuts={shortcut} />
          <Text size="xs" tone="muted">
            {`'${shortcut}'`}
          </Text>
        </Row>
      ))}
      <Row>
        <KbdGroup shortcuts={['cmd', 'shift', 'p']} />
        <Text size="xs" tone="muted">
          {"['cmd', 'shift', 'p']"}
        </Text>
      </Row>
    </Column>
  ),
}

/** 鼠标和触摸手势显示为图标，可以和修饰键组合。 */
export const Gestures: Story = {
  render: () => (
    <Row>
      <KbdGroup shortcuts="shift+mld" />
      <KbdGroup shortcuts="mrd" />
      <KbdGroup shortcuts="mdd" />
      <KbdGroup shortcuts="touch-two" />
    </Row>
  ),
}

/** 三档高度；正文中单个按键用 `Kbd`，`letterCase="preserve"` 保留按键名的大小写。 */
export const Sizes: Story = {
  render: () => (
    <Column>
      <Row>
        {(['xs', 'sm', 'md'] as const).map((size) => (
          <Item key={size} label={`${size} · ${{ xs: 16, sm: 18, md: 20 }[size]}px`}>
            <KbdGroup shortcuts="ctrl+z" size={size} />
          </Item>
        ))}
      </Row>
      <Text size="sm">
        按 <Kbd letterCase="preserve">Escape</Kbd> 关闭当前面板。
      </Text>
    </Column>
  ),
}

import type { Meta, StoryObj } from '@storybook/react'
import { IconAlertCircle, IconAlertTriangle, IconCircleCheck, IconInfoCircle } from '@tabler/icons-react'
import { Callout } from '../src/display/feedback'
import { describeComponent } from './support/describe'
import { Column } from './support/layout'

const meta = {
  title: 'Display/Callout',
  component: Callout,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '一段持续显示的提示：说明、警告、错误或成功结果。',
    use: ['面板顶部说明当前状态："这个对象由预制件控制"', '保存、导入后的结果说明', '需要用户处理的错误'],
    avoid: [
      '短暂的操作反馈 → 用通知（`NotificationProvider`）',
      '字段旁的校验错误 → 用输入控件的 `state` 和 `PropertyField` 的错误',
      '一两个词的状态 → 用 `Badge`',
    ],
    related: ['`Badge`：短状态标签', '通知：自动消失的反馈'],
    notes: ['`severity` 只决定颜色；读屏是否立即播报由 `role` 决定，紧急错误用 `role="alert"`'],
  }),
  argTypes: { icon: { control: false } },
  args: {
    severity: 'info',
    title: 'Prefab instance',
    icon: <IconInfoCircle />,
    children: '这些属性由预制件控制。修改会覆盖预制件中的值。',
  },
} satisfies Meta<typeof Callout>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: (args) => (
    <Column width={420}>
      <Callout {...args} />
    </Column>
  ),
}

/** 四种严重程度：底色是对应颜色的浅色 tint，图标和标题带颜色，正文保持普通文字色。 */
export const Severities: Story = {
  render: () => (
    <Column width={420}>
      <Callout severity="info" icon={<IconInfoCircle />} title="Info">
        光照贴图会在下次烘焙时更新。
      </Callout>
      <Callout severity="warning" icon={<IconAlertTriangle />} title="Warning">
        这个材质使用了已弃用的着色器。
      </Callout>
      <Callout severity="error" icon={<IconAlertCircle />} title="Error" role="alert">
        3 个资源导入失败，查看日志了解原因。
      </Callout>
      <Callout severity="success" icon={<IconCircleCheck />} title="Success" role="status">
        已保存到 Assets/Scenes/Main.scene。
      </Callout>
    </Column>
  ),
}

/** 只有正文、不带标题和图标的简短说明。 */
export const Minimal: Story = {
  render: () => (
    <Column width={420}>
      <Callout>没有未保存的修改。</Callout>
    </Column>
  ),
}

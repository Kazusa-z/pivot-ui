import type { Meta, StoryObj } from '@storybook/react'
import { HoverCard } from '../src/overlays'
import { Button } from '../src/controls/buttons'
import { Badge } from '../src/display/Badge'
import { css } from '../styled-system/css'
import { describeComponent } from './support/describe'

const swatch = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d7dbe0"/><stop offset="1" stop-color="#7a8088"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/></svg>'
)}`

function MaterialPreview() {
  return (
    <div className={css({ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 'var(--space-3)', width: '260px' })}>
      <img src={swatch} alt="" width={64} height={64} className={css({ borderRadius: 'var(--radii-control)' })} />
      <div className={css({ display: 'grid', gap: 'var(--space-1)', alignContent: 'start' })}>
        <strong className={css({ color: 'var(--colors-textStrong)', fontSize: 'var(--fontSizes-controlLarge)' })}>
          Brushed metal
        </strong>
        <span className={css({ color: 'var(--colors-textMuted)', fontSize: 'var(--fontSizes-control)' })}>
          Assets/Materials/Metal.mat
        </span>
        <span>
          <Badge color="green" size="xs">
            ready
          </Badge>
        </span>
      </div>
    </div>
  )
}

const meta = {
  title: 'Overlays/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '悬停或聚焦时显示的预览卡片，比 Tooltip 内容更丰富。',
    use: ['资源引用、对象链接的预览：缩略图、路径、状态'],
    avoid: ['一句话提示 → 用 `Tooltip`', '需要点击操作的内容 → 用 `Popover`（悬停卡片在指针离开时会关闭）'],
    related: ['`Tooltip`：一句话提示', '`Popover`：点击打开、可交互'],
    notes: ['卡片内容只做补充，键盘和读屏用户应该能从触发元素本身得到同样的关键信息'],
  }),
  argTypes: { trigger: { control: false } },
  args: {
    trigger: <Button variant="subtle">Metal.mat</Button>,
    children: <MaterialPreview />,
    rootProps: { openDelay: 200, closeDelay: 150 },
  },
} satisfies Meta<typeof HoverCard>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** `contentProps.side` 控制方向，例如在侧栏中向右展开。 */
export const Placement: Story = {
  args: { contentProps: { side: 'right', align: 'start' } },
}

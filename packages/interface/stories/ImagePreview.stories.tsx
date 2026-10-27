import type { Meta, StoryObj } from '@storybook/react'
import { ImagePreview } from '../src/display/ImagePreview'
import { describeComponent } from './support/describe'
import { Item, Row } from './support/layout'

const source = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120"><rect width="240" height="120" fill="#253a62"/><circle cx="60" cy="60" r="36" fill="#5fbaee"/><path d="M126 92L166 24L206 92Z" fill="#eaa05b"/></svg>'
)}`

const meta = {
  title: 'Display/ImagePreview',
  component: ImagePreview,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '在固定尺寸里预览一张图片，默认完整显示并保持比例。',
    use: ['贴图、截图、缩略图的大图预览', 'HoverCard 或 Popover 里的资源预览'],
    avoid: ['资源列表中的小缩略图 → 用 `AssetThumbnail`'],
    related: ['`AssetThumbnail`：资源磁贴的缩略图，含加载和缺失状态'],
    notes: ['`alt` 必填；纯装饰时传空字符串'],
  }),
  args: { src: source, alt: 'Blue circle and orange triangle', width: 240, height: 120 },
} satisfies Meta<typeof ImagePreview>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** `objectFit` 决定图片在不同比例容器中的缩放：`contain` 完整显示（默认），`cover` 填满裁切，`fill` 拉伸。 */
export const ObjectFit: Story = {
  render: (args) => (
    <Row>
      {(['contain', 'cover', 'fill'] as const).map((fit) => (
        <Item key={fit} label={fit}>
          <ImagePreview {...args} objectFit={fit} width={120} height={120} />
        </Item>
      ))}
    </Row>
  ),
}

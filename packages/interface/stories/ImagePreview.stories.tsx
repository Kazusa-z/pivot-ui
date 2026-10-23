import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ImagePreview } from '../src/widgets/display/ImagePreview'
import { ContractFrame, StatePanel } from './support/ContractFrame'

const source = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120"><rect width="240" height="120" fill="#253a62"/><circle cx="60" cy="60" r="36" fill="#5fbaee"/><path d="M126 92L166 24L206 92Z" fill="#eaa05b"/></svg>')}`

function ImagePreviewExample() {
  const [fit, setFit] = useState<'contain' | 'cover'>('contain')
  const [width, setWidth] = useState(180)
  return (
    <ContractFrame
      title="在有限区域展示图片"
      description="切换 objectFit 可比较完整显示与裁切填满，调整宽度可观察容器约束。应用提供 src 和说明图片内容的 alt，并按需要设置尺寸；资源解析和加载状态由应用管理。"
      onReset={() => {
        setFit('contain')
        setWidth(180)
      }}>
      <label>
        Object fit
        <select value={fit} onChange={(e) => setFit(e.currentTarget.value as typeof fit)}>
          <option value="contain">Contain</option>
          <option value="cover">Cover</option>
        </select>
      </label>
      <label>
        Preview width
        <input
          type="range"
          min={80}
          max={300}
          value={width}
          onChange={(e) => setWidth(Number(e.currentTarget.value))}
        />
      </label>
      <ImagePreview
        src={source}
        alt="Blue circle and orange triangle"
        width={width}
        height={120}
        objectFit={fit}
        css={{ backgroundColor: 'var(--colors-gray3)' }}
      />
      <StatePanel label="State" value={{ width, height: 120, fit }} />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ImagePreview 用于在限定区域内展示图片，适合缩略图、材质预览和详情面板。src 和 alt 提供图像及文字说明，objectFit 决定完整显示或裁切填满。应用负责取得图片地址并确定加载、错误等业务状态，尺寸由容器和组件样式控制。',
      },
    },
  },
  title: 'Widgets/ImagePreview',
  component: ImagePreview,
  args: { alt: 'Image preview' },
} satisfies Meta<typeof ImagePreview>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <ImagePreviewExample /> }

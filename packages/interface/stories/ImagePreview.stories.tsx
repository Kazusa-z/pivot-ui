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
      title="Image presentation"
      description="src、alt、尺寸与适配方式独立；缩略图解析和资源状态由调用方提供。"
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

const meta = { title: 'Widgets/ImagePreview', component: ImagePreview, args: { alt: 'Image preview' } } satisfies Meta<
  typeof ImagePreview
>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <ImagePreviewExample /> }

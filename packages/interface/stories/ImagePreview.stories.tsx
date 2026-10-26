import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ImagePreview } from '../src/widgets/display/ImagePreview'
import { Select } from '../src/widgets/choices/Select'
import { InputNumber } from '../src/widgets/inputs/InputNumber'
import { Text } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryField,
  StoryGrid,
  StoryCode,
  StoryProps,
} from './support/StoryPage'

const source = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120"><rect width="240" height="120" fill="#253a62"/><circle cx="60" cy="60" r="36" fill="#5fbaee"/><path d="M126 92L166 24L206 92Z" fill="#eaa05b"/></svg>')}`

const fitOptions = [
  { key: 'contain', label: 'Contain', value: 'contain' },
  { key: 'cover', label: 'Cover', value: 'cover' },
] as const

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ImagePreview 在限定区域内展示图片，适合缩略图、材质预览和详情面板。src 与 alt 提供图像和说明，objectFit 决定完整显示或裁切填满；资源地址和加载状态由应用管理。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Display/ImagePreview',
  component: ImagePreview,
  args: { alt: 'Image preview' },
} satisfies Meta<typeof ImagePreview>
export default meta
type Story = StoryObj<typeof meta>

function ImagePreviewExample() {
  const [fit, setFit] = useState<'contain' | 'cover'>('contain')
  const [width, setWidth] = useState(180)
  return (
    <StoryPage
      eyebrow="Display"
      title="ImagePreview"
      summary="只负责图片展示。应用提供地址、alt、尺寸和 objectFit；加载、失败与资源解析由应用处理。"
      meta={
        <>
          <span>object-fit</span>
          <span>·</span>
          <span>intrinsic aspect ratio</span>
        </>
      }>
      <StorySection title="Preview" description="切换 objectFit 比较完整显示与裁切填满；宽度由容器和组件尺寸控制。">
        <StoryCard>
          <StoryRow align="start">
            <StoryField label="Object fit">
              <Select
                aria-label="Object fit"
                value={fit}
                options={[...fitOptions]}
                onValueChange={(value) => {
                  if (value === 'contain' || value === 'cover') setFit(value)
                }}
              />
            </StoryField>
            <StoryField label="Preview width">
              <InputNumber
                aria-label="Preview width"
                value={width}
                min={80}
                max={300}
                step={10}
                onValueChange={(value) => setWidth(value)}
              />
            </StoryField>
          </StoryRow>
          <div
            style={{ width: `${width}px`, maxWidth: '100%' }}
            className={css({ backgroundColor: 'var(--colors-surfaceSubtle)', borderRadius: 'var(--radii-control)' })}>
            <ImagePreview
              src={source}
              alt="Blue circle and orange triangle"
              width={width}
              height={120}
              objectFit={fit}
            />
          </div>
          <Text size="sm" tone="muted">
            Current: {width}px wide, object-fit: {fit}
          </Text>
        </StoryCard>
      </StorySection>

      <StorySection title="Fit modes" description="同一张图片在 contain 与 cover 下的裁切差异。">
        <StoryGrid>
          {(['contain', 'cover'] as const).map((mode) => (
            <StoryCard key={mode} title={mode}>
              <div
                className={css({
                  width: '100%',
                  height: '120px',
                  overflow: 'hidden',
                  borderRadius: 'var(--radii-control)',
                  backgroundColor: 'var(--colors-surfaceSubtle)',
                })}>
                <ImagePreview
                  src={source}
                  alt={`Blue circle and orange triangle, ${mode}`}
                  width="100%"
                  height="100%"
                  objectFit={mode}
                />
              </div>
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<ImagePreview
  src={asset.thumbnailUrl}
  alt={asset.name}
  width={220}
  height={120}
  objectFit="contain"
/>`}
          />
          <StoryProps
            rows={[
              { name: 'src', type: 'string', description: '图片地址；由应用解析资源。' },
              { name: 'alt', type: 'string', description: '必填；说明图片内容。' },
              { name: 'objectFit', type: 'CSS object-fit', defaultValue: "'contain'", description: '完整显示或裁切。' },
              { name: 'width / height', type: 'number | string', description: '原生图片尺寸；容器仍可约束。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <ImagePreviewExample /> }

import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { css } from '../styled-system/css'
import {
  EyeDropperIcon,
  MouseDoubleDownIcon,
  MouseLeftDownIcon,
  MouseRightDownIcon,
  IconRightBottomCorner,
  IconCodeFile,
  IconAnimationControllerFile,
  IconAnimatorClipFile,
  IconFontFile,
  IconPrefabFile,
  IconSceneFile,
  IconShaderFile,
  IconSpineSkeletonFile,
  IconSpineFile,
  IconSpriteFile,
  IconSpriteAtlasFile,
  IconUnknownFile,
  IconVrReferenceImageFile,
  IconPendingFile,
  ConstrainIcon,
} from '../src/foundation/icons'
import { Button } from '../src/controls/buttons'
import { Text } from '../src/foundation/typography'
import { StoryPage, StorySection, StoryCard, StoryGrid, StoryRow, StoryState, StoryCode } from './support/StoryPage'

const commonIcons = {
  EyeDropperIcon,
  MouseDoubleDownIcon,
  MouseLeftDownIcon,
  MouseRightDownIcon,
  IconRightBottomCorner,
}

const fileIcons = {
  IconCodeFile,
  IconAnimationControllerFile,
  IconAnimatorClipFile,
  IconFontFile,
  IconPrefabFile,
  IconSceneFile,
  IconShaderFile,
  IconSpineSkeletonFile,
  IconSpineFile,
  IconSpriteFile,
  IconSpriteAtlasFile,
  IconUnknownFile,
  IconVrReferenceImageFile,
  IconPendingFile,
}

const iconCell = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--space-2)',
  minWidth: 0,
  textAlign: 'center',
})

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '图标组件标识文件类型、鼠标操作和工具状态，接收 SVG 尺寸、颜色和原生属性。图标默认装饰；独立表达含义时提供 title 或 aria-label。放入按钮时由按钮提供操作名称。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Foundation/Icons',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function IconAttributesExample() {
  const ref = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(32)
  const [message, setMessage] = useState('Ref is attached to the SVG')
  return (
    <StoryCard
      title="Accessible names and attributes"
      description="title/aria-label 决定可访问名称；ref 指向实际 SVG。">
      <StoryRow align="start">
        <div className={iconCell}>
          <IconCodeFile title="Source code file" width={width} height={48} ref={ref} data-testid="named-icon" />
          <Text size="xs" tone="muted">
            Source code file
          </Text>
        </div>
        <div className={iconCell}>
          <IconCodeFile title="Second source code file" width={width} height={48} />
          <Text size="xs" tone="muted">
            Second source file
          </Text>
        </div>
        <div className={iconCell}>
          <EyeDropperIcon
            aria-label="Pick a color"
            width={width}
            height={48}
            style={{ color: 'var(--colors-primary)' }}
          />
          <Text size="xs" tone="muted">
            Pick a color
          </Text>
        </div>
      </StoryRow>
      <StoryRow>
        <Button
          onClick={() => {
            setWidth(width === 32 ? 48 : 32)
            setMessage(ref.current ? `Ref points to ${ref.current.tagName}` : 'Ref is not attached')
          }}>
          Resize icons
        </Button>
        <Text size="sm" tone="muted">
          {message}; width {width}
        </Text>
      </StoryRow>
      <StoryState label="Icon state" value={{ width, message }} />
    </StoryCard>
  )
}

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Foundation"
      title="Icons"
      summary="文件类型、鼠标手势和工具状态图标。固定尺寸的 viewBox 加原生 SVG 属性，业务颜色和尺寸由调用方控制。"
      meta={
        <>
          <span>SVG</span>
          <span>·</span>
          <span>title / aria-label</span>
          <span>·</span>
          <span>currentColor</span>
        </>
      }>
      <StorySection title="Common icons" description="鼠标操作和工具状态图标；默认 1em，示例使用 28px。">
        <StoryGrid>
          {Object.entries(commonIcons).map(([name, Icon]) => (
            <StoryCard key={name}>
              <div className={iconCell}>
                <Icon width={28} height={28} />
                <Text size="xs" tone="muted">
                  {name}
                </Text>
              </div>
            </StoryCard>
          ))}
          <StoryCard>
            <div className={iconCell}>
              <ConstrainIcon width={28} height={28} />
              <Text size="xs" tone="muted">
                Unconstrained
              </Text>
            </div>
          </StoryCard>
          <StoryCard>
            <div className={iconCell}>
              <ConstrainIcon active width={28} height={28} />
              <Text size="xs" tone="muted">
                Constrained
              </Text>
            </div>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection title="File types" description="文件图标使用固定配色；在树或资源网格中按文件类型选择。">
        <StoryGrid>
          {Object.entries(fileIcons).map(([name, Icon]) => (
            <StoryCard key={name}>
              <div className={iconCell}>
                <Icon width={48} height={56} />
                <Text size="xs" tone="muted">
                  {name}
                </Text>
              </div>
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection title="Accessible names and attributes">
        <IconAttributesExample />
      </StorySection>

      <StorySection title="Usage">
        <StoryCode
          label="tsx"
          code={`<IconSceneFile width={24} height={28} />          // decorative
<IconSceneFile title="Scene file" width={24} height={28} />
<EyeDropperIcon aria-label="Pick a color" />`}
        />
      </StorySection>
    </StoryPage>
  ),
}

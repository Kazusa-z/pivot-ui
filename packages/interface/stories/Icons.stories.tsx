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

const grid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
  gap: '20px',
  width: 'min(680px, 90vw)',
})
const item = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
  textAlign: 'center',
  minWidth: 0,
  overflowWrap: 'anywhere',
})
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
const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '图标组件用于标识文件类型、鼠标操作和工具状态，接收 SVG 的尺寸、颜色及其他原生属性。图标默认作为装饰；独立传达含义时可提供 title 或 aria-label。放入按钮时由按钮提供操作名称，图标本身保留展示职责。',
      },
    },
  },
  title: 'Foundation/Icons',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Common: Story = {
  render: () => (
    <div className={grid}>
      {Object.entries(commonIcons).map(([name, Icon]) => (
        <div key={name} className={item}>
          <Icon width={28} height={28} />
          <span>{name}</span>
        </div>
      ))}
      <div className={item}>
        <ConstrainIcon width={28} height={28} />
        <span>Unconstrained</span>
      </div>
      <div className={item}>
        <ConstrainIcon active width={28} height={28} />
        <span>Constrained</span>
      </div>
    </div>
  ),
}

export const FileTypes: Story = {
  render: () => (
    <div className={grid}>
      {Object.entries(fileIcons).map(([name, Icon]) => (
        <div key={name} className={item}>
          <Icon width={48} height={56} />
          <span>{name}</span>
        </div>
      ))}
    </div>
  ),
}

function IconAttributesExample() {
  const ref = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(32)
  const [message, setMessage] = useState('')
  return (
    <div className={grid}>
      <IconCodeFile title="Source code file" width={width} height={48} ref={ref} data-testid="named-icon" />
      <IconCodeFile title="Second source code file" width={width} height={48} />
      <EyeDropperIcon aria-label="Pick a color" width={width} height={48} style={{ color: 'var(--colors-blue11)' }} />
      <button
        type="button"
        onClick={() => {
          setWidth(width === 32 ? 48 : 32)
          setMessage(ref.current?.tagName ?? '')
        }}>
        Resize icons
      </button>
      <output>{message ? `Ref points to ${message}; width ${width}` : 'Ref is attached to the SVG'}</output>
    </div>
  )
}

export const AccessibleNamesAndAttributes: Story = { render: () => <IconAttributesExample /> }

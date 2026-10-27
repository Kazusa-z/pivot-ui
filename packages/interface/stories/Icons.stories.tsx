import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Arrow,
  ConstrainIcon,
  EyeDropperIcon,
  IconAnimationControllerFile,
  IconAnimatorClipFile,
  IconCodeFile,
  IconFontFile,
  IconPendingFile,
  IconPrefabFile,
  IconRightBottomCorner,
  IconSceneFile,
  IconShaderFile,
  IconSpineFile,
  IconSpineSkeletonFile,
  IconSpriteAtlasFile,
  IconSpriteFile,
  IconUnknownFile,
  IconVrReferenceImageFile,
  MouseDoubleDownIcon,
  MouseLeftDownIcon,
  MouseRightDownIcon,
  type ArrowDirection,
} from '../src/foundation/icons'
import { Button } from '../src/controls/buttons'
import { css } from '../styled-system/css'
import { describeComponent } from './support/describe'
import { Grid, Item, Row } from './support/layout'

const fileIcons = {
  IconSceneFile,
  IconPrefabFile,
  IconCodeFile,
  IconShaderFile,
  IconFontFile,
  IconSpriteFile,
  IconSpriteAtlasFile,
  IconSpineFile,
  IconSpineSkeletonFile,
  IconAnimationControllerFile,
  IconAnimatorClipFile,
  IconVrReferenceImageFile,
  IconUnknownFile,
  IconPendingFile,
}
const toolIcons = { EyeDropperIcon, MouseLeftDownIcon, MouseRightDownIcon, MouseDoubleDownIcon, IconRightBottomCorner }
const cell = css({ display: 'grid', justifyItems: 'center', gap: 'var(--space-1_5)' })
const name = css({
  fontFamily: 'var(--fonts-mono)',
  fontSize: 'var(--fontSizes-micro)',
  color: 'var(--colors-textMuted)',
})

const meta = {
  title: 'Foundation/Icons',
  component: IconCodeFile,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '编辑器专用的 SVG 图标：资源文件类型、鼠标操作、工具状态和方向箭头。通用图标使用 `@tabler/icons-react`。',
    use: ['资源列表、树和磁贴里标识文件类型', '快捷键说明里表示鼠标操作', '折叠、展开等方向提示：`Arrow`'],
    notes: [
      '图标默认是装饰，会对读屏隐藏；单独表达含义时传 `title` 或 `aria-label`',
      '放进按钮时由按钮提供名称（`IconButton` 的 `aria-label`），图标保持装饰',
      '颜色跟随 `currentColor`，尺寸用 `width` / `height`',
    ],
  }),
  args: { width: 32, height: 32 },
} satisfies Meta<typeof IconCodeFile>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {}

/** 资源文件类型图标；`IconPendingFile` 表示仍在加载。 */
export const FileTypes: Story = {
  render: () => (
    <Grid>
      {Object.entries(fileIcons).map(([iconName, Icon]) => (
        <div key={iconName} className={cell}>
          <Icon width={32} height={32} />
          <span className={name}>{iconName}</span>
        </div>
      ))}
    </Grid>
  ),
}

/** 鼠标操作与工具图标；`ConstrainIcon` 的 `active` 表示比例已锁定。 */
export const Tools: Story = {
  render: () => (
    <Grid>
      {Object.entries(toolIcons).map(([iconName, Icon]) => (
        <div key={iconName} className={cell}>
          <Icon width={24} height={24} />
          <span className={name}>{iconName}</span>
        </div>
      ))}
      <div className={cell}>
        <ConstrainIcon width={24} height={24} />
        <span className={name}>ConstrainIcon</span>
      </div>
      <div className={cell}>
        <ConstrainIcon active width={24} height={24} />
        <span className={name}>ConstrainIcon active</span>
      </div>
    </Grid>
  ),
}

/** `Arrow` 支持八个方向；`animate` 让方向变化带旋转过渡。展开状态由外层按钮保存。 */
export const Arrows: Story = {
  render: function Render() {
    const [expanded, setExpanded] = useState(false)
    const directions: ArrowDirection[] = [
      'up',
      'right',
      'down',
      'left',
      'up-left',
      'up-right',
      'down-left',
      'down-right',
    ]
    return (
      <Row>
        {directions.map((direction) => (
          <Item key={direction} label={direction}>
            <Arrow direction={direction} />
          </Item>
        ))}
        <Item label="animate">
          <Button
            variant="subtle"
            aria-expanded={expanded}
            startSlot={<Arrow direction={expanded ? 'down' : 'right'} animate size="xs" />}
            onClick={() => setExpanded((value) => !value)}>
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </Item>
      </Row>
    )
  },
}

/** 单独出现时提供 `title`（悬停显示并供读屏朗读）；颜色由 `currentColor` 控制。 */
export const Labelled: Story = {
  render: () => (
    <Row>
      <IconCodeFile title="Source code file" width={32} height={32} />
      <EyeDropperIcon aria-label="Pick a color" width={24} height={24} style={{ color: 'var(--colors-primary)' }} />
    </Row>
  ),
}

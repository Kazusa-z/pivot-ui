import type { Meta, StoryObj } from '@storybook/react'
import { fontSizes, radii, shadows, sizes, space } from '../../../panda/designTokens'
import { css } from '../styled-system/css'
import { describeComponent } from './support/describe'
import { Grid, Item, Row } from './support/layout'

const tokenLabel = css({
  fontFamily: 'var(--fonts-mono)',
  fontSize: 'var(--fontSizes-micro)',
  color: 'var(--colors-textMuted)',
  overflowWrap: 'anywhere',
})
const swatch = css({ height: '40px', borderRadius: 'var(--radii-control)', border: '1px solid var(--colors-border)' })
const stack = css({ display: 'grid', gap: 'var(--space-1)' })

const colorGroups = {
  背景与层级: ['appBg', 'surface', 'surfaceRaised', 'panelBg', 'softBg', 'border', 'borderStrong'],
  文字: ['textMuted', 'text', 'textStrong'],
  强调与选中: ['primary', 'primaryMuted', 'selectionBg', 'selectionSubtleBg', 'controlRaisedBg', 'focusRing'],
  状态: ['infoBg', 'infoIcon', 'successBg', 'successIcon', 'warningBg', 'warningIcon', 'dangerBg', 'dangerIcon'],
} as const

const meta = {
  title: 'Foundation/Tokens',
  tags: ['autodocs'],
  parameters: {
    ...describeComponent({
      summary: '颜色、字号、尺寸、圆角、间距和阴影的设计 token。组件样式只使用这些值，应用自定义样式也应如此。',
      use: [
        '为应用界面写样式：`var(--colors-surface)`、`var(--sizes-controlSm)` 等 CSS 变量',
        '优先使用语义 token（`surface`、`text`、`primary`），而不是原始色阶（`gray3`、`blue9`）',
      ],
      notes: [
        '所有颜色 token 在明暗主题下都有值，`pnpm audit:styles` 会检查',
        '控件高度、圆角、字号不要写裸 px；内容尺寸（缩略图、颜色平面）需要在审计脚本里登记例外',
      ],
    }),
    controls: { disable: true },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/** 语义颜色按用途分组；切换工具栏的 Theme 查看亮色下的值。 */
export const Colors: Story = {
  render: () => (
    <div className={css({ display: 'grid', gap: 'var(--space-5)' })}>
      {Object.entries(colorGroups).map(([group, tokens]) => (
        <Item key={group} label={group}>
          <Grid>
            {tokens.map((token) => (
              <div key={token} className={stack}>
                <div className={swatch} style={{ backgroundColor: `var(--colors-${token})` }} />
                <span className={tokenLabel}>colors.{token}</span>
              </div>
            ))}
          </Grid>
        </Item>
      ))}
    </div>
  ),
}

/** 11 micro（快捷键、元信息）/ 12 紧凑控件 / 14 常规控件 / 16 标题 / 24 页面标题。 */
export const FontSizes: Story = {
  render: () => (
    <div className={css({ display: 'grid', gap: 'var(--space-3)' })}>
      {(['micro', 'control', 'controlLarge', 'heading', 'display'] as const).map((token) => (
        <div key={token} className={stack}>
          <span style={{ fontSize: `var(--fontSizes-${token})`, color: 'var(--colors-textStrong)' }}>
            Pivot UI 编辑器界面
          </span>
          <span className={tokenLabel}>
            fontSizes.{token} · {fontSizes[token]}
          </span>
        </div>
      ))}
    </div>
  ),
}

/** 控件只有四个高度：紧凑档 20 / 24，常规档 32 / 36。 */
export const ControlHeights: Story = {
  render: () => (
    <Row>
      {(['controlXs', 'controlSm', 'controlMd', 'controlLg'] as const).map((token) => (
        <div key={token} className={stack}>
          <div
            className={css({
              width: '72px',
              border: '1px solid var(--colors-border)',
              borderRadius: 'var(--radii-control)',
              backgroundColor: 'var(--colors-softBg)',
            })}
            style={{ height: `var(--sizes-${token})` }}
          />
          <span className={tokenLabel}>
            sizes.{token} · {sizes[token]}
          </span>
        </div>
      ))}
    </Row>
  ),
}

/** 20/24 控件 4px，32 控件 6px，36 控件与浮层 8px；pill 只用于标签和进度条。 */
export const Radii: Story = {
  render: () => (
    <Row>
      {(['control', 'controlMd', 'controlLg', 'pill'] as const).map((token) => (
        <div key={token} className={stack}>
          <div
            className={css({
              width: '72px',
              height: '40px',
              backgroundColor: 'var(--colors-softBg)',
              border: '1px solid var(--colors-borderStrong)',
            })}
            style={{ borderRadius: `var(--radii-${token})` }}
          />
          <span className={tokenLabel}>
            radii.{token} · {radii[token]}
          </span>
        </div>
      ))}
    </Row>
  ),
}

/** 布局间距只用 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32。 */
export const Spacing: Story = {
  render: () => (
    <div className={css({ display: 'grid', gap: 'var(--space-1_5)' })}>
      {(['0_5', '1', '1_5', '2', '3', '4', '5', '6', '8'] as const).map((token) => (
        <Row key={token}>
          <div
            className={css({
              height: '8px',
              borderRadius: 'var(--radii-pill)',
              backgroundColor: 'var(--colors-primary)',
            })}
            style={{ width: `var(--space-${token})` }}
          />
          <span className={tokenLabel}>
            space.{token} · {space[token]}
          </span>
        </Row>
      ))}
    </div>
  ),
}

/** 浮层（Popover、菜单）用 `overlay`，对话框用更强的 `modal`；分段控件的选中项用 `raised`。 */
export const Elevation: Story = {
  render: () => (
    <Row>
      {(['raised', 'overlay', 'modal'] as const).map((token) => (
        <div key={token} className={stack}>
          <div
            className={css({
              width: '160px',
              height: '80px',
              borderRadius: 'var(--radii-card)',
              backgroundColor: 'var(--colors-surfaceRaised)',
              border: '1px solid var(--colors-border)',
            })}
            style={{ boxShadow: `var(--shadows-${token})` }}
          />
          <span className={tokenLabel} title={shadows[token]}>
            shadows.{token}
          </span>
        </div>
      ))}
    </Row>
  ),
}

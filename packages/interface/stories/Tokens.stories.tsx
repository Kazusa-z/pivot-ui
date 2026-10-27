import type { Meta, StoryObj } from '@storybook/react'
import { fontSizes, radii, sizes, space } from '../../../panda/designTokens'
import { Button } from '../src/controls/buttons'
import { Input } from '../src/controls/inputs/Input'
import { Select } from '../src/controls/choices/Select'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { Text } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryGrid,
  StoryCard,
  StoryRow,
  StoryDensity,
  StoryDensityGroup,
  StoryCode,
} from './support/StoryPage'

const densityOptions = [
  { key: 'a', label: 'Local', value: 'local' },
  { key: 'b', label: 'World', value: 'world' },
]

const semanticSwatches = [
  'appBg',
  'surface',
  'surfaceRaised',
  'panelBg',
  'softBg',
  'border',
  'borderStrong',
  'textMuted',
  'text',
  'textStrong',
  'primary',
  'primarySolid',
  'selectionBg',
  'selectionText',
  'infoBg',
  'infoText',
  'successBg',
  'successText',
  'warningBg',
  'warningText',
  'dangerBg',
  'dangerText',
] as const

const fontScale = [
  { token: 'micro', size: 'xs', label: 'micro / Kbd / meta' },
  { token: 'control', size: 'sm', label: 'control / dense UI' },
  { token: 'controlLarge', size: 'md', label: 'controlLarge / regular' },
  { token: 'heading', size: 'lg', label: 'heading / section' },
  { token: 'display', size: 5, label: 'display / page title' },
] as const

const radiusScale = ['control', 'controlMd', 'controlLg', 'pill'] as const
const spaceScale = ['0_5', '1', '1_5', '2', '3', '4', '5', '6', '8'] as const

const swatch = css({
  height: '40px',
  borderRadius: 'var(--radii-control)',
  border: '1px solid var(--colors-border)',
})
const bar = css({
  height: '8px',
  borderRadius: 'var(--radii-pill)',
  backgroundColor: 'var(--colors-primary)',
})
const tokenLabel = css({
  fontFamily: 'var(--fonts-mono)',
  fontSize: 'var(--fontSizes-micro)',
  color: 'var(--colors-textMuted)',
  overflowWrap: 'anywhere',
})

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '视觉规范页：两档密度、语义颜色、字阶、圆角、间距和 elevation。组件的尺寸、状态和层级来自这些 token；应用自定义样式也优先使用相同角色。',
      },
    },
    layout: 'fullscreen',
    controls: { disable: true },
  },
  title: 'Foundation/Tokens',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Foundation"
      title="Tokens"
      summary="一套两档密度的编辑器视觉基线：紧凑 20/24，常规 32/36；圆角 4/6/8，浮层与模态共用一套 surface 和 elevation。"
      meta={
        <>
          <span>2 density tiers</span>
          <span>·</span>
          <span>semantic colors</span>
          <span>·</span>
          <span>1 focus ring</span>
        </>
      }>
      <StorySection
        title="Density"
        description="核心控件只使用两档高度；面板、菜单、树和表格按 24/32 行高对齐。"
        actions={
          <Text size="xs" tone="muted">
            20 / 24 / 32 / 36
          </Text>
        }>
        <StoryDensityGroup>
          <StoryDensity tier="compact" description="工具栏、属性面板、菜单、树、表格。">
            <Button size="sm">Button</Button>
            <Button size="sm" variant="outline">
              Outline
            </Button>
            <Input aria-label="Compact input" placeholder="Value" size="sm" />
            <Select aria-label="Compact select" size="sm" value="local" options={densityOptions} />
            <Checkbox size="sm" defaultChecked label="Bool" />
          </StoryDensity>
          <StoryDensity tier="regular" description="对话框、常规表单、文档页。">
            <Button size="md">Button</Button>
            <Button size="md" variant="outline">
              Outline
            </Button>
            <Input aria-label="Regular input" placeholder="Value" size="md" />
            <Select aria-label="Regular select" size="md" value="local" options={densityOptions} />
            <Checkbox size="md" defaultChecked label="Bool" />
          </StoryDensity>
        </StoryDensityGroup>
        <StoryCard title="Control heights" description="token 值与实际控件高度一一对应。">
          <StoryRow>
            {(['controlXs', 'controlSm', 'controlMd', 'controlLg'] as const).map((token) => (
              <div key={token} className={css({ display: 'grid', gap: 'var(--space-1)' })}>
                <div
                  className={css({
                    width: '64px',
                    border: '1px solid var(--colors-border)',
                    borderRadius: 'var(--radii-control)',
                    backgroundColor: 'var(--colors-surfaceSubtle)',
                  })}
                  style={{ height: `var(--sizes-${token})` }}
                />
                <span className={tokenLabel}>
                  {token} · {sizes[token]}
                </span>
              </div>
            ))}
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="Semantic colors"
        description="优先使用角色，不直接引用原始调色板；明暗主题由 ThemeProvider 切换。">
        <StoryGrid>
          {semanticSwatches.map((token) => (
            <StoryCard key={token}>
              <div className={swatch} style={{ backgroundColor: `var(--colors-${token})` }} />
              <div className={tokenLabel}>colors.{token}</div>
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection title="Type scale" description="11 / 12 / 14 / 16 / 24；10 与 13 不再用于新样式。">
        <StoryCard>
          {fontScale.map((item) => (
            <StoryRow key={item.token} align="center">
              <div className={css({ display: 'grid', gap: 'var(--space-1)', width: '100%' })}>
                <Text size={item.size}>The quick brown fox</Text>
                <span className={tokenLabel}>
                  {item.token} · {fontSizes[item.token]} · {item.label}
                </span>
              </div>
            </StoryRow>
          ))}
        </StoryCard>
      </StorySection>

      <StorySection title="Radii" description="20/24 控件 4px，32 控件 6px，36+ 与浮层 8px；pill 只用于标签和进度。">
        <StoryGrid>
          {radiusScale.map((token) => (
            <StoryCard key={token}>
              <div
                className={css({
                  width: '72px',
                  height: '48px',
                  backgroundColor: 'var(--colors-surfaceStrong)',
                  border: '1px solid var(--colors-borderStrong)',
                })}
                style={{ borderRadius: `var(--radii-${token})` }}
              />
              <div className={tokenLabel}>
                radii.{token} · {radii[token]}
              </div>
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection title="Spacing" description="布局只使用 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32。">
        <StoryCard>
          {spaceScale.map((token) => (
            <StoryRow key={token}>
              <div className={bar} style={{ width: `var(--space-${token})` }} />
              <span className={tokenLabel}>
                space.{token} · {space[token]}
              </span>
            </StoryRow>
          ))}
        </StoryCard>
      </StorySection>

      <StorySection
        title="Elevation"
        description="浮层使用 overlay，Dialog 使用更强的 modal；两者都基于 surfaceRaised。">
        <StoryGrid>
          {(['overlay', 'modal'] as const).map((token) => (
            <StoryCard key={token}>
              <div
                className={css({
                  height: '96px',
                  borderRadius: 'var(--radii-card)',
                  backgroundColor: 'var(--colors-surfaceRaised)',
                  border: '1px solid var(--colors-border)',
                })}
                style={{ boxShadow: `var(--shadows-${token})` }}
              />
              <div className={tokenLabel}>
                shadows.{token} · {token}
              </div>
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="css"
            code={`backgroundColor: 'var(--colors-surface)',
borderColor: 'var(--colors-border)',
borderRadius: 'var(--radii-controlMd)',
height: 'var(--sizes-controlSm)',
fontSize: 'var(--fontSizes-control)',
outlineColor: 'var(--colors-focusRing)'`}
          />
          <StoryCard title="Rules">
            <Text size="sm" tone="muted">
              控件高度、圆角、字号和状态色必须来自 token。不要在组件里新增一次性 px；内容尺寸（颜色平面、缩略图、Slider
              竖向高度）保留例外并写注释。
            </Text>
            <Text size="sm" tone="muted">
              overlay 与 modal 是两级阴影：浮层使用 overlay，Dialog 使用更强的 modal。
            </Text>
          </StoryCard>
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}

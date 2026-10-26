import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button, ActionButton, ActionButtonGroup } from '../src/widgets/buttons'
import { Text } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryState,
  StoryCode,
  StoryProps,
} from './support/StoryPage'

function AddIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
      <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

const sizeLabels = { xs: '20px', sm: '24px', md: '32px', lg: '36px' } as const
const variants = ['outline', 'soft', 'solid', 'subtle', 'inverted'] as const

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Button 用于带文字的操作，ActionButton 用于紧凑图标操作，ActionButtonGroup 把相关动作排成一组。size 使用两档密度，variant 表达层级；async 接收 Promise 并在等待期间阻止重复请求。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Widgets/Buttons',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function ButtonsExample() {
  const [clicks, setClicks] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState('move')
  return (
    <StoryPage
      eyebrow="Widgets"
      title="Buttons"
      summary="用文字按钮执行操作，用图标按钮节省空间。尺寸只有紧凑 20/24 与常规 32/36；状态由 variant、critical/positive、disabled 和 loading 组合表达。"
      meta={
        <>
          <span>{clicks} clicks</span>
          <span>·</span>
          <span>2 density tiers</span>
        </>
      }
      actions={
        <Button size="sm" variant="outline" onClick={() => setClicks(0)}>
          Reset
        </Button>
      }>
      <StorySection
        title="Variants"
        description="outline 用于次级操作，soft 是默认，solid 用于主要操作，subtle/inverted 用于低强调或反色场景。">
        <StoryCard>
          <StoryRow>
            {variants.map((variant) => (
              <Button key={variant} variant={variant} onClick={() => setClicks((value) => value + 1)}>
                {variant}
              </Button>
            ))}
          </StoryRow>
          <StoryRow>
            <Button critical variant="solid" onClick={() => setClicks((value) => value + 1)}>
              Critical
            </Button>
            <Button positive variant="soft" onClick={() => setClicks((value) => value + 1)}>
              Positive
            </Button>
            <Button disabled>Disabled</Button>
            <Button loading={loading}>Save</Button>
            <Button variant="outline" onClick={() => setLoading((value) => !value)}>
              Toggle loading
            </Button>
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection title="Sizes" description="紧凑档 20/24，常规档 32/36；字号和圆角随档位变化。">
        <StoryCard>
          <StoryRow align="end">
            {(Object.keys(sizeLabels) as (keyof typeof sizeLabels)[]).map((size) => (
              <div key={size} className={css({ display: 'grid', gap: 'var(--space-1)' })}>
                <Text size="xs" tone="muted">
                  {size} · {sizeLabels[size]}
                </Text>
                <Button size={size} onClick={() => setClicks((value) => value + 1)}>
                  {size.toUpperCase()}
                </Button>
              </div>
            ))}
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection title="Slots" description="startSlot/endSlot 放置图标或单位；加载时用 Spin 替换开始/结束图标。">
        <StoryCard>
          <StoryRow>
            <Button startSlot={<AddIcon />} onClick={() => setClicks((value) => value + 1)}>
              Add object
            </Button>
            <Button endSlot="↗" variant="outline">
              Open docs
            </Button>
            <Button startSlot={<AddIcon />} endSlot="⌘K" variant="subtle">
              Shortcut
            </Button>
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="Action buttons"
        description="图标按钮提供 aria-label；active 表示当前工具，corner 显示角标。">
        <StoryCard>
          <StoryRow>
            {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
              <ActionButton
                key={size}
                size={size}
                aria-label={`Add ${size}`}
                onClick={() => setClicks((value) => value + 1)}>
                <AddIcon />
              </ActionButton>
            ))}
            <ActionButton active aria-label="Active action">
              <AddIcon />
            </ActionButton>
            <ActionButton disabled aria-label="Disabled action">
              <AddIcon />
            </ActionButton>
            <ActionButton loading aria-label="Loading action">
              <AddIcon />
            </ActionButton>
            <ActionButton corner aria-label="Open action menu">
              <AddIcon />
            </ActionButton>
          </StoryRow>
          <StoryRow>
            {(['horizontal', 'vertical'] as const).map((direction) => (
              <ActionButtonGroup
                key={direction}
                direction={direction}
                size="md"
                role="group"
                aria-label={`${direction} actions`}>
                {['move', 'rotate', 'scale'].map((action) => (
                  <ActionButton
                    key={action}
                    size="md"
                    aria-label={`${direction} ${action}`}
                    active={selected === action}
                    onClick={() => setSelected(action)}>
                    {action[0]?.toUpperCase()}
                  </ActionButton>
                ))}
              </ActionButtonGroup>
            ))}
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<Button variant="solid" onClick={save}>Save</Button>
<Button startSlot={<IconPlus />} loading={saving}>Add</Button>
<ActionButton aria-label="Delete" active onClick={remove}>
  <IconTrash />
</ActionButton>
<ActionButtonGroup size="md" direction="horizontal">…</ActionButtonGroup>`}
          />
          <StoryProps
            rows={[
              {
                name: 'size',
                type: "'xs' | 'sm' | 'md' | 'lg'",
                defaultValue: "'sm'",
                description: '紧凑 20/24，常规 32/36。',
              },
              {
                name: 'variant',
                type: "'outline' | 'soft' | 'solid' | 'subtle' | 'inverted'",
                defaultValue: "'soft'",
                description: '视觉层级。',
              },
              { name: 'critical / positive', type: 'boolean', defaultValue: 'false', description: '危险/正向语义。' },
              { name: 'loading', type: 'boolean', defaultValue: 'false', description: '显示等待状态并阻止重复激活。' },
              {
                name: 'async',
                type: '() => Promise<void>',
                description: '点击后等待 Promise，失败交给 onAsyncError。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
      <StoryState label="Interaction state" value={{ clicks, loading, selected }} />
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <ButtonsExample /> }

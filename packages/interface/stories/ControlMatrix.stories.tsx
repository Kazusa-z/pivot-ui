import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button, IconButton } from '../src/controls/buttons'
import { Input } from '../src/controls/inputs/Input'
import { NumberInput } from '../src/controls/inputs/NumberInput'
import { Select } from '../src/controls/choices/Select'
import { Combobox } from '../src/controls/choices/Combobox'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { SegmentControl } from '../src/controls/choices/SegmentControl'
import { ToggleGroup } from '../src/controls/choices/ToggleGroup'
import { Slider } from '../src/controls/sliders/Slider'
import { Text } from '../src/foundation/typography'
import { StoryPage, StorySection, StoryCard, StoryRow } from './support/StoryPage'

const options = [
  { key: 'local', label: 'Local', value: 'local' },
  { key: 'world', label: 'World', value: 'world' },
]
const toggleOptions = [
  { key: 'move', label: 'Move', value: 'move' },
  { key: 'rotate', label: 'Rotate', value: 'rotate' },
  { key: 'scale', label: 'Scale', value: 'scale' },
]

const controlWidth = { width: '200px' } as const
const sliderWidth = { width: '220px' } as const

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <StoryRow align="center">
    <Text size="xs" tone="muted" css={{ width: '104px', flexShrink: 0 }}>
      {label}
    </Text>
    {children}
  </StoryRow>
)

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '核心控件的两档密度与状态矩阵。用于快速检查高度、圆角、字号、焦点、禁用、只读和错误状态是否一致；不是替代各组件文档的用法说明。',
      },
    },
    layout: 'fullscreen',
    controls: { disable: true },
  },
  title: 'Foundation/Control matrix',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function Matrix({ density }: { density: 'compact' | 'regular' }) {
  const size = density === 'compact' ? 'sm' : 'md'
  return (
    <StoryCard
      title={density === 'compact' ? 'Compact · 20 / 24' : 'Regular · 32 / 36'}
      description={density === 'compact' ? '工具栏、属性面板、菜单、树、表格。' : '对话框、常规表单、文档页。'}>
      <Row label="Button">
        <Button size={size}>Button</Button>
        <Button size={size} variant="outline">
          Outline
        </Button>
        <Button size={size} variant="solid">
          Solid
        </Button>
        <IconButton size={size} aria-label={`Add (${density})`}>
          <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
            <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </IconButton>
      </Row>
      <Row label="Text input">
        <Input size={size} placeholder="Value" aria-label={`${density} input`} css={controlWidth} />
        <Input
          size={size}
          state="invalid"
          defaultValue="Invalid"
          aria-label={`${density} invalid input`}
          css={controlWidth}
        />
      </Row>
      <Row label="Number">
        <NumberInput size={size} value={10} min={0} max={100} aria-label={`${density} number`} css={controlWidth} />
      </Row>
      <Row label="Select">
        <Select size={size} value="local" options={options} aria-label={`${density} select`} css={controlWidth} />
        <Combobox size={size} value="local" options={options} aria-label={`${density} combobox`} css={controlWidth} />
      </Row>
      <Row label="Choices">
        <Checkbox size={size} defaultChecked label="Checked" />
        <Checkbox size={size} label="Unchecked" />
        <Checkbox size={size} checked="indeterminate" label="Mixed" />
      </Row>
      <Row label="Segment">
        <SegmentControl
          size={size}
          value="local"
          options={options}
          onValueChange={() => {}}
          aria-label={`${density} segment`}
        />
      </Row>
      <Row label="Toggle">
        <ToggleGroup
          type="single"
          size={size}
          value="move"
          options={toggleOptions}
          onValueChange={() => {}}
          aria-label={`${density} toggle`}
        />
      </Row>
      <Row label="Slider">
        <Slider size={size} value={[40]} aria-label={`${density} slider`} css={sliderWidth} />
      </Row>
    </StoryCard>
  )
}

function States() {
  return (
    <StoryCard title="States" description="同一状态在不同控件上使用同一套语义。">
      <Row label="Disabled">
        <Button disabled>Button</Button>
        <Input disabled defaultValue="Disabled" aria-label="Disabled input" css={controlWidth} />
        <Select disabled value="local" options={options} aria-label="Disabled select" css={controlWidth} />
        <Checkbox disabled defaultChecked label="Disabled" />
      </Row>
      <Row label="Read only">
        <Input readOnly value="Read only" aria-label="Read only input" css={controlWidth} />
        <Select readOnly value="local" options={options} aria-label="Read only select" css={controlWidth} />
        <Slider readOnly value={[40]} aria-label="Read only slider" css={sliderWidth} />
      </Row>
      <Row label="Invalid">
        <Input state="invalid" defaultValue="Invalid" aria-label="Invalid input" css={controlWidth} />
        <Checkbox aria-invalid label="Invalid choice" />
      </Row>
      <Row label="Loading">
        <Button loading>Loading</Button>
        <IconButton loading aria-label="Loading action" />
      </Row>
    </StoryCard>
  )
}

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Foundation"
      title="Control matrix"
      summary="把核心控件放在同一张表里检查两档密度和状态。新增控件或修改 token 后，先看这一页是否仍然对齐。"
      meta={
        <>
          <span>Button</span>
          <span>·</span>
          <span>Input</span>
          <span>·</span>
          <span>Choice</span>
          <span>·</span>
          <span>Slider</span>
        </>
      }>
      <StorySection title="Density" description="同一行的控件高度、字号、圆角应属于同一档。">
        <Matrix density="compact" />
        <Matrix density="regular" />
      </StorySection>
      <StorySection title="States" description="焦点、禁用、只读、错误和加载不依赖具体组件。">
        <States />
      </StorySection>
    </StoryPage>
  ),
}

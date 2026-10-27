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
import { css } from '../styled-system/css'
import { describeComponent } from './support/describe'

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

// Every row uses the same label column so heights and baselines can be compared across rows.
const rowClass = css({
  display: 'grid',
  gridTemplateColumns: '96px minmax(0, 1fr)',
  alignItems: 'center',
  gap: 'var(--space-3)',
})
const labelClass = css({ fontSize: 'var(--fontSizes-micro)', color: 'var(--colors-textMuted)' })
const cellClass = css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' })
const tableClass = css({ display: 'grid', gap: 'var(--space-2)' })
const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className={rowClass}>
    <span className={labelClass}>{label}</span>
    <div className={cellClass}>{children}</div>
  </div>
)

const meta = {
  title: 'Foundation/Control matrix',
  tags: ['autodocs'],
  parameters: {
    ...describeComponent({
      summary: '把核心控件按两档密度和常见状态排在一起，检查高度、圆角、字号和状态样式是否一致。',
      use: [
        '修改 token 或新增控件后，先看这一页是否仍然对齐',
        '选择密度：紧凑档（20 / 24）用于工具栏、属性面板、菜单、树和表格；常规档（32 / 36）用于对话框、表单和文档页',
      ],
      notes: [
        '焦点：2px `focusRing` 外描边；禁用：50% 透明且不可交互；只读：颜色不变、只改光标；错误：只改边框和文字色',
      ],
    }),
    controls: { disable: true },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function Matrix({ density }: { density: 'compact' | 'regular' }) {
  const size = density === 'compact' ? 'sm' : 'md'
  return (
    <div className={tableClass}>
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
          css={controlWidth}
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
    </div>
  )
}

function States() {
  return (
    <div className={tableClass}>
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
    </div>
  )
}

/** 紧凑档：控件 24px（`sm`），同一行的高度、字号、圆角都属于同一档。 */
export const Compact: Story = { render: () => <Matrix density="compact" /> }

/** 常规档：控件 32px（`md`），用于对话框、表单和文档页。 */
export const Regular: Story = { render: () => <Matrix density="regular" /> }

/** 禁用、只读、错误和加载在每种控件上使用同一套表现。 */
export const ControlStates: Story = { render: () => <States /> }

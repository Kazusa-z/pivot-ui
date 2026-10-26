import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SegmentControl } from '../src/widgets/choices/SegmentControl'
import type { ChoiceOption, ChoiceValue } from '../src/values'
import { Button } from '../src/widgets/buttons'
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
  StoryState,
  StoryKeyboard,
} from './support/StoryPage'

const options = [
  { key: 'local', label: 'Local', value: 'local' },
  { key: 'world', label: 'World', value: 'world' },
  { key: 'normal', label: 'Normal', value: 'normal', disabled: true, disabledReason: 'Select a mesh first' },
] satisfies readonly ChoiceOption<string>[]

const typedOptions = [
  { key: 's001', label: 'String 001', value: '001' },
  { key: 's1', label: 'String 1', value: '1' },
  { key: 'n1', label: 'Number 1', value: 1 },
  { key: 'empty', label: 'Empty string', value: '' },
] satisfies readonly ChoiceOption[]

const sizes = [
  { size: 'sm' as const, height: '24px' },
  { size: 'md' as const, height: '32px' },
  { size: 'lg' as const, height: '36px' },
]

const meta = {
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'SegmentControl 在少量互斥选项之间切换，适合坐标系、视图模式等场景。它使用单选组语义，方向键移动并选择，onValueChange 返回所选原始值；应用通过 value 接受请求，null 表示未选择。',
      },
    },
  },
  title: 'Widgets/Choices/SegmentControl',
} satisfies Meta
export default meta
type Story = StoryObj

function SegmentExample() {
  const [value, setValue] = useState<string | null>('local')
  const [typed, setTyped] = useState<ChoiceValue | null>(null)
  const [requests, setRequests] = useState<string[]>([])
  const [revision, setRevision] = useState(0)
  const reset = () => {
    setValue('local')
    setTyped(null)
    setRequests([])
    setRevision((current) => current + 1)
  }
  return (
    <StoryPage
      eyebrow="Widgets / Choices"
      title="SegmentControl"
      summary="用一组并排的单选项切换模式。组件负责焦点和选择请求，应用通过受控 value 接受结果；需要再次点击取消或多选时使用 ToggleGroup。"
      meta={
        <>
          <span>single-select</span>
          <span>·</span>
          <span>24 / 32 / 36</span>
          <span>·</span>
          <span>radiogroup</span>
        </>
      }
      actions={
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
      }>
      <StorySection
        title="Variants"
        description="subtle 是默认的紧凑样式；solid 提供更强的选中对比。两者都使用同一套选择语义和键盘行为。">
        <StoryGrid>
          <StoryCard title="Subtle" description="Default in dense panels.">
            <SegmentControl
              aria-label="Subtle coordinate system"
              options={options}
              value={value}
              onValueChange={setValue}
            />
            <Text size="sm" tone="muted">
              Current value: {value ?? 'null'}
            </Text>
          </StoryCard>
          <StoryCard title="Solid" description="Higher-contrast selected state.">
            <SegmentControl
              key={revision}
              aria-label="Solid coordinate system"
              options={options}
              defaultValue="world"
              variant="solid"
            />
            <Text size="sm" tone="muted">
              Selected option is filled with the selection color.
            </Text>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Sizes"
        description="紧凑档使用 24px；常规档使用 32px 和 36px。控件高度、字号和圆角随 size 一起变化。">
        <StoryCard title="Size scale" description="sm / md / lg">
          <StoryRow align="start">
            {sizes.map(({ size, height }) => (
              <StoryField key={size} label={`${size} — ${height}`}>
                <SegmentControl
                  key={`${revision}-${size}`}
                  aria-label={`${size} coordinate system`}
                  options={options}
                  size={size}
                  defaultValue="local"
                />
              </StoryField>
            ))}
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="States"
        description="readOnly 保留键盘浏览但拒绝修改；disabled 停用整个组；固定 value 的示例展示应用拒绝请求时界面保持原值。">
        <StoryCard>
          <StoryRow align="start">
            <StoryField label="Read only" hint="Focusable, value fixed">
              <SegmentControl
                aria-label="Read only coordinate system"
                options={options}
                defaultValue="local"
                readOnly
                onValueChange={(next) => setRequests((current) => [...current, next])}
              />
            </StoryField>
            <StoryField label="Disabled" hint="Skipped by keyboard">
              <SegmentControl
                key={revision}
                aria-label="Disabled coordinate system"
                options={options}
                defaultValue="world"
                disabled
              />
            </StoryField>
            <StoryField label="Rejected request" hint="Controlled value stays local">
              <SegmentControl
                aria-label="Rejected coordinate system"
                options={options}
                value="local"
                onValueChange={(next) => setRequests((current) => [...current, next])}
              />
            </StoryField>
          </StoryRow>
          <StoryState label="Requested values" value={requests} open />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Typed values"
        description="key 用于稳定识别选项，value 是应用收到的原始值。字符串 001、字符串 1、数字 1 和空字符串分别保留自己的类型。">
        <StoryCard title="Identity-preserving selection">
          <SegmentControl
            aria-label="Typed value"
            options={typedOptions}
            value={typed}
            onValueChange={setTyped}
            variant="solid"
          />
          <Text size="sm" tone="muted">
            {typed === null ? 'No value selected' : `${String(typed)} · ${typeof typed}`}
          </Text>
          <StoryState label="Value and type" value={{ value: typed, type: typed === null ? 'null' : typeof typed }} />
        </StoryCard>
      </StorySection>

      <StorySection title="Layout" description="空选项时保留组容器；竖排适合窄侧栏。">
        <StoryCard>
          <StoryRow align="start">
            <StoryField label="Empty" hint="No options yet">
              <SegmentControl aria-label="Empty coordinate system" options={[]} />
            </StoryField>
            <StoryField label="Vertical" hint="Arrow keys still apply">
              <SegmentControl
                key={revision}
                aria-label="Vertical coordinate system"
                options={options}
                defaultValue="world"
                orientation="vertical"
                css={{ maxWidth: '200px' }}
              />
            </StoryField>
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="Keyboard & accessibility"
        description="组使用 radiogroup 语义；每个选项保留自己的可访问名称，禁用项会从键盘浏览中移除。">
        <StoryGrid>
          <StoryKeyboard
            rows={[
              { keys: ['←', '→', '↑', '↓'], action: '移动焦点并选择相邻选项。' },
              { keys: ['Home', 'End'], action: '跳到第一个或最后一个可用选项。' },
              { keys: ['Space', 'Enter'], action: '选择当前聚焦的选项。' },
              { keys: 'Tab', action: '进入或离开整个组。' },
            ]}
          />
          <StoryCard title="Notes">
            <Text size="sm" tone="muted">
              提供 aria-label 描述这组选项的用途。readOnly 仍可聚焦和浏览，但不会触发 onValueChange；disabled
              会跳过整组。选项的 disabledReason 会作为 title 提示。
            </Text>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const [mode, setMode] = useState<string | null>('local')

<SegmentControl
  aria-label="Coordinate system"
  options={[
    { key: 'local', label: 'Local', value: 'local' },
    { key: 'world', label: 'World', value: 'world' },
  ]}
  value={mode}
  onValueChange={setMode}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'options', type: 'readonly ChoiceOption<T>[]', description: '稳定 key 与原始 value。' },
              { name: 'value', type: 'T | null', description: '受控值；null 表示未选择。' },
              { name: 'onValueChange', type: '(value: T) => void', description: '用户选择请求。' },
              { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'sm'", description: '24 / 32 / 36px。' },
              { name: 'variant', type: "'subtle' | 'solid'", defaultValue: "'subtle'", description: '选中对比。' },
              { name: 'readOnly', type: 'boolean', defaultValue: 'false', description: '可浏览、不可修改。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <SegmentExample /> }

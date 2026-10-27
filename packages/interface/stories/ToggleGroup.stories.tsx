import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ToggleGroup, ToggleGroupRoot, ToggleGroupItem } from '../src/widgets/choices/ToggleGroup'
import type { ChoiceOption, ChoiceValue } from '../src/values'
import { Button } from '../src/widgets/buttons'
import { Text } from '../src/foundation/typography'
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
  { key: 'translate', label: 'Move', value: 'move' },
  { key: 'rotate', label: 'Rotate', value: 'rotate' },
  { key: 'scale', label: 'Scale', value: 'scale' },
  { key: 'locked', label: 'Locked', value: 'locked', disabled: true, disabledReason: 'This action is unavailable' },
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
          'ToggleGroup 把一组可独立按下或取消的按钮排在一起。单选模式的值是一个值或 null，多选模式始终是数组；onValueChange 返回用户请求的新选择。方向键移动焦点，Enter 或 Space 激活按钮。',
      },
    },
  },
  title: 'Widgets/Choices/ToggleGroup',
} satisfies Meta
export default meta
type Story = StoryObj

function ToggleExample() {
  const [single, setSingle] = useState<string | null>('move')
  const [visible, setVisible] = useState<string[]>(['move', 'scale'])
  const [multi, setMulti] = useState<ChoiceValue[]>(['001', 1])
  const [requests, setRequests] = useState<string[]>([])
  const [revision, setRevision] = useState(0)
  const reset = () => {
    setSingle('move')
    setVisible(['move', 'scale'])
    setMulti(['001', 1])
    setRequests([])
    setRevision((current) => current + 1)
  }
  return (
    <StoryPage
      eyebrow="Widgets / Choices"
      title="ToggleGroup"
      summary="把相关工具按钮排成一组。单选模式一次只保留一个值，并且可以再次点击取消；多选模式独立切换每个按钮。"
      meta={
        <>
          <span>single / multiple</span>
          <span>·</span>
          <span>24 / 32 / 36</span>
          <span>·</span>
          <span>aria-pressed</span>
        </>
      }
      actions={
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
      }>
      <StorySection
        title="Variants"
        description="单选组适合可取消的当前工具；多选组适合同时启用多个开关。subtle 减少背景对比，solid 强调选中状态。">
        <StoryGrid>
          <StoryCard title="Single · solid" description="Click the active tool again to clear it.">
            <ToggleGroup
              aria-label="Active tool"
              type="single"
              options={options}
              value={single}
              onValueChange={setSingle}
              variant="solid"
            />
            <Text size="sm" tone="muted">
              Current value: {single ?? 'null'}
            </Text>
          </StoryCard>
          <StoryCard title="Multiple · solid" description="Each item toggles independently.">
            <ToggleGroup
              aria-label="Visible panels"
              type="multiple"
              options={options}
              value={visible}
              onValueChange={setVisible}
              variant="solid"
            />
            <Text size="sm" tone="muted">
              {visible.length} selected
            </Text>
          </StoryCard>
          <StoryCard title="Multiple · subtle" description="Lower-contrast selected state.">
            <ToggleGroup
              key={revision}
              aria-label="Subtle visible panels"
              type="multiple"
              options={options}
              defaultValue={['move', 'scale']}
              variant="subtle"
            />
            <Text size="sm" tone="muted">
              Default selection is independent for each button.
            </Text>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Sizes"
        description="紧凑档使用 24px；常规档使用 32px 和 36px。按钮高度、字号、图标和圆角一起变化。">
        <StoryCard title="Size scale" description="sm / md / lg">
          <StoryRow align="start">
            {sizes.map(({ size, height }) => (
              <StoryField key={size} label={`${size} · ${height}`}>
                <ToggleGroup
                  key={`${revision}-${size}`}
                  aria-label={`${size} tool group`}
                  type="single"
                  options={options}
                  size={size}
                  defaultValue="move"
                />
              </StoryField>
            ))}
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="States"
        description="readOnly 保留键盘浏览但拒绝修改；disabled 跳过整组；固定 value 的示例展示应用拒绝请求时界面保持原选择。">
        <StoryCard>
          <StoryRow align="start">
            <StoryField label="Read only" hint="Focusable, selection fixed">
              <ToggleGroup
                aria-label="Read only tools"
                type="multiple"
                options={options}
                defaultValue={['move']}
                readOnly
                onValueChange={(next) => setRequests((current) => [...current, ...next])}
              />
            </StoryField>
            <StoryField label="Disabled" hint="Skipped by keyboard">
              <ToggleGroup
                key={revision}
                aria-label="Disabled tools"
                type="single"
                options={options}
                defaultValue="rotate"
                disabled
              />
            </StoryField>
            <StoryField label="Rejected request" hint="Controlled value stays move">
              <ToggleGroup
                aria-label="Rejected tool"
                type="single"
                options={options}
                value="move"
                onValueChange={(next) => setRequests((current) => [...current, next ?? 'null'])}
              />
            </StoryField>
            <StoryField label="Rejected multiple" hint="Controlled array stays ['move']">
              <ToggleGroup
                aria-label="Rejected tools"
                type="multiple"
                options={options}
                value={['move']}
                onValueChange={(next) => setRequests((current) => [...current, ...next])}
              />
            </StoryField>
          </StoryRow>
          <StoryState label="Requested values" value={requests} />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Typed values"
        description="多选模式的 value 使用数组；字符串 001、字符串 1、数字 1 和空字符串分别保留原始类型。">
        <StoryCard title="Identity-preserving multiple selection">
          <ToggleGroup
            aria-label="Typed values"
            type="multiple"
            options={typedOptions}
            value={multi}
            onValueChange={setMulti}
            variant="subtle"
          />
          <StoryState label="Typed values" value={multi.map((item) => ({ value: item, type: typeof item }))} open />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Composition"
        description="需要自定义图标或内容时，组合 ToggleGroupRoot 与 ToggleGroupItem；每个 item 使用稳定字符串 value 标识。">
        <StoryCard>
          <StoryRow align="start">
            <StoryField label="Custom content" hint="Composition primitive">
              <ToggleGroupRoot aria-label="Axis visibility" type="multiple" defaultValue={['x', 'z']} size="lg">
                <>
                  <ToggleGroupItem value="x" aria-label="X axis">
                    X
                  </ToggleGroupItem>
                  <ToggleGroupItem value="y" aria-label="Y axis">
                    Y
                  </ToggleGroupItem>
                </>
                <ToggleGroupItem value="z" aria-label="Z axis">
                  Z
                </ToggleGroupItem>
              </ToggleGroupRoot>
            </StoryField>
            <StoryField label="Vertical" hint="Arrow keys still apply">
              <ToggleGroup
                key={revision}
                aria-label="Vertical tools"
                type="single"
                options={options}
                defaultValue="move"
                orientation="vertical"
                size="md"
              />
            </StoryField>
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="Keyboard & accessibility"
        description="每个按钮保留自己的可访问名称和 aria-pressed 状态；单选组的工具栏语义和值类型由组件处理。">
        <StoryGrid>
          <StoryKeyboard
            rows={[
              { keys: ['←', '→', '↑', '↓'], action: '在组内移动焦点。' },
              { keys: ['Space', 'Enter'], action: '切换当前按钮；单选组再次按下会清空选择。' },
              { keys: 'Tab', action: '进入或离开整个组。' },
            ]}
          />
          <StoryCard title="Notes">
            <Text size="sm" tone="muted">
              多选组返回完整数组，单选组返回一个值或 null。readOnly 只阻止修改，不阻止聚焦；disabled
              会移除整组交互。图标按钮需要 aria-label 或可见文字。
            </Text>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const [tools, setTools] = useState<string[]>(['move'])

<ToggleGroup
  aria-label="Tools"
  type="multiple"
  options={[
    { key: 'move', label: 'Move', value: 'move' },
    { key: 'rotate', label: 'Rotate', value: 'rotate' },
  ]}
  value={tools}
  onValueChange={setTools}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'type', type: "'single' | 'multiple'", description: '决定值类型和取消行为。' },
              { name: 'options', type: 'readonly ChoiceOption<T>[]', description: '稳定 key 与原始 value。' },
              { name: 'value', type: 'T | null | readonly T[]', description: '单选值或完整多选数组。' },
              { name: 'onValueChange', type: '(value) => void', description: '用户请求的新选择。' },
              { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'sm'", description: '24 / 32 / 36px。' },
              { name: 'variant', type: "'subtle' | 'solid'", defaultValue: "'solid'", description: '选中对比。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <ToggleExample /> }

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Select } from '../src/widgets/choices/Select'
import { Checkbox } from '../src/widgets/choices/Checkbox'
import { Button } from '../src/widgets/buttons'
import { Text } from '../src/foundation/typography'
import type { ChoiceOption, ChoiceValue } from '../src/values'
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

const options: readonly ChoiceOption[] = [
  { key: 'string-leading', label: 'String 001', value: '001' },
  { key: 'number-one', label: 'Number 1', value: 1 },
  { key: 'string-one', label: 'String 1', value: '1' },
  { key: 'empty-string', label: 'Empty string', value: '' },
  {
    key: 'locked',
    label: 'Unavailable',
    value: 'locked',
    disabled: true,
    disabledReason: 'Unavailable in this workspace',
  },
]

const meta = {
  title: 'Widgets/Choices/Select',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Select 适合从固定选项中选择一个值。options 提供稳定的 key、显示 label 和原始 value；value 决定当前显示，onValueChange 把选择请求交给应用。数字、字符串和空字符串保持各自类型，null 表示未选择；需要搜索或多选时使用 Combobox。',
      },
    },
  },
  component: Select,
  args: { options },
} satisfies Meta<typeof Select>
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = { render: () => <SelectPage /> }

function SelectPage() {
  const [value, setValue] = useState<ChoiceValue | null>('001')
  const [request, setRequest] = useState<ChoiceValue | null>(null)
  const [reject, setReject] = useState(false)
  const [uncontrolledKey, setUncontrolledKey] = useState(0)
  const [lastUncontrolled, setLastUncontrolled] = useState<ChoiceValue | null>(null)

  const reset = () => {
    setValue('001')
    setRequest(null)
    setReject(false)
    setUncontrolledKey((current) => current + 1)
    setLastUncontrolled(null)
  }

  return (
    <StoryPage
      eyebrow="Widgets / Choices"
      title="Select"
      summary="从固定选项中选择一项。选项 key 与业务 value 分离，value 决定显示，onValueChange 只提出请求；应用可以接受或拒绝。"
      meta={
        <>
          <span>single select</span>
          <span>·</span>
          <span>xs / sm / md</span>
          <span>·</span>
          <span>identity-preserving values</span>
        </>
      }
      actions={
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
      }>
      <StorySection
        title="Variants"
        description="outline 使用边框和表面背景，soft 使用浅底，subtle 没有背景；在面板中按周围密度选择。">
        <StoryGrid>
          {(['outline', 'soft', 'subtle'] as const).map((variant) => (
            <StoryCard key={variant} title={variant}>
              <StoryField label="Value">
                <Select
                  aria-label={`${variant} variant`}
                  variant={variant}
                  size="md"
                  options={options}
                  defaultValue="001"
                />
              </StoryField>
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection title="Sizes" description="紧凑档 xs 20 / sm 24，常规档 md 32；选项弹层与触发器共用同一尺寸语义。">
        <StoryCard>
          <StoryRow align="start">
            {(
              [
                ['xs', 'xs · 20px'],
                ['sm', 'sm · 24px'],
                ['md', 'md · 32px'],
              ] as const
            ).map(([size, label]) => (
              <StoryField key={size} label={label}>
                <Select aria-label={`${label} select`} size={size} options={options} defaultValue="001" />
              </StoryField>
            ))}
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="States"
        description="disabled 移出交互；readOnly 保留显示和焦点但拒绝修改。Select 没有 invalid 外观，字段错误应由外层 PropertyField 或表单展示。">
        <StoryGrid>
          <StoryCard title="Default" description="未选择时显示 placeholder。">
            <Select aria-label="Default select" options={options} />
          </StoryCard>
          <StoryCard title="Disabled">
            <Select aria-label="Disabled select" options={options} defaultValue={1} disabled />
          </StoryCard>
          <StoryCard title="Read only">
            <Select aria-label="Read only select" options={options} defaultValue="001" readOnly />
          </StoryCard>
          <StoryCard title="Empty options">
            <Select aria-label="Empty select" options={[]} emptyText="No materials" />
          </StoryCard>
          <StoryCard title="Disabled option" description="禁用项保留在列表中并显示原因。">
            <Select aria-label="Disabled option select" options={options} defaultValue="001" />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Controlled selection"
        description="选项 key 与 value 分离：数字 1、字符串 '1' 和 '001' 是三个不同的值。应用可以记录请求但保留原值，观察拒绝行为。">
        <StoryCard>
          <StoryRow align="end">
            <StoryField label="Selected value">
              <Select
                aria-label="Controlled select"
                size="md"
                options={options}
                value={value}
                onValueChange={(next) => {
                  setRequest(next)
                  if (!reject) setValue(next)
                }}
              />
            </StoryField>
            <Checkbox label="Reject requests" checked={reject} onCheckedChange={setReject} size="sm" />
          </StoryRow>
          <Text size="sm" tone="muted">
            value: {value === null ? 'null' : `${String(value)} (${typeof value})`}
          </Text>
        </StoryCard>
        <StoryState label="Select state" value={{ value, type: typeof value, lastRequest: request, reject }} />
      </StorySection>

      <StorySection title="Uncontrolled" description="defaultValue 只在首次渲染使用；key 变化可重建实例并恢复初始值。">
        <StoryCard>
          <div key={uncontrolledKey}>
            <StoryField label="Value">
              <Select
                aria-label="Uncontrolled select"
                options={options}
                defaultValue={1}
                onValueChange={(next) => setLastUncontrolled(next)}
              />
            </StoryField>
          </div>
          <StoryRow>
            <Button size="sm" variant="outline" onClick={() => setUncontrolledKey((value) => value + 1)}>
              Reset instance
            </Button>
            <Text size="sm" tone="muted">
              last request: {lastUncontrolled === null ? 'null' : String(lastUncontrolled)}
            </Text>
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="Keyboard and accessibility"
        description="触发器和选项使用 Radix Select 的键盘模型；触发器需要可访问名称。">
        <StoryKeyboard
          rows={[
            { keys: ['Space', 'Enter'], action: '打开选项列表' },
            { keys: ['ArrowDown', 'ArrowUp'], action: '移动高亮项' },
            { keys: ['Home', 'End'], action: '跳到第一项或最后一项' },
            { keys: 'Escape', action: '关闭列表并回到触发器' },
            { keys: 'A–Z', action: '按选项文字进行 typeahead' },
          ]}
        />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const options = [
  { key: 'string', label: 'String 001', value: '001' },
  { key: 'number', label: 'Number 1', value: 1 },
]

<Select
  aria-label="Material"
  options={options}
  value={value}
  onValueChange={setValue}
/>`}
          />
          <StoryProps
            rows={[
              {
                name: 'options',
                type: 'readonly ChoiceOption<T>[]',
                description: '稳定 key、显示 label 与业务 value。',
              },
              { name: 'value', type: 'T | null', description: '受控值；null 表示未选择。' },
              { name: 'defaultValue', type: 'T | null', defaultValue: 'null', description: '非受控初始值。' },
              {
                name: 'onValueChange',
                type: '(value: T | null) => void',
                description: '选择请求；应用决定是否回写 value。',
              },
              {
                name: 'size',
                type: "'xs' | 'sm' | 'md'",
                defaultValue: "'sm'",
                description: '20 / 24 / 32px 触发器。',
              },
              {
                name: 'variant',
                type: "'outline' | 'soft' | 'subtle'",
                defaultValue: "'soft'",
                description: '表面样式。',
              },
              { name: 'readOnly', type: 'boolean', defaultValue: 'false', description: '保留焦点与显示，拒绝修改。' },
              { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '移出交互并降低不透明度。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

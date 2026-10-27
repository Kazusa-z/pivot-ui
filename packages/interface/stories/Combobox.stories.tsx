import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Combobox } from '../src/controls/choices/Combobox'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { Button } from '../src/controls/buttons'
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
  { key: 'leading', label: 'String 001', value: '001' },
  { key: 'numeric', label: 'Number 1', value: 1 },
  { key: 'string', label: 'String 1', value: '1' },
  { key: 'empty', label: 'Empty string', value: '' },
  { key: 'locked', label: 'Locked choice', value: 'locked', disabled: true, disabledReason: 'Managed by the host' },
  { key: 'long', label: 'A long option label that remains readable in the popup', value: 'long' },
]

const meta = {
  title: 'Widgets/Choices/Combobox',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Combobox 适合从较多选项中搜索并选择一项或多项。搜索文字与已选值分开，onValueChange 返回选择请求；multiple 模式始终使用数组。应用通过 value 接受请求，禁用项保留在列表中并显示原因。',
      },
    },
  },
  component: Combobox,
  args: { options, multiple: false },
} satisfies Meta<typeof Combobox>
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = { render: () => <ComboboxPage /> }

function ComboboxPage() {
  const [single, setSingle] = useState<ChoiceValue | null>('001')
  const [multiple, setMultiple] = useState<readonly ChoiceValue[]>(['001', 1, 'locked'])
  const [lastRequest, setLastRequest] = useState<readonly ChoiceValue[] | null>(null)
  const [reject, setReject] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [readOnly, setReadOnly] = useState(false)

  const reset = () => {
    setSingle('001')
    setMultiple(['001', 1, 'locked'])
    setLastRequest(null)
    setReject(false)
    setDisabled(false)
    setReadOnly(false)
  }

  return (
    <StoryPage
      eyebrow="Widgets / Choices"
      title="Combobox"
      summary="可搜索的单选或多选下拉框。输入文字只影响过滤，不改变已选值；multiple 模式的 value/onValueChange 始终是数组。"
      meta={
        <>
          <span>single / multiple</span>
          <span>·</span>
          <span>searchable</span>
          <span>·</span>
          <span>xs / sm / md</span>
        </>
      }
      actions={
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
      }>
      <StorySection
        title="Variants"
        description="outline 使用边框，soft 使用浅底，subtle 透明；单选和多选共用同一套表面样式。">
        <StoryGrid>
          {(['outline', 'soft', 'subtle'] as const).map((variant) => (
            <StoryCard key={variant} title={variant}>
              <StoryField label="Value">
                <Combobox
                  aria-label={`${variant} combobox`}
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

      <StorySection title="Sizes" description="紧凑档 xs 20 / sm 24，常规档 md 32；tag 和搜索输入随触发器尺寸缩放。">
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
                <Combobox aria-label={`${label} combobox`} size={size} options={options} defaultValue="001" />
              </StoryField>
            ))}
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="States"
        description="disabled 移出交互；readOnly 保留显示和焦点但拒绝修改；空选项显示 emptyText。禁用选项仍可见，并说明不可用原因。">
        <StoryGrid>
          <StoryCard title="Single" description="未选择时显示 placeholder。">
            <Combobox aria-label="Default combobox" options={options} />
          </StoryCard>
          <StoryCard title="Disabled">
            <Combobox aria-label="Disabled combobox" options={options} defaultValue="001" disabled />
          </StoryCard>
          <StoryCard title="Read only">
            <Combobox aria-label="Read only combobox" options={options} defaultValue="001" readOnly />
          </StoryCard>
          <StoryCard title="Empty options">
            <Combobox aria-label="Empty combobox" options={[]} emptyText="No materials" />
          </StoryCard>
          <StoryCard title="Uncontrolled multiple" description="defaultValue 只在首次渲染使用。">
            <Combobox
              aria-label="Uncontrolled multiple combobox"
              multiple
              options={options}
              defaultValue={['001', 1]}
              searchable={false}
            />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Single searchable"
        description="输入过滤选项，选择后自动关闭；onValueChange 交出原始 value，清空按钮由应用决定是否提供。">
        <StoryCard>
          <StoryRow align="end">
            <StoryField label="Selected value">
              <Combobox
                aria-label="Single searchable combobox"
                size="md"
                options={options}
                value={single}
                onValueChange={setSingle}
              />
            </StoryField>
            <Button size="sm" variant="outline" onClick={() => setSingle(null)}>
              Clear
            </Button>
          </StoryRow>
          <Text size="sm" tone="muted">
            value: {single === null ? 'null' : `${String(single)} (${typeof single})`}
          </Text>
        </StoryCard>
        <StoryState label="Single combobox state" value={{ single, type: typeof single }} />
      </StorySection>

      <StorySection
        title="Multiple selection"
        description="multiple 模式返回数组；tag 的移除按钮请求新数组。showSelectAll 可一次选择所有可见且可用的选项。">
        <StoryCard>
          <StoryField label="Selected values">
            <Combobox
              aria-label="Multiple combobox"
              multiple
              options={options}
              value={multiple}
              onValueChange={(next) => {
                setLastRequest(next)
                if (!reject) setMultiple(next)
              }}
              disabled={disabled}
              readOnly={readOnly}
              showSelectAll
              size="md"
            />
          </StoryField>
          <StoryRow>
            <Checkbox label="Reject requests" checked={reject} onCheckedChange={setReject} size="sm" />
            <Checkbox label="Disabled" checked={disabled} onCheckedChange={setDisabled} size="sm" />
            <Checkbox label="Read only" checked={readOnly} onCheckedChange={setReadOnly} size="sm" />
          </StoryRow>
          <Text size="sm" tone="muted">
            selected: {multiple.length === 0 ? 'none' : multiple.map(String).join(', ')}
          </Text>
        </StoryCard>
        <StoryState label="Multiple combobox state" value={{ multiple, lastRequest, reject, disabled, readOnly }} />
      </StorySection>

      <StorySection
        title="Keyboard and accessibility"
        description="触发器打开列表后，搜索输入接管方向键；禁用项会被跳过。tag 的移除按钮拥有独立可访问名称。">
        <StoryKeyboard
          rows={[
            { keys: ['ArrowDown', 'Enter'], action: '打开选项列表' },
            { keys: 'A–Z', action: '在搜索框中过滤选项' },
            { keys: ['ArrowDown', 'ArrowUp'], action: '移动高亮项' },
            { keys: 'Enter', action: '选择高亮项；多选时继续选择' },
            { keys: 'Escape', action: '关闭列表并回到触发器' },
            { keys: 'Tab', action: '关闭列表并移到下一个控件' },
          ]}
        />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<Combobox
  aria-label="Material"
  options={options}
  value={material}
  onValueChange={setMaterial}
  size="md"
/>

<Combobox
  aria-label="Tags"
  multiple
  options={options}
  value={tags}
  onValueChange={setTags}
  showSelectAll
/>`}
          />
          <StoryProps
            rows={[
              {
                name: 'options',
                type: 'readonly ChoiceOption<T>[]',
                description: '稳定 key、显示 label 与业务 value。',
              },
              { name: 'multiple', type: 'boolean', defaultValue: 'false', description: '切换数组值模式。' },
              {
                name: 'value / defaultValue',
                type: 'T | null 或 readonly T[]',
                description: '单选为单值，多选为数组。',
              },
              { name: 'onValueChange', type: '(value) => void', description: '选择请求；应用决定是否回写。' },
              { name: 'searchable', type: 'boolean', defaultValue: 'true', description: '是否显示搜索输入。' },
              { name: 'showSelectAll', type: 'boolean', defaultValue: 'false', description: '多选时显示全选入口。' },
              {
                name: 'size',
                type: "'xs' | 'sm' | 'md'",
                defaultValue: "'sm'",
                description: '20 / 24 / 32px 触发器。',
              },
              {
                name: 'readOnly / disabled',
                type: 'boolean',
                defaultValue: 'false',
                description: '只读保留显示，禁用移出交互。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

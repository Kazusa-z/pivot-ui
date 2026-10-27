import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NumberInput } from '../src/controls/inputs/NumberInput'
import { Button } from '../src/controls/buttons'
import { Kbd } from '../src/display/Kbd'
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
} from './support/StoryPage'

const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Inputs/Number',
  parameters: {
    docs: {
      description: {
        component:
          'NumberInput 用于精确输入、拖动和步进调整一个有限数值，适合尺寸、角度和强度等参数。value/onValueChange 控制受控值，onEditStart/onValueCommit/onEditCancel 区分开始、保存和取消。min/max 与 softMin/softMax 分别控制硬范围和常用调节范围，step/dragStep/precision 控制步进与精度。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Widgets / Inputs"
      title="Number"
      summary="一个数值编辑器，同时支持键入、拖动和步进。受控值决定显示；完成一次编辑时才触发保存回调，中间文本草稿和失败状态由组件保留。"
      meta={
        <>
          <span>spinbutton</span>
          <span>·</span>
          <span>drag / step / text</span>
          <span>·</span>
          <span>soft range</span>
        </>
      }>
      <StorySection
        title="Variants"
        description="stepper 提供 +/− 按钮；soft range 允许在常用范围内拖动、仍可键入硬范围内的值；mixed 表示多个对象的数值不一致。">
        <StoryGrid>
          <StepperVariant />
          <SoftRangeVariant />
          <MixedVariant />
        </StoryGrid>
      </StorySection>

      <StorySection title="Density" description="紧凑档 20/24，常规档 32/36；步进按钮和单位插槽随高度缩放。">
        <StoryGrid>
          <StoryCard title="Compact 20 / 24">
            <StoryRow align="end">
              <StoryField label="xs · 20px">
                <NumberInput
                  aria-label="Compact xs number"
                  size="xs"
                  defaultValue={12}
                  min={0}
                  max={100}
                  stepper
                  css={{ width: '160px' }}
                />
              </StoryField>
              <StoryField label="sm · 24px">
                <NumberInput
                  aria-label="Compact sm number"
                  size="sm"
                  defaultValue={12}
                  min={0}
                  max={100}
                  stepper
                  css={{ width: '180px' }}
                />
              </StoryField>
            </StoryRow>
          </StoryCard>
          <StoryCard title="Regular 32 / 36">
            <StoryRow align="end">
              <StoryField label="md · 32px">
                <NumberInput
                  aria-label="Regular md number"
                  size="md"
                  defaultValue={12}
                  min={0}
                  max={100}
                  stepper
                  css={{ width: '180px' }}
                />
              </StoryField>
              <StoryField label="lg · 36px">
                <NumberInput
                  aria-label="Regular lg number"
                  size="lg"
                  defaultValue={12}
                  min={0}
                  max={100}
                  stepper
                  css={{ width: '200px' }}
                />
              </StoryField>
            </StoryRow>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="States"
        description="disabled 不可操作；readOnly 仍可聚焦；valid/invalid 使用统一边框与文字状态。">
        <StoryGrid>
          <StoryCard title="Default">
            <NumberInput aria-label="Default number" defaultValue={5} />
          </StoryCard>
          <StoryCard title="Valid">
            <NumberInput aria-label="Valid number" state="valid" defaultValue={5} />
          </StoryCard>
          <StoryCard title="Invalid">
            <NumberInput aria-label="Invalid number" state="invalid" defaultValue={5} />
          </StoryCard>
          <StoryCard title="Disabled">
            <NumberInput aria-label="Disabled number" disabled defaultValue={5} />
          </StoryCard>
          <StoryCard title="Read only">
            <NumberInput aria-label="Read only number" readOnly defaultValue={5} />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Behavior"
        description="拖动、步进和键入共用同一次编辑会话；按 Enter 或失焦提交，Escape 取消。异步保存期间显示 Saving，拒绝后保留草稿。">
        <StoryGrid>
          <NumberBehaviorCard />
          <AsyncNumberBehaviorCard />
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Keyboard and accessibility"
        description="输入使用 role=spinbutton，并向辅助技术提供当前值、范围、忙碌和错误状态。">
        <StoryCard title="Keyboard">
          <StoryRow>
            <Kbd letterCase="preserve">ArrowUp</Kbd>
            <Kbd letterCase="preserve">ArrowDown</Kbd>
            <Text size="sm">按 step 增加或减少；上下文支持时也可拖动输入框。</Text>
          </StoryRow>
          <StoryRow>
            <Kbd letterCase="preserve">Enter</Kbd>
            <Text size="sm">提交当前文本草稿；非法文本会显示错误并保留草稿。</Text>
          </StoryRow>
          <StoryRow>
            <Kbd letterCase="preserve">Escape</Kbd>
            <Text size="sm">取消本次编辑，恢复已接受的值。</Text>
          </StoryRow>
          <StoryRow>
            <Kbd size="xs">Ctrl</Kbd>
            <Text size="sm">拖动或步进时使用 0.1 倍步长；Shift 使用 10 倍。</Text>
          </StoryRow>
          <Text size="sm" tone="muted">
            组件维护 aria-valuemin、aria-valuemax、aria-valuenow、aria-busy 和 aria-invalid；应用仍需提供 aria-label
            或外部标签。
          </Text>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<NumberInput
  aria-label="Position X"
  value={position.x}
  min={-100}
  max={100}
  softMin={-10}
  softMax={10}
  step={1}
  dragStep={0.1}
  precision={2}
  stepper
  onValueChange={setX}
  onValueCommit={(next) => saveX(next)}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'value / defaultValue', type: 'number', description: '受控值或非受控初值。' },
              { name: 'onValueChange', type: '(value: number) => void', description: '拖动、步进或合法键入时更新。' },
              {
                name: 'onEditStart',
                type: '(source: NumericEditSource) => boolean | void',
                description: '开始一次编辑；返回 false 可拒绝。',
              },
              {
                name: 'onValueCommit',
                type: '(value, reason) => void | Promise<void>',
                description: 'Enter/失焦/手势结束时保存。',
              },
              {
                name: 'onEditCancel',
                type: '(reason: NumericCancelReason) => void',
                description: 'Escape、取消或外部更新时通知应用。',
              },
              { name: 'min / max', type: 'number', description: '硬范围；键入必须落在其中。' },
              { name: 'softMin / softMax', type: 'number', description: '拖动和步进的常用范围。' },
              { name: 'step / dragStep / precision', type: 'number', description: '步进、拖动增量和精度。' },
              { name: 'mixed', type: 'boolean', description: '多个对象值不一致时显示空值。' },
              { name: 'stepper', type: 'boolean', defaultValue: 'false', description: '显示原生 +/− 按钮。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}

function StepperVariant() {
  const [value, setValue] = useState(12)
  return (
    <StoryCard title="Stepper and unit" description="输入框右侧保留单位，步进按钮使用同一编辑会话。">
      <NumberInput
        aria-label="Stepper value"
        value={value}
        min={-100}
        max={100}
        step={1}
        dragStep={0.1}
        stepper
        startSlot="X"
        endSlot="px"
        onValueChange={setValue}
      />
      <Text size="sm" tone="muted">
        Current: {value}px
      </Text>
    </StoryCard>
  )
}

function SoftRangeVariant() {
  const [value, setValue] = useState(25)
  return (
    <StoryCard title="Soft range" description="硬范围 −100…100，常用范围 0…10；键入仍可覆盖常用范围。">
      <NumberInput
        aria-label="Soft range value"
        value={value}
        min={-100}
        max={100}
        softMin={0}
        softMax={10}
        step={1}
        dragStep={0.1}
        precision={2}
        stepper
        onValueChange={setValue}
      />
      <Text size="sm" tone="muted">
        Current: {value}; soft 0…10
      </Text>
    </StoryCard>
  )
}

function MixedVariant() {
  const [value, setValue] = useState(10)
  const [mixed, setMixed] = useState(true)
  return (
    <StoryCard title="Mixed" description="多个对象的数值不一致时显示空值；输入具体值后清除 mixed。">
      <NumberInput
        aria-label="Mixed value"
        value={value}
        mixed={mixed}
        min={-100}
        max={100}
        onValueChange={(next) => {
          setValue(next)
          setMixed(false)
        }}
      />
      <StoryRow>
        <Button size="sm" variant="outline" onClick={() => setMixed(true)}>
          Set mixed
        </Button>
      </StoryRow>
      <StoryState label="Mixed state" value={{ value, mixed }} />
    </StoryCard>
  )
}

const rollsBackPreview = (reason: string) =>
  ['escape', 'pointer-cancel', 'window-blur', 'read-only', 'disabled'].includes(reason)

function NumberBehaviorCard() {
  const [value, setValue] = useState(10)
  const [mixed, setMixed] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(10)
  const record = (message: string) => setEvents((items) => [...items.slice(-11), message])
  return (
    <StoryCard title="Drag, step and text draft" description="尝试键入 -、1e-、1+2，或拖动输入框、点击 +/−。">
      <NumberInput
        aria-label="Number behavior"
        value={value}
        mixed={mixed}
        min={-100}
        max={100}
        softMin={0}
        softMax={10}
        step={1}
        dragStep={0.1}
        precision={3}
        stepper
        startSlot="X"
        endSlot="px"
        onEditStart={(source) => {
          start.current = value
          record(`begin:${source}`)
        }}
        onValueChange={(next) => {
          record(`change:${next}`)
          setValue(next)
          setMixed(false)
        }}
        onValueCommit={(next, reason) => record(`commit:${reason}:${next}`)}
        onEditCancel={(reason) => {
          record(`cancel:${reason}`)
          if (rollsBackPreview(reason)) setValue(start.current)
        }}
      />
      <StoryRow>
        <Button size="sm" variant="outline" onClick={() => setValue(70)}>
          External 70
        </Button>
        <Button size="sm" variant="outline" onClick={() => setMixed(true)}>
          Set mixed
        </Button>
        <Button size="sm" variant="outline">
          Blur target
        </Button>
      </StoryRow>
      <StoryState label="Numeric state" value={{ value, mixed, events }} />
    </StoryCard>
  )
}

function AsyncNumberBehaviorCard() {
  const [value, setValue] = useState(10)
  const [pending, setPending] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(10)
  const request = useRef<{ resolve: () => void; reject: (error: Error) => void } | null>(null)
  const record = (message: string) => setEvents((items) => [...items.slice(-11), message])
  return (
    <StoryCard title="Async commit" description="Enter 后保存进入等待；Accept 提交，Reject 显示错误并保留草稿。">
      <NumberInput
        aria-label="Async number"
        value={value}
        min={-100}
        max={100}
        step={1}
        stepper
        onEditStart={() => {
          start.current = value
          record('begin')
        }}
        onValueChange={setValue}
        onValueCommit={async (next, reason) => {
          record(`request:${reason}:${next}`)
          setPending(true)
          try {
            await new Promise<void>((resolve, reject) => {
              request.current = { resolve, reject }
            })
            setValue(next)
            record(`accepted:${next}`)
          } catch (error) {
            setValue(start.current)
            record(`rejected:${error instanceof Error ? error.message : String(error)}`)
            throw error
          } finally {
            request.current = null
            setPending(false)
          }
        }}
        onEditCancel={(reason) => {
          record(`cancel:${reason}`)
          if (rollsBackPreview(reason)) setValue(start.current)
        }}
      />
      <StoryRow>
        <Button
          size="sm"
          variant="outline"
          disabled={!pending}
          onClick={() => {
            const current = request.current
            request.current = null
            current?.resolve()
          }}>
          Accept request
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!pending}
          onClick={() => {
            const current = request.current
            request.current = null
            current?.reject(new Error('Number rejected. Edit the draft or retry.'))
          }}>
          Reject request
        </Button>
      </StoryRow>
      <StoryState label="Async numeric state" value={{ value, pending, events }} />
    </StoryCard>
  )
}

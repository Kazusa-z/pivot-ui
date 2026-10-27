import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DistributionSlider } from '../src/widgets/sliders/DistributionSlider'
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

const sizes = [
  { size: 'xs' as const, height: '20px' },
  { size: 'sm' as const, height: '24px' },
  { size: 'md' as const, height: '32px' },
]

const meta = {
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'DistributionSlider 调整各部分在固定总量中的分配，value 保存每段长度，滑块表示相邻段之间的边界。移动一个边界只改变相邻两段，onValueChange 返回完整数组，onValueCommit 表示一次调整完成。total 和 minSegment 约束总量与每段最小值。',
      },
    },
  },
  title: 'Widgets/Sliders/DistributionSlider',
} satisfies Meta
export default meta
type Story = StoryObj

function DistributionExample() {
  const [value, setValue] = useState([20, 30, 50])
  const [requests, setRequests] = useState<number[][]>([])
  const [events, setEvents] = useState<string[]>([])
  const [revision, setRevision] = useState(0)
  const initial = useRef(value)
  const reset = () => {
    setValue([20, 30, 50])
    setRequests([])
    setEvents([])
    setRevision((current) => current + 1)
  }
  const total = value.reduce((sum, item) => sum + item, 0)
  return (
    <StoryPage
      eyebrow="Widgets / Sliders"
      title="DistributionSlider"
      summary="把固定总量分配到多个段。拖动一个边界只改变相邻两段，总和保持不变；value 是长度数组，不是边界数组。"
      meta={
        <>
          <span>fixed total</span>
          <span>·</span>
          <span>20 / 24 / 32</span>
          <span>·</span>
          <span>boundaries</span>
        </>
      }
      actions={
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
      }>
      <StorySection
        title="Variants"
        description="三段、五段和带业务单位的分配共用同一种数据结构。formatter 和 unit 只影响显示，不改变保存的长度。">
        <StoryGrid>
          <StoryCard title="Three segments" description="Controlled fixed total.">
            <DistributionSlider
              aria-label="Three segment distribution"
              value={value}
              total={100}
              minSegment={5}
              step={5}
              thumbLabels={['First boundary', 'Second boundary']}
              onValueChange={setValue}
              onEditStart={() => {
                initial.current = value
                setEvents((current) => [...current, 'start'])
              }}
              onValueCommit={(next, reason) => setEvents((current) => [...current, `${reason}: ${next.join(', ')}`])}
              onEditCancel={(reason) => {
                if (!['external-update', 'reset', 'target-change', 'unmount'].includes(reason))
                  setValue(initial.current)
                setEvents((current) => [...current, `cancel: ${reason}`])
              }}
            />
            <Text size="sm" tone="muted">
              {value.join(' / ')} = {total}
            </Text>
            <StoryState label="Value, total and events" value={{ value, total, events }} />
          </StoryCard>
          <StoryCard title="Five segments" description="More boundaries, same data shape.">
            <DistributionSlider
              key={`five-${revision}`}
              aria-label="Five segment distribution"
              defaultValue={[10, 20, 30, 20, 20]}
              total={100}
              minSegment={5}
              step={5}
              thumbLabels={['Boundary 1', 'Boundary 2', 'Boundary 3', 'Boundary 4']}
            />
          </StoryCard>
          <StoryCard title="Units and formatting" description="Total is 1, displayed in meters.">
            <DistributionSlider
              key={`units-${revision}`}
              aria-label="Meter distribution"
              defaultValue={[0.2, 0.3, 0.5]}
              total={1}
              minSegment={0.05}
              step={0.01}
              precision={2}
              unit="m"
              formatter={(length) => length.toFixed(2)}
              thumbLabels={['First boundary', 'Second boundary']}
            />
            <Text size="sm" tone="muted">
              Lengths are stored as numbers; formatting is presentation only.
            </Text>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Sizes"
        description="紧凑档使用 20px 和 24px；常规档使用 32px。高度、thumb 尺寸和轨道一起变化。">
        <StoryCard title="Size scale" description="xs / sm / md">
          <StoryRow align="start">
            {sizes.map(({ size, height }) => (
              <StoryField key={size} label={`${size} · ${height}`}>
                <DistributionSlider
                  key={`${revision}-${size}`}
                  aria-label={`${size} distribution`}
                  size={size}
                  defaultValue={[20, 30, 50]}
                  total={100}
                  minSegment={5}
                  step={5}
                />
              </StoryField>
            ))}
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="States"
        description="readOnly 允许查看但拒绝修改；disabled 停用交互；固定 value 的示例展示应用拒绝请求时总量和分配保持不变。">
        <StoryCard>
          <StoryRow align="start">
            <StoryField label="Read only" hint="Focusable, lengths fixed">
              <DistributionSlider
                aria-label="Read only distribution"
                value={[20, 30, 50]}
                total={100}
                minSegment={5}
                readOnly
                onValueChange={(next) => setRequests((current) => [...current, next])}
              />
            </StoryField>
            <StoryField label="Disabled" hint="Skipped by keyboard">
              <DistributionSlider
                key={revision}
                aria-label="Disabled distribution"
                value={[20, 30, 50]}
                total={100}
                disabled
              />
            </StoryField>
            <StoryField label="Rejected request" hint="Controlled value stays 20 / 30 / 50">
              <DistributionSlider
                aria-label="Rejected distribution"
                value={[20, 30, 50]}
                total={100}
                minSegment={5}
                onValueChange={(next) => setRequests((current) => [...current, next])}
              />
            </StoryField>
          </StoryRow>
          <StoryState label="Requested distributions" value={requests} />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Edge cases"
        description="零长度段、单段、空数组和零总量都有明确形状；加载中或尚未分配时可以先传入空数组。">
        <StoryGrid>
          <StoryCard title="Zero-length segments">
            <DistributionSlider
              key={`zero-${revision}`}
              aria-label="Zero length segments"
              defaultValue={[0, 20, 0, 80]}
            />
          </StoryCard>
          <StoryCard title="Single segment">
            <DistributionSlider
              key={`single-${revision}`}
              aria-label="Single segment"
              defaultValue={[100]}
              total={100}
            />
          </StoryCard>
          <StoryCard title="Empty distribution">
            <DistributionSlider key={`empty-${revision}`} aria-label="Empty distribution" defaultValue={[]} />
          </StoryCard>
          <StoryCard title="Zero total">
            <DistributionSlider key={`zero-total-${revision}`} aria-label="Zero total" defaultValue={[0, 0, 0]} />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Keyboard & accessibility"
        description="边界是独立的 slider；方向键和 PageUp/PageDown 按 step 调整，Home/End 把边界推到极限，总量始终不变。">
        <StoryGrid>
          <StoryKeyboard
            rows={[
              { keys: ['←', '→', '↑', '↓'], action: '按 step 移动当前边界。' },
              { keys: ['PageUp', 'PageDown'], action: '按 10 倍 step 移动。' },
              { keys: ['Home', 'End'], action: '把边界移到最小/最大可用位置。' },
              { keys: 'Tab', action: '在相邻边界之间移动焦点。' },
              { keys: 'Escape', action: '取消当前拖动并恢复编辑前的分配。' },
            ]}
          />
          <StoryCard title="Notes">
            <Text size="sm" tone="muted">
              为每个边界提供 thumbLabels，或给整组提供 aria-label。minSegment 为每段保留最小值；
              空数组、单段和零长度段都合法。formatter 只改变显示文字，不改变数值。
            </Text>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const [parts, setParts] = useState([20, 30, 50])

<DistributionSlider
  aria-label="Time distribution"
  value={parts}
  total={100}
  minSegment={5}
  step={5}
  thumbLabels={['First boundary', 'Second boundary']}
  onValueChange={setParts}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'value', type: 'number[]', description: '每段长度；n 段对应 n − 1 个边界。' },
              { name: 'onValueChange', type: '(value: number[]) => void', description: '完整的新长度数组。' },
              { name: 'total', type: 'number', description: '固定总量；省略时由当前长度推导。' },
              { name: 'minSegment', type: 'number', defaultValue: '0', description: '每段最小长度。' },
              { name: 'step / precision', type: 'number', description: '边界调整步长与显示精度。' },
              { name: 'unit / formatter', type: 'string | function', description: '只影响显示，不改变值。' },
              { name: 'size', type: "'xs' | 'sm' | 'md'", defaultValue: "'sm'", description: '20 / 24 / 32px。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <DistributionExample /> }

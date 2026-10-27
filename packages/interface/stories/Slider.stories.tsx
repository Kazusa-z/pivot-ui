import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Slider } from '../src/widgets/sliders/Slider'
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
          'Slider 通过拖动或键盘调整一个或多个数值位置。value 数组中的每一项对应一个滑块，适合单值参数和区间选择；onValueChange 提供预览，onValueCommit 保存一次完整调整。应用负责接受新值，并在取消时恢复编辑前的值。',
      },
    },
  },
  title: 'Widgets/Sliders/Slider',
} satisfies Meta
export default meta
type Story = StoryObj

function SliderExample() {
  const [value, setValue] = useState([25])
  const [range, setRange] = useState([20, 80])
  const [compactRange, setCompactRange] = useState([20, 60, 80])
  const [requests, setRequests] = useState<number[][]>([])
  const [events, setEvents] = useState<string[]>([])
  const [revision, setRevision] = useState(0)
  const initial = useRef(value)
  const reset = () => {
    setValue([25])
    setRange([20, 80])
    setCompactRange([20, 60, 80])
    setRequests([])
    setEvents([])
    setRevision((current) => current + 1)
  }
  return (
    <StoryPage
      eyebrow="Widgets / Sliders"
      title="Slider"
      summary="用于在固定范围内调整数值。单值参数使用一个滑块，区间和多值参数使用多个滑块；拖动提供实时预览，松开或键盘调整后再提交。"
      meta={
        <>
          <span>single / range</span>
          <span>·</span>
          <span>20 / 24 / 32</span>
          <span>·</span>
          <span>keyboard</span>
        </>
      }
      actions={
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
      }>
      <StorySection
        title="Variants"
        description="单值适合不透明度、强度等参数；多滑块适合区间；compact 使用细轨道和较短的竖条滑块，并隐藏轨道背景。">
        <StoryGrid>
          <StoryCard title="Single value" description="Controlled value with edit events.">
            <Slider
              aria-label="Opacity"
              value={value}
              onValueChange={setValue}
              resetKey={revision}
              min={0}
              max={100}
              step={1}
              startSlot="Opacity"
              endSlot="%"
              showRuler
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
              Current value: {value[0]}
            </Text>
            <StoryState label="Value and edit events" value={{ value, events }} />
          </StoryCard>
          <StoryCard title="Range" description="Two thumbs with a minimum step gap.">
            <Slider
              aria-label="Visible range"
              value={range}
              onValueChange={setRange}
              thumbLabels={['Minimum', 'Maximum']}
              minStepsBetweenThumbs={5}
              startSlot="20"
              endSlot="80"
            />
            <StoryState label="Range value" value={range} />
          </StoryCard>
          <StoryCard title="Compact multi-thumb" description="细轨道与短竖条滑块，适合紧凑面板。">
            <Slider
              aria-label="Compact range"
              value={compactRange}
              onValueChange={setCompactRange}
              thumbLabels={['Low', 'Middle', 'High']}
              compact
              minStepsBetweenThumbs={5}
            />
            <StoryState label="Compact range value" value={compactRange} />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Sizes"
        description="紧凑档使用 20px 和 24px；常规档使用 32px。控件高度、thumb 尺寸和命中区域一起变化。">
        <StoryCard title="Size scale" description="xs / sm / md">
          <StoryRow align="start">
            {sizes.map(({ size, height }) => (
              <StoryField key={size} label={`${size} · ${height}`}>
                <Slider
                  key={`${revision}-${size}`}
                  aria-label={`${size} opacity`}
                  size={size}
                  defaultValue={[40]}
                  startSlot={size}
                />
              </StoryField>
            ))}
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="States"
        description="readOnly 保留焦点和浏览但拒绝修改；disabled 禁止交互；固定 value 的示例展示应用拒绝请求时滑块保持原位置。">
        <StoryCard>
          <StoryRow align="start">
            <StoryField label="Read only" hint="Focusable, value fixed">
              <Slider
                aria-label="Read only opacity"
                value={[30]}
                readOnly
                onValueChange={(next) => setRequests((current) => [...current, next])}
              />
            </StoryField>
            <StoryField label="Disabled" hint="Skipped by keyboard">
              <Slider key={revision} aria-label="Disabled opacity" value={[50]} disabled />
            </StoryField>
            <StoryField label="Rejected request" hint="Controlled value stays 30">
              <Slider
                aria-label="Rejected opacity"
                value={[30]}
                onValueChange={(next) => setRequests((current) => [...current, next])}
              />
            </StoryField>
          </StoryRow>
          <StoryState label="Requested values" value={requests} />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Keyboard & accessibility"
        description="每个 thumb 都是可聚焦的 slider；单独拖动、方向键和 PageUp/PageDown 都遵守 step 与范围。">
        <StoryGrid>
          <StoryKeyboard
            rows={[
              { keys: ['←', '→', '↑', '↓'], action: '按 step 调整当前 thumb。' },
              { keys: ['PageUp', 'PageDown'], action: '按 10 倍 step 调整。' },
              { keys: ['Home', 'End'], action: '跳到范围的最小或最大值。' },
              { keys: ['Ctrl', '⌘'], action: '按住时细调，增量为 0.1 × step。' },
              { keys: 'Escape', action: '取消当前拖动并恢复编辑前的值。' },
            ]}
          />
          <StoryCard title="Notes">
            <Text size="sm" tone="muted">
              为滑块提供 aria-label；多滑块使用 thumbLabels 区分每个 thumb。readOnly 仍可聚焦， disabled
              会移出键盘顺序。拖动时 onValueChange 更新预览，松开时 onValueCommit 提交一次完整调整。
            </Text>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const [opacity, setOpacity] = useState([25])

<Slider
  aria-label="Opacity"
  value={opacity}
  onValueChange={setOpacity}
  min={0}
  max={100}
  step={1}
  startSlot="Opacity"
  endSlot="%"
/>`}
          />
          <StoryProps
            rows={[
              { name: 'value', type: 'number[]', description: '每个 thumb 的受控值。' },
              { name: 'onValueChange', type: '(value: number[]) => void', description: '拖动中的预览请求。' },
              { name: 'onValueCommit', type: '(value, reason) => void', description: '一次调整完成。' },
              { name: 'onEditCancel', type: '(reason) => void', description: 'Escape、指针取消或窗口失焦。' },
              { name: 'min / max / step', type: 'number', defaultValue: '0 / 100 / 1', description: '范围与步长。' },
              { name: 'size', type: "'xs' | 'sm' | 'md'", defaultValue: "'sm'", description: '20 / 24 / 32px。' },
              { name: 'compact', type: 'boolean', defaultValue: 'false', description: '细轨道与短竖条 thumb。' },
              { name: 'thumbLabels', type: 'readonly string[]', description: '多滑块的可访问名称。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <SliderExample /> }

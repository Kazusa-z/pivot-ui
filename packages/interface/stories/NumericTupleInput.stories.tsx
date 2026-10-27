import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Vector2Input, Vector3Input, Vector4Input, RectInput } from '../src/editors/numeric/GeometryInputs'
import type { Rect, Vector3 } from '../src/values/geometry'
import type { NumericCancelReason } from '../src/interaction/numeric/types'
import { Button } from '../src/controls/buttons/Button'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryCode,
  StoryProps,
  StoryState,
  StoryKeyboard,
} from './support/StoryPage'

const rollbackReasons = new Set<NumericCancelReason>([
  'escape',
  'pointer-cancel',
  'window-blur',
  'read-only',
  'disabled',
])
const tupleWidth = css({ width: 'min(420px, 100%)', minWidth: 0 })
const linkedWidth = css({ width: 'min(480px, 100%)', minWidth: 0 })

function ShapesDemo() {
  const [two, setTwo] = useState({ x: 10, y: 20 })
  const [four, setFour] = useState({ x: 1, y: 2, z: 3, w: 4 })
  const [revision, setRevision] = useState(0)
  const twoStart = useRef(two)
  const fourStart = useRef(four)
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)', minWidth: 0 })}>
      <StoryGrid>
        <StoryCard title="Vector2" description="x/y 对象形状，单位为 px。">
          <div className={tupleWidth}>
            <Vector2Input
              value={two}
              onValueChange={setTwo}
              resetKey={revision}
              axes={{ x: { label: 'Horizontal', unit: 'px' }, y: { label: 'Vertical', unit: 'px' } }}
              onEditStart={() => {
                twoStart.current = two
              }}
              onEditCancel={(reason) => {
                if (rollbackReasons.has(reason)) setTwo(twoStart.current)
              }}
            />
          </div>
        </StoryCard>
        <StoryCard title="Vector4" description="x/y/z/w 对象形状，默认精度。">
          <div className={tupleWidth}>
            <Vector4Input
              value={four}
              onValueChange={setFour}
              resetKey={revision}
              onEditStart={() => {
                fourStart.current = four
              }}
              onEditCancel={(reason) => {
                if (rollbackReasons.has(reason)) setFour(fourStart.current)
              }}
            />
          </div>
        </StoryCard>
      </StoryGrid>
      <StoryRow>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setTwo({ x: 10, y: 20 })
            setFour({ x: 1, y: 2, z: 3, w: 4 })
            setRevision((value) => value + 1)
          }}>
          Reset shapes
        </Button>
      </StoryRow>
      <StoryState label="Object shapes" value={{ two, four }} />
    </div>
  )
}

function LinkedDemo() {
  const initial: Vector3 = { x: 2, y: 4, z: -6 }
  const [value, setValue] = useState(initial)
  const [linked, setLinked] = useState(true)
  const [events, setEvents] = useState<string[]>([])
  const [revision, setRevision] = useState(0)
  const start = useRef(value)
  const load = (next: Vector3) => {
    start.current = next
    setValue(next)
    setRevision((current) => current + 1)
  }
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)', minWidth: 0 })}>
      <div className={linkedWidth}>
        <Vector3Input
          value={value}
          onValueChange={setValue}
          linked={linked}
          onLinkedChange={setLinked}
          resetKey={revision}
          axes={{
            x: { min: 0, max: 20, precision: 2 },
            y: { min: 0, max: 10, precision: 2 },
            z: { min: -12, max: 12, precision: 2 },
          }}
          onEditStart={(source, axis) => {
            start.current = value
            setEvents((list) => [...list.slice(-9), `begin:${axis}:${source}`])
          }}
          onValueCommit={(next, reason, axis) =>
            setEvents((list) => [...list.slice(-9), `commit:${axis}:${reason}:${JSON.stringify(next)}`])
          }
          onEditCancel={(reason, axis) => {
            if (rollbackReasons.has(reason)) setValue(start.current)
            setEvents((list) => [...list.slice(-9), `cancel:${axis}:${reason}`])
          }}
        />
      </div>
      <StoryRow>
        <Button size="sm" variant="outline" onClick={() => load(initial)}>
          Reset linked
        </Button>
        <Button size="sm" variant="outline" onClick={() => load({ x: 0, y: 4, z: 6 })}>
          Load zero X
        </Button>
      </StoryRow>
      <StoryState label="Linked vector" value={{ value, linked, events }} />
    </div>
  )
}

function RectStatesDemo() {
  const [value, setValue] = useState<Rect>({ x: -20, y: 10, width: 120, height: 60 })
  const [disabled, setDisabled] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const start = useRef(value)
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)', minWidth: 0 })}>
      <div className={tupleWidth}>
        <RectInput
          value={value}
          onValueChange={setValue}
          positionConstraints={{ min: -500, max: 500, precision: 1 }}
          sizeConstraints={{ min: 0, max: 300, precision: 0 }}
          axes={{ width: { unit: 'px' }, height: { unit: 'px' } }}
          disabled={disabled}
          readOnly={readOnly}
          onEditStart={() => {
            start.current = value
          }}
          onEditCancel={(reason) => {
            if (rollbackReasons.has(reason)) setValue(start.current)
          }}
        />
      </div>
      <StoryRow>
        <Checkbox checked={disabled} onCheckedChange={(checked) => setDisabled(checked === true)} label="Disabled" />
        <Checkbox checked={readOnly} onCheckedChange={(checked) => setReadOnly(checked === true)} label="Read only" />
      </StoryRow>
      <StoryState label="Rectangle" value={{ value, disabled, readOnly }} />
    </div>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'NumberTupleInput 编辑一组命名数值，Vector2/3/4 和 Rect 保留对象形状。每个轴有独立范围、精度和单位；linked 打开时按本次编辑开始时的比例联动。提交与取消以整组值为单位，应用负责保存并通过 resetKey 触发外部重置。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Numeric/NumberTupleInput',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Numeric"
      title="NumberTupleInput"
      summary="用一行的多个数值输入编辑坐标、尺寸或参数组。对象输入保留 Vector/Rect 形状，联动模式按起始比例缩放。"
      meta={
        <>
          <span>Vector2 / 3 / 4</span>
          <span>·</span>
          <span>Rect</span>
          <span>·</span>
          <span>20 / 24 / 32</span>
        </>
      }>
      <StorySection title="Object shapes" description="对象输入只改变值的形状，底层仍是轴配置、范围、精度和编辑回调。">
        <ShapesDemo />
      </StorySection>

      <StorySection
        title="Density"
        description="xs 20、sm 24 为紧凑档，md 32 为常规档。NumberTupleInput 没有 lg/36；联动按钮与输入保持同一档。">
        <StoryGrid>
          {(
            [
              ['xs', '20px', '密集坐标面板'],
              ['sm', '24px', '属性面板默认'],
              ['md', '32px', '常规表单'],
            ] as const
          ).map(([size, height, usage]) => (
            <StoryCard key={size} title={`${size} · ${height}`} description={usage}>
              <div className={tupleWidth}>
                <Vector3Input
                  size={size}
                  defaultValue={{ x: 1, y: 2, z: 3 }}
                  axes={{ x: { unit: 'm' }, y: { unit: 'm' }, z: { unit: 'm' } }}
                />
              </div>
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Proportional editing"
        description="提高 X 时 Y/Z 按起始比例变化，并在各轴范围内停止；零值轴只改变自身。">
        <StoryCard
          title="Linked vector"
          description="Y/Z 有上限，联动会在可用比例内停止；点击 Load zero X 观察零值主轴。">
          <LinkedDemo />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Availability"
        description="disabled 阻止编辑，readOnly 保留可聚焦和复制能力；两者都不改变字段布局。">
        <StoryCard title="Rectangle states">
          <RectStatesDemo />
        </StoryCard>
      </StorySection>

      <StorySection title="Keyboard and accessibility">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '在轴输入框和联动按钮之间移动焦点。' },
            { keys: ['↑', '↓'], action: '按 step 调整当前轴；Shift 使用更大步进。' },
            { keys: 'Enter', action: '提交当前轴的整组值。' },
            { keys: 'Escape', action: '取消当前轴编辑并恢复起始值。' },
            { keys: ['Space', 'Enter'], action: '在联动按钮上切换 linked。' },
          ]}
        />
      </StorySection>

      <StorySection title="Usage and props">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<Vector3Input
  value={value}
  linked={linked}
  onLinkedChange={setLinked}
  axes={{
    x: { min: 0, max: 20, precision: 2 },
    y: { min: 0, max: 10, precision: 2 },
    z: { min: -12, max: 12, precision: 2 },
  }}
  onValueChange={setValue}
  onValueCommit={save}
  onEditCancel={restore}
/>`}
          />
          <StoryProps
            rows={[
              {
                name: 'axes',
                type: 'NumericAxisConfig[]',
                description: '每轴的 key、label、unit、范围和 disabled/readOnly。',
              },
              {
                name: 'value',
                type: 'readonly number[] | Vector/Rect',
                description: '受控值；对象输入由适配组件传入。',
              },
              { name: 'linked', type: 'boolean', defaultValue: 'false', description: '按起始比例联动各轴。' },
              { name: 'onLinkedChange', type: '(linked: boolean) => void', description: '提供后显示联动按钮。' },
              {
                name: 'size',
                type: "'xs' | 'sm' | 'md'",
                defaultValue: "'sm'",
                description: '20/24 紧凑，32 常规；没有 36。',
              },
              {
                name: 'onValueCommit',
                type: '(value, reason, axis) => void | Promise<void>',
                description: '一次完整编辑。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}

import { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { CurvePreset, CurvePresetService } from '../src/contracts/curve'
import { NumericDistributionTemplate } from '../src/templates/curve/NumericDistributionTemplate'
import { copyCurveValue, type CurveValue, type CurveViewport } from '../src/values/curve'
import {
  areNumericDistributionsEqual,
  copyNumericDistributionValue,
  type NumericDistributionCache,
  type NumericDistributionMode,
  type NumericDistributionValue,
} from '../src/values/numeric-distribution'
import { css } from '../styled-system/css'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'
import { fromHostNumericCurve, toHostNumericCurve, type HostNumericCurve } from './support/numeric-curve-host-adapter'

const curve: CurveValue = {
  interpolation: 'bezier',
  points: [
    { id: 'start', x: 0, y: 2, outHandle: { x: 0.35, y: 2 } },
    { id: 'end', x: 1, y: 5, inHandle: { x: 0.65, y: 5 } },
  ],
}
const linear: CurveValue = {
  interpolation: 'linear',
  points: [
    { id: 'a', x: 0, y: 0 },
    { id: 'b', x: 1, y: 10 },
  ],
}
const presets: readonly CurvePreset[] = [
  { id: 'ease', label: 'Ease 2 to 5', value: curve },
  { id: 'linear', label: 'Linear 0 to 10', value: linear },
]
const initialView: CurveViewport = { xMin: 0, xMax: 1, yMin: 0, yMax: 10 }
const userCancellation = new Set(['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only'])
const makeValue = (mode: NumericDistributionMode): NumericDistributionValue =>
  mode === 'constant'
    ? { mode, value: 2 }
    : mode === 'two-constant'
      ? { mode, values: [2, 5] }
      : mode === 'curve'
        ? { mode, curve: copyCurveValue(curve) }
        : { mode, curves: [copyCurveValue(curve), copyCurveValue(linear)] }

function DistributionExample({
  mode = 'constant',
  controlledCache = false,
  refuse = false,
  delayed = false,
  constraints = false,
  availability = false,
  capabilities = false,
}: {
  mode?: NumericDistributionMode
  controlledCache?: boolean
  refuse?: boolean
  delayed?: boolean
  constraints?: boolean
  availability?: boolean
  capabilities?: boolean
}) {
  const [value, setValue] = useState(() => makeValue(mode))
  const [authority, setAuthority] = useState(value)
  const [cache, setCache] = useState<NumericDistributionCache>({})
  const [revision, setRevision] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const [history, setHistory] = useState(0)
  const [rejectNext, setRejectNext] = useState(delayed)
  const [state, setState] = useState<'editable' | 'readonly' | 'disabled'>('editable')
  const [viewport, setViewport] = useState(initialView)
  const generation = useRef(0),
    start = useRef(value)
  const record = (event: string) => setEvents((old) => [...old.slice(-19), event])
  const service = useMemo<CurvePresetService>(() => {
    const entries = new Map(presets.map((preset) => [preset.id, preset]))
    let next = 0
    return {
      async list() {
        record('capability:list')
        return [...entries.values()].map(({ id, label }) => ({ id, label }))
      },
      async load(id) {
        record(`capability:load:${id}`)
        const entry = entries.get(id)
        if (!entry) throw Error('Preset missing')
        return copyCurveValue(entry.value)
      },
      async save(input) {
        const preset = { id: `saved-${++next}`, label: input.label, value: copyCurveValue(input.value) }
        entries.set(preset.id, preset)
        record(`capability:save:${preset.id}`)
        return { id: preset.id, label: preset.label }
      },
      async remove(id) {
        entries.delete(id)
        record(`capability:remove:${id}`)
      },
    }
  }, [revision])
  function reset() {
    generation.current++
    const next = makeValue(mode)
    start.current = next
    setValue(next)
    setAuthority(next)
    setCache({})
    setHistory(0)
    setViewport(initialView)
    setRevision((old) => old + 1)
    setEvents([])
    setRejectNext(delayed)
  }
  return (
    <ContractFrame
      title="数值与曲线分布"
      description={
        refuse
          ? '尝试输入数值或切换模式，观察下方的修改请求与控件保留的原值。这展示应用暂不接受修改时的效果；接入时在 onValueChange 中更新 value，控件就会显示接受后的结果。'
          : delayed
            ? '修改数值并按 Enter，等待 450 ms 后会看到第一次保存失败的提示，再按 Enter 可重试。也可在等待时点击 Load another target，查看切换后的当前值和事件记录；应用通过 resetKey 标识当前对象。'
            : capabilities
              ? '切换到曲线模式，打开编辑器，选择一个预设后点击 Apply preset，观察曲线与事件记录。还可把当前曲线保存为预设，供下次选择。应用通过 curvePresetService 提供个人预设的读取、保存和删除方法。'
              : '先输入一个固定数值，再切换到曲线模式画一条曲线，最后切回固定数值，查看先前的设置如何恢复。下方同时展示当前 value 和模式 cache；应用可分别保存它们，Reset 可重新开始。'
      }
      onReset={reset}>
      <div className={contractStyles.row}>
        <ControlButton
          onClick={() => {
            generation.current++
            const next: NumericDistributionValue = { mode: 'constant', value: 8 }
            start.current = next
            setValue(next)
            setAuthority(next)
            setCache({})
            setHistory(0)
            setRevision((old) => old + 1)
            record('external target loaded')
          }}>
          Load another target
        </ControlButton>
        {delayed && <ControlButton onClick={() => setRejectNext(true)}>Reject next commit</ControlButton>}
        {availability &&
          (['editable', 'readonly', 'disabled'] as const).map((next) => (
            <ControlButton key={next} aria-pressed={state === next} onClick={() => setState(next)}>
              {next}
            </ControlButton>
          ))}
      </div>
      <div className={css({ width: 'min(480px, 100%)', minWidth: 0 })}>
        <NumericDistributionTemplate
          value={value}
          {...(controlledCache ? { cache } : {})}
          onCacheChange={setCache}
          resetKey={revision}
          disabled={state === 'disabled'}
          readOnly={state === 'readonly'}
          {...(constraints ? { min: -5, max: 5, step: 0.25, dragStep: 0.1, precision: 2, unit: 'm/s' } : {})}
          curveBounds={constraints ? { xMin: 0, xMax: 1, yMin: -2, yMax: 12 } : undefined}
          curveViewport={viewport}
          onCurveViewportChange={(next, index) => {
            setViewport(next)
            record(`view:${index}`)
          }}
          curvePresets={capabilities ? undefined : presets}
          curvePresetService={capabilities ? service : undefined}
          onEditStart={(source) => {
            start.current = copyNumericDistributionValue(value)
            record(`begin:${source}`)
          }}
          onValueChange={(next) => {
            record(`preview:${next.mode}`)
            if (!refuse) setValue(next)
          }}
          onValueCommit={async (next, reason) => {
            const version = generation.current,
              previous = start.current,
              reject = rejectNext
            setRejectNext(false)
            record(`request:${reason}:${next.mode}`)
            if (delayed) await new Promise<void>((resolve) => setTimeout(resolve, 450))
            if (version !== generation.current) return
            if (reject) {
              setValue(previous)
              record('rejected')
              throw Error('修改未保存，请重试输入或再次选择模式。')
            }
            if (!refuse) {
              setAuthority(next)
              if (!areNumericDistributionsEqual(previous, next)) setHistory((old) => old + 1)
            }
            record(refuse ? '应用保留原值' : 'accepted')
          }}
          onEditCancel={(reason) => {
            if (userCancellation.has(reason) && !refuse) setValue(start.current)
            record(`cancel:${reason}`)
          }}
        />
      </div>
      <StatePanel
        label="当前值、模式设置与编辑记录"
        value={{ value, authority, cache, history, viewport, revision, state, events }}
      />
    </ContractFrame>
  )
}

const hostInitial: HostNumericCurve = {
  interpolation: 'bezier',
  multiplier: 10,
  keys: [
    { id: 'engine-start', time: 0, value: 0.2, outgoing: { time: 0.3, value: 0.2 } },
    { id: 'engine-end', time: 1, value: 0.8, incoming: { time: 0.7, value: 0.8 } },
  ],
}
function HostRoundTripExample() {
  const [host, setHost] = useState(hostInitial)
  const [value, setValue] = useState<NumericDistributionValue>(() => ({
    mode: 'curve',
    curve: fromHostNumericCurve(hostInitial),
  }))
  const [revision, setRevision] = useState(0)
  const start = useRef(value)
  return (
    <ContractFrame
      title="与应用曲线格式互相转换"
      description="修改曲线点后，比较下方组件的 x/y 坐标与应用的 time/value 数据；再点击 Toggle business multiplier，查看独立保存的倍率。示例适配函数负责坐标转换，应用在计算最终结果时使用倍率。"
      onReset={() => {
        setHost(hostInitial)
        setValue({ mode: 'curve', curve: fromHostNumericCurve(hostInitial) })
        setRevision((old) => old + 1)
      }}>
      <ControlButton
        onClick={() => setHost((current) => ({ ...current, multiplier: current.multiplier === 10 ? 20 : 10 }))}>
        Toggle business multiplier
      </ControlButton>
      <div className={css({ width: 'min(480px, 100%)', minWidth: 0 })}>
        <NumericDistributionTemplate
          value={value}
          resetKey={revision}
          onEditStart={() => {
            start.current = copyNumericDistributionValue(value)
          }}
          onValueChange={setValue}
          onValueCommit={(next) => {
            if (next.mode === 'curve') setHost((current) => toHostNumericCurve(next.curve, current))
          }}
          onEditCancel={(reason) => {
            if (userCancellation.has(reason)) setValue(start.current)
          }}
        />
      </div>
      <StatePanel label="应用的 time/value 数据与独立倍率" value={host} />
      <StatePanel label="UI distribution" value={value} />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Templates/NumericDistribution',
  parameters: {
    docs: {
      description: {
        component:
          'NumericDistributionTemplate 用于在单个数值、曲线、两个数值和两条曲线之间切换，适合既允许固定参数又允许随时间变化的参数输入。\n\nvalue 是由 mode 区分的对象。onValueChange 用于预览，onValueCommit 用于保存一次编辑；独立的 cache 保存其他模式已接受的设置。曲线选择和视图变化不会生成属性修改。\n\n应用负责保存值、处理拒绝与取消，并在切换对象或重置时更新 resetKey。预设服务通过 curvePresetService 注入；业务倍率和 time/value 数据转换由应用单独处理。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <DistributionExample /> }
export const Curve: Story = { render: () => <DistributionExample mode="curve" /> }
export const TwoConstants: Story = { render: () => <DistributionExample mode="two-constant" /> }
export const TwoCurves: Story = { render: () => <DistributionExample mode="two-curve" /> }
export const ControlledCache: Story = { render: () => <DistributionExample controlledCache /> }
export const ControlledRefusal: Story = { render: () => <DistributionExample refuse /> }
export const DelayedRejectionAndTarget: Story = { render: () => <DistributionExample delayed /> }
export const ConstraintsAndViewport: Story = { render: () => <DistributionExample mode="curve" constraints /> }
export const Availability: Story = { render: () => <DistributionExample availability /> }
export const PresetCapabilities: Story = { render: () => <DistributionExample mode="curve" capabilities /> }
export const HostAdapterRoundTrip: Story = { render: () => <HostRoundTripExample /> }

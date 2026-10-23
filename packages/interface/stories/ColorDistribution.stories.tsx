import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ColorDistributionTemplate } from '../src/templates/color/ColorDistributionTemplate'
import {
  copyColorDistributionValue,
  switchColorDistributionMode,
  type ColorDistributionCache,
  type ColorDistributionMode,
  type ColorDistributionValue,
} from '../src/values/color-distribution'
import { css } from '../styled-system/css'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'
import { fromHostColorChannels, toHostColorChannels, type HostColorChannels } from './support/color-host-adapter'

const initial: ColorDistributionValue = {
  mode: 'constant',
  color: { space: 'linear', r: 0.15, g: 0.45, b: 0.8, a: 0.7 },
}
const hdrInitial: ColorDistributionValue = { mode: 'constant', color: { space: 'linear', r: 3, g: 1.5, b: 0.5, a: 1 } }
const userCancellation = new Set(['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only'])

function DistributionExample({
  mode = 'constant',
  hdr = false,
  controlledCache = false,
  refuse = false,
  delayed = false,
  availability = false,
}: {
  mode?: ColorDistributionMode
  hdr?: boolean
  controlledCache?: boolean
  refuse?: boolean
  delayed?: boolean
  availability?: boolean
}) {
  const makeInitial = () => switchColorDistributionMode(hdr ? hdrInitial : initial, mode)
  const [value, setValue] = useState(makeInitial)
  const [cache, setCache] = useState<ColorDistributionCache>({})
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<'editable' | 'readonly' | 'disabled'>('editable')
  const [events, setEvents] = useState<string[]>([])
  const [rejectNext, setRejectNext] = useState(delayed)
  const generation = useRef(0)
  const start = useRef(value)
  const record = (event: string) => setEvents((old) => [...old.slice(-15), event])
  function reset() {
    generation.current++
    const next = makeInitial()
    start.current = next
    setValue(next)
    setCache({})
    setRevision((old) => old + 1)
    setEvents([])
    setRejectNext(delayed)
  }
  return (
    <ContractFrame
      title="颜色分布与模式切换"
      description={
        refuse
          ? '尝试切换模式或编辑颜色，再看下方出现的修改请求与保留原状的控件。这是应用暂不接受修改时的显示；接入时在 onValueChange 中更新 value，在 onValueCommit 中保存即可。'
          : delayed
            ? '编辑颜色或切换模式，等待 450 ms 后体验第一次保存失败，再重试同一项操作。下方会记录拒绝和成功的结果；等待时也可点击 Load another target 体验对象切换，应用用 resetKey 标识正在编辑的对象。'
            : '先编辑单色，再切换到渐变并调整颜色点，最后切回单色，查看之前的颜色如何恢复。下方分别展示当前 value 和各模式的 cache；需要由应用记住模式设置时，可连接 cache/onCacheChange。Reset 可重新开始。'
      }
      onReset={reset}>
      <div className={contractStyles.row}>
        <ControlButton
          onClick={() => {
            generation.current++
            const next: ColorDistributionValue = {
              mode: 'constant',
              color: { space: 'srgb', r: 0.8, g: 0.2, b: 0.1, a: 0.35 },
            }
            start.current = next
            setValue(next)
            setCache({})
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
        <ColorDistributionTemplate
          value={value}
          {...(controlledCache ? { cache } : {})}
          onCacheChange={setCache}
          resetKey={revision}
          hdr={hdr}
          disabled={state === 'disabled'}
          readOnly={state === 'readonly'}
          onEditStart={(source) => {
            start.current = copyColorDistributionValue(value)
            record(`begin:${source}`)
          }}
          onValueChange={(next) => {
            record(`preview:${next.mode}`)
            if (!refuse) setValue(next)
          }}
          onValueCommit={async (next, reason) => {
            const version = generation.current
            const previous = start.current
            const reject = rejectNext
            setRejectNext(false)
            record(`request:${reason}:${next.mode}`)
            if (delayed) await new Promise<void>((resolve) => setTimeout(resolve, 450))
            if (version !== generation.current) return
            if (reject) {
              setValue(previous)
              record('rejected')
              throw new Error('颜色修改未保存，请重试输入或再次选择模式。')
            }
            record(refuse ? '应用保留原值' : 'accepted')
          }}
          onEditCancel={(reason) => {
            if (userCancellation.has(reason) && !refuse) setValue(start.current)
            record(`cancel:${reason}`)
          }}
        />
      </div>
      <StatePanel label="当前值与各模式保留的值" value={{ value, cache, revision, state, events }} />
    </ContractFrame>
  )
}

const hostInitial: HostColorChannels = {
  interpolation: 'linear',
  color: [
    { id: 'engine-red', time: 0, value: { r: 0.8, g: 0.1, b: 0.05, a: 1 } },
    { id: 'engine-blue', time: 1, value: { r: 0.05, g: 0.2, b: 0.9, a: 1 } },
  ],
  alpha: [
    { id: 'engine-fade-in', time: 0, value: 0.1 },
    { id: 'engine-fade-out', time: 1, value: 0.9 },
  ],
}
function HostRoundTripExample() {
  const [host, setHost] = useState(hostInitial)
  const [value, setValue] = useState<ColorDistributionValue>(() => ({
    mode: 'gradient',
    ramp: fromHostColorChannels(hostInitial, 'linear'),
  }))
  const [revision, setRevision] = useState(0)
  const start = useRef(value)
  return (
    <ContractFrame
      title="与应用颜色格式互相转换"
      description="拖动渐变点或修改颜色，比较下方应用数据中的 time 与组件数据中的 position。此例的适配函数在编辑前后转换颜色格式和位置字段，并保留停靠点 ID；可在自己的数据读写入口采用同样的转换方式。"
      onReset={() => {
        setHost(hostInitial)
        setValue({ mode: 'gradient', ramp: fromHostColorChannels(hostInitial, 'linear') })
        setRevision((old) => old + 1)
      }}>
      <div className={css({ width: 'min(480px, 100%)', minWidth: 0 })}>
        <ColorDistributionTemplate
          value={value}
          resetKey={revision}
          onEditStart={() => {
            start.current = copyColorDistributionValue(value)
          }}
          onValueChange={setValue}
          onValueCommit={(next) => {
            if (next.mode === 'gradient') setHost(toHostColorChannels(next.ramp, 'linear'))
          }}
          onEditCancel={(reason) => {
            if (userCancellation.has(reason)) setValue(start.current)
          }}
        />
      </div>
      <StatePanel label="应用数据：time 与稳定 ID" value={host} />
      <StatePanel label="组件数据：position" value={value} />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Templates/ColorDistribution',
  parameters: {
    docs: {
      description: {
        component:
          'ColorDistributionTemplate 用于在单色、渐变、两种颜色和两组渐变之间切换，适合效果参数或随机颜色范围。value 的 mode 决定当前使用的数据形状。\n\nonValueChange 返回预览值，onValueCommit 表示保存一次编辑。cache 与当前 value 分开保存，让用户切换模式后可以找回该模式已接受的设置；需要外部管理时同时传入 cache 和 onCacheChange。\n\n切换编辑对象或重置时更新 resetKey。应用负责接受、拒绝和取消后的值恢复；业务系统使用的时间字段或颜色格式由应用适配代码转换。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <DistributionExample /> }
export const Gradient: Story = { render: () => <DistributionExample mode="gradient" /> }
export const TwoColors: Story = { render: () => <DistributionExample mode="two-constant" /> }
export const TwoGradients: Story = { render: () => <DistributionExample mode="two-gradient" /> }
export const ControlledCache: Story = { render: () => <DistributionExample controlledCache /> }
export const ControlledRefusal: Story = { render: () => <DistributionExample refuse /> }
export const AsyncRejection: Story = { render: () => <DistributionExample delayed /> }
export const HDR: Story = { render: () => <DistributionExample hdr /> }
export const Availability: Story = { render: () => <DistributionExample availability /> }
export const HostAdapterRoundTrip: Story = { render: () => <HostRoundTripExample /> }

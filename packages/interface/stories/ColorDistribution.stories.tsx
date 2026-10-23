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
      title="Color distribution"
      description={
        refuse
          ? 'The owner refuses all previews. Mode and color stay authoritative; requests are still visible below.'
          : delayed
            ? 'Commit waits 450 ms and rejects the first request. The host restores its start snapshot; input drafts can be retried. Load another target while pending to ignore old UI results.'
            : 'One discriminated value is active. Mode cache is separate: edit a color, switch away, then return. Reset and target revision clear the cache.'
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
              throw new Error('Host rejected the color edit. Retry the input or choose the mode again.')
            }
            record(refuse ? 'owner kept previous value' : 'accepted')
          }}
          onEditCancel={(reason) => {
            if (userCancellation.has(reason) && !refuse) setValue(start.current)
            record(`cancel:${reason}`)
          }}
        />
      </div>
      <StatePanel label="Active value and separate mode cache" value={{ value, cache, revision, state, events }} />
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
      title="Host color adapter round trip"
      description="This example adapter alone maps normalized engine RGB/time to explicit UI color space/position. Editing gradient stops writes back the same stable IDs; changing distribution mode does not invent an engine DTO."
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
      <StatePanel label="Engine DTO with time and stable IDs" value={host} />
      <StatePanel label="UI value with position" value={value} />
    </ContractFrame>
  )
}

const meta = { title: 'Templates/ColorDistribution', parameters: { layout: 'fullscreen' } } satisfies Meta
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

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
      title="Numeric distribution"
      description={
        refuse
          ? 'The owner refuses all previews. Requested values are visible in the events; the active value and accepted cache stay unchanged.'
          : delayed
            ? 'Commits wait 450 ms; the first one is rejected and rolled back. Retry the original draft with Enter. Load another target while pending to invalidate old local results.'
            : capabilities
              ? 'An explicit in-memory service provides presets. Saving and deleting presets changes host storage only; loading a preset commits one value edit.'
              : 'Edit, switch modes, and return to inspect the separate accepted cache. Point selection and curve viewport changes do not add property history. Reset clears cached modes.'
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
              throw Error('Host rejected the numeric distribution. Retry the input or mode.')
            }
            if (!refuse) {
              setAuthority(next)
              if (!areNumericDistributionsEqual(previous, next)) setHistory((old) => old + 1)
            }
            record(refuse ? 'owner kept previous value' : 'accepted')
          }}
          onEditCancel={(reason) => {
            if (userCancellation.has(reason) && !refuse) setValue(start.current)
            record(`cancel:${reason}`)
          }}
        />
      </div>
      <StatePanel
        label="Value, accepted modes, and transactions"
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
      title="Host curve DTO round trip"
      description="Only this host adapter maps time/value and handle coordinates to x/y while preserving IDs. The business multiplier remains separate metadata; changing it never rewrites curve points or viewport."
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
      <StatePanel label="Host time/value DTO and independent multiplier" value={host} />
      <StatePanel label="UI distribution" value={value} />
    </ContractFrame>
  )
}

const meta = { title: 'Templates/NumericDistribution', parameters: { layout: 'fullscreen' } } satisfies Meta
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

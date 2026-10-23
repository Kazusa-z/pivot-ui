import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CurveWidget } from '../src/widgets/curve/CurveWidget'
import { copyCurveValue, sampleCurve, type CurveValue, type CurveViewport } from '../src/values/curve'
import { css } from '../styled-system/css'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'

const linear: CurveValue = {
  interpolation: 'linear',
  points: [
    { id: 'start', x: 0, y: 0 },
    { id: 'middle', x: 0.5, y: 0.7 },
    { id: 'end', x: 1, y: 1 },
  ],
}
const bezier: CurveValue = {
  interpolation: 'bezier',
  points: [
    { id: 'start', x: 0, y: 0, outHandle: { x: 0.15, y: 0.8 } },
    { id: 'middle', x: 0.5, y: 0.5, inHandle: { x: 0.35, y: 0.2 }, outHandle: { x: 0.65, y: 1 } },
    { id: 'end', x: 1, y: 0.8, inHandle: { x: 0.85, y: 0.5 } },
  ],
}
type Kind = 'linear' | 'bezier' | 'empty' | 'single' | 'bounds' | 'async' | 'frozen' | 'units'
function CurveExample({ kind = 'linear' }: { kind?: Kind }) {
  const initial =
    kind === 'empty'
      ? { interpolation: 'linear' as const, points: [] }
      : kind === 'single'
        ? { interpolation: 'linear' as const, points: [{ id: 'only', x: 0.5, y: 0.5 }] }
        : kind === 'bezier'
          ? bezier
          : linear
  const [value, setValue] = useState<CurveValue>(initial)
  const [selection, setSelection] = useState<readonly string[]>(
    kind === 'empty' ? [] : [initial.points[Math.min(1, initial.points.length - 1)].id]
  )
  const [viewport, setViewport] = useState<CurveViewport>({ xMin: 0, xMax: 1, yMin: 0, yMax: 1 })
  const [revision, setRevision] = useState(0)
  const revisionRef = useRef(revision)
  revisionRef.current = revision
  const [disabled, setDisabled] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [narrowBounds, setNarrowBounds] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const start = useRef(value),
    rejectNext = useRef(false)
  const record = (event: string) => setEvents((old) => [...old.slice(-19), event])
  return (
    <ContractFrame
      title={`CurveWidget · ${kind}`}
      description={
        kind === 'async'
          ? 'Preview is immediate; commit waits 500 ms. Reject next, drag a point or edit a coordinate, then retry. External update/new revision invalidates old local completion.'
          : kind === 'bounds'
            ? 'Hard editing range starts at X/Y 0…1. Shrinking X to 1.1…1.2 does not change existing data; the middle point has no reachable X interval between its neighbours, while Y remains editable.'
            : kind === 'frozen'
              ? 'The owner logs requests without accepting values. Graph geometry stays authoritative; local numeric drafts return to the accepted value after submission.'
              : 'Point click, selection, viewport, ticks and animation are UI state only. Drag a point/handle or use its arrow keys. Shift changes keyboard steps ×10, Ctrl/Meta ×0.1. Double-click empty graph to add; Delete removes selected points.'
      }
      onReset={() => {
        revisionRef.current++
        setRevision(revisionRef.current)
        setValue(initial)
        setSelection(kind === 'empty' ? [] : [initial.points[Math.min(1, initial.points.length - 1)].id])
        setViewport({ xMin: 0, xMax: 1, yMin: 0, yMax: 1 })
        setEvents([])
        setDisabled(false)
        setReadOnly(false)
        setNarrowBounds(false)
        rejectNext.current = false
      }}>
      <div className={css({ width: '100%', maxWidth: '680px', minWidth: 0 })}>
        <CurveWidget
          value={value}
          label="Response curve"
          selectedPointIds={selection}
          onSelectedPointIdsChange={(next) => {
            setSelection(next)
            record('selection only')
          }}
          viewport={viewport}
          onViewportChange={(next) => {
            setViewport(next)
            record('view only')
          }}
          resetKey={revision}
          disabled={disabled}
          readOnly={readOnly}
          showAnimation
          height={280}
          bounds={
            kind === 'bounds'
              ? narrowBounds
                ? { xMin: 1.1, xMax: 1.2, yMin: 0, yMax: 1 }
                : { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
              : undefined
          }
          xLabel={kind === 'units' ? 'Time (ms)' : 'X'}
          yLabel={kind === 'units' ? 'Percent' : 'Y'}
          formatXTick={kind === 'units' ? (number) => String(Math.round(number * 1000)) : undefined}
          formatYTick={kind === 'units' ? (number) => `${Math.round(number * 100)}%` : undefined}
          onEditStart={(source) => {
            start.current = copyCurveValue(value)
            record(`begin:${source}`)
          }}
          onValueChange={(next) => {
            record('preview')
            if (kind !== 'frozen') setValue(next)
          }}
          onValueCommit={async (_next, reason) => {
            record(`commit:${reason}`)
            const version = revisionRef.current
            if (kind === 'async') await new Promise((resolve) => setTimeout(resolve, 500))
            if (version !== revisionRef.current) {
              record('host ignored stale completion')
              return
            }
            if (rejectNext.current) {
              rejectNext.current = false
              setValue(start.current)
              record('rejected')
              throw new Error('The host rejected this curve. Retry or cancel the edit.')
            }
            record('accepted')
          }}
          onEditCancel={(reason) => {
            record(`cancel:${reason}`)
            if (
              kind !== 'frozen' &&
              ['escape', 'pointer-cancel', 'window-blur', 'disabled', 'read-only'].includes(reason)
            )
              setValue(start.current)
          }}
        />
      </div>
      <div className={contractStyles.row}>
        <ControlButton
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => {
            revisionRef.current++
            setRevision(revisionRef.current)
            setValue(bezier)
            setSelection(['middle'])
            record('external/new revision')
          }}>
          External curve
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setReadOnly((old) => !old)}>
          Toggle read-only
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setDisabled((old) => !old)}>
          Toggle disabled
        </ControlButton>
        {kind === 'async' && (
          <ControlButton
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => {
              rejectNext.current = true
              record('next commit rejects')
            }}>
            Reject next commit
          </ControlButton>
        )}
        {kind === 'bounds' && (
          <ControlButton
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => setNarrowBounds((old) => !old)}>
            Toggle narrow bounds
          </ControlButton>
        )}
      </div>
      <StatePanel label="Authoritative curve / sample at X 0.25" value={{ value, sample: sampleCurve(value, 0.25) }} />
      <StatePanel label="Independent selection / viewport" value={{ selection, viewport }} />
      <StatePanel label="Events" value={events} />
    </ContractFrame>
  )
}
const meta = {
  title: 'Widgets/Curve',
  component: CurveWidget,
  args: { value: linear },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CurveWidget>
export default meta
type Story = StoryObj<typeof meta>
export const Linear: Story = { render: () => <CurveExample /> }
export const Bezier: Story = { render: () => <CurveExample kind="bezier" /> }
export const Empty: Story = { render: () => <CurveExample kind="empty" /> }
export const SinglePoint: Story = { render: () => <CurveExample kind="single" /> }
export const EditingBounds: Story = { render: () => <CurveExample kind="bounds" /> }
export const AsyncRejection: Story = { render: () => <CurveExample kind="async" /> }
export const FrozenControlled: Story = { render: () => <CurveExample kind="frozen" /> }
export const DisplayUnits: Story = { render: () => <CurveExample kind="units" /> }

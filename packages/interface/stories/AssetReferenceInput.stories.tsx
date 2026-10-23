import { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { ResourceProvider } from '../src/contracts/resources'
import { DragDropProvider } from '../src/interaction/drag-drop/DragDropProvider'
import { useDragSource } from '../src/interaction/drag-drop/useDragSource'
import { AssetReferenceInput } from '../src/templates/resources/AssetReferenceInput'
import {
  ASSET_REFERENCE_DRAG_TYPE,
  type AssetDescriptor,
  type AssetDragData,
  type ResourceViewMode,
} from '../src/values/assets'
import { css } from '../styled-system/css'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'
import { createMockResourceProvider, mockAssets, type MockResourceEvent } from './support/mock-resource-provider'

function DraggableReference({ asset }: { asset: AssetDescriptor }) {
  const binding = useDragSource<AssetDragData, HTMLButtonElement>({
    type: ASSET_REFERENCE_DRAG_TYPE,
    data: { id: asset.id },
    effectAllowed: 'link',
  })
  return (
    <button
      type="button"
      ref={binding.ref}
      aria-label={`Drag ${asset.name}`}
      className={css({
        border: '1px dashed var(--colors-borderStrong)',
        borderRadius: '6px',
        padding: '8px',
        background: 'var(--colors-surfaceSubtle)',
        color: 'var(--colors-text)',
        font: 'inherit',
        fontSize: '12px',
        cursor: 'grab',
      })}>
      {asset.name} ({asset.kind}, {asset.status})
    </button>
  )
}

function ReferenceExample({
  initial = 'asset-1',
  outsideQuery = false,
  snapshot = false,
  noCapabilities = false,
  refuse = false,
  delayed = false,
  availability = false,
  textureOnly = false,
  drag = false,
  display = false,
}: {
  initial?: string | null
  outsideQuery?: boolean
  snapshot?: boolean
  noCapabilities?: boolean
  refuse?: boolean
  delayed?: boolean
  availability?: boolean
  textureOnly?: boolean
  drag?: boolean
  display?: boolean
}) {
  const [value, setValue] = useState<string | null>(initial)
  const [provider, setProvider] = useState(() => createMockResourceProvider())
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<'editable' | 'readonly' | 'disabled'>('editable')
  const [history, setHistory] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const [calls, setCalls] = useState<readonly MockResourceEvent[]>([])
  const [rejectNext, setRejectNext] = useState(delayed)
  const [viewMode, setViewMode] = useState<ResourceViewMode>('grid')
  const generation = useRef(0)
  const record = (event: string) => setEvents((old) => [...old.slice(-17), event])
  const access = useMemo<ResourceProvider>(
    () => (noCapabilities ? { query: provider.query, get: provider.get } : provider),
    [provider, noCapabilities]
  )
  function reset() {
    generation.current++
    setValue(initial)
    setProvider(createMockResourceProvider())
    setRevision((old) => old + 1)
    setState('editable')
    setHistory(0)
    setEvents([])
    setCalls([])
    setRejectNext(delayed)
    setViewMode('grid')
  }
  const content = (
    <ContractFrame
      title="Asset reference"
      description={
        refuse
          ? 'The owner explicitly returns false. Selection stays unchanged, the popup remains open, and the error can be retried.'
          : delayed
            ? 'The host waits 450 ms and rejects the first request. A target or provider switch invalidates old local results; successful selection closes the popup.'
            : drag
              ? 'Drag the ID-only sources into the input. The current provider resolves and validates the ID, kind, group and readiness before proposing a reference change. Picker selection is the keyboard alternative.'
              : 'The current ID resolves independently from query pages and search. Optional locate/file capabilities are injected by the host; read-only mode still allows browsing and locating.'
      }
      onReset={reset}>
      <div className={contractStyles.row}>
        <ControlButton
          onClick={() => {
            generation.current++
            setValue('asset-15')
            setRevision((old) => old + 1)
            record('target changed to asset-15')
          }}>
          Load another target
        </ControlButton>
        <ControlButton
          onClick={() => {
            generation.current++
            setProvider(
              createMockResourceProvider({
                assets: mockAssets.map((asset) => ({ ...asset, name: `Alternate ${asset.name}` })),
              })
            )
            record('provider replaced')
          }}>
          Replace provider
        </ControlButton>
        {delayed && <ControlButton onClick={() => setRejectNext(true)}>Reject next reference change</ControlButton>}
        {availability &&
          (['editable', 'readonly', 'disabled'] as const).map((next) => (
            <ControlButton key={next} aria-pressed={state === next} onClick={() => setState(next)}>
              {next}
            </ControlButton>
          ))}
        {!noCapabilities && (
          <>
            <ControlButton
              onClick={() => {
                provider.setFileResult('asset-4')
                record('file chooser will return texture asset-4')
              }}>
              File result: texture
            </ControlButton>
            <ControlButton
              onClick={() => {
                provider.setFileResult('asset-2')
                record('file chooser will return material asset-2')
              }}>
              File result: material
            </ControlButton>
            <ControlButton
              onClick={() => {
                provider.rejectNext('locate')
                record('next locate will reject')
              }}>
              Reject next locate
            </ControlButton>
          </>
        )}
        <ControlButton onClick={() => setCalls(provider.getEvents())}>Inspect provider calls</ControlButton>
      </div>
      {drag && (
        <div className={contractStyles.row}>
          {[mockAssets[0], mockAssets[1], mockAssets[15]].map((asset) => (
            <DraggableReference key={asset.id} asset={asset} />
          ))}
        </div>
      )}
      <div className={css({ width: 'min(540px, 100%)', minWidth: 0 })}>
        <AssetReferenceInput
          value={value}
          provider={access}
          selectedAsset={snapshot && value === initial ? mockAssets.find((asset) => asset.id === initial) : undefined}
          resetKey={revision}
          disabled={state === 'disabled'}
          readOnly={state === 'readonly'}
          kinds={textureOnly || drag ? ['texture'] : undefined}
          dropEnabled={drag}
          pickerProps={{
            defaultQueryText: outsideQuery ? 'Brick' : '',
            pageSize: 6,
            ...(display ? { viewMode, onViewModeChange: setViewMode } : {}),
          }}
          onOpenChange={(open) => record(open ? 'picker opened' : 'picker closed')}
          onValueChange={async (next, asset) => {
            const version = generation.current,
              reject = rejectNext
            setRejectNext(false)
            record(`request:${next ?? 'empty'}:${asset?.status ?? 'none'}`)
            if (delayed) await new Promise<void>((resolve) => setTimeout(resolve, 450))
            if (version !== generation.current) return false
            if (reject) {
              record('rejected')
              throw Error('The host rejected this reference. Select it again to retry.')
            }
            if (refuse) {
              record('owner refused')
              return false
            }
            setValue(next)
            if (next !== value) setHistory((old) => old + 1)
            record('accepted')
          }}
        />
      </div>
      <StatePanel
        label="Controlled reference and history"
        value={{ value, history, revision, state, viewMode, events }}
      />
      <StatePanel label="Explicit provider calls" value={calls} />
    </ContractFrame>
  )
  return drag ? <DragDropProvider>{content}</DragDropProvider> : content
}

const meta = { title: 'Templates/Resources/AssetReferenceInput', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <ReferenceExample /> }
export const Empty: Story = { render: () => <ReferenceExample initial={null} /> }
export const CurrentOutsideQuery: Story = { render: () => <ReferenceExample initial="asset-15" outsideQuery /> }
export const MissingReference: Story = { render: () => <ReferenceExample initial="missing-resource" /> }
export const InjectedSnapshot: Story = { render: () => <ReferenceExample initial="asset-15" snapshot outsideQuery /> }
export const MissingCapabilities: Story = { render: () => <ReferenceExample noCapabilities /> }
export const ControlledRefusal: Story = { render: () => <ReferenceExample refuse /> }
export const DelayedRejectionAndTarget: Story = { render: () => <ReferenceExample delayed /> }
export const ReadonlyAndDisabled: Story = { render: () => <ReferenceExample availability /> }
export const KindFilterAndFile: Story = { render: () => <ReferenceExample textureOnly /> }
export const DragAndDrop: Story = { render: () => <ReferenceExample initial={null} drag /> }
export const ControlledDisplayMode: Story = { render: () => <ReferenceExample display /> }

import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AssetItem } from '../src/widgets/collections/asset/AssetItem'
import { AssetName } from '../src/widgets/collections/asset/AssetName'
import { AssetThumbnail } from '../src/widgets/collections/asset/AssetThumbnail'
import type { AssetDescriptor } from '../src/values/assets'
import { Button } from '../src/widgets/buttons/Button'
import { css } from '../styled-system/css'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'

const thumbnail =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#325f93"/><path d="M20 70 42 30 60 60 74 40 88 70Z" fill="#c4d9ec"/></svg>'
  )
const initialAssets: readonly AssetDescriptor[] = [
  {
    id: 'landscape',
    name: 'Landscape texture',
    kind: 'texture',
    status: 'ready',
    thumbnailUrl: thumbnail,
    description: 'A small preview supplied by the host.',
  },
  {
    id: 'mesh',
    name: 'Very long resource name that wraps inside a narrow grid or list item',
    kind: 'mesh',
    status: 'ready',
  },
  { id: 'material', name: 'Surface material', kind: 'material', status: 'ready' },
]
type Kind = 'grid' | 'list' | 'states' | 'rename' | 'target' | 'fallback'
function AssetExample({ kind = 'grid' }: { kind?: Kind }) {
  const [assets, setAssets] = useState(initialAssets)
  const [selected, setSelected] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(kind === 'list' ? 'list' : 'grid')
  const [readOnly, setReadOnly] = useState(false),
    [disabled, setDisabled] = useState(false)
  const [target, setTarget] = useState('landscape'),
    [revision, setRevision] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const rejectNext = useRef(false),
    generation = useRef(0)
  const record = (event: string) => setEvents((old) => [...old.slice(-19), event])
  const reset = () => {
    generation.current++
    setAssets(initialAssets)
    setSelected(null)
    setViewMode(kind === 'list' ? 'list' : 'grid')
    setReadOnly(false)
    setDisabled(false)
    setTarget('landscape')
    setRevision((old) => old + 1)
    setEvents([])
    rejectNext.current = false
  }
  const rows: readonly AssetDescriptor[] =
    kind === 'states'
      ? [
          ...assets.slice(0, 1),
          { id: 'pending', name: 'Loading resource', kind: 'texture', status: 'loading' },
          {
            id: 'error',
            name: 'Unavailable resource',
            kind: 'mesh',
            status: 'error',
            disabledReason: 'The resource provider could not load metadata.',
          },
          { id: 'missing', name: 'Missing resource', kind: 'material', status: 'missing' },
          {
            id: 'restricted',
            name: 'Restricted resource',
            kind: 'mesh',
            status: 'ready',
            selectable: false,
            disabledReason: 'This resource kind is not accepted by the host.',
          },
        ]
      : kind === 'target'
        ? assets.filter((asset) => asset.id === target)
        : kind === 'fallback'
          ? [{ ...assets[0], thumbnailUrl: revision % 2 ? thumbnail : 'data:image/png;base64,AA==' }]
          : assets
  return (
    <ContractFrame
      title={`AssetItem · ${kind}`}
      description={
        kind === 'rename'
          ? 'Edit a resource name. Reject next rename retains the draft and one error; Enter retries, Escape cancels. Enter followed by blur submits once.'
          : kind === 'target'
            ? 'Start renaming, then switch the resource or update the same target externally. Local draft and pending completion belong to their original asset ID. A submitted host rename may still finish for that old asset.'
            : kind === 'fallback'
              ? 'The first image fails to decode and uses a file fallback. Changing the URL allows a fresh image attempt; resource selection remains available.'
              : 'Thumbnail selection, rename and host actions are separate native controls. Loading, error, missing and restricted resources cannot be selected. Read-only resources can be viewed and selected.'
      }
      onReset={reset}>
      <div className={contractStyles.row}>
        <ControlButton onClick={() => setViewMode((old) => (old === 'grid' ? 'list' : 'grid'))}>
          Switch grid/list
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setReadOnly((old) => !old)}>
          Toggle read-only
        </ControlButton>
        <ControlButton onPointerDown={(event) => event.preventDefault()} onClick={() => setDisabled((old) => !old)}>
          Toggle disabled
        </ControlButton>
        {kind === 'rename' && (
          <ControlButton
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => {
              rejectNext.current = true
              record('next rename rejects')
            }}>
            Reject next rename
          </ControlButton>
        )}
        {kind === 'target' && (
          <>
            <ControlButton
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => {
                setTarget((old) => (old === 'landscape' ? 'material' : 'landscape'))
                record('switch target')
              }}>
              Switch target
            </ControlButton>
            <ControlButton
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => {
                generation.current++
                setAssets((old) =>
                  old.map((asset) => (asset.id === target ? { ...asset, name: 'External name' } : asset))
                )
                setRevision((old) => old + 1)
                record('external update')
              }}>
              External name
            </ControlButton>
          </>
        )}
        {kind === 'fallback' && (
          <ControlButton onClick={() => setRevision((old) => old + 1)}>Replace thumbnail URL</ControlButton>
        )}
      </div>
      <div
        className={css({ display: 'grid', gap: '12px', width: '100%', maxWidth: '620px', minWidth: 0 })}
        style={{
          gridTemplateColumns:
            viewMode === 'grid' ? 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))' : 'minmax(0, 1fr)',
        }}>
        {rows.map((asset) => (
          <AssetItem
            key={kind === 'target' ? 'target-slot' : asset.id}
            asset={asset}
            viewMode={viewMode}
            selected={selected === asset.id}
            readOnly={readOnly}
            disabled={disabled}
            resetKey={revision}
            onSelect={(id) => {
              setSelected(id)
              record('select:' + id)
            }}
            onRename={
              kind === 'states' || kind === 'fallback'
                ? undefined
                : async (name) => {
                    const version = generation.current
                    const rejected = rejectNext.current
                    rejectNext.current = false
                    record('request:' + asset.id + ':' + name)
                    if (kind === 'rename' || kind === 'target') await new Promise((resolve) => setTimeout(resolve, 500))
                    if (version !== generation.current) {
                      record('host ignored stale rename:' + asset.id)
                      return
                    }
                    if (rejected) {
                      record('rejected:' + asset.id)
                      throw new Error('The host rejected this name. Press Enter to retry.')
                    }
                    setAssets((old) => old.map((item) => (item.id === asset.id ? { ...item, name } : item)))
                    record('accepted:' + asset.id)
                  }
            }
            actions={
              kind === 'grid' || kind === 'list' ? (
                <Button size="xs" variant="subtle" disabled={disabled} onClick={() => record('inspect:' + asset.id)}>
                  Inspect
                </Button>
              ) : undefined
            }
          />
        ))}
      </div>
      <StatePanel label="Accepted resources and selection" value={{ assets, selected, viewMode, readOnly, disabled }} />
      <StatePanel label="Events" value={events} />
    </ContractFrame>
  )
}
function AssetPartsExample() {
  const [asset, setAsset] = useState(initialAssets[0])
  return (
    <ContractFrame
      title="Asset display parts"
      description="AssetThumbnail is display only. AssetName uses the same EditableText lifecycle as AssetItem; neither part queries resources."
      onReset={() => setAsset(initialAssets[0])}>
      <AssetThumbnail asset={asset} css={{ width: '96px' }} />
      <AssetName asset={asset} onRename={(name) => setAsset((old) => ({ ...old, name }))} />
      <StatePanel label="Accepted asset" value={asset} />
    </ContractFrame>
  )
}
const meta = {
  title: 'Widgets/AssetItem',
  component: AssetItem,
  args: { asset: initialAssets[0] },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AssetItem>
export default meta
type Story = StoryObj<typeof meta>
export const Grid: Story = { render: () => <AssetExample /> }
export const List: Story = { render: () => <AssetExample kind="list" /> }
export const States: Story = { render: () => <AssetExample kind="states" /> }
export const RenameRejection: Story = { render: () => <AssetExample kind="rename" /> }
export const ExternalTarget: Story = { render: () => <AssetExample kind="target" /> }
export const ThumbnailFallback: Story = { render: () => <AssetExample kind="fallback" /> }
export const Parts: Story = { render: () => <AssetPartsExample /> }

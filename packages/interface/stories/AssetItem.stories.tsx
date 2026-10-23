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
    description: '应用提供的资源缩略图。',
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
            disabledReason: '资源信息加载失败，请重试。',
          },
          { id: 'missing', name: 'Missing resource', kind: 'material', status: 'missing' },
          {
            id: 'restricted',
            name: 'Restricted resource',
            kind: 'mesh',
            status: 'ready',
            selectable: false,
            disabledReason: '此应用不接受这种资源类型。',
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
          ? '编辑资源名称后按 Enter 或移开焦点保存。点击 Reject next rename 可模拟保存失败：输入内容会保留，按 Enter 重试或按 Escape 取消。应用在 onRename 成功后回传新名称。'
          : kind === 'target'
            ? '修改名称时点击 Switch target，体验在两项资源之间切换；也可点击 External name，查看应用传入新名称后的显示。下方记录会标出每次改名对应的资源 ID，接入时可用这个 ID 找到要保存的资源。'
            : kind === 'fallback'
              ? '先查看缩略图加载失败时的占位图，再点击 Replace thumbnail URL 尝试另一个地址。点击资源仍可选择它，下方会显示选择结果；应用可以通过更新 thumbnailUrl 重新加载缩略图。'
              : '点击缩略图选择资源，用 Switch grid/list 比较两种布局，再试试 Tab 在资源名称和操作按钮之间移动。下方记录展示选择和操作结果；应用在 onSelect 中更新选择，在 onRename 中保存名称。'
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
                      record('应用忽略较早的改名结果：' + asset.id)
                      return
                    }
                    if (rejected) {
                      record('rejected:' + asset.id)
                      throw new Error('名称未保存。请修改后按 Enter 重试。')
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
      <StatePanel label="当前资源与选择状态" value={{ assets, selected, viewMode, readOnly, disabled }} />
      <StatePanel label="Events" value={events} />
    </ContractFrame>
  )
}
function AssetPartsExample() {
  const [asset, setAsset] = useState(initialAssets[0])
  return (
    <ContractFrame
      title="单独使用缩略图和资源名称"
      description="这里把缩略图和名称分开摆放。试着编辑名称并按 Enter，观察下方资源数据随之更新；自己的列表只需分别传入 asset，并在 AssetName 的 onRename 中保存新名称。"
      onReset={() => setAsset(initialAssets[0])}>
      <AssetThumbnail asset={asset} css={{ width: '96px' }} />
      <AssetName asset={asset} onRename={(name) => setAsset((old) => ({ ...old, name }))} />
      <StatePanel label="Accepted asset" value={asset} />
    </ContractFrame>
  )
}
const meta = {
  tags: ['autodocs'],
  title: 'Widgets/AssetItem',
  component: AssetItem,
  args: { asset: initialAssets[0] },
  parameters: {
    docs: {
      description: {
        component:
          'AssetItem 用于资源列表或网格中的单个项目，显示缩略图、名称、选择状态和操作按钮。AssetThumbnail 与 AssetName 可以单独使用。\n\n传入 asset 描述资源，用 selected 表示当前选择，并在 onSelect 中更新应用状态。提供 onRename 后可以编辑名称；返回的 Promise 成功后由应用回传新名称，失败时保留输入内容供重试。\n\n资源查询与保存由应用提供。readOnly 允许查看和选择但禁止改名；disabled 禁止交互。加载中、缺失、出错或不可选择的资源会明确显示状态。',
      },
    },
    layout: 'fullscreen',
  },
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

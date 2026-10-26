import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AssetItem, AssetName, AssetThumbnail } from '../src/widgets/collections/asset'
import type { AssetDescriptor } from '../src/values/assets'
import { Badge } from '../src/widgets/display/Badge'
import { Button } from '../src/widgets/buttons'
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
  StoryNote,
} from './support/StoryPage'

const thumbnail =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#325f93"/><path d="M20 70 42 30 60 60 74 40 88 70Z" fill="#c4d9ec"/></svg>'
  )

const galleryAssets: readonly AssetDescriptor[] = [
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

const stateAssets: readonly AssetDescriptor[] = [
  { id: 'loading', name: 'Loading resource', kind: 'texture', status: 'loading' },
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

type ViewMode = 'grid' | 'list'
type Density = 'compact' | 'regular'

const assetGridClass = css({ display: 'grid', gap: 'var(--space-2)', width: '100%', minWidth: 0 })

function AssetGrid({
  mode,
  density = 'compact',
  assets = galleryAssets,
  selectedId,
}: {
  mode: ViewMode
  density?: Density
  assets?: readonly AssetDescriptor[]
  selectedId?: string
}) {
  return (
    <div
      className={assetGridClass}
      style={{
        gridTemplateColumns: mode === 'grid' ? 'repeat(auto-fit, minmax(min(150px, 100%), 1fr))' : 'minmax(0, 1fr)',
      }}>
      {assets.map((asset) => (
        <AssetItem key={asset.id} asset={asset} viewMode={mode} density={density} selected={selectedId === asset.id} />
      ))}
    </div>
  )
}

function RenameExample() {
  const [assets, setAssets] = useState<AssetDescriptor[]>(() => galleryAssets.map((asset) => ({ ...asset })))
  const [selected, setSelected] = useState<string | null>('landscape')
  const [mode, setMode] = useState<ViewMode>('grid')
  const [density, setDensity] = useState<Density>('compact')
  const [readOnly, setReadOnly] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const rejectNext = useRef(false)
  const record = (event: string) => setEvents((current) => [...current.slice(-7), event])
  const reset = () => {
    setAssets(galleryAssets.map((asset) => ({ ...asset })))
    setSelected('landscape')
    setMode('grid')
    setDensity('compact')
    setReadOnly(false)
    setDisabled(false)
    setEvents([])
    rejectNext.current = false
  }
  const rename = async (asset: AssetDescriptor, name: string) => {
    record(`rename ${asset.id}: ${name}`)
    await new Promise((resolve) => setTimeout(resolve, 250))
    if (rejectNext.current) {
      rejectNext.current = false
      record(`rejected ${asset.id}`)
      throw new Error('名称未保存。请修改后按 Enter 重试。')
    }
    setAssets((current) => current.map((item) => (item.id === asset.id ? { ...item, name } : item)))
    record(`accepted ${asset.id}`)
  }
  return (
    <>
      <StoryRow>
        <Button size="sm" variant={mode === 'grid' ? 'solid' : 'outline'} onClick={() => setMode('grid')}>
          Grid
        </Button>
        <Button size="sm" variant={mode === 'list' ? 'solid' : 'outline'} onClick={() => setMode('list')}>
          List
        </Button>
        <Button size="sm" variant={density === 'compact' ? 'solid' : 'outline'} onClick={() => setDensity('compact')}>
          Compact
        </Button>
        <Button size="sm" variant={density === 'regular' ? 'solid' : 'outline'} onClick={() => setDensity('regular')}>
          Regular
        </Button>
        <Button size="sm" variant="outline" onClick={() => setReadOnly((value) => !value)}>
          {readOnly ? 'Read only: on' : 'Read only: off'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setDisabled((value) => !value)}>
          {disabled ? 'Disabled: on' : 'Disabled: off'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            rejectNext.current = true
            record('next rename rejects')
          }}>
          Reject next rename
        </Button>
        <Button size="sm" variant="subtle" onClick={reset}>
          Reset
        </Button>
      </StoryRow>
      <div
        className={assetGridClass}
        style={{
          gridTemplateColumns: mode === 'grid' ? 'repeat(auto-fit, minmax(min(170px, 100%), 1fr))' : 'minmax(0, 1fr)',
        }}>
        {assets.map((asset) => (
          <AssetItem
            key={asset.id}
            asset={asset}
            viewMode={mode}
            density={density}
            selected={selected === asset.id}
            readOnly={readOnly}
            disabled={disabled}
            onSelect={(id) => {
              setSelected(id)
              record(`select ${id}`)
            }}
            onRename={(name) => rename(asset, name)}
            actions={
              <Button size="xs" variant="subtle" disabled={disabled} onClick={() => record(`inspect ${asset.id}`)}>
                Inspect
              </Button>
            }
          />
        ))}
      </div>
      <StoryNote>
        点击缩略图选择；名称旁的编辑按钮进入改名。`onRename` 返回
        Promise：成功后应用回传新名称，失败时保留草稿并显示错误。
      </StoryNote>
      <StoryState label="Assets and events" value={{ selected, mode, density, readOnly, disabled, events }} />
    </>
  )
}

function AssetPage() {
  const [partAsset, setPartAsset] = useState<AssetDescriptor>(galleryAssets[0])
  return (
    <StoryPage
      eyebrow="Collections"
      title="AssetItem"
      summary="AssetItem 在网格或列表中展示一条资源，包含缩略图、选择、名称编辑和宿主操作。AssetThumbnail 与 AssetName 也可以拆开使用。"
      meta={
        <>
          <span>Grid</span>
          <span>·</span>
          <span>List</span>
          <span>·</span>
          <span>selectionSubtle</span>
        </>
      }>
      <StorySection
        title="Grid and list"
        description="grid 把缩略图放在上方，list 保持单行；两种模式共用同一套选择、状态和名称编辑行为。">
        <StoryGrid>
          <StoryCard title="Grid view">
            <AssetGrid mode="grid" selectedId="landscape" />
          </StoryCard>
          <StoryCard title="List view">
            <AssetGrid mode="list" selectedId="mesh" />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Density"
        description="AssetItem 的 compact / regular 控制文字 12/14 和列表中的名称密度；缩略图保持方形。选中态使用 selectionSubtle 浅底和边框，而不是整行实心。">
        <StoryGrid>
          <StoryCard title="Compact · 12px">
            <AssetGrid mode="list" density="compact" selectedId="landscape" assets={galleryAssets.slice(0, 2)} />
          </StoryCard>
          <StoryCard title="Regular · 14px">
            <AssetGrid mode="list" density="regular" selectedId="landscape" assets={galleryAssets.slice(0, 2)} />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="States"
        description="加载、错误、缺失和不可选择都由 asset.status / selectable 提供；AssetItem 显示说明文字，但不会伪造可交互状态。">
        <StoryGrid>
          {stateAssets.map((asset) => (
            <StoryCard
              key={asset.id}
              title={
                <StoryRow>
                  <span>{asset.status === 'ready' ? 'Not selectable' : asset.status}</span>
                  <Badge
                    size="xs"
                    variant="surface"
                    color={
                      asset.status === 'error'
                        ? 'red'
                        : asset.status === 'loading'
                          ? 'amber'
                          : asset.status === 'missing'
                            ? 'gray'
                            : 'blue'
                    }>
                    {asset.status}
                  </Badge>
                </StoryRow>
              }>
              <AssetItem asset={asset} density="compact" onSelect={() => {}} />
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Selection and rename"
        description="选择与改名是两个独立请求。切换视图、密度、只读和禁用，观察选择按钮、名称编辑和 Inspect 操作的变化。">
        <StoryCard>
          <RenameExample />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Disabled and read-only"
        description="disabled 关闭选择、改名和操作；readOnly 仍可选择，但名称只能查看。">
        <StoryGrid>
          <StoryCard title="Disabled">
            <AssetItem
              asset={galleryAssets[0]}
              density="compact"
              disabled
              onSelect={() => {}}
              onRename={async () => {}}
              actions={
                <Button size="xs" variant="subtle">
                  Inspect
                </Button>
              }
            />
          </StoryCard>
          <StoryCard title="Read only">
            <AssetItem
              asset={galleryAssets[0]}
              density="compact"
              readOnly
              onSelect={() => {}}
              onRename={async () => {}}
            />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Parts"
        description="只需要缩略图或名称时，可以单独组合 AssetThumbnail 与 AssetName；名称的保存仍由应用负责。">
        <StoryCard>
          <StoryRow align="start">
            <AssetThumbnail asset={partAsset} css={{ width: '96px' }} />
            <AssetName asset={partAsset} onRename={(name) => setPartAsset((current) => ({ ...current, name }))} />
          </StoryRow>
          <StoryState label="Accepted asset" value={partAsset} />
        </StoryCard>
      </StorySection>

      <StorySection title="Keyboard and accessibility">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '在资源选择按钮、名称编辑和操作之间移动。' },
            { keys: ['Enter', 'Space'], action: '激活当前的选择按钮。' },
            { keys: 'Enter', action: '在名称编辑按钮上进入编辑；提交时再次按 Enter。' },
            { keys: 'Escape', action: '在名称编辑中取消本次草稿。' },
          ]}
        />
        <StoryNote>
          选择按钮使用 aria-pressed 和逐项 aria-label；资源容器是 role="group"。状态说明通过 aria-describedby
          关联到选择按钮。
        </StoryNote>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<AssetItem
  asset={asset}
  viewMode={mode}
  density="compact"
  selected={selected === asset.id}
  onSelect={setSelected}
  onRename={saveName}
  actions={<Button size="xs">Inspect</Button>}
/>`}
          />
          <StoryProps
            rows={[
              {
                name: 'asset',
                type: 'AssetDescriptor',
                description: '资源快照；包含 id、name、kind、status 和可选 thumbnailUrl。',
              },
              {
                name: 'viewMode',
                type: "'grid' | 'list'",
                defaultValue: "'grid'",
                description: '缩略图布局；list 使用固定方形缩略图。',
              },
              {
                name: 'density',
                type: "'compact' | 'regular'",
                defaultValue: "'compact'",
                description: '控制文字 12/14 和列表名称密度；缩略图保持方形。',
              },
              {
                name: 'selected',
                type: 'boolean',
                defaultValue: 'false',
                description: '使用 selectionSubtleBg + border 表示选择。',
              },
              { name: 'onSelect', type: '(id: string) => void', description: '选择请求；缺失表示不可选择。' },
              {
                name: 'onRename',
                type: '(name: string) => void | Promise<void>',
                description: '名称提交；拒绝时保留草稿并显示错误。',
              },
              {
                name: 'disabled / readOnly',
                type: 'boolean',
                description: 'disabled 关闭全部交互；readOnly 仅禁止改名。',
              },
              { name: 'actions', type: 'ReactNode', description: '宿主操作，与选择按钮并列而不是嵌套。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'AssetItem 展示网格或列表中的一条资源，包含缩略图、选择、名称编辑和宿主操作。AssetThumbnail 与 AssetName 可以单独组合；名称保存和资源查询由应用负责。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Collections/AssetItem',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = { render: () => <AssetPage /> }

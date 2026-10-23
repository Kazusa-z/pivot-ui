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
      title="资源引用选择"
      description={
        refuse
          ? '打开弹层并选择一个资源，体验应用拒绝选择时的错误提示：输入框继续显示原资源，弹层中可以再次操作。此例通过 onValueChange 返回 false 模拟拒绝；实际接受选择时，在这个回调中更新 value。'
          : delayed
            ? '打开弹层选择资源，等待 450 ms 后会看到第一次保存失败的提示；再次选择即可保存并关闭弹层。下方显示 value、历史次数和事件。还可在等待时点击 Load another target，体验切换对象；应用用 resetKey 标识这次切换。'
            : drag
              ? '把上方资源拖入输入框，比较就绪纹理、其他类型和加载中资源的处理结果；也可以打开弹层用键盘选择。启用拖放时包裹 DragDropProvider，组件会调用 provider.get 读取拖入的资源，接受后通过 onValueChange 更新引用。'
              : '打开资源弹层，尝试搜索、翻页并选择一项，再查看输入框中的名称与下方 value。清空按钮可移除引用，定位和文件按钮展示应用提供的附加操作。接入时用 value 保存资源 ID，在 onValueChange 中更新它；provider.get 负责读取当前资源名称。'
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
              throw Error('选择未保存，请再次选择以重试。')
            }
            if (refuse) {
              record('应用拒绝了本次选择')
              return false
            }
            setValue(next)
            if (next !== value) setHistory((old) => old + 1)
            record('accepted')
          }}
        />
      </div>
      <StatePanel label="当前引用与保存历史" value={{ value, history, revision, state, viewMode, events }} />
      <StatePanel label="资源服务调用记录" value={calls} />
    </ContractFrame>
  )
  return drag ? <DragDropProvider>{content}</DragDropProvider> : content
}

const meta = {
  tags: ['autodocs'],
  title: 'Templates/Resources/AssetReferenceInput',
  parameters: {
    docs: {
      description: {
        component:
          'AssetReferenceInput 用于表单中选择一个资源引用，例如纹理、材质或模型。value 保存资源 ID，null 表示未选择；provider.get 单独读取当前引用，搜索和翻页时仍可显示它的名称。\n\n在 onValueChange(nextId, asset) 中接受或拒绝选择，并更新 React 状态中的 value。回调可返回 Promise：返回 true 或 void 表示成功并关闭弹层，返回 false 或抛出错误会显示提示供重试。\n\nprovider 负责查询，也可提供 locate 与 chooseFile 启用定位和文件选择。拖放需要 DragDropProvider 和 dropEnabled，组件会检查拖入资源的状态与类型。readOnly 适合查看与定位，disabled 适合暂时停止交互；切换编辑对象时更新 resetKey。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
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

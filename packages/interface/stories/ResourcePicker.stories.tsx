import { StrictMode, useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ResourcePicker } from '../src/templates/resources/ResourcePicker'
import type { ResourceProvider } from '../src/contracts/resources'
import type { ResourceViewMode } from '../src/values/assets'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'
import {
  createMockResourceProvider,
  mockAssets,
  resourceGroupOptions,
  resourceKindOptions,
} from './support/mock-resource-provider'

function PickerExample({
  empty = false,
  capabilities = true,
  initialReadOnly = false,
  initialDisabled = false,
  refuse = false,
  async = false,
  narrow = false,
}: {
  empty?: boolean
  capabilities?: boolean
  initialReadOnly?: boolean
  initialDisabled?: boolean
  refuse?: boolean
  async?: boolean
  narrow?: boolean
}) {
  const [revision, setRevision] = useState(0),
    [host, setHost] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>('outside-current-page')
  const [queryText, setQueryText] = useState(''),
    [kinds, setKinds] = useState<readonly string[]>([]),
    [groupId, setGroupId] = useState('')
  const [viewMode, setViewMode] = useState<ResourceViewMode>('grid'),
    [page, setPage] = useState(1)
  const [readOnly, setReadOnly] = useState(initialReadOnly),
    [disabled, setDisabled] = useState(initialDisabled)
  const [events, setEvents] = useState<string[]>([]),
    [reject, setReject] = useState(false)
  const context = useRef({ revision, host })
  context.current = { revision, host }
  const mock = useMemo(
    () =>
      createMockResourceProvider({
        assets: empty
          ? []
          : host
            ? mockAssets.map((asset) => ({ ...asset, name: `Other host ${asset.name}` }))
            : mockAssets,
        delayMs: async ? 450 : 0,
      }),
    [revision, host, empty, async]
  )
  const provider = useMemo<ResourceProvider>(
    () => (capabilities ? mock : { query: (query) => mock.query(query), get: (id) => mock.get(id) }),
    [mock, capabilities]
  )
  const log = (event: string) => setEvents((previous) => [...previous.slice(-11), event])
  function reset() {
    setRevision((value) => value + 1)
    setSelectedId('outside-current-page')
    setQueryText('')
    setKinds([])
    setGroupId('')
    setViewMode('grid')
    setPage(1)
    setEvents([])
    setReject(false)
    setReadOnly(initialReadOnly)
    setDisabled(initialDisabled)
  }
  return (
    <ContractFrame
      title="搜索和选择资源"
      description="输入关键词，切换类型、分组或页码来查找资源，然后点击一项查看选中高亮与下方记录。再点击 Reject selection asynchronously 体验保存失败后的重试。此例用 onSelect 处理选择请求，成功后由 onSelectedIdChange 更新 selectedId；provider 提供查询和改名。"
      onReset={reset}>
      <div className={contractStyles.row}>
        <ControlButton onClick={() => setReadOnly((value) => !value)}>
          {readOnly ? 'Allow selection' : 'Read only'}
        </ControlButton>
        <ControlButton onClick={() => setDisabled((value) => !value)}>
          {disabled ? 'Enable picker' : 'Disable picker'}
        </ControlButton>
        <ControlButton onClick={() => setHost((value) => value + 1)}>Replace provider</ControlButton>
        <ControlButton
          onClick={() => {
            mock.rejectNext('query')
            log('Next query will fail')
          }}>
          Fail next query
        </ControlButton>
        {capabilities && (
          <ControlButton
            onClick={() => {
              mock.rejectNext('rename')
              log('Next rename will fail')
            }}>
            Fail next rename
          </ControlButton>
        )}
        <ControlButton onClick={() => setReject((value) => !value)}>
          {reject ? 'Accept selection' : 'Reject selection asynchronously'}
        </ControlButton>
      </div>
      <div style={{ width: narrow ? 280 : '100%', maxWidth: '100%' }}>
        <ResourcePicker
          provider={provider}
          selectedId={selectedId}
          onSelectedIdChange={(id) => {
            if (!refuse) setSelectedId(id)
          }}
          queryText={queryText}
          onQueryTextChange={setQueryText}
          kinds={kinds}
          onKindsChange={setKinds}
          groupId={groupId}
          onGroupIdChange={setGroupId}
          kindOptions={resourceKindOptions}
          groupOptions={resourceGroupOptions}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          page={page}
          onPageChange={setPage}
          pageSize={6}
          readOnly={readOnly}
          disabled={disabled}
          resetKey={revision}
          onSelect={async (id) => {
            const token = context.current
            log(`select ${id}`)
            if (async || reject) await new Promise((resolve) => setTimeout(resolve, 500))
            if (
              token !== context.current &&
              (token.revision !== context.current.revision || token.host !== context.current.host)
            )
              return false
            if (reject) throw Error('此资源未被接受，请取消拒绝选项后重试。')
            return !refuse
          }}
          onSelectSuccess={(id) => log(`selection completed ${id}`)}
        />
      </div>
      <StatePanel
        label="当前选择与浏览状态"
        value={{ selectedId, queryText, kinds, groupId, viewMode, page, readOnly, disabled, events }}
      />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Templates/Resources/ResourcePicker',
  component: PickerExample,
  parameters: {
    docs: {
      description: {
        component:
          'ResourcePicker 是可嵌入弹层或页面的资源浏览器，支持搜索、类型与分组筛选、分页，以及列表和网格显示。\n\n用 selectedId 表示选中资源，在 onSelectedIdChange 中更新这个 ID。onSelect(id, asset) 可先校验或异步保存选择：返回 true 或 void 后会调用 onSelectedIdChange 与 onSelectSuccess，返回 false 或抛出错误则显示提示并保留原选择。\n\nprovider 提供查询和可选改名方法。queryText、viewMode、kinds、groupId 和 page 可由 React 状态控制；需要记住浏览偏好时，应用保存这些状态即可。readOnly 适合只浏览资源的界面。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PickerExample>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = {}
export const ControlledRefusal: Story = { args: { refuse: true } }
export const AsyncAndReset: Story = {
  args: { async: true },
  render: (args) => (
    <StrictMode>
      <PickerExample {...args} />
    </StrictMode>
  ),
}
export const Empty: Story = { args: { empty: true } }
export const ReadOnly: Story = { args: { initialReadOnly: true } }
export const Disabled: Story = { args: { initialDisabled: true } }
export const WithoutOptionalCapabilities: Story = { args: { capabilities: false } }
export const Narrow: Story = { args: { narrow: true } }

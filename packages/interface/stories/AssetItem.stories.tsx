import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AssetItem, AssetName, AssetThumbnail } from '../src/collections/asset'
import type { AssetDescriptor } from '../src/values/assets'
import { Button } from '../src/controls/buttons'
import { css } from '../styled-system/css'
import { describeComponent } from './support/describe'
import { Column, Grid, Item, Row, StateView } from './support/layout'

const thumbnail =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#325f93"/><path d="M20 70 42 30 60 60 74 40 88 70Z" fill="#c4d9ec"/></svg>'
  )

const assets: readonly AssetDescriptor[] = [
  { id: 'landscape', name: 'Landscape texture', kind: 'texture', status: 'ready', thumbnailUrl: thumbnail },
  { id: 'mesh', name: 'Very long resource name that wraps inside a narrow tile', kind: 'mesh', status: 'ready' },
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

const tilesClass = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: 'var(--space-2)',
  width: '100%',
})
const listClass = css({ display: 'grid', gap: 'var(--space-1)', width: '100%' })

const meta = {
  title: 'Collections/AssetItem',
  component: AssetItem,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '资源浏览器里的一项：缩略图、名称、状态说明，以及选择、改名和附加操作。',
    use: ['资源库、素材面板的网格或列表', '只需要缩略图或可改名的名称时，单独使用 `AssetThumbnail`、`AssetName`'],
    avoid: ['完整的资源选择流程（搜索、分页、筛选）→ 用 `ResourceBrowser`', '表格式的多列信息 → 用 `DataTable`'],
    related: ['`ResourceBrowser`：内部用 AssetItem 显示结果', '`AssetField`：属性面板里引用一个资源'],
    notes: [
      '`asset.status` 为 loading / error / missing，或 `selectable: false` 时显示说明文字，`disabledReason` 会作为说明',
      '选择、改名和 `actions` 是并列的控件，不会互相嵌套',
      '`onRename` 返回 Promise 时，失败会保留草稿并显示错误；资源在外部变化时更新 `resetKey`',
    ],
    keyboard: [
      ['Tab', '在选择按钮、改名按钮和附加操作之间移动'],
      ['Enter / Space', '选择当前资源'],
      ['Enter', '在改名输入框中提交'],
      ['Escape', '取消改名'],
    ],
  }),
  args: { asset: assets[0], viewMode: 'grid', density: 'compact', selected: true },
  argTypes: { asset: { control: false }, actions: { control: false } },
} satisfies Meta<typeof AssetItem>
export default meta
type Story = StoryObj<typeof meta>

/** 网格磁贴：点击缩略图选择，名称旁的按钮进入改名。 */
export const Basic: Story = {
  render: function Render(args) {
    const [items, setItems] = useState(assets)
    const [selected, setSelected] = useState<string>('landscape')
    return (
      <div className={args.viewMode === 'list' ? listClass : tilesClass} style={{ maxWidth: 520 }}>
        {items.map((asset) => (
          <AssetItem
            key={asset.id}
            {...args}
            asset={asset}
            selected={selected === asset.id}
            onSelect={setSelected}
            onRename={(name) =>
              setItems((list) => list.map((item) => (item.id === asset.id ? { ...item, name } : item)))
            }
          />
        ))}
      </div>
    )
  },
}

/** `viewMode="list"` 单行显示，适合窄面板。 */
export const List: Story = {
  render: () => (
    <Column width={320}>
      {assets.map((asset) => (
        <AssetItem key={asset.id} asset={asset} viewMode="list" selected={asset.id === 'mesh'} onSelect={() => {}} />
      ))}
    </Column>
  ),
}

/** compact 名称 12px，regular 名称 14px；缩略图尺寸不变。 */
export const Density: Story = {
  render: () => (
    <Grid>
      {(['compact', 'regular'] as const).map((density) => (
        <Item key={density} label={density}>
          <div className={listClass}>
            {assets.slice(0, 2).map((asset) => (
              <AssetItem key={asset.id} asset={asset} viewMode="list" density={density} onSelect={() => {}} />
            ))}
          </div>
        </Item>
      ))}
    </Grid>
  ),
}

/** 状态由 `asset.status` 和 `selectable` 决定；不可选择的资源显示 `disabledReason`。 */
export const States: Story = {
  render: () => (
    <div className={tilesClass} style={{ maxWidth: 680 }}>
      {stateAssets.map((asset) => (
        <AssetItem key={asset.id} asset={asset} onSelect={() => {}} />
      ))}
    </div>
  ),
}

/** `actions` 与选择按钮并列，例如"更多"菜单或"检查"按钮。 */
export const WithActions: Story = {
  render: () => (
    <Column width={320}>
      {assets.slice(0, 2).map((asset) => (
        <AssetItem
          key={asset.id}
          asset={asset}
          viewMode="list"
          onSelect={() => {}}
          actions={
            <Button size="xs" variant="subtle">
              Inspect
            </Button>
          }
        />
      ))}
    </Column>
  ),
}

/** `AssetThumbnail` 与 `AssetName` 可以单独组合；名称保存仍由应用完成。 */
export const Parts: Story = {
  render: function Render() {
    const [asset, setAsset] = useState<AssetDescriptor>(assets[0])
    return (
      <Row>
        <AssetThumbnail asset={asset} css={{ width: '96px' }} />
        <AssetName asset={asset} onRename={(name) => setAsset((current) => ({ ...current, name }))} />
      </Row>
    )
  },
}

/** 改名提交是异步请求：可以让下一次改名失败，观察草稿和错误；同时切换只读、禁用。 */
export const BehaviorRename: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const [items, setItems] = useState(assets)
    const [selected, setSelected] = useState<string | null>('landscape')
    const [readOnly, setReadOnly] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const [events, setEvents] = useState<string[]>([])
    const rejectNext = useRef(false)
    const record = (event: string) => setEvents((current) => [...current.slice(-7), event])
    const rename = async (asset: AssetDescriptor, name: string) => {
      record(`rename ${asset.id}: ${name}`)
      await new Promise((resolve) => setTimeout(resolve, 250))
      if (rejectNext.current) {
        rejectNext.current = false
        record(`rejected ${asset.id}`)
        throw new Error('名称未保存。请修改后按 Enter 重试。')
      }
      setItems((current) => current.map((item) => (item.id === asset.id ? { ...item, name } : item)))
      record(`accepted ${asset.id}`)
    }
    return (
      <Column width={560}>
        <Row>
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
        </Row>
        <div className={tilesClass}>
          {items.map((asset) => (
            <AssetItem
              key={asset.id}
              asset={asset}
              selected={selected === asset.id}
              readOnly={readOnly}
              disabled={disabled}
              onSelect={(id) => {
                setSelected(id)
                record(`select ${id}`)
              }}
              onRename={(name) => rename(asset, name)}
            />
          ))}
        </div>
        <StateView value={{ selected, readOnly, disabled, events }} />
      </Column>
    )
  },
}

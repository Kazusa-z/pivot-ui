import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AssetField } from '../src/editors/resources/AssetField'
import { Button } from '../src/controls/buttons'
import { DragDropProvider, useDragSource } from '../src/interaction/drag-drop'
import { ASSET_REFERENCE_DRAG_TYPE, type AssetDescriptor, type AssetId } from '../src/values/assets'
import { css } from '../styled-system/css'
import { createMockResourceProvider, mockAssets } from './support/mock-resource-provider'
import { describeComponent } from './support/describe'
import { Column, Item, Panel, Row, StateView } from './support/layout'

const sharedProvider = createMockResourceProvider()

const meta = {
  title: 'Editors/Resources/AssetField',
  component: AssetField,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '属性面板里的资源引用：显示当前资源的缩略图和名称，可以从浮层里更换、清空，或拖入资源。',
    use: ['材质、贴图、模型等引用另一个资源的属性'],
    avoid: ['浏览整个资源库 → 用 `ResourceBrowser`'],
    related: ['`ResourceBrowser`：选择浮层的内容', '`AssetItem`：资源的显示', '指南「接入资源服务」'],
    notes: [
      '值只是资源 ID；名称和缩略图通过 `provider.get` 读取，也可以用 `selectedAsset` 直接提供',
      '`onValueChange` 返回 `false` 或抛错时拒绝更换，浮层保持打开；不提供 `onValueChange` 时字段只能查看',
      '`provider.locate` 存在时显示"定位"，`provider.chooseFile` 存在时显示"从文件选择"',
      '`dropEnabled` 允许拖入资源，需要外层 `DragDropProvider`',
    ],
    keyboard: [
      ['Tab', '在更换、清空、定位等按钮之间移动'],
      ['Enter / Space', '打开选择浮层或执行按钮'],
      ['Escape', '关闭选择浮层'],
    ],
  }),
  args: { label: 'Base texture', value: 'asset-1', provider: sharedProvider },
  argTypes: { provider: { control: false }, selectedAsset: { control: false }, pickerProps: { control: false } },
} satisfies Meta<typeof AssetField>
export default meta
type Story = StoryObj<typeof meta>

/** 点击打开选择浮层更换资源，或清空引用。 */
export const Basic: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<AssetId | null>(args.value)
    return (
      <Panel>
        <AssetField {...args} value={value} onValueChange={(id) => setValue(id)} />
      </Panel>
    )
  },
}

/** 未选择时显示 `placeholder`；`kinds` 让浮层只列出材质。 */
export const Empty: Story = {
  args: { value: null, label: 'Material', placeholder: 'Choose a material', kinds: ['material'] },
  render: Basic.render,
}

/** 只读可以查看和定位，禁用不能操作。 */
export const States: Story = {
  render: function Render() {
    const provider = useMemo(() => createMockResourceProvider(), [])
    return (
      <Panel>
        <Column>
          <Item label="readOnly">
            <AssetField label="Read only texture" provider={provider} value="asset-1" readOnly />
          </Item>
          <Item label="disabled">
            <AssetField label="Disabled texture" provider={provider} value="asset-1" disabled />
          </Item>
        </Column>
      </Panel>
    )
  },
}

function DraggableAsset({ asset }: { asset: AssetDescriptor }) {
  const source = useDragSource<{ id: AssetId }, HTMLButtonElement>({
    type: ASSET_REFERENCE_DRAG_TYPE,
    data: { id: asset.id },
    effectAllowed: 'link',
  })
  return (
    <Button ref={source.ref} size="sm" variant="outline" className={css({ borderStyle: 'dashed', cursor: 'grab' })}>
      {asset.name}
    </Button>
  )
}

/** `dropEnabled`：把上方的资源拖到字段上更换引用。 */
export const DropAsset: Story = {
  render: function Render() {
    const provider = useMemo(() => createMockResourceProvider(), [])
    const [value, setValue] = useState<AssetId | null>('asset-1')
    return (
      <DragDropProvider>
        <Column width={320}>
          <Row>
            {mockAssets.slice(1, 4).map((asset) => (
              <DraggableAsset key={asset.id} asset={asset} />
            ))}
          </Row>
          <AssetField
            label="Drop target"
            provider={provider}
            value={value}
            dropEnabled
            onValueChange={(id) => setValue(id)}
          />
        </Column>
      </DragDropProvider>
    )
  },
}

/** 异步更换：可以让下一次更换被拒绝，或让读取失败。 */
export const BehaviorAsyncChange: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const provider = useMemo(() => createMockResourceProvider({ delayMs: 200 }), [])
    const [value, setValue] = useState<AssetId | null>('asset-1')
    const [reject, setReject] = useState(false)
    const [events, setEvents] = useState<string[]>([])
    const record = (event: string) => setEvents((items) => [...items.slice(-7), event])
    return (
      <Column width={360}>
        <Row>
          <Button size="sm" variant="outline" onClick={() => setReject((current) => !current)}>
            {reject ? 'Reject change: on' : 'Reject change: off'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => provider.setFileResult('asset-5')}>
            File picker returns asset-5
          </Button>
        </Row>
        <AssetField
          label="Async texture"
          provider={provider}
          value={value}
          onValueChange={async (id) => {
            record(`request ${id ?? 'clear'}`)
            await new Promise((resolve) => setTimeout(resolve, 250))
            if (reject) {
              record('rejected')
              throw new Error('The reference was not saved.')
            }
            setValue(id)
            record('accepted')
          }}
        />
        <StateView value={{ value, events }} />
      </Column>
    )
  },
}

import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { ResourceBrowser } from '../src/editors/resources/ResourceBrowser'
import { Button } from '../src/controls/buttons'
import { createMockResourceProvider, resourceGroupOptions, resourceKindOptions } from './support/mock-resource-provider'
import { describeComponent } from './support/describe'
import { Column, Item, Row, StateView } from './support/layout'

const sharedProvider = createMockResourceProvider()

const meta = {
  title: 'Editors/Resources/ResourceBrowser',
  component: ResourceBrowser,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '浏览和选择资源：搜索、按类型和分组筛选、网格或列表视图、分页，数据来自应用实现的 ResourceProvider。',
    use: ['资源面板、素材库', '`AssetField` 的选择浮层就是它'],
    avoid: ['属性面板里引用一个资源 → 用 `AssetField`', '展示固定的几项资源 → 直接用 `AssetItem`'],
    related: [
      '`AssetField`：资源引用字段，浮层里使用本组件',
      '`AssetItem`：每一项的显示',
      '指南「接入资源服务」：如何实现 provider',
    ],
    notes: [
      '`provider.query` 收到搜索文字、类型、分组和分页参数，返回一页结果和总数；组件不缓存数据',
      '点击资源调用 `onSelect` 请求选择，返回 `false` 或抛错表示拒绝；接受后才更新选中项',
      '搜索、筛选、视图、分页、选中项都可以分别受控，例如把视图偏好保存到应用里',
      '`provider.rename` 存在时，每一项的名称都可以就地改名',
    ],
    keyboard: [
      ['Tab', '在搜索、筛选、视图切换、资源和分页之间移动'],
      ['Enter / Space', '选择聚焦的资源'],
    ],
  }),
  args: {
    label: 'Materials',
    provider: sharedProvider,
    onSelect: fn(),
    kindOptions: resourceKindOptions,
    groupOptions: resourceGroupOptions,
  },
  argTypes: { provider: { control: false }, kindOptions: { control: false }, groupOptions: { control: false } },
  render: (args) => (
    <Column width={640}>
      <ResourceBrowser {...args} />
    </Column>
  ),
} satisfies Meta<typeof ResourceBrowser>
export default meta
type Story = StoryObj<typeof meta>

/** 18 个示例资源，包含加载中、出错和不可选择的项；可以搜索、筛选、切换视图和翻页。 */
export const Basic: Story = { args: { pageSize: 8 } }

/** `defaultViewMode="list"`，适合窄面板。 */
export const ListView: Story = { args: { defaultViewMode: 'list', pageSize: 6 } }

/** 不提供 `kindOptions` / `groupOptions` 时只显示搜索；`kinds` 固定只列出贴图。 */
export const FixedFilter: Story = { args: { kindOptions: undefined, groupOptions: undefined, kinds: ['texture'] } }

/** 每次请求延迟 1.2 秒，查看加载状态。 */
export const Loading: Story = {
  render: function Render() {
    const provider = useMemo(() => createMockResourceProvider({ delayMs: 1200 }), [])
    return (
      <Column width={640}>
        <ResourceBrowser label="Slow resources" provider={provider} pageSize={6} />
      </Column>
    )
  },
}

/** 选择请求可以被拒绝；可以让下一次查询失败，查看错误和重试。 */
export const BehaviorSelectAndErrors: Story = {
  tags: ['!autodocs'],
  render: function Render() {
    const provider = useMemo(() => createMockResourceProvider({ delayMs: 150 }), [])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [rejectSelect, setRejectSelect] = useState(false)
    const [events, setEvents] = useState<string[]>([])
    const record = (event: string) => setEvents((items) => [...items.slice(-7), event])
    return (
      <Column width={640}>
        <Row>
          <Button size="sm" variant="outline" onClick={() => setRejectSelect((value) => !value)}>
            {rejectSelect ? 'Reject selection: on' : 'Reject selection: off'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => provider.rejectNext('query', 'The library is offline.')}>
            Fail next query
          </Button>
        </Row>
        <ResourceBrowser
          label="Behavior resources"
          provider={provider}
          pageSize={6}
          kindOptions={resourceKindOptions}
          selectedId={selectedId}
          onSelectedIdChange={setSelectedId}
          onSelect={(id) => {
            record(`select ${id}${rejectSelect ? ' rejected' : ''}`)
            return !rejectSelect
          }}
        />
        <Item label="State">
          <StateView value={{ selectedId, events }} />
        </Item>
      </Column>
    )
  },
}

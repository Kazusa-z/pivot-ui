import { css } from '../../styled-system/css'

interface Layer {
  /** Sidebar group and source directory. */
  name: string
  dir: string
  role: string
  components: readonly string[]
}

// Top to bottom, as an architecture diagram reads; every layer builds on the ones below it.
const layers: readonly Layer[] = [
  { name: 'Property', dir: 'property', role: '把控件接到应用数据', components: ['PropertyField'] },
  {
    name: 'Editors',
    dir: 'editors',
    role: '按值类型组织的编辑器',
    components: [
      'SliderField',
      'Vector3Input',
      'ColorField',
      'ColorEditor',
      'CurvePicker',
      'CurveEditor',
      'AssetField',
      'ResourceBrowser',
    ],
  },
  {
    name: 'Collections',
    dir: 'collections',
    role: '一组数据',
    components: ['Tree', 'Table', 'DataTable', 'AssetItem', 'CollectionEditor', 'Breadcrumbs', 'Pagination'],
  },
  {
    name: 'Layout',
    dir: 'layout',
    role: '组织页面',
    components: ['Section', 'Accordion', 'PropertyRow', 'Flex', 'ResizableSplit', 'ScrollArea', 'Separator'],
  },
  {
    name: 'Dialogs',
    dir: 'dialogs',
    role: '模态操作与确认',
    components: ['Dialog', 'AlertDialog', 'ConfirmationProvider'],
  },
  {
    name: 'Controls',
    dir: 'controls',
    role: '单一用途的交互控件',
    components: [
      'Button',
      'IconButton',
      'Input',
      'NumberInput',
      'Select',
      'Combobox',
      'Checkbox',
      'SegmentControl',
      'ToggleGroup',
      'Slider',
    ],
  },
  {
    name: 'Overlays',
    dir: 'overlays',
    role: '浮在页面上的层',
    components: ['Popover', 'Tooltip', 'HoverCard', 'DropdownMenu', 'ContextMenu', 'Menubar', 'Notifications'],
  },
  {
    name: 'Display',
    dir: 'display',
    role: '只展示、不编辑',
    components: ['Badge', 'Kbd', 'ReadonlyValue', 'ImagePreview', 'Callout', 'Progress', 'Spin'],
  },
  {
    name: 'Foundation',
    dir: 'foundation',
    role: '主题、字体与图标',
    components: ['ThemeProvider', 'Text', 'Icons', 'Tokens'],
  },
]

const rootClass = css({ display: 'grid', gap: 'var(--space-1)', margin: 'var(--space-4) 0' })
const rowClass = css({
  display: 'grid',
  gridTemplateColumns: '200px minmax(0, 1fr)',
  gap: 'var(--space-3)',
  alignItems: 'center',
  padding: 'var(--space-2) var(--space-3)',
  borderRadius: 'var(--radii-controlMd)',
  backgroundColor: 'var(--colors-surface)',
  border: '1px solid var(--colors-border)',
})
const nameClass = css({ display: 'grid', gap: 'var(--space-0_5)' })
const titleClass = css({
  fontSize: 'var(--fontSizes-controlLarge)',
  fontWeight: 600,
  color: 'var(--colors-textStrong)',
})
const metaClass = css({ fontSize: 'var(--fontSizes-micro)', color: 'var(--colors-textMuted)' })
const chipsClass = css({ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' })
const chipClass = css({
  padding: 'var(--space-0_5) var(--space-1_5)',
  borderRadius: 'var(--radii-control)',
  backgroundColor: 'var(--colors-softBg)',
  color: 'var(--colors-text)',
  fontFamily: 'var(--fonts-mono)',
  fontSize: 'var(--fontSizes-micro)',
})
const sharedClass = css({
  padding: 'var(--space-2) var(--space-3)',
  borderRadius: 'var(--radii-controlMd)',
  border: '1px dashed var(--colors-borderStrong)',
  color: 'var(--colors-textMuted)',
  fontSize: 'var(--fontSizes-control)',
})

/** The library's layers with representative components, highest layer first. */
export function LayerDiagram() {
  return (
    <div className={rootClass}>
      {layers.map((layer) => (
        <div key={layer.name} className={rowClass}>
          <div className={nameClass}>
            <span className={titleClass}>{layer.name}</span>
            <span className={metaClass}>
              src/{layer.dir} · {layer.role}
            </span>
          </div>
          <div className={chipsClass}>
            {layer.components.map((component) => (
              <span key={component} className={chipClass}>
                {component}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className={sharedClass}>
        共享模块（不含界面，任何层都可使用）：<code>values</code> 数据类型与纯函数 · <code>contracts</code>{' '}
        应用需要实现的接口 · <code>interaction</code> 编辑与拖放 hooks
      </div>
    </div>
  )
}

import { css } from '../../styled-system/css'
import { DocLink } from './DocLink'

interface Layer {
  /** Sidebar group and source directory. */
  name: string
  dir: string
  role: string
  /** Docs pages in sidebar order; Editors splits them by value type. */
  groups: readonly { name?: string; pages: readonly string[] }[]
}

// Top to bottom, as an architecture diagram reads; every layer builds on the ones below it.
const layers: readonly Layer[] = [
  { name: 'Property', dir: 'property', role: '把控件接到应用数据', groups: [{ pages: ['PropertyField'] }] },
  {
    name: 'Editors',
    dir: 'editors',
    role: '按值类型组织的编辑器',
    groups: [
      { name: 'Numeric', pages: ['SliderField', 'VectorInput', 'NumberTupleInput', 'NumericDistributionEditor'] },
      {
        name: 'Color',
        pages: [
          'ColorField',
          'HDRColorField',
          'ColorPicker',
          'ColorEditor',
          'ColorRampPicker',
          'ColorRampEditor',
          'ColorAlphaRampEditor',
          'ColorDistributionEditor',
        ],
      },
      { name: 'Curve', pages: ['CurvePicker', 'CurveEditor', 'CurvePresets'] },
      { name: 'Resources', pages: ['AssetField', 'ResourceBrowser'] },
    ],
  },
  {
    name: 'Collections',
    dir: 'collections',
    role: '一组数据',
    groups: [{ pages: ['Tree', 'Table', 'DataTable', 'AssetItem', 'CollectionEditor', 'Breadcrumbs', 'Pagination'] }],
  },
  {
    name: 'Dialogs',
    dir: 'dialogs',
    role: '模态操作与确认',
    groups: [{ pages: ['Dialog', 'AlertDialog', 'ConfirmationProvider'] }],
  },
  {
    name: 'Layout',
    dir: 'layout',
    role: '组织页面',
    groups: [
      {
        pages: [
          'Section',
          'Accordion',
          'PropertyRow',
          'Flex',
          'ResizableSplit',
          'ScrollArea',
          'Separator',
          'SectionDivider',
        ],
      },
    ],
  },
  {
    name: 'Controls',
    dir: 'controls',
    role: '单一用途的交互控件',
    groups: [
      {
        pages: [
          'Button',
          'IconButton',
          'Input',
          'Textarea',
          'EditableText',
          'NumberInput',
          'Select',
          'Combobox',
          'Checkbox',
          'SegmentControl',
          'ToggleGroup',
          'Slider',
          'PartitionSlider',
        ],
      },
    ],
  },
  {
    name: 'Overlays',
    dir: 'overlays',
    role: '浮在页面上的层',
    groups: [
      {
        pages: [
          'Popover',
          'Tooltip',
          'HoverCard',
          'OverlayLayer',
          'DropdownMenu',
          'ContextMenu',
          'Menubar',
          'Notifications',
        ],
      },
    ],
  },
  {
    name: 'Display',
    dir: 'display',
    role: '只展示、不编辑',
    groups: [{ pages: ['Badge', 'Kbd', 'ReadonlyValue', 'ImagePreview', 'Callout', 'Progress', 'Spin'] }],
  },
  {
    name: 'Foundation',
    dir: 'foundation',
    role: '主题、字体与图标',
    groups: [{ pages: ['Tokens', 'Control Matrix', 'Theme', 'Typography', 'Icons'] }],
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
const chipsClass = css({ display: 'grid', gap: 'var(--space-1_5)' })
const groupClass = css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-1)' })
const groupNameClass = css({
  minWidth: '72px',
  fontSize: 'var(--fontSizes-micro)',
  color: 'var(--colors-textMuted)',
})
const chipClass = css({
  padding: 'var(--space-0_5) var(--space-1_5)',
  borderRadius: 'var(--radii-control)',
  backgroundColor: 'var(--colors-softBg)',
  color: 'var(--colors-text)',
  fontFamily: 'var(--fonts-mono)',
  fontSize: 'var(--fontSizes-micro)',
  textDecoration: 'none',
  '&:hover': { backgroundColor: 'var(--colors-selectionSubtleBg)', color: 'var(--colors-textStrong)' },
  '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '1px' },
})
const sharedClass = css({
  padding: 'var(--space-2) var(--space-3)',
  borderRadius: 'var(--radii-controlMd)',
  border: '1px dashed var(--colors-borderStrong)',
  color: 'var(--colors-textMuted)',
  fontSize: 'var(--fontSizes-control)',
})

/** The library's layers with links to every component page, highest layer first. */
export function LayerDiagram() {
  return (
    // sb-unstyled keeps the docs page's typography (blue underlined links) off the diagram.
    <div className={`sb-unstyled ${rootClass}`}>
      {layers.map((layer) => (
        <div key={layer.name} className={rowClass}>
          <div className={nameClass}>
            <span className={titleClass}>{layer.name}</span>
            <span className={metaClass}>
              src/{layer.dir} · {layer.role}
            </span>
          </div>
          <div className={chipsClass}>
            {layer.groups.map((group) => (
              <div key={group.name ?? layer.name} className={groupClass}>
                {group.name && <span className={groupNameClass}>{group.name}</span>}
                {group.pages.map((page) => (
                  <DocLink
                    key={page}
                    title={[layer.name, group.name, page].filter(Boolean).join('/')}
                    className={chipClass}>
                    {page}
                  </DocLink>
                ))}
              </div>
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

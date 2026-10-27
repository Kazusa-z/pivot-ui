import type { Meta, StoryObj } from '@storybook/react'
import { ScrollArea } from '../src/layout/ScrollArea'
import { css } from '../styled-system/css'
import { describeComponent } from './support/describe'
import { Item, Row } from './support/layout'

const frame = css({
  width: '260px',
  height: '180px',
  border: '1px solid var(--colors-border)',
  borderRadius: 'var(--radii-controlMd)',
})
const row = css({
  padding: 'var(--space-1_5) var(--space-3)',
  fontSize: 'var(--fontSizes-control)',
  color: 'var(--colors-text)',
  borderBottom: '1px solid var(--colors-border)',
})
const rows = Array.from({ length: 24 }, (_, index) => `Asset_${String(index + 1).padStart(2, '0')}.prefab`)

const meta = {
  title: 'Layout/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  parameters: describeComponent({
    summary: '使用原生滚动、但滚动条外观与主题一致的滚动区域。',
    use: ['面板内容、长列表、浮层里的可滚动内容'],
    notes: [
      '`sizing="fill"`（默认）填满父元素给定的高度；`sizing="content"` 随内容增长，配合 `maxHeight`',
      '`shadows` 在还能继续滚动的一侧显示渐隐阴影',
      '滚动依旧是原生行为，键盘、触控板和读屏都正常工作',
    ],
  }),
  args: { scrollbars: 'vertical' },
} satisfies Meta<typeof ScrollArea>
export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: (args) => (
    <div className={frame}>
      <ScrollArea {...args}>
        {rows.map((name) => (
          <div key={name} className={row}>
            {name}
          </div>
        ))}
      </ScrollArea>
    </div>
  ),
}

/** `shadows` 提示还有更多内容；`scrollbarVariant="track"` 显示轨道。 */
export const Appearance: Story = {
  render: () => (
    <Row>
      {(
        [
          ['shadows', { shadows: true }],
          ['track', { scrollbarVariant: 'track' as const, type: 'always' as const }],
        ] as const
      ).map(([label, props]) => (
        <Item key={label} label={label}>
          <div className={frame}>
            <ScrollArea scrollbars="vertical" {...props}>
              {rows.map((name) => (
                <div key={name} className={row}>
                  {name}
                </div>
              ))}
            </ScrollArea>
          </div>
        </Item>
      ))}
    </Row>
  ),
}

/** 横向滚动：`viewportProps.contentLayout="intrinsic"` 让内容保持自身宽度。 */
export const Horizontal: Story = {
  render: () => (
    <div
      className={css({
        width: '260px',
        border: '1px solid var(--colors-border)',
        borderRadius: 'var(--radii-controlMd)',
      })}>
      <ScrollArea scrollbars="horizontal" sizing="content" viewportProps={{ contentLayout: 'intrinsic' }}>
        <div className={css({ display: 'flex', gap: 'var(--space-2)', padding: 'var(--space-2)' })}>
          {rows.slice(0, 10).map((name) => (
            <div
              key={name}
              className={css({
                flexShrink: 0,
                padding: 'var(--space-2)',
                backgroundColor: 'var(--colors-softBg)',
                borderRadius: 'var(--radii-control)',
                fontSize: 'var(--fontSizes-control)',
              })}>
              {name}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
}

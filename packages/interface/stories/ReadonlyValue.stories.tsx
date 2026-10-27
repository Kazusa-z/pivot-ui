import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ReadonlyValue } from '../src/display/ReadonlyValue'
import { Textarea } from '../src/controls/inputs/Textarea'
import { Text } from '../src/foundation/typography'
import { StoryPage, StorySection, StoryCard, StoryRow, StoryField, StoryCode, StoryProps } from './support/StoryPage'

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ReadonlyValue 用于展示已经格式化的只读内容，适合摘要、计算结果和不可编辑属性。空值显示 emptyText，数字 0 仍会显示；文字可以选中复制。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Display/ReadonlyValue',
  component: ReadonlyValue,
} satisfies Meta<typeof ReadonlyValue>
export default meta
type Story = StoryObj<typeof meta>

function ReadonlyValueExample() {
  const [value, setValue] = useState('Object_001\nRead-only values preserve line breaks.')
  return (
    <StoryPage
      eyebrow="Display"
      title="ReadonlyValue"
      summary="展示已格式化的只读内容。应用负责格式化数据、提供可访问名称，并在需要播报更新时添加状态区域。"
      meta={
        <>
          <span>selectable</span>
          <span>·</span>
          <span>preserves line breaks</span>
        </>
      }>
      <StorySection title="Preview" description="修改示例内容，观察换行、等宽字体和空值处理。">
        <StoryCard>
          <StoryField label="Preview content">
            <Textarea size="md" value={value} rows={3} onValueChange={setValue} aria-label="Preview content" />
          </StoryField>
          <ReadonlyValue code>{value}</ReadonlyValue>
          <ReadonlyValue aria-label="Empty value" emptyText="No value">
            {null}
          </ReadonlyValue>
          <ReadonlyValue aria-label="Numeric zero">{0}</ReadonlyValue>
          <ReadonlyValue css={{ width: '180px' }}>Averylongreadonlyvaluestayswithintheavailablewidth.</ReadonlyValue>
        </StoryCard>
      </StorySection>

      <StorySection title="Empty values" description="null、undefined 和空字符串显示 emptyText；0 是有效值。">
        <StoryRow align="start">
          <StoryCard title="null" description="emptyText = No value">
            <ReadonlyValue emptyText="No value">{null}</ReadonlyValue>
          </StoryCard>
          <StoryCard title="zero" description="0 is preserved">
            <ReadonlyValue>{0}</ReadonlyValue>
          </StoryCard>
          <StoryCard title="empty string" description="emptyText = —">
            <ReadonlyValue>{''}</ReadonlyValue>
          </StoryCard>
        </StoryRow>
      </StorySection>

      <StorySection title="Usage">
        <StoryCode
          label="tsx"
          code={`<ReadonlyValue>{formattedValue}</ReadonlyValue>
<ReadonlyValue emptyText="No value">{value}</ReadonlyValue>
<ReadonlyValue code>{text}</ReadonlyValue>`}
        />
      </StorySection>

      <StorySection title="Props">
        <StoryProps
          rows={[
            { name: 'children', type: 'ReactNode', description: '已格式化的内容；0 会正常显示。' },
            { name: 'emptyText', type: 'ReactNode', defaultValue: "'—'", description: '空值占位。' },
            { name: 'code', type: 'boolean', defaultValue: 'false', description: '使用等宽字体。' },
          ]}
        />
      </StorySection>
      <Text size="sm" tone="muted">
        ReadonlyValue 不解析原始数据，也不负责格式化；这些工作由应用完成。
      </Text>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <ReadonlyValueExample /> }

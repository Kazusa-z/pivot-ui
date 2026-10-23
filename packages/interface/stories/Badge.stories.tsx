import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Badge, Tag } from '../src/widgets/display/Badge'
import { ContractFrame, StatePanel, contractStyles } from './support/ContractFrame'

const colors = ['gray', 'green', 'red', 'blue', 'orange', 'amber', 'gold', 'violet'] as const
function BadgeExample() {
  const [tags, setTags] = useState(['Mesh', 'Material', 'Texture'])
  const [requests, setRequests] = useState(0)
  return (
    <ContractFrame
      title="状态徽标与可移除标签"
      description="Badge 用颜色和短文字显示分类；Tag 另外提供移除入口。点击移除按钮或用 Tab、Enter/Space 激活后，onRemove 通知应用更新数组。Keep me 的回调只记录请求，数组保持不变，因此标签仍然显示。"
      onReset={() => {
        setTags(['Mesh', 'Material', 'Texture'])
        setRequests(0)
      }}>
      {(['solid', 'surface'] as const).map((variant) => (
        <div key={variant} className={contractStyles.row}>
          {colors.map((color) => (
            <Badge key={color} color={color} variant={variant}>
              {color}
            </Badge>
          ))}
        </div>
      ))}
      <div className={contractStyles.row}>
        <Badge size="xs">XS</Badge>
        <Badge pill color="blue">
          Pill
        </Badge>
        <Badge code color="violet">
          Code
        </Badge>
        <Badge active>Active</Badge>
      </div>
      <div className={contractStyles.row}>
        {tags.map((tag) => (
          <Tag
            key={tag}
            color="blue"
            pill
            onRemove={() => {
              setRequests((value) => value + 1)
              setTags((items) => items.filter((item) => item !== tag))
            }}>
            {tag}
          </Tag>
        ))}
        <Tag onRemove={() => setRequests((value) => value + 1)}>Keep me</Tag>
        <Tag disabled onRemove={() => setRequests((value) => value + 1)}>
          Disabled tag
        </Tag>
      </div>
      <StatePanel label="Parent-owned tags" value={{ tags, removeRequests: requests }} />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Badge and Tag',
  parameters: {
    docs: {
      description: {
        component:
          'Badge 用于显示状态、数量或分类，Tag 适合表示可以移除的已选项。颜色、尺寸和外形影响展示；Tag 的移除按钮通过 onRemove 通知应用。应用在接受移除后更新标签数组，保留数组则标签继续显示；图标或缩写内容应配上能理解的名称。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <BadgeExample /> }

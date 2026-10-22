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
      title="Badge and controlled Tag"
      description="Badge 纯展示。Tag 的原生移除按钮仅发出 onRemove，数据由父级删除；Keep me 演示父级保留项。可用 Tab + Enter/Space 操作移除按钮。"
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

const meta = { title: 'Widgets/Badge and Tag', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <BadgeExample /> }

import { useId, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PropertyRow, PropertyLabel, PropertyControl, PropertyDescription } from '../src/layout/PropertyRow'
import { Input } from '../src/widgets/inputs/Input'
import { Checkbox } from '../src/widgets/choices/Checkbox'
import { Button } from '../src/widgets/buttons'
import { Text } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryCode,
  StoryProps,
  StoryState,
} from './support/StoryPage'

const narrowFrame = css({ width: '200px', maxWidth: '100%' })

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'PropertyRow 把标签、控件和说明排成属性行。单个输入用 PropertyLabel 的 htmlFor 关联控件；多个控件用 PropertyControl 的 group 关联共享标签，并为每个控件单独命名。输入值和回调由应用提供给真实控件。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Layout/PropertyRow',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function DensityRow({ density }: { density: 'compact' | 'regular' }) {
  const id = useId()
  return (
    <StoryCard
      title={density === 'compact' ? 'Compact · 24px' : 'Regular · 32px'}
      description="标签、控件和说明共享同一行高与字号。">
      <PropertyRow density={density}>
        <PropertyLabel htmlFor={id}>Position X</PropertyLabel>
        <PropertyControl association="control">
          <Input id={id} size={density === 'compact' ? 'sm' : 'md'} defaultValue="12.50" />
        </PropertyControl>
        <PropertyDescription>以场景单位表示的世界坐标。</PropertyDescription>
      </PropertyRow>
    </StoryCard>
  )
}

function PropertyRowExample() {
  const singleId = useId()
  const groupId = useId()
  const narrowId = useId()
  const [value, setValue] = useState('Object')
  const [disabled, setDisabled] = useState(false)
  const [help, setHelp] = useState(true)
  const [column, setColumn] = useState(false)
  const [locked, setLocked] = useState(false)
  const [coordinates, setCoordinates] = useState({ x: '10', y: '20' })
  return (
    <StoryPage
      eyebrow="Layout"
      title="PropertyRow"
      summary="属性面板中的一行：标签、控件、帮助文字。紧凑档 24px，常规档 32px；复杂控件用 group 关联共享标签。"
      meta={
        <>
          <span>label + control + description</span>
          <span>·</span>
          <span>24 / 32</span>
        </>
      }>
      <StorySection title="Single control" description="点击 Name 聚焦对应输入；帮助文字通过 aria-describedby 关联。">
        <StoryCard>
          <StoryRow>
            <Checkbox size="md" checked={disabled} onCheckedChange={setDisabled} label="Disabled" />
            <Checkbox size="md" checked={help} onCheckedChange={setHelp} label="Show description" />
          </StoryRow>
          <PropertyRow>
            <PropertyLabel htmlFor={singleId}>Name</PropertyLabel>
            <PropertyControl association="control">
              <Input
                id={singleId}
                value={value}
                disabled={disabled}
                onValueChange={setValue}
                aria-describedby={help ? `${singleId}-help` : undefined}
              />
            </PropertyControl>
            {help && <PropertyDescription id={`${singleId}-help`}>输入便于识别的显示名称。</PropertyDescription>}
          </PropertyRow>
        </StoryCard>
        <StoryState label="Single control state" value={{ value, disabled, help }} />
      </StorySection>

      <StorySection title="Density" description="同一组字段在紧凑与常规面板中使用不同行高；控件尺寸跟随 density。">
        <StoryGrid>
          <DensityRow density="compact" />
          <DensityRow density="regular" />
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Control group"
        description="多个输入共享一个组名；每个输入仍有自己的 aria-label。标签旁的锁定按钮是独立操作。">
        <StoryCard>
          <PropertyRow>
            <PropertyLabel
              id={`${groupId}-label`}
              endSlot={
                <Button
                  size="xs"
                  variant="subtle"
                  aria-label="Toggle coordinate lock"
                  aria-pressed={locked}
                  onClick={() => setLocked((value) => !value)}>
                  {locked ? 'Locked' : 'Unlocked'}
                </Button>
              }>
              Coordinates
            </PropertyLabel>
            <PropertyControl
              association="group"
              labelledBy={`${groupId}-label`}
              columns={2}
              aria-describedby={`${groupId}-help`}>
              {(['x', 'y'] as const).map((axis) => (
                <Input
                  key={axis}
                  aria-label={`${axis.toUpperCase()} coordinate`}
                  value={coordinates[axis]}
                  readOnly={locked}
                  onValueChange={(next) => setCoordinates((current) => ({ ...current, [axis]: next }))}
                />
              ))}
            </PropertyControl>
            <PropertyDescription id={`${groupId}-help`}>X 和 Y 分别表示世界坐标。</PropertyDescription>
          </PropertyRow>
        </StoryCard>
        <StoryState label="Group state" value={{ coordinates, locked }} />
      </StorySection>

      <StorySection
        title="Narrow and unlabelled"
        description="窄侧栏可把标签放到控件上方；没有标签的行用 withoutLabel 占满整行。">
        <StoryCard>
          <StoryRow>
            <Checkbox size="md" checked={column} onCheckedChange={setColumn} label="Stack label above control" />
          </StoryRow>
          <div className={narrowFrame}>
            <PropertyRow direction={column ? 'column' : 'row'}>
              <PropertyLabel htmlFor={narrowId}>A long property label without truncation</PropertyLabel>
              <PropertyControl association="control">
                <Input id={narrowId} value={value} onValueChange={setValue} aria-describedby={`${narrowId}-help`} />
              </PropertyControl>
              <PropertyDescription id={`${narrowId}-help`}>
                Averylongunbrokendescriptionmuststayinsidetherow.
              </PropertyDescription>
            </PropertyRow>
            <PropertyRow withoutLabel>
              <PropertyControl association="none">
                <Button css={{ width: '100%' }}>Full width action</Button>
              </PropertyControl>
            </PropertyRow>
          </div>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<PropertyRow density="compact">
  <PropertyLabel htmlFor={id}>Name</PropertyLabel>
  <PropertyControl association="control">
    <Input id={id} aria-describedby={helpId} />
  </PropertyControl>
  <PropertyDescription id={helpId}>Display name.</PropertyDescription>
</PropertyRow>`}
          />
          <StoryProps
            rows={[
              {
                name: 'density',
                type: "'compact' | 'regular'",
                defaultValue: "'compact'",
                description: '24px 或 32px 行高。',
              },
              {
                name: 'direction',
                type: "'row' | 'column'",
                defaultValue: "'row'",
                description: '标签在控件旁或上方。',
              },
              { name: 'withoutLabel', type: 'boolean', defaultValue: 'false', description: '内容占满整行。' },
              { name: 'labelWidth', type: 'string', description: '覆盖标签列宽度。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
      <Text size="sm" tone="muted">
        行只负责布局和关联；值的接受、校验和保存由应用完成。
      </Text>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <PropertyRowExample /> }

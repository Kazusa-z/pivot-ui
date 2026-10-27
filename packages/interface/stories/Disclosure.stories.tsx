import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Accordion, AccordionItem, Collapsible } from '../src/widgets/disclosure'
import { Button } from '../src/widgets/buttons'
import { Checkbox } from '../src/widgets/choices/Checkbox'
import { Input } from '../src/widgets/inputs/Input'
import { Select } from '../src/widgets/choices/Select'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryField,
  StoryGrid,
  StoryCode,
  StoryState,
  StoryKeyboard,
  StoryProps,
} from './support/StoryPage'

const longTitle = 'A very long section title that should truncate while its independent header actions stay available'

const orientationOptions = [
  { key: 'vertical', label: 'Vertical', value: 'vertical' },
  { key: 'horizontal', label: 'Horizontal', value: 'horizontal' },
]

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Accordion 管理一组可展开内容，Collapsible 管理单个区域。标题支持点击或键盘展开，受控模式通过 onValueChange/onOpenChange 接收请求；标题旁的独立操作放在 actions，内容状态由应用保存。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Layout/Disclosure',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function VariantsExample() {
  const [single, setSingle] = useState('first')
  return (
    <StoryGrid>
      <StoryCard title="Accordion · surface" description="一组连接的区域；默认一次展开一个。">
        <Accordion type="single" collapsible value={single} onValueChange={setSingle}>
          {['first', 'second'].map((value, index) => (
            <AccordionItem key={value} value={value} title={`Section ${index + 1}`}>
              Content for section {index + 1}. 展开状态由应用保存。
            </AccordionItem>
          ))}
        </Accordion>
      </StoryCard>
      <StoryCard title="Collapsible · subtle" description="单个区域，标题和内容独立组合。">
        <Collapsible title="Standalone section" defaultOpen>
          <p className={css({ margin: 0 })}>单个折叠区域可以包含任意内容，不要求与其他区域连接。</p>
        </Collapsible>
      </StoryCard>
    </StoryGrid>
  )
}

function SizesExample() {
  return (
    <StoryGrid>
      {(['sm', 'md'] as const).map((size) => (
        <StoryCard key={size} title={size === 'sm' ? 'sm · 24px header' : 'md · 32px header'}>
          <Accordion type="single" collapsible defaultValue="a" size={size}>
            <AccordionItem value="a" title="Header height">
              <p className={css({ margin: 0 })}>
                标题使用 {size === 'sm' ? '24' : '32'}px 行高，字号 {size === 'sm' ? '12' : '14'}px。
              </p>
            </AccordionItem>
            <AccordionItem value="b" title="Second section">
              Content B
            </AccordionItem>
          </Accordion>
        </StoryCard>
      ))}
    </StoryGrid>
  )
}

function StatesExample() {
  const [disabled, setDisabled] = useState(false)
  const [fixed, setFixed] = useState(false)
  const [iconOnly, setIconOnly] = useState(false)
  const [actions, setActions] = useState(0)
  const [open, setOpen] = useState(true)
  return (
    <StoryCard
      title="Collapsible states"
      description="disabled 只控制折叠入口；fixed 始终展示内容；icon trigger 只保留图标。">
      <StoryRow>
        <Checkbox checked={disabled} onCheckedChange={setDisabled} label="Disabled" size="sm" />
        <Checkbox checked={fixed} onCheckedChange={setFixed} label="Fixed open" size="sm" />
        <Checkbox checked={iconOnly} onCheckedChange={setIconOnly} label="Icon trigger" size="sm" />
        <Button size="xs" variant="outline" onClick={() => setOpen((value) => !value)}>
          External toggle
        </Button>
      </StoryRow>
      <Collapsible
        title="Standalone section"
        open={open}
        disabled={disabled}
        collapsible={!fixed}
        triggerMode={iconOnly ? 'icon' : 'title'}
        triggerLabel={iconOnly ? 'Toggle section' : undefined}
        onOpenChange={setOpen}
        actions={
          <Button size="xs" variant="subtle" onClick={() => setActions((value) => value + 1)}>
            Independent action
          </Button>
        }>
        <Input aria-label="Content field" defaultValue="Editable content" size="sm" />
      </Collapsible>
      <StoryState label="Collapsible state" value={{ open, disabled, fixed, iconOnly, actions }} />
    </StoryCard>
  )
}

function ControlledExample() {
  const [single, setSingle] = useState('first')
  const [many, setMany] = useState(['first'])
  const [changes, setChanges] = useState(0)
  return (
    <StoryCard title="Controlled Accordion" description="外部按钮写入 value；组件只报告展开请求，应用决定最终值。">
      <StoryRow>
        <Button
          size="xs"
          variant="outline"
          onClick={() => {
            setSingle('third')
            setMany(['first', 'second', 'third'])
          }}>
          External update
        </Button>
        <Button
          size="xs"
          variant="outline"
          onClick={() => {
            setSingle('first')
            setMany(['first'])
            setChanges(0)
          }}>
          Reset
        </Button>
      </StoryRow>
      <StoryGrid>
        <div>
          <StoryField label="Single" hint="一次只展开一个">
            <Accordion
              type="single"
              collapsible
              value={single}
              onValueChange={(value) => {
                setSingle(value)
                setChanges((count) => count + 1)
              }}>
              {['first', 'second', 'third'].map((value, index) => (
                <AccordionItem key={value} value={value} title={`Single ${index + 1}`}>
                  Content {index + 1}
                </AccordionItem>
              ))}
            </Accordion>
          </StoryField>
        </div>
        <div>
          <StoryField label="Multiple" hint="可同时展开多个">
            <Accordion
              type="multiple"
              value={many}
              onValueChange={(value) => {
                setMany(value)
                setChanges((count) => count + 1)
              }}>
              {['first', 'second', 'third'].map((value, index) => (
                <AccordionItem key={value} value={value} title={`Multiple ${index + 1}`}>
                  Content {index + 1}
                </AccordionItem>
              ))}
            </Accordion>
          </StoryField>
        </div>
      </StoryGrid>
      <StoryState label="Accordion state" value={{ single, many, changes }} />
    </StoryCard>
  )
}

function NarrowExample() {
  const [name, setName] = useState('Editable action')
  const [actions, setActions] = useState(0)
  return (
    <StoryCard title="Narrow header" description="标题截断，操作仍保留空间；避免在标题里放交互控件。">
      <div style={{ width: 260, maxWidth: '100%' }}>
        <Accordion type="multiple" defaultValue={['first']}>
          <AccordionItem
            value="first"
            title={longTitle}
            actions={
              <Button size="xs" onClick={() => setActions((value) => value + 1)}>
                Run
              </Button>
            }>
            VeryLongContentWithoutSpacesStillWrapsInsideTheAvailableWidthForTheWholeSection.
          </AccordionItem>
          <AccordionItem value="disabled" title="Disabled item" disabled>
            Unavailable content.
          </AccordionItem>
        </Accordion>
        <Collapsible
          title={longTitle}
          defaultOpen
          variant="transparent"
          triggerMode="icon"
          triggerLabel="Toggle long section"
          actions={<Input aria-label="Rename action" value={name} onValueChange={setName} size="sm" />}>
          文字和控件会使用当前区域的可用宽度。
        </Collapsible>
      </div>
      <StoryState label="Narrow state" value={{ name, actions }} />
    </StoryCard>
  )
}

function KeyboardExample() {
  const [horizontal, setHorizontal] = useState(false)
  const [rtl, setRtl] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [focused, setFocused] = useState('')
  const [open, setOpen] = useState('first')
  return (
    <StoryCard title="Keyboard" description="方向键在标题间移动，Home/End 到首尾，Enter/Space 切换；Tab 离开这组标题。">
      <StoryRow>
        <StoryField label="Orientation">
          <Select
            aria-label="Orientation"
            value={horizontal ? 'horizontal' : 'vertical'}
            options={orientationOptions}
            onValueChange={(value) => setHorizontal(value === 'horizontal')}
          />
        </StoryField>
        <Checkbox checked={rtl} onCheckedChange={setRtl} label="RTL" size="sm" />
        <Checkbox checked={disabled} onCheckedChange={setDisabled} label="Disable all triggers" size="sm" />
      </StoryRow>
      <Accordion
        type="single"
        collapsible
        value={open}
        onValueChange={setOpen}
        orientation={horizontal ? 'horizontal' : 'vertical'}
        dir={rtl ? 'rtl' : 'ltr'}
        disabled={disabled}>
        {['first', 'disabled', 'last'].map((item) => (
          <AccordionItem
            key={item}
            value={item}
            title={`Keyboard ${item}`}
            disabled={item === 'disabled'}
            triggerProps={{ onFocus: () => setFocused(item) }}>
            Content {item}
          </AccordionItem>
        ))}
      </Accordion>
      <Button size="sm" variant="outline">
        Next focus target
      </Button>
      <StoryState label="Keyboard state" value={{ horizontal, rtl, disabled, open, focused }} />
      <StoryKeyboard
        rows={[
          { keys: ['ArrowDown', 'ArrowUp'], action: '在纵向标题之间移动焦点。' },
          { keys: ['ArrowLeft', 'ArrowRight'], action: '横向排列时移动焦点；RTL 会反转方向。' },
          { keys: ['Enter', 'Space'], action: '展开或收起当前标题。' },
          { keys: ['Tab'], action: '离开这组标题，进入下一个焦点目标。' },
        ]}
      />
    </StoryCard>
  )
}

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Layout"
      title="Disclosure"
      summary="用 Accordion 组织一组可展开的区块，用 Collapsible 处理单个区域。标题是唯一折叠入口，其他操作放在 actions。"
      meta={
        <>
          <span>Accordion</span>
          <span>·</span>
          <span>Collapsible</span>
          <span>·</span>
          <span>24 / 32 header</span>
        </>
      }>
      <StorySection title="Variants" description="Accordion 适合多区块导航；Collapsible 适合单个可折叠面板。">
        <VariantsExample />
      </StorySection>
      <StorySection title="Sizes" description="sm 24px / md 32px；字号和内容 padding 同步切换。">
        <SizesExample />
      </StorySection>
      <StorySection title="States" description="禁用、固定展开和图标触发是标题入口的不同状态。">
        <StatesExample />
      </StorySection>
      <StorySection title="Controlled" description="value 决定展开项，onValueChange 只提出请求。">
        <ControlledExample />
      </StorySection>
      <StorySection title="Narrow header">
        <NarrowExample />
      </StorySection>
      <StorySection title="Keyboard and accessibility">
        <KeyboardExample />
      </StorySection>
      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<Accordion type="single" collapsible value={open} onValueChange={setOpen}>
  <AccordionItem value="transform" title="Transform">
    <Vector3Input … />
  </AccordionItem>
</Accordion>

<Collapsible title="Advanced" actions={<Button size="xs">Reset</Button>}>
  <Input … />
</Collapsible>`}
          />
          <StoryProps
            rows={[
              { name: 'size', type: "'sm' | 'md'", defaultValue: "'sm'", description: '24 / 32px 头部。' },
              {
                name: 'variant',
                type: "'surface' | 'subtle' | 'transparent'",
                defaultValue: "'surface'",
                description: '面板表面。',
              },
              { name: 'actions', type: 'ReactNode', description: '标题旁的独立操作。' },
              {
                name: 'triggerMode',
                type: "'title' | 'icon'",
                defaultValue: "'title'",
                description: '仅 Collapsible。',
              },
              { name: 'collapsible', type: 'boolean', defaultValue: 'true', description: 'false 时固定展开。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}

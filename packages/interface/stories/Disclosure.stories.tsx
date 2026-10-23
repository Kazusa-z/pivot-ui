import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Accordion, AccordionItem, Collapsible } from '../src/widgets/disclosure'
import { Button } from '../src/widgets/buttons'
import { css } from '../styled-system/css'
import {
  ContractFrame,
  ControlButton,
  ControlInput,
  ControlSelect,
  StatePanel,
  contractStyles,
} from './support/ContractFrame'

function AccordionExample({ multiple = false }: { multiple?: boolean }) {
  const [single, setSingle] = useState('first')
  const [many, setMany] = useState(['first'])
  const [changes, setChanges] = useState(0)
  const [actions, setActions] = useState(0)
  const [focused, setFocused] = useState('')
  const items = ['first', 'second', 'third'].map((value, index) => (
    <AccordionItem
      key={value}
      value={value}
      title={`Section ${index + 1}`}
      triggerProps={{ onFocus: () => setFocused(value) }}
      actions={
        index === 0 ? (
          <Button size="xs" onClick={() => setActions((count) => count + 1)}>
            Header action
          </Button>
        ) : undefined
      }>
      <p>Content {index + 1}。标题操作按钮使用自己的回调，展开状态由标题触发按钮控制。</p>
      <ControlInput aria-label={`Field ${index + 1}`} defaultValue={`Value ${index + 1}`} />
    </AccordionItem>
  ))
  return (
    <ContractFrame
      title={`Accordion：受控展开 ${multiple ? 'multiple' : 'single'}`}
      description="Accordion 适合按组浏览内容。点击标题或按 Enter/Space 展开，通过 onValueChange 保存当前展开项；方向键和 Home/End 在标题之间移动，标题操作按钮可单独用 Tab 聚焦。"
      onReset={() => {
        setSingle('first')
        setMany(['first'])
        setChanges(0)
        setActions(0)
        setFocused('')
      }}>
      <div className={contractStyles.row}>
        <ControlButton
          onClick={() => {
            setSingle('third')
            setMany(['first', 'second', 'third'])
          }}>
          External update
        </ControlButton>
      </div>
      {multiple ? (
        <Accordion
          type="multiple"
          value={many}
          onValueChange={(value) => {
            setMany(value)
            setChanges((count) => count + 1)
          }}>
          {items}
        </Accordion>
      ) : (
        <Accordion
          type="single"
          value={single}
          collapsible
          onValueChange={(value) => {
            setSingle(value)
            setChanges((count) => count + 1)
          }}>
          {items}
        </Accordion>
      )}
      <StatePanel label="Accordion state" value={{ value: multiple ? many : single, changes, actions, focused }} />
    </ContractFrame>
  )
}

function UncontrolledExample() {
  const [generation, setGeneration] = useState(0)
  const [single, setSingle] = useState('first')
  const [many, setMany] = useState(['first'])
  const [open, setOpen] = useState(true)
  return (
    <ContractFrame
      title="设置初始展开状态"
      description="使用 defaultValue 或 defaultOpen 设置初始展开状态，之后由组件保存状态。下方记录 onValueChange 和 onOpenChange 的通知；Reset 重新创建实例以恢复初始状态。"
      onReset={() => {
        setGeneration((value) => value + 1)
        setSingle('first')
        setMany(['first'])
        setOpen(true)
      }}>
      <div key={generation} className={contractStyles.stack}>
        <Accordion type="single" defaultValue="first" onValueChange={setSingle}>
          <AccordionItem value="first" title="Required single first">
            单选模式未开启 collapsible 时，始终保留一个展开项。
          </AccordionItem>
          <AccordionItem value="second" title="Required single second">
            展开此项时，前一个单选项会收起。
          </AccordionItem>
        </Accordion>
        <Accordion type="multiple" defaultValue={['first']} onValueChange={setMany}>
          <AccordionItem value="first" title="Multiple first">
            Independent content A.
          </AccordionItem>
          <AccordionItem value="second" title="Multiple second">
            Independent content B.
          </AccordionItem>
        </Accordion>
        <Collapsible title="Uncontrolled collapsible" defaultOpen onOpenChange={setOpen}>
          这个独立区域使用自己的布尔值保存展开状态。
        </Collapsible>
      </div>
      <StatePanel label="Last reported values" value={{ single, multiple: many, open }} />
    </ContractFrame>
  )
}

function CollapsibleExample() {
  const [open, setOpen] = useState(true)
  const [disabled, setDisabled] = useState(false)
  const [fixed, setFixed] = useState(false)
  const [iconOnly, setIconOnly] = useState(false)
  const [actions, setActions] = useState(0)
  const [changes, setChanges] = useState(0)
  return (
    <ContractFrame
      title="折叠入口与固定展开模式"
      description="Collapsible 可用于带独立操作的单个内容区。Disabled 控制标题的折叠入口，内容控件与操作按钮的可用性由应用单独设置；Fixed 始终展示内容，切回可折叠模式时恢复先前的展开状态。"
      onReset={() => {
        setOpen(true)
        setDisabled(false)
        setFixed(false)
        setIconOnly(false)
        setActions(0)
        setChanges(0)
      }}>
      <div className={contractStyles.row}>
        <label>
          <input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.currentTarget.checked)} />{' '}
          Disabled
        </label>
        <label>
          <input type="checkbox" checked={fixed} onChange={(event) => setFixed(event.currentTarget.checked)} /> Fixed
        </label>
        <label>
          <input type="checkbox" checked={iconOnly} onChange={(event) => setIconOnly(event.currentTarget.checked)} />{' '}
          Icon trigger
        </label>
        <ControlButton onClick={() => setOpen((value) => !value)}>External toggle</ControlButton>
      </div>
      <Collapsible
        title="Standalone section"
        open={open}
        disabled={disabled}
        collapsible={!fixed}
        triggerMode={iconOnly ? 'icon' : 'title'}
        onOpenChange={(value) => {
          setOpen(value)
          setChanges((count) => count + 1)
        }}
        actions={
          <Button size="xs" onClick={() => setActions((count) => count + 1)}>
            Independent action
          </Button>
        }>
        <ControlInput aria-label="Content field" defaultValue="Editable content" />
      </Collapsible>
      <StatePanel
        label="Collapsible state"
        value={{ requestedOpen: open, visible: fixed || open, disabled, fixed, iconOnly, changes, actions }}
      />
    </ContractFrame>
  )
}

const longTitle = 'A very long section title that should truncate while its independent header actions stay available'
function NarrowExample() {
  const [width, setWidth] = useState(220)
  const [open, setOpen] = useState(true)
  const [value, setValue] = useState(['first'])
  const [name, setName] = useState('Editable action')
  const [actions, setActions] = useState(0)
  return (
    <ContractFrame
      title="窄标题中的独立操作"
      description="缩小宽度后，标题截断显示，操作入口仍保留可用空间。重命名输入框和折叠按钮是独立控件：编辑标题调用输入回调，展开状态通过对应的折叠回调保存。"
      onReset={() => {
        setWidth(220)
        setOpen(true)
        setValue(['first'])
        setName('Editable action')
        setActions(0)
      }}>
      <label>
        Width {width}px{' '}
        <input
          aria-label="Disclosure width"
          type="range"
          min="180"
          max="480"
          value={width}
          onChange={(event) => setWidth(Number(event.currentTarget.value))}
        />
      </label>
      <div style={{ width, maxWidth: '100%' }} className={contractStyles.stack}>
        <Accordion type="multiple" value={value} onValueChange={setValue}>
          <AccordionItem
            value="first"
            title={longTitle}
            actions={
              <Button size="xs" onClick={() => setActions((count) => count + 1)}>
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
          open={open}
          onOpenChange={setOpen}
          triggerMode="icon"
          variant="transparent"
          actions={
            <input
              aria-label="Rename action"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              className={css({
                width: '80px',
                boxSizing: 'border-box',
                color: 'var(--colors-text)',
                backgroundColor: 'var(--colors-surface)',
                border: '1px solid var(--colors-border)',
              })}
            />
          }>
          文字和控件会使用当前区域的可用宽度。
        </Collapsible>
      </div>
      <StatePanel label="Narrow state" value={{ width, accordion: value, open, name, actions }} />
    </ContractFrame>
  )
}

function KeyboardExample() {
  const [horizontal, setHorizontal] = useState(false)
  const [rtl, setRtl] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [focused, setFocused] = useState('')
  const [open, setOpen] = useState('first')
  return (
    <ContractFrame
      title="用键盘浏览可展开标题"
      description="选择纵向或横向排列，观察相应方向键在可用标题之间移动。Home/End 到首尾，RTL 会调整横向移动方向；Enter/Space 改变展开状态，Tab 可离开这组标题。"
      onReset={() => {
        setHorizontal(false)
        setRtl(false)
        setDisabled(false)
        setFocused('')
        setOpen('first')
      }}>
      <div className={contractStyles.row}>
        <ControlSelect
          aria-label="Orientation"
          value={horizontal ? 'horizontal' : 'vertical'}
          onChange={(event) => setHorizontal(event.currentTarget.value === 'horizontal')}>
          <option value="vertical">Vertical</option>
          <option value="horizontal">Horizontal</option>
        </ControlSelect>
        <label>
          <input type="checkbox" checked={rtl} onChange={(event) => setRtl(event.currentTarget.checked)} /> RTL
        </label>
        <label>
          <input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.currentTarget.checked)} />{' '}
          Disable all triggers
        </label>
      </div>
      <Accordion
        type="single"
        value={open}
        onValueChange={setOpen}
        collapsible
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
      <ControlButton>Next focus target</ControlButton>
      <StatePanel label="Keyboard state" value={{ horizontal, rtl, disabled, open, focused }} />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Disclosure',
  parameters: {
    docs: {
      description: {
        component:
          'Accordion 用于管理一组可展开内容，Collapsible 用于单个可折叠区域。用户可以点击标题或使用键盘展开；受控模式通过 onValueChange 或 onOpenChange 接收新状态。标题旁的独立操作通过 actions 放置，内容中的表单值由应用各自保存；需要始终展开时使用固定展示模式。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const AccordionSingle: Story = { render: () => <AccordionExample /> }
export const AccordionMultiple: Story = { render: () => <AccordionExample multiple /> }
export const Uncontrolled: Story = { render: () => <UncontrolledExample /> }
export const CollapsibleStates: Story = { render: () => <CollapsibleExample /> }
export const ActionsAndNarrow: Story = { render: () => <NarrowExample /> }
export const Keyboard: Story = { render: () => <KeyboardExample /> }

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
      <p>Content {index + 1}. Header actions do not change expanded state.</p>
      <ControlInput aria-label={`Field ${index + 1}`} defaultValue={`Value ${index + 1}`} />
    </AccordionItem>
  ))
  return (
    <ContractFrame
      title={`Accordion: controlled ${multiple ? 'multiple' : 'single'}`}
      description="点击或 Enter/Space 展开。方向键、Home/End 在触发按钮之间移动焦点；动作按钮独立 Tab 聚焦。"
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
      title="Uncontrolled disclosure"
      description="状态由组件持有；下方输出仅记录回调。Reset 重新挂载并恢复 defaultValue/defaultOpen。"
      onReset={() => {
        setGeneration((value) => value + 1)
        setSingle('first')
        setMany(['first'])
        setOpen(true)
      }}>
      <div key={generation} className={contractStyles.stack}>
        <Accordion type="single" defaultValue="first" onValueChange={setSingle}>
          <AccordionItem value="first" title="Required single first">
            Single mode without collapsible keeps one item open.
          </AccordionItem>
          <AccordionItem value="second" title="Required single second">
            Selecting this closes the first.
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
          This standalone item has its own boolean state.
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
      title="Collapsible: state and trigger modes"
      description="Disabled 只锁定折叠触发，不替内容或动作决定可编辑性。Fixed 保持内容展开并移除触发按钮；切回后恢复先前展开值。"
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
      title="Narrow headers and independent actions"
      description="标题保持省略号，操作槽与折叠按钮平级。Tab 到重命名输入框并编辑或按 Space 不会展开/收起内容。"
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
          Text and controls remain within the available width.
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
      title="Accordion keyboard and disabled items"
      description="纵向用 Up/Down，横向用 Left/Right（RTL 反向）；Home/End 定位首尾，跳过禁用项。Tab 仍可离开组件。"
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

const meta = { title: 'Widgets/Disclosure', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const AccordionSingle: Story = { render: () => <AccordionExample /> }
export const AccordionMultiple: Story = { render: () => <AccordionExample multiple /> }
export const Uncontrolled: Story = { render: () => <UncontrolledExample /> }
export const CollapsibleStates: Story = { render: () => <CollapsibleExample /> }
export const ActionsAndNarrow: Story = { render: () => <NarrowExample /> }
export const Keyboard: Story = { render: () => <KeyboardExample /> }

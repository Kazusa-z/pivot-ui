import { StrictMode, useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { CurvePreset, CurvePresetService } from '../src/contracts/curve'
import { CurvePicker } from '../src/templates/curve/CurvePicker'
import { defaultCurvePresets } from '../src/templates/curve/CurvePresets'
import { copyCurveValue, type CurveValue } from '../src/values/curve'
import {
  PopoverContent,
  PopoverDescription,
  PopoverPortal,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from '../src/widgets/overlays/Popover'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'

const initial: CurveValue = defaultCurvePresets[1].value
function PickerExample({
  storage = false,
  refuse = false,
  rejectCommit = false,
  readOnly = false,
  narrow = false,
}: {
  storage?: boolean
  refuse?: boolean
  rejectCommit?: boolean
  readOnly?: boolean
  narrow?: boolean
}) {
  const [value, setValue] = useState(initial)
  const [revision, setRevision] = useState(0)
  const [events, setEvents] = useState<string[]>([])
  const [reject, setReject] = useState(rejectCommit)
  const [enabled, setEnabled] = useState(storage)
  const [open, setOpen] = useState(false)
  const currentRevision = useRef(revision)
  currentRevision.current = revision
  const initialEdit = useRef(value),
    failNext = useRef(false)
  const log = (event: string) => setEvents((items) => [...items.slice(-14), event])
  const service = useMemo<CurvePresetService>(() => {
    const entries = new Map<string, CurvePreset>([
      ['stored-1', { id: 'stored-1', label: 'Stored arch', value: defaultCurvePresets[2].value }],
    ])
    let counter = 1
    async function delay(action: string) {
      log(`service ${action}`)
      await new Promise((resolve) => setTimeout(resolve, 350))
      if (failNext.current) {
        failNext.current = false
        throw Error(`Mock ${action} failed. Retry the operation.`)
      }
    }
    return {
      async list() {
        await delay('list')
        return [...entries.values()].map(({ id, label }) => ({ id, label }))
      },
      async load(id) {
        await delay('load')
        const item = entries.get(id)
        if (!item) throw Error('Preset no longer exists.')
        return copyCurveValue(item.value)
      },
      async save(input) {
        await delay('save')
        const id = `stored-${++counter}`
        entries.set(id, { id, label: input.label, value: copyCurveValue(input.value) })
        return { id, label: input.label }
      },
      async remove(id) {
        await delay('remove')
        entries.delete(id)
      },
    }
  }, [])
  const picker = (
    <CurvePicker
      value={value}
      label="Animation curve"
      open={open}
      onOpenChange={setOpen}
      presetService={enabled ? service : undefined}
      resetKey={revision}
      readOnly={readOnly}
      onEditStart={(source) => {
        initialEdit.current = value
        log(`begin ${source}`)
      }}
      onValueChange={(next) => {
        log('curve request')
        if (!refuse) setValue(next)
      }}
      onValueCommit={async (_next, reason) => {
        const snapshot = initialEdit.current
        log(`commit ${reason}`)
        if (rejectCommit) {
          await new Promise((resolve) => setTimeout(resolve, 300))
          if (currentRevision.current !== revision) return
          if (reject) {
            setValue(snapshot)
            throw Error('Host rejected the curve. Switch to Accept and retry.')
          }
        }
      }}
      onEditCancel={(reason) => {
        log(`cancel ${reason}`)
        if (!['external-update', 'target-change', 'reset', 'unmount'].includes(reason)) setValue(initialEdit.current)
      }}
    />
  )
  return (
    <ContractFrame
      title="Curve picker and presets"
      description="CurvePicker只组合一个CurveWidget；选择预设不写曲线，Apply算一次编辑。示例存储是显式注入的内存服务。保存/删除仅改变服务预设，不触发曲线change或commit。Reset使旧请求失效。"
      onReset={() => {
        setValue(initial)
        setRevision((current) => current + 1)
        setEvents([])
        setOpen(false)
      }}>
      <div className={contractStyles.row}>
        {storage && (
          <>
            <ControlButton
              onClick={() => {
                failNext.current = true
              }}>
              Fail next storage operation
            </ControlButton>
            <ControlButton onClick={() => setEnabled((current) => !current)}>
              {enabled ? 'Detach service' : 'Attach service'}
            </ControlButton>
          </>
        )}
        {rejectCommit && (
          <ControlButton onClick={() => setReject((current) => !current)}>
            Commit: {reject ? 'Reject' : 'Accept'}
          </ControlButton>
        )}
      </div>
      {narrow ? (
        <div style={{ maxWidth: 240 }}>
          <PopoverRoot>
            <PopoverTrigger asChild>
              <ControlButton>Open nested editor</ControlButton>
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverContent collisionPadding={12} style={{ width: 260, maxWidth: 'calc(100vw - 24px)' }}>
                <PopoverTitle>Nested property</PopoverTitle>
                <PopoverDescription>The curve popup shares the parent theme and overlay layer.</PopoverDescription>
                {picker}
              </PopoverContent>
            </PopoverPortal>
          </PopoverRoot>
        </div>
      ) : (
        <StrictMode>{picker}</StrictMode>
      )}
      <StatePanel label="Authoritative curve and events" value={{ value, revision, refuse, events }} />
    </ContractFrame>
  )
}
function NoStorage() {
  return <PickerExample />
}
function Storage() {
  return <PickerExample storage />
}
function Refusal() {
  return <PickerExample refuse />
}
function Rejection() {
  return <PickerExample rejectCommit />
}
function ReadOnly() {
  return <PickerExample storage readOnly />
}
function Narrow() {
  return <PickerExample storage narrow />
}
function EmptyPresets() {
  const [value, setValue] = useState<CurveValue>({ interpolation: 'linear', points: [] })
  const [revision, setRevision] = useState(0)
  return (
    <ContractFrame
      title="Empty curve and explicit preset collection"
      description="显式presets=[]替换内置预设。空曲线保持空值，不自动插入默认点；编辑器仍可新增点。无服务时存储按钮不可用。"
      onReset={() => {
        setValue({ interpolation: 'linear', points: [] })
        setRevision((current) => current + 1)
      }}>
      <CurvePicker value={value} onValueChange={setValue} presets={[]} resetKey={revision} />
      <StatePanel label="Curve" value={value} />
    </ContractFrame>
  )
}
const meta = {
  title: 'Templates/CurvePicker',
  component: CurvePicker,
  args: { value: initial },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CurvePicker>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <NoStorage /> }
export const PresetStorage: Story = { render: () => <Storage /> }
export const ControlledRefusal: Story = { render: () => <Refusal /> }
export const AsyncRejection: Story = { render: () => <Rejection /> }
export const ReadOnlyStorage: Story = { render: () => <ReadOnly /> }
export const NestedAndNarrow: Story = { render: () => <Narrow /> }
export const Empty: Story = { render: () => <EmptyPresets /> }

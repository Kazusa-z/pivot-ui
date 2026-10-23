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
        throw Error(`Mock ${action} 失败，请重试。`)
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
        if (!item) throw Error('此预设已不存在，请刷新列表。')
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
            throw Error('曲线未保存，请切换为 Accept 后重试。')
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
      title="弹出式曲线编辑与预设"
      description="点击曲线预览，在弹层里拖动曲线点，或选择预设后点击 Apply preset。下方事件列表展示预览与保存过程。带预设服务的示例还可保存、删除个人预设；接入时通过 presetService 提供这些方法。Reset 恢复本例的曲线和编辑状态。"
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
                <PopoverDescription>
                  在弹层中打开曲线编辑器时，它会沿用当前主题，并显示在外层弹层上方。
                </PopoverDescription>
                {picker}
              </PopoverContent>
            </PopoverPortal>
          </PopoverRoot>
        </div>
      ) : (
        <StrictMode>{picker}</StrictMode>
      )}
      <StatePanel label="当前曲线与编辑事件" value={{ value, revision, refuse, events }} />
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
      title="空曲线与空预设列表"
      description="打开空曲线编辑器，双击画布新增点，从头画出一条曲线；下方可查看点坐标。此例传入 presets=[]，适合希望用户自行绘制的场景。需要提供起始曲线时，可通过 presets 传入预设列表。"
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
  tags: ['autodocs'],
  title: 'Templates/CurvePicker',
  component: CurvePicker,
  args: { value: initial },
  parameters: {
    docs: {
      description: {
        component:
          'CurvePicker 是带预览的曲线输入控件，适合动画参数、变化趋势和空间有限的属性面板。点击预览即可打开编辑器，拖动点和控制柄来调整曲线。\n\n编辑时通过 `onValueChange` 接收预览值，完成时通过 `onValueCommit` 保存结果。也可以在预设列表中选一项，再点击 Apply preset 应用到当前曲线。父组件将接受的结果写回 `value`。\n\n通过 `presets` 提供预设列表，通过 `presetService` 接入个人预设的加载、保存和删除。应用在取消或保存失败时恢复显示值；只需手动编辑时可传入 `presets=[]`。',
      },
    },
    layout: 'fullscreen',
  },
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

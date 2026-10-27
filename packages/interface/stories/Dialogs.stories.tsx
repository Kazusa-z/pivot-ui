import { useState, type FormEvent } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AlertDialog, Dialog, DialogClose } from '../src/dialogs'
import { Button } from '../src/controls/buttons'
import { Input } from '../src/controls/inputs'
import { Text } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryCode,
  StoryKeyboard,
  StoryProps,
  StoryState,
  StoryNote,
} from './support/StoryPage'

const fieldClass = css({ display: 'grid', gap: 'var(--space-1)', minWidth: 0 })
const labelClass = css({ fontSize: 'var(--fontSizes-control)', fontWeight: 500, color: 'var(--colors-text)' })
const formClass = css({ display: 'grid', gap: 'var(--space-3)', minWidth: 0 })

function FormDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('Cube')
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    setError('')
    setSaved(name.trim())
    setOpen(false)
  }
  return (
    <StoryCard
      title="Form dialog"
      description="Dialog 用于需要集中注意力的表单。打开后焦点进入内容，Tab 在模态内循环，Escape 关闭后回到触发按钮。">
      <Dialog
        title="Rename object"
        description="更新显示名称；保存后对话框关闭并保留结果。"
        trigger={<Button>Rename…</Button>}
        rootProps={{ open, onOpenChange: setOpen }}>
        <form className={formClass} onSubmit={submit}>
          <div className={fieldClass}>
            <label className={labelClass} htmlFor="dialog-object-name">
              Object name
            </label>
            <Input
              id="dialog-object-name"
              value={name}
              state={error ? 'invalid' : undefined}
              aria-invalid={error ? true : undefined}
              onChange={(event) => {
                setName(event.currentTarget.value)
                if (error) setError('')
              }}
            />
            {error && (
              <Text size="xs" tone="danger">
                {error}
              </Text>
            )}
          </div>
          <StoryRow align="end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="solid">
              Save
            </Button>
          </StoryRow>
        </form>
      </Dialog>
      <StoryState label="Form dialog state" value={{ open, name, saved, error }} />
    </StoryCard>
  )
}

function CriticalAlert() {
  const [open, setOpen] = useState(false)
  const [last, setLast] = useState('none')
  return (
    <StoryCard
      title="Critical alert"
      description="AlertDialog 要求明确决定；critical 使用危险实心确认按钮，取消保持中性。">
      <AlertDialog
        title="Delete object?"
        description="This removes the object and its animation data. This action cannot be undone."
        trigger={<Button critical>Delete…</Button>}
        confirmLabel="Delete"
        critical
        rootProps={{ open, onOpenChange: setOpen }}
        onConfirm={() => setLast('confirmed')}
        onCancel={() => setLast('cancelled')}
      />
      <StoryState label="Critical alert state" value={{ open, last }} />
    </StoryCard>
  )
}

function SizeExample() {
  return (
    <StoryCard
      title="Regular surface, two close sizes"
      description="Dialog 没有 compact/md 两档布局；正文使用常规 14/20、padding 20、标题 16。closeSize 只控制右上角关闭按钮的 24/32 触达尺寸。">
      <StoryRow>
        <Dialog title="Compact close" trigger={<Button size="sm">Open 24px close</Button>} closeSize="sm">
          <Text size="sm" tone="muted">
            关闭按钮使用 24px，与紧凑工具栏一致；正文仍是常规对话框尺寸。
          </Text>
        </Dialog>
        <Dialog title="Regular close" trigger={<Button size="md">Open 32px close</Button>} closeSize="md">
          <Text size="sm" tone="muted">
            关闭按钮使用 32px，适合触控或常规表单；标题、正文和 padding 不变。
          </Text>
        </Dialog>
        <Button disabled>Disabled trigger</Button>
      </StoryRow>
      <StoryNote>Dialog 没有 disabled 状态，由触发元素控制；禁用的触发按钮不能打开对话框。</StoryNote>
      <StoryNote>对话框宽度上限 440px（视口不足时减去 32px），最大高度为视口高度减 32px。</StoryNote>
    </StoryCard>
  )
}

function LongAlert() {
  const [open, setOpen] = useState(false)
  const [last, setLast] = useState('none')
  const description = Array.from(
    { length: 14 },
    (_, index) => `Change ${index + 1}: this paragraph wraps within the dialog body and scrolls independently.`
  ).join('\n\n')
  return (
    <StoryCard
      title="Long content and scrolling"
      description="内容超出视口时只有正文区域滚动，标题和操作按钮保持可见；取消/确认不会随内容滚走。">
      <AlertDialog
        title="Review a long change"
        description={description}
        trigger={<Button>Review long change</Button>}
        confirmLabel="Apply change"
        rootProps={{ open, onOpenChange: setOpen }}
        contentProps={{ css: { maxWidth: '480px' } }}
        onConfirm={() => setLast('applied')}
        onCancel={() => setLast('cancelled')}
      />
      <StoryState label="Long alert state" value={{ open, last }} />
    </StoryCard>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Dialog 用于表单或详细内容，AlertDialog 用于需要明确确认的操作。浮层使用 surfaceRaised、6px 圆角、overlay/modal shadow；对话框标题 16、正文 14、padding 20，按钮 32。打开后焦点进入内容，Escape 关闭并回到触发器。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Overlays/Dialogs',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Overlays"
      title="Dialogs"
      summary="Dialog 承载表单和详细内容，AlertDialog 等待明确决定。两者共用常规对话框表面：padding 20、标题 16、正文 14、圆角 8、modal shadow；差异在语义和操作按钮。"
      meta={
        <>
          <span>Dialog</span>
          <span>·</span>
          <span>AlertDialog</span>
          <span>·</span>
          <span>regular surface</span>
        </>
      }>
      <StorySection
        title="Variants"
        description="先选语义，再决定表单或确认操作；不要把可撤销的普通操作做成 AlertDialog。">
        <StoryGrid>
          <FormDialog />
          <CriticalAlert />
        </StoryGrid>
      </StorySection>

      <StorySection title="Size" description="对话框本身只有常规档；关闭按钮提供 24/32 两种触达尺寸。">
        <SizeExample />
      </StorySection>

      <StorySection title="Long content" description="正文独立滚动，footer 固定，避免用户看不到决定按钮。">
        <LongAlert />
      </StorySection>

      <StorySection
        title="Keyboard and accessibility"
        description="模态内容需要标题；没有说明时显式省略 aria-describedby。">
        <StoryCard>
          <StoryKeyboard
            rows={[
              { keys: ['Enter', 'Space'], action: '打开聚焦的对话框触发器' },
              { keys: 'Tab', action: '在对话框内循环焦点，不进入背景页面' },
              { keys: 'Escape', action: '关闭对话框，焦点回到触发按钮' },
              { keys: ['Enter'], action: '在表单中提交；AlertDialog 中激活当前聚焦按钮' },
            ]}
          />
          <StoryNote>
            AlertDialog 打开时优先聚焦 Cancel，避免误确认。关闭按钮必须有可访问名称；表单错误用文字和 invalid
            边框表达，不只依赖颜色。
          </StoryNote>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<Dialog
  title="Rename object"
  description="Update the display name."
  trigger={<Button>Rename…</Button>}
  rootProps={{ open, onOpenChange: setOpen }}>
  <form onSubmit={save}>
    <Input value={name} onChange={change} />
    <Button type="submit" variant="solid">Save</Button>
  </form>
</Dialog>

<AlertDialog
  title="Delete object?"
  critical
  confirmLabel="Delete"
  trigger={<Button critical>Delete…</Button>}
  onConfirm={remove}
/>`}
          />
          <StoryProps
            rows={[
              { name: 'title', type: 'ReactNode', description: '必填，作为对话框的可访问名称。' },
              { name: 'description', type: 'ReactNode', description: '可选说明；没有时组件会省略 aria-describedby。' },
              { name: 'trigger', type: 'ReactElement', description: '传给 Trigger asChild 的触发元素。' },
              { name: 'rootProps', type: 'DialogRootProps', description: '传入 open / onOpenChange 等受控状态。' },
              {
                name: 'closeSize',
                type: "'sm' | 'md'",
                defaultValue: "'sm'",
                description: '关闭按钮 24 / 32；不影响对话框布局。',
              },
              {
                name: 'critical',
                type: 'boolean',
                defaultValue: 'false',
                description: 'AlertDialog 确认按钮使用危险实心样式。',
              },
              { name: 'onConfirm / onCancel', type: '() => void', description: 'AlertDialog 的决定回调。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}

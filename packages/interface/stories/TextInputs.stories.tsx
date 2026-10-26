import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Input, Textarea, EditableText } from '../src/widgets/inputs'
import { Button } from '../src/widgets/buttons'
import { Kbd } from '../src/widgets/display/Kbd'
import { Text } from '../src/foundation/typography'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryField,
  StoryGrid,
  StoryCode,
  StoryProps,
  StoryState,
} from './support/StoryPage'

const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Inputs/Text',
  parameters: {
    docs: {
      description: {
        component:
          'Input 与 Textarea 负责普通文本输入：onChange 提供原生事件，onValueChange 直接返回字符串。EditableText 适合先展示、再进入编辑的字段，Enter 提交、Escape 取消；异步保存时在 onCommit 中返回 Promise，失败会保留草稿供重试。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Widgets / Inputs"
      title="Text"
      summary="普通文本、多行文本和可编辑文字共享同一套尺寸与状态。受控值决定显示，onValueChange 请求更新；EditableText 把一次文字修改整理成开始、提交和取消。"
      meta={
        <>
          <span>Input</span>
          <span>·</span>
          <span>Textarea</span>
          <span>·</span>
          <span>EditableText</span>
        </>
      }>
      <StorySection
        title="Variants"
        description="Input 与 Textarea 都支持 outline、soft、subtle；默认 soft 适合面板内嵌，outline 适合独立字段。">
        <StoryGrid>
          {(['outline', 'soft', 'subtle'] as const).map((variant) => (
            <StoryCard key={variant} title={variant}>
              <StoryField label="Input">
                <Input
                  aria-label={`${variant} input`}
                  variant={variant}
                  defaultValue="Scene 001"
                  startSlot="Aa"
                  endSlot=".scene"
                />
              </StoryField>
              <StoryField label="Textarea">
                <Textarea
                  aria-label={`${variant} textarea`}
                  variant={variant}
                  rows={3}
                  defaultValue={'Line one\nLine two'}
                />
              </StoryField>
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Density"
        description="紧凑档 20/24，常规档 32/36；Textarea 只有 sm/md 两档，通过 minHeight 保持多行输入空间。">
        <StoryGrid>
          <StoryCard title="Compact 20 / 24">
            <StoryRow align="end">
              <StoryField label="xs · 20">
                <Input aria-label="Compact xs input" size="xs" defaultValue="Material" css={{ width: '160px' }} />
              </StoryField>
              <StoryField label="sm · 24">
                <Input aria-label="Compact sm input" size="sm" defaultValue="material.mat" css={{ width: '180px' }} />
              </StoryField>
            </StoryRow>
            <StoryField label="Textarea sm">
              <Textarea aria-label="Compact textarea" size="sm" rows={3} defaultValue="Compact notes" />
            </StoryField>
          </StoryCard>
          <StoryCard title="Regular 32 / 36">
            <StoryRow align="end">
              <StoryField label="md · 32">
                <Input aria-label="Regular md input" size="md" defaultValue="Material" css={{ width: '180px' }} />
              </StoryField>
              <StoryField label="lg · 36">
                <Input aria-label="Regular lg input" size="lg" defaultValue="material.mat" css={{ width: '200px' }} />
              </StoryField>
            </StoryRow>
            <StoryField label="Textarea md">
              <Textarea aria-label="Regular textarea" size="md" rows={4} defaultValue="Regular notes" />
            </StoryField>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="States"
        description="disabled 不可操作；readOnly 仍可聚焦和选择；valid/invalid 只改变边框和文字，不整块填充背景。">
        <StoryGrid>
          <StoryCard title="Input states">
            <StoryField label="Default">
              <Input aria-label="Default input" defaultValue="Cube" />
            </StoryField>
            <StoryField label="Valid">
              <Input aria-label="Valid input" state="valid" defaultValue="Valid name" />
            </StoryField>
            <StoryField label="Invalid">
              <Input aria-label="Invalid input" state="invalid" defaultValue="Invalid name" />
            </StoryField>
            <StoryField label="Disabled">
              <Input aria-label="Disabled input" disabled defaultValue="Disabled" />
            </StoryField>
            <StoryField label="Read only">
              <Input aria-label="Read only input" readOnly value="Selectable read-only text" />
            </StoryField>
          </StoryCard>
          <StoryCard title="Textarea states">
            <StoryField label="Default">
              <Textarea aria-label="Default textarea" rows={3} defaultValue="Line one" />
            </StoryField>
            <StoryField label="Valid">
              <Textarea aria-label="Valid textarea" state="valid" rows={3} defaultValue="Valid text" />
            </StoryField>
            <StoryField label="Invalid">
              <Textarea aria-label="Invalid textarea" state="invalid" rows={3} defaultValue="Invalid text" />
            </StoryField>
            <StoryField label="Disabled">
              <Textarea aria-label="Disabled textarea" disabled rows={3} defaultValue="Disabled text" />
            </StoryField>
            <StoryField label="Read only">
              <Textarea aria-label="Read only textarea" readOnly rows={3} value={'Read only\nSelectable text'} />
            </StoryField>
          </StoryCard>
          <StoryCard title="EditableText availability">
            <StoryField label="Disabled">
              <EditableText label="Disabled name" value="Disabled name" disabled onCommit={() => {}} />
            </StoryField>
            <StoryField label="Read only">
              <EditableText label="Read only name" value="Read only name" readOnly onCommit={() => {}} />
            </StoryField>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Behavior"
        description="EditableText 平时显示文字，点击或按 Enter/Space 进入编辑。提交和取消都由应用接收，异步失败保留草稿。">
        <StoryGrid>
          <EditableBehaviorCard />
          <AsyncEditableBehaviorCard />
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Keyboard and accessibility"
        description="Input/Textarea 保留原生焦点、选择和输入行为；EditableText 的触发按钮和输入都提供可访问名称。">
        <StoryCard title="Keyboard">
          <StoryRow>
            <Kbd letterCase="preserve">Enter</Kbd>
            <Text size="sm">编辑时提交；在 EditableText 触发按钮上进入编辑。</Text>
          </StoryRow>
          <StoryRow>
            <Kbd letterCase="preserve">Escape</Kbd>
            <Text size="sm">取消编辑并恢复已接受的值。</Text>
          </StoryRow>
          <StoryRow>
            <Kbd letterCase="preserve">Tab</Kbd>
            <Text size="sm">离开输入；失焦会提交 EditableText 的当前草稿。</Text>
          </StoryRow>
          <StoryRow>
            <Kbd size="xs">Ctrl</Kbd>
            <Text size="sm">配合多行 useTextEdit 时，Ctrl/⌘+Enter 提交而不是插入换行。</Text>
          </StoryRow>
          <Text size="sm" tone="muted">
            readOnly 仍可聚焦和复制；disabled 会移出表单交互。Input 和 Textarea 的 aria-label 或外部 label
            必须能说明字段含义。
          </Text>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<Input
  aria-label="Object name"
  value={name}
  onValueChange={setName}
/>

<Textarea rows={4} value={notes} onValueChange={setNotes} />

<EditableText
  label="Object name"
  value={name}
  onCommit={async (draft) => saveName(draft)}
/>`}
          />
          <StoryProps
            rows={[
              {
                name: 'Input.size',
                type: "'xs' | 'sm' | 'md' | 'lg'",
                defaultValue: "'sm'",
                description: '20/24 紧凑，32/36 常规。',
              },
              {
                name: 'Input.variant',
                type: "'outline' | 'soft' | 'subtle'",
                defaultValue: "'soft'",
                description: '字段表面样式。',
              },
              { name: 'Input.state', type: "'valid' | 'invalid'", description: '边框与文字状态，不填满背景。' },
              {
                name: 'Input.onValueChange',
                type: '(value: string) => void',
                description: '直接接收字符串；onChange 仍可用。',
              },
              { name: 'Textarea.size', type: "'sm' | 'md'", defaultValue: "'sm'", description: '多行输入只有两档。' },
              { name: 'EditableText.value', type: 'string', description: '平时展示的已接受文字。' },
              {
                name: 'EditableText.onCommit',
                type: '(draft, reason) => void | Promise<void>',
                description: '保存草稿；抛错时显示错误并保留草稿。',
              },
              {
                name: 'EditableText.readOnly',
                type: 'boolean',
                defaultValue: 'false',
                description: '仍可聚焦，不进入编辑。',
              },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}

function EditableBehaviorCard() {
  const [name, setName] = useState('Camera 001')
  const [events, setEvents] = useState<string[]>([])
  const record = (message: string) => setEvents((items) => [...items.slice(-9), message])
  return (
    <StoryCard title="EditableText — commit and cancel" description="Enter 提交，Escape 取消，失焦提交。">
      <EditableText
        label="Object name"
        value={name}
        showIcon
        onBegin={() => record('begin')}
        onDraftChange={(draft) => record(`draft: ${draft}`)}
        onCommit={(draft, reason) => {
          record(`commit (${reason}): ${draft}`)
          setName(draft)
        }}
        onCancel={(reason) => record(`cancel: ${reason}`)}
      />
      <StoryRow>
        <Button size="sm" variant="outline">
          Blur target
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setName('Externally updated')
            record('external update')
          }}>
          External update
        </Button>
      </StoryRow>
      <StoryState label="Name state" value={{ value: name, events }} />
    </StoryCard>
  )
}

function AsyncEditableBehaviorCard() {
  const [name, setName] = useState('Accepted name')
  const [pending, setPending] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const request = useRef<{ resolve: () => void; reject: (error: Error) => void } | null>(null)
  const record = (message: string) => setEvents((items) => [...items.slice(-9), message])
  return (
    <StoryCard title="EditableText — async commit" description="保存 Promise 完成前显示 Saving；拒绝后保留草稿。">
      <EditableText
        label="Async name"
        value={name}
        onBegin={() => record('begin')}
        onCommit={async (draft) => {
          record(`request: ${draft}`)
          setPending(true)
          try {
            await new Promise<void>((resolve, reject) => {
              request.current = { resolve, reject }
            })
            setName(draft)
            record(`accepted: ${draft}`)
          } catch (error) {
            record(`rejected: ${error instanceof Error ? error.message : String(error)}`)
            throw error
          } finally {
            request.current = null
            setPending(false)
          }
        }}
        onCancel={(reason) => record(`cancel: ${reason}`)}
      />
      <StoryRow>
        <Button
          size="sm"
          variant="outline"
          disabled={!pending}
          onClick={() => {
            const current = request.current
            request.current = null
            current?.resolve()
          }}>
          Accept request
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!pending}
          onClick={() => {
            const current = request.current
            request.current = null
            current?.reject(new Error('Name rejected. Edit the draft or retry.'))
          }}>
          Reject request
        </Button>
      </StoryRow>
      <StoryState label="Async request" value={{ value: name, pending, events }} />
    </StoryCard>
  )
}

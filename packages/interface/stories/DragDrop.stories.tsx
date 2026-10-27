import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  DragDropProvider,
  useDragSource,
  useDropTarget,
  useDragDropState,
  useDragDropCancel,
} from '../src/interaction/drag-drop'
import type { DragResult } from '../src/values/drag-drop'
import { TreeDragPreview, TreeInsertionIndicator } from '../src/collections/tree'
import { Button } from '../src/controls/buttons'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryState,
  StoryCode,
  StoryProps,
  StoryKeyboard,
  StoryNote,
} from './support/StoryPage'

const sourceClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '72px',
  padding: 'var(--space-3)',
  border: '1px solid var(--colors-border)',
  borderRadius: 'var(--radii-controlMd)',
  backgroundColor: 'var(--colors-surface)',
  color: 'var(--colors-text)',
  cursor: 'grab',
  userSelect: 'none',
  '&[data-dragging]': { opacity: 0.5, cursor: 'grabbing' },
})

const targetClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '72px',
  padding: 'var(--space-3)',
  border: '1px dashed var(--colors-borderStrong)',
  borderRadius: 'var(--radii-controlMd)',
  color: 'var(--colors-text)',
  textAlign: 'center',
  '&[data-over=true]': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '-2px' },
})

const previewClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  padding: 'var(--space-1) var(--space-2)',
  border: '1px solid var(--colors-border)',
  borderRadius: 'var(--radii-controlMd)',
  backgroundColor: 'var(--colors-surfaceRaised)',
  boxShadow: 'var(--shadows-overlay)',
  fontSize: 'var(--fontSizes-control)',
})

const hiddenPreviewClass = css({
  position: 'fixed',
  top: '-1000px',
  left: '-1000px',
  pointerEvents: 'none',
})

function Source({ disabled, onEnd }: { disabled: boolean; onEnd: (result: DragResult<{ id: string }>) => void }) {
  const source = useDragSource<{ id: string }>({
    type: 'example-object',
    data: { id: 'cube' },
    disabled,
    onEnd,
  })
  return (
    <>
      <div ref={source.ref} data-dragging={source.isDragging || undefined} className={sourceClass}>
        Cube
      </div>
      <div ref={source.previewRef} aria-hidden className={hiddenPreviewClass}>
        <div className={previewClass}>Cube</div>
      </div>
    </>
  )
}

function Target({
  label,
  accept,
  reject,
  onReceive,
}: {
  label: string
  accept: string[]
  reject?: boolean
  onReceive: (id: string) => void
}) {
  const target = useDropTarget<{ id: string }>({
    accept,
    onDrop: ({ data }) => {
      if (reject) return false
      onReceive(data.id)
    },
  })
  return (
    <div ref={target.ref} data-over={target.isOver || undefined} className={targetClass}>
      {label}
    </div>
  )
}

function Snapshot() {
  const state = useDragDropState()
  const cancel = useDragDropCancel()
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-2)' })}>
      <StoryRow>
        <Button size="sm" variant="outline" disabled={state.phase === 'idle'} onClick={() => cancel('escape')}>
          Cancel drag
        </Button>
      </StoryRow>
      <StoryState label="Drag state" value={state} />
    </div>
  )
}

function Lifecycle() {
  const [version, setVersion] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [removeOnDrop, setRemoveOnDrop] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const receive = (id: string) => {
    setEvents((current) => [...current.slice(-7), `received: ${id}`])
    if (removeOnDrop) setVisible(false)
  }
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)' })}>
      <StoryRow>
        <Button size="sm" variant="outline" onClick={() => setDisabled((value) => !value)}>
          {disabled ? 'Enable source' : 'Disable source'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setVisible((value) => !value)}>
          {visible ? 'Remove source' : 'Show source'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setRemoveOnDrop((value) => !value)}>
          {removeOnDrop ? 'Keep after drop' : 'Remove after drop'}
        </Button>
        <Button
          size="sm"
          variant="subtle"
          onClick={() => {
            setVersion((value) => value + 1)
            setDisabled(false)
            setVisible(true)
            setRemoveOnDrop(false)
            setEvents([])
          }}>
          Reset
        </Button>
      </StoryRow>
      <DragDropProvider resetKey={version}>
        <div
          className={css({
            display: 'grid',
            gap: 'var(--space-3)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          })}>
          {visible && (
            <Source
              disabled={disabled}
              onEnd={(result) =>
                setEvents((current) => [
                  ...current.slice(-7),
                  result.status === 'dropped' ? 'dropped' : `cancelled: ${result.reason}`,
                ])
              }
            />
          )}
          <Target label="Accepts cube" accept={['example-object']} onReceive={receive} />
          <Target label="Rejects drop" accept={['example-object']} reject onReceive={receive} />
          <Target label="Accepts another type" accept={['example-material']} onReceive={receive} />
        </div>
        <Snapshot />
      </DragDropProvider>
      <StoryState label="Completed actions" value={events} />
    </div>
  )
}

function IsolatedProvider() {
  const [events, setEvents] = useState<string[]>([])
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)' })}>
      <DragDropProvider>
        <Target
          label="Target in a separate provider"
          accept={['example-object']}
          onReceive={(id) => setEvents((old) => [...old, id])}
        />
        <Snapshot />
      </DragDropProvider>
      <StoryState label="Received outside the source provider" value={events} />
    </div>
  )
}

function KeyboardAlternative() {
  const [moved, setMoved] = useState(0)
  return (
    <StoryRow>
      <Button onClick={() => setMoved((value) => value + 1)}>Move Cube to slot</Button>
      <StoryState label="Moves completed" value={moved} />
    </StoryRow>
  )
}

function FilesBoundary() {
  const [files, setFiles] = useState<string[]>([])
  const drop = useDropTarget<never>({
    accept: [],
    onDrop: () => false,
    onFilesDrop: (incoming) => setFiles(incoming.map((file) => file.name)),
  })
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)' })}>
      <div ref={drop.ref} data-over={drop.isOver || undefined} className={targetClass}>
        Drop system files here to inspect their names
      </div>
      <StoryState label="File names" value={files} />
    </div>
  )
}

function SystemFiles() {
  const [revision, setRevision] = useState(0)
  return (
    <div className={css({ display: 'grid', gap: 'var(--space-3)' })}>
      <StoryRow>
        <Button size="sm" variant="outline" onClick={() => setRevision((value) => value + 1)}>
          Reset target
        </Button>
      </StoryRow>
      <DragDropProvider key={revision}>
        <FilesBoundary />
      </DragDropProvider>
    </div>
  )
}

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'DragDropProvider 划定一次拖放可以到达的区域，useDragSource 提供 type/data，useDropTarget 按 accept 接收并通过 onDrop 交给应用。源端 onEnd 报告 dropped 或取消原因；Escape、窗口失焦和源不可用都会取消。键盘移动入口由应用提供，不能只依赖指针拖动。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Interaction/DragDrop',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Interaction"
      title="Drag and drop"
      summary="把对象从源交给目标区域。Provider 限定作用域，类型匹配决定目标是否接受；拖动取消、源移除和放置完成都在同一套状态里记录。"
      meta={
        <>
          <span>Pointer + keyboard alternative</span>
          <span>·</span>
          <span>6px preview</span>
          <span>·</span>
          <span>2px indicator</span>
        </>
      }>
      <StorySection
        title="Pointer drag"
        description="拖动 Cube 到目标；删除源、禁用源或按 Escape 会取消。目标 onDrop 返回 false 表示拒绝本次放置。">
        <StoryCard>
          <Lifecycle />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Provider boundary"
        description="跨 Provider 的拖动不会到达目标；需要通信的区域必须共享同一个 DragDropProvider。">
        <StoryCard>
          <IsolatedProvider />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Keyboard alternative"
        description="拖放本身是指针手势；为同样的操作提供普通按钮，键盘和触摸用户才能完成。">
        <StoryCard>
          <KeyboardAlternative />
        </StoryCard>
      </StorySection>

      <StorySection
        title="System files"
        description="系统文件通过 onFilesDrop 进入，应用在其中校验并读取 File；页面不依赖隐藏的原生文件输入。">
        <StoryCard>
          <SystemFiles />
        </StoryCard>
      </StorySection>

      <StorySection
        title="Preview and indicator"
        description="拖动预览使用 surfaceRaised、6px 圆角和 overlay shadow；插入位置使用 2px focusRing 线。">
        <StoryGrid>
          <StoryCard title="Drag preview" description="跟随指针的临时表面。">
            <TreeDragPreview count={2}>Cube</TreeDragPreview>
          </StoryCard>
          <StoryCard title="Insertion indicator" description="before/after 的落点提示。">
            <div className={css({ display: 'grid', gap: 'var(--space-2)' })}>
              <TreeInsertionIndicator active />
              <TreeInsertionIndicator />
            </div>
          </StoryCard>
        </StoryGrid>
        <StoryNote>预览和指示线只表达位置，不改变数据；最终结果必须由 onDrop/onEnd 的返回值决定。</StoryNote>
      </StorySection>

      <StorySection title="Keyboard and accessibility" description="拖放可作为增强，不应成为唯一入口。">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '进入源、目标或键盘替代按钮' },
            { keys: 'Enter / Space', action: '激活键盘替代操作' },
            { keys: 'Escape', action: '取消当前拖动' },
            { keys: 'Window blur', action: '取消当前拖动' },
          ]}
        />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const source = useDragSource({
  type: 'asset/cube',
  data: { id: 'cube' },
  onEnd: (result) => log(result.status),
})

const target = useDropTarget({
  accept: ['asset/cube'],
  onDrop: ({ data }) => move(data.id),
})

<DragDropProvider>
  <div ref={source.ref}>Cube</div>
  <div ref={target.ref}>Slot</div>
</DragDropProvider>`}
          />
          <StoryProps
            rows={[
              { name: 'type / accept', type: 'string / string[]', description: '源与目标必须匹配类型。' },
              { name: 'data', type: 'T', description: '随拖动传递的不可变载荷。' },
              { name: 'onDrop', type: '() => boolean | void', description: '返回 false 拒绝放置。' },
              { name: 'onEnd', type: '(result) => void', description: '报告 dropped 或取消原因。' },
              { name: 'resetKey / disabled', type: 'unknown / boolean', description: '源身份变化或禁用时取消拖动。' },
              { name: 'onFilesDrop', type: '(files: File[]) => void', description: '接收系统文件。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}

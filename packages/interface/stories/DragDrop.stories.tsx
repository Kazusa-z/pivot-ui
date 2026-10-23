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
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'
import { css, cx } from '../styled-system/css'

const tile = css({
  padding: '18px',
  border: '1px dashed var(--colors-borderStrong)',
  borderRadius: '8px',
  minWidth: 0,
  overflowWrap: 'anywhere',
  '&[data-over=true]': { outline: '2px solid var(--colors-focusRing)' },
  '&[data-dragging=true]': { opacity: 0.5 },
})

function Source({ disabled, onEnd }: { disabled: boolean; onEnd: (result: DragResult<{ id: string }>) => void }) {
  const source = useDragSource({ type: 'example-object', data: { id: 'cube' }, disabled, onEnd })
  return (
    <div
      ref={source.ref}
      data-dragging={source.isDragging}
      className={tile}
      style={{ cursor: disabled ? 'default' : 'grab' }}>
      拖动 Cube
    </div>
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
    <div ref={target.ref} data-over={target.isOver} className={tile}>
      {label}
    </div>
  )
}
function Snapshot() {
  const state = useDragDropState()
  const cancel = useDragDropCancel()
  return (
    <>
      <ControlButton disabled={state.phase === 'idle'} onClick={() => cancel('escape')}>
        取消拖放
      </ControlButton>
      <StatePanel label="当前拖放状态" value={state} />
    </>
  )
}
function Lifecycle({ isolated = false }: { isolated?: boolean }) {
  const [version, setVersion] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [removeOnDrop, setRemoveOnDrop] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const receive = (id: string) => {
    setEvents((current) => [...current, `received: ${id}`])
    if (removeOnDrop) setVisible(false)
  }
  return (
    <ContractFrame
      title={isolated ? '独立区域之间的拖放范围' : '对象拖放与完成结果'}
      description="拖放用于把对象交给目标区域，适合移动条目或建立资源关联。将 Cube 拖到不同目标，可观察类型匹配、接受和拒绝的结果。目标的 onDrop 接收 data，应用在其中完成操作；源端 onEnd 报告 dropped 或取消原因。源与目标需要共享 DragDropProvider，Escape、窗口失焦或源变为不可用时会取消拖动；应用可为同一操作另外提供键盘可用的移动按钮。"
      onReset={() => {
        setVersion((value) => value + 1)
        setDisabled(false)
        setVisible(true)
        setRemoveOnDrop(false)
        setEvents([])
      }}>
      <div className={contractStyles.row}>
        <ControlButton onClick={() => setDisabled((value) => !value)}>
          {disabled ? '启用拖动源' : '禁用拖动源'}
        </ControlButton>
        <ControlButton onClick={() => setVisible((value) => !value)}>
          {visible ? '移除拖动源' : '显示拖动源'}
        </ControlButton>
        <label>
          <input type="checkbox" checked={removeOnDrop} onChange={(event) => setRemoveOnDrop(event.target.checked)} />{' '}
          成功放置后移除源对象
        </label>
      </div>
      <DragDropProvider resetKey={version}>
        <div className={contractStyles.grid}>
          {visible && (
            <Source
              disabled={disabled}
              onEnd={(result) =>
                setEvents((current) => [
                  ...current,
                  result.status === 'dropped' ? 'dropped' : `cancelled: ${result.reason}`,
                ])
              }
            />
          )}
          <Target label="接收对象" accept={['example-object']} onReceive={receive} />
          <Target label="拒绝本次放置" accept={['example-object']} reject onReceive={receive} />
          <Target label="接收其他类型" accept={['example-material']} onReceive={receive} />
        </div>
        <Snapshot />
      </DragDropProvider>
      {isolated && (
        <DragDropProvider>
          <Target label="另一个区域的目标" accept={['example-object']} onReceive={receive} />
          <Snapshot />
        </DragDropProvider>
      )}
      <StatePanel label="已完成的操作" value={events} />
    </ContractFrame>
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
    <>
      <div ref={drop.ref} data-over={drop.isOver} className={cx(tile, contractStyles.stack)}>
        将系统文件拖到这里，查看文件名
        <input
          aria-label="选择本地文件"
          type="file"
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files ?? []).map((file) => file.name))}
        />
      </div>
      <StatePanel label="文件名" value={files} />
    </>
  )
}
function SystemFiles() {
  const [revision, setRevision] = useState(0)
  return (
    <ContractFrame
      title="拖入或选择系统文件"
      description="把系统文件拖入区域，或通过文件选择器选取文件。onFilesDrop 接收 File 列表，本例取出文件名显示；应用可在该回调中校验文件，再按自己的流程读取或上传。文件选择器也可通过键盘操作。"
      onReset={() => setRevision((value) => value + 1)}>
      <DragDropProvider key={revision}>
        <FilesBoundary />
      </DragDropProvider>
    </ContractFrame>
  )
}
export default {
  tags: ['autodocs'],
  title: 'Interaction/Drag and drop',
  parameters: {
    docs: {
      description: {
        component:
          '这组 hooks 用于应用内部对象的桌面拖放，例如把资源放入槽位或移动列表条目。DragDropProvider 划定一次拖放可以到达的区域，useDragSource 提供 type 和 data，useDropTarget 按 accept 接收并通过 onDrop 交给应用处理；源端 onEnd 报告放置或取消。跨区域传递需共享同一个 Provider；文件使用 onFilesDrop 接收，键盘移动入口由应用结合具体操作提供。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export const LifecycleStory: StoryObj = { name: 'Lifecycle', render: () => <Lifecycle /> }
export const ProviderIsolation: StoryObj = { render: () => <Lifecycle isolated /> }
export const Files: StoryObj = { render: () => <SystemFiles /> }

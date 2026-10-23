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
      Drag Cube
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
        Cancel drag
      </ControlButton>
      <StatePanel label="Drag session" value={state} />
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
      title={isolated ? 'Scoped drag sessions' : 'Drag lifecycle'}
      description="原生桌面拖放；只传递本Provider拥有的类型化数据。Escape、失焦、禁用、卸载与Reset结束会话。另一Provider不能接收此会话。集合组件另提供键盘移动操作。"
      onReset={() => {
        setVersion((value) => value + 1)
        setDisabled(false)
        setVisible(true)
        setRemoveOnDrop(false)
        setEvents([])
      }}>
      <div className={contractStyles.row}>
        <ControlButton onClick={() => setDisabled((value) => !value)}>
          {disabled ? 'Enable source' : 'Disable source'}
        </ControlButton>
        <ControlButton onClick={() => setVisible((value) => !value)}>
          {visible ? 'Unmount source' : 'Mount source'}
        </ControlButton>
        <label>
          <input type="checkbox" checked={removeOnDrop} onChange={(event) => setRemoveOnDrop(event.target.checked)} />{' '}
          Remove source after drop
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
          <Target label="Accept object" accept={['example-object']} onReceive={receive} />
          <Target label="Reject on drop" accept={['example-object']} reject onReceive={receive} />
          <Target label="Different type" accept={['example-material']} onReceive={receive} />
        </div>
        <Snapshot />
      </DragDropProvider>
      {isolated && (
        <DragDropProvider>
          <Target label="Other provider target" accept={['example-object']} onReceive={receive} />
          <Snapshot />
        </DragDropProvider>
      )}
      <StatePanel label="Completed events" value={events} />
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
        Drop system files here (names only)
        <input
          aria-label="Choose local files"
          type="file"
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files ?? []).map((file) => file.name))}
        />
      </div>
      <StatePanel label="File names" value={files} />
    </>
  )
}
function SystemFiles() {
  const [revision, setRevision] = useState(0)
  return (
    <ContractFrame
      title="Explicit system-file boundary"
      description="文件与内部payload分开接收；这里只显示文件名，不读取或上传内容。文件选择器提供键盘等价入口。"
      onReset={() => setRevision((value) => value + 1)}>
      <DragDropProvider key={revision}>
        <FilesBoundary />
      </DragDropProvider>
    </ContractFrame>
  )
}
export default { title: 'Interaction/Drag and drop', parameters: { layout: 'fullscreen' } } satisfies Meta
export const LifecycleStory: StoryObj = { name: 'Lifecycle', render: () => <Lifecycle /> }
export const ProviderIsolation: StoryObj = { render: () => <Lifecycle isolated /> }
export const Files: StoryObj = { render: () => <SystemFiles /> }

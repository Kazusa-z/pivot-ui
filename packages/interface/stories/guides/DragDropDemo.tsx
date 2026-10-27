import { useState } from 'react'
import {
  DragDropProvider,
  useDragDropCancel,
  useDragDropState,
  useDragSource,
  useDropTarget,
} from '../../src/interaction/drag-drop'
import { Button } from '../../src/controls/buttons'
import { css } from '../../styled-system/css'

const gridClass = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 'var(--space-2)',
  margin: 'var(--space-3) 0',
})
const tileClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '64px',
  padding: 'var(--space-2)',
  borderRadius: 'var(--radii-controlMd)',
  fontSize: 'var(--fontSizes-control)',
  color: 'var(--colors-text)',
  textAlign: 'center',
  userSelect: 'none',
})
const sourceClass = css({
  border: '1px solid var(--colors-border)',
  backgroundColor: 'var(--colors-surfaceRaised)',
  cursor: 'grab',
  '&[data-dragging]': { opacity: 0.5, cursor: 'grabbing' },
})
const targetClass = css({
  border: '1px dashed var(--colors-borderStrong)',
  backgroundColor: 'var(--colors-surface)',
  '&[data-over]': {
    borderStyle: 'solid',
    borderColor: 'var(--colors-primary)',
    backgroundColor: 'var(--colors-selectionSubtleBg)',
  },
})
const previewClass = css({
  position: 'fixed',
  top: '-1000px',
  left: '-1000px',
  padding: 'var(--space-1) var(--space-2)',
  borderRadius: 'var(--radii-controlMd)',
  border: '1px solid var(--colors-border)',
  backgroundColor: 'var(--colors-surfaceRaised)',
  fontSize: 'var(--fontSizes-control)',
})
const footerClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  fontSize: 'var(--fontSizes-control)',
  color: 'var(--colors-textMuted)',
})

function Source({ onResult }: { onResult: (text: string) => void }) {
  const source = useDragSource<{ id: string }>({
    type: 'demo/object',
    data: { id: 'Cube' },
    onEnd: (result) => onResult(result.status === 'dropped' ? '已放置' : `已取消：${result.reason}`),
  })
  return (
    <>
      <div ref={source.ref} data-dragging={source.isDragging || undefined} className={`${tileClass} ${sourceClass}`}>
        拖动 Cube
      </div>
      <div ref={source.previewRef} aria-hidden className={previewClass}>
        Cube
      </div>
    </>
  )
}

function Target({
  label,
  accept,
  reject,
  onResult,
}: {
  label: string
  accept: string[]
  reject?: boolean
  onResult: (text: string) => void
}) {
  const target = useDropTarget<{ id: string }>({
    accept,
    onDrop: ({ data }) => {
      if (reject) {
        onResult(`${label} 拒绝了 ${data.id}`)
        return false
      }
      onResult(`${label} 收到了 ${data.id}`)
    },
  })
  return (
    <div ref={target.ref} data-over={target.isOver || undefined} className={`${tileClass} ${targetClass}`}>
      {label}
    </div>
  )
}

function Status({ drop, end }: { drop: string; end: string }) {
  const state = useDragDropState()
  const cancel = useDragDropCancel()
  return (
    <div className={footerClass}>
      <span>状态：{state.phase}</span>
      {drop && <span>{drop}</span>}
      {end && <span>源：{end}</span>}
      <Button size="xs" variant="outline" disabled={state.phase === 'idle'} onClick={() => cancel('escape')}>
        取消拖动
      </Button>
    </div>
  )
}

/** One source and three targets: accepts, refuses in onDrop, and accepts a different type. */
export function DragDropDemo() {
  const [drop, setDrop] = useState('')
  const [end, setEnd] = useState('')
  return (
    <DragDropProvider>
      <div className={gridClass}>
        <Source
          onResult={(text) => {
            setEnd(text)
            if (text !== '已放置') setDrop('')
          }}
        />
        <Target label="接受" accept={['demo/object']} onResult={setDrop} />
        <Target label="onDrop 返回 false" accept={['demo/object']} reject onResult={setDrop} />
        <Target label="只接受 demo/material" accept={['demo/material']} onResult={setDrop} />
      </div>
      <Status drop={drop} end={end} />
    </DragDropProvider>
  )
}

function FileTarget() {
  const [files, setFiles] = useState<string[]>([])
  const target = useDropTarget<never>({
    accept: [],
    onDrop: () => false,
    onFilesDrop: (incoming) => setFiles(incoming.map((file) => file.name)),
  })
  return (
    <div className={gridClass}>
      <div ref={target.ref} data-over={target.isOver || undefined} className={`${tileClass} ${targetClass}`}>
        {files.length ? files.join('、') : '把系统文件拖到这里'}
      </div>
    </div>
  )
}

/** A target that only takes files from the operating system. */
export function FileDropDemo() {
  return (
    <DragDropProvider>
      <FileTarget />
    </DragDropProvider>
  )
}

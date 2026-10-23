import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BezierCurveEditor, type IPoint } from './'

const initial: IPoint[] = [
  { x: 0, y: 0 },
  { x: 0.15, y: 0.15 },
  { x: 0.75, y: 0.75 },
  { x: 1, y: 1 },
]
const meta = {
  title: 'Inputs/BezierCurveEditor',
  component: BezierCurveEditor,
} satisfies Meta<typeof BezierCurveEditor>
export default meta
type Story = StoryObj<typeof meta>

function Example({ controlled = false, linear = false }: { controlled?: boolean; linear?: boolean }) {
  const [points, setPoints] = useState(initial)
  const [scale, setScale] = useState(1)
  const [epoch, setEpoch] = useState(0)
  return (
    <div style={{ width: 420, maxWidth: '100%', display: 'grid', gap: 12 }}>
      <p>Compatibility entry. Curve selection, view and Y display scale do not change the stored points.</p>
      <button
        onClick={() => {
          setPoints(initial)
          setScale(1)
          setEpoch((value) => value + 1)
        }}>
        Reset
      </button>
      <BezierCurveEditor
        key={epoch}
        algo={linear ? 'linear' : 'bezier'}
        value={controlled ? points : undefined}
        defaultValue={initial}
        onChange={setPoints}
        yTickScale={scale}
        onYTickScaleChange={setScale}
      />
      <pre aria-label="Legacy curve value" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {JSON.stringify(points, null, 2)}
      </pre>
    </div>
  )
}
export const Overview: Story = { render: () => <Example /> }
export const Controlled: Story = { render: () => <Example controlled /> }
export const Uncontrolled: Story = { render: () => <Example linear /> }

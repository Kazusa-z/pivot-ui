import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Callout, Progress, Spin } from '../src/widgets/feedback'
import { Button } from '../src/widgets/buttons'
import { ContractFrame, ControlField, ControlInput, StatePanel, contractStyles } from './support/ContractFrame'

function CalloutExample() {
  const [saved, setSaved] = useState(false)
  return (
    <ContractFrame
      title="Callout"
      description="视觉 severity 和语义 role 分开。普通说明默认 note；动态结果显式选择 status；紧急信息才使用 alert。长内容保持换行与可选择。"
      onReset={() => setSaved(false)}>
      {(['info', 'warning', 'error', 'success'] as const).map((severity) => (
        <Callout key={severity} severity={severity} title={`${severity} note`} icon={<span>ⓘ</span>}>
          This is descriptive content. A longer explanation can wrap without clipping in a narrow inspector.
        </Callout>
      ))}
      <Button onClick={() => setSaved(true)}>Save</Button>
      <Callout role="status" severity={saved ? 'success' : 'info'}>
        {saved ? 'Saved successfully.' : 'No changes saved.'}
      </Callout>
      <Callout role="alert" severity="error" title="Explicit alert">
        This example deliberately requests an assertive announcement.
      </Callout>
      <StatePanel label="Status" value={{ saved }} />
    </ContractFrame>
  )
}

function ProgressExample() {
  const [value, setValue] = useState(50)
  const [max, setMax] = useState(200)
  const [indeterminate, setIndeterminate] = useState(false)
  return (
    <ContractFrame
      title="Progress"
      description="50 / 200 应为 25%，视觉宽度与 ARIA 数值使用同一范围。Indeterminate 不发布 aria-valuenow；无动画的条纹表示进度未知。"
      onReset={() => {
        setValue(50)
        setMax(200)
        setIndeterminate(false)
      }}>
      <div className={contractStyles.row}>
        <ControlField label="Value">
          <ControlInput
            type="number"
            value={value}
            onChange={(event) => {
              if (Number.isFinite(event.currentTarget.valueAsNumber)) setValue(event.currentTarget.valueAsNumber)
            }}
          />
        </ControlField>
        <ControlField label="Max">
          <ControlInput
            type="number"
            min={1}
            value={max}
            onChange={(event) => {
              const next = event.currentTarget.valueAsNumber
              if (Number.isFinite(next) && next > 0) setMax(next)
            }}
          />
        </ControlField>
        <label>
          <input
            type="checkbox"
            checked={indeterminate}
            onChange={(event) => setIndeterminate(event.currentTarget.checked)}
          />{' '}
          Indeterminate
        </label>
      </div>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Progress key={size} size={size} label={`${size} progress`} value={indeterminate ? null : value} max={max} />
      ))}
      <StatePanel
        label="Progress model"
        value={{
          value: indeterminate ? null : value,
          max,
          percentage: indeterminate ? null : (Math.max(0, Math.min(max, value)) / max) * 100,
        }}
      />
    </ContractFrame>
  )
}

function SpinExample() {
  return (
    <ContractFrame
      title="Spin"
      description="独立 Spin 提供 Loading 名称；在已有 busy 状态的按钮内部使用 decorative。系统 prefers-reduced-motion 开启时停止转动，保留静态标识。"
      onReset={() => {}}>
      <div className={contractStyles.row}>
        <Spin size="xs" label="Loading thumbnail" />
        <Spin size="sm" label="Loading asset" />
        <Spin size="md" label="Loading scene" />
        <Spin color="default" label="Default loading" />
        <span style={{ color: 'var(--colors-successText)' }}>
          <Spin color="inherit" label="Inherited loading" />
        </span>
        <Spin decorative />
      </div>
      <Button loading>Loading button</Button>
    </ContractFrame>
  )
}

const meta = { title: 'Widgets/Feedback', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Callouts: Story = { render: () => <CalloutExample /> }
export const ProgressRange: Story = { render: () => <ProgressExample /> }
export const LoadingIndicators: Story = { render: () => <SpinExample /> }

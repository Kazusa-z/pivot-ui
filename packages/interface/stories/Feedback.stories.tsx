import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Callout, Progress, Spin } from '../src/widgets/feedback'
import { Button } from '../src/widgets/buttons'
import { ContractFrame, ControlField, ControlInput, StatePanel, contractStyles } from './support/ContractFrame'

function CalloutExample() {
  const [saved, setSaved] = useState(false)
  return (
    <ContractFrame
      title="在内容旁展示说明和结果"
      description="Callout 适合把说明或操作结果放在相关内容旁。severity 决定颜色，role 决定辅助技术的播报方式：普通说明用 note，保存结果用 status，紧急错误用 alert。点击 Save 可更新结果说明。"
      onReset={() => setSaved(false)}>
      {(['info', 'warning', 'error', 'success'] as const).map((severity) => (
        <Callout key={severity} severity={severity} title={`${severity} note`} icon={<span>ⓘ</span>}>
          说明文字会随容器宽度换行，适合放在窄侧栏中帮助理解当前操作。
        </Callout>
      ))}
      <Button onClick={() => setSaved(true)}>Save</Button>
      <Callout role="status" severity={saved ? 'success' : 'info'}>
        {saved ? 'Saved successfully.' : 'No changes saved.'}
      </Callout>
      <Callout role="alert" severity="error" title="Explicit alert">
        需要立即处理的错误可以使用 alert，让辅助技术及时播报。
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
      title="展示任务完成比例"
      description="Progress 根据 value 与 max 显示任务完成比例，例如 50 / 200 为 25%。应用在任务推进时更新 value；完成量未知时将 value 设为 null，以条纹表示等待，并省略具体进度播报。"
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
      title="提示正在加载"
      description="Spin 用于提示正在加载。独立使用时提供描述任务的 label；放在已有名称和 busy 状态的按钮里时可设 decorative。系统开启减少动态效果后，图标以静态形式保留加载提示。"
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

const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Feedback',
  parameters: {
    docs: {
      description: {
        component:
          'Callout 显示持续可见的说明或结果，Progress 显示任务进度，Spin 表示正在等待。应用更新这些组件的内容和状态；它们适合与保存、加载或校验流程一起使用。根据消息紧急程度选择 note、status 或 alert；已有名称和忙碌状态的控件内部可把加载图标设为 decorative。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Callouts: Story = { render: () => <CalloutExample /> }
export const ProgressRange: Story = { render: () => <ProgressExample /> }
export const LoadingIndicators: Story = { render: () => <SpinExample /> }

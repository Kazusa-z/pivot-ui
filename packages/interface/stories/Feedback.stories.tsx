import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IconAlertCircle, IconAlertTriangle, IconCircleCheck, IconInfoCircle } from '@tabler/icons-react'
import { Callout, Progress, Spin } from '../src/display/feedback'
import { Button } from '../src/controls/buttons'
import { Checkbox } from '../src/controls/choices/Checkbox'
import { NumberInput } from '../src/controls/inputs/NumberInput'
import { Text } from '../src/foundation/typography'
import { css } from '../styled-system/css'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryField,
  StoryGrid,
  StoryCode,
  StoryState,
} from './support/StoryPage'

const severities = [
  { severity: 'info', title: 'Info', icon: <IconInfoCircle /> },
  { severity: 'warning', title: 'Warning', icon: <IconAlertTriangle /> },
  { severity: 'error', title: 'Error', icon: <IconAlertCircle /> },
  { severity: 'success', title: 'Success', icon: <IconCircleCheck /> },
] as const

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Callout 显示持续可见的说明或结果，Progress 显示任务进度，Spin 表示等待。根据消息紧急程度选择 note、status 或 alert；已有名称和忙碌状态的控件内部可把加载图标设为 decorative。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Widgets/Feedback',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function FeedbackExample() {
  const [saved, setSaved] = useState(false)
  const [value, setValue] = useState(50)
  const [max, setMax] = useState(200)
  const [indeterminate, setIndeterminate] = useState(false)
  return (
    <StoryPage
      eyebrow="Widgets"
      title="Feedback"
      summary="用持续可见的提示、进度和加载状态解释系统正在发生什么。组件只负责展示，任务状态由应用更新。"
      meta={
        <>
          <span>Callout</span>
          <span>·</span>
          <span>Progress</span>
          <span>·</span>
          <span>Spin</span>
        </>
      }>
      <StorySection
        title="Callouts"
        description="四种 severity 使用统一的语义状态色；标题说明性质，正文给出可执行信息。">
        <div className={css({ display: 'grid', gap: 'var(--space-2)' })}>
          {severities.map(({ severity, title, icon }) => (
            <Callout key={severity} severity={severity} title={title} icon={icon}>
              说明文字会随容器宽度换行，适合放在窄侧栏中帮助理解当前操作。
            </Callout>
          ))}
        </div>
      </StorySection>

      <StorySection
        title="Roles"
        description="role 决定读屏器播报方式：普通说明 note，保存结果 status，紧急错误 alert。">
        <StoryCard>
          <StoryRow>
            <Button onClick={() => setSaved(true)}>Save changes</Button>
            <Button variant="outline" onClick={() => setSaved(false)}>
              Discard
            </Button>
          </StoryRow>
          <Callout role="status" severity={saved ? 'success' : 'info'}>
            {saved ? 'Saved successfully.' : 'No changes saved.'}
          </Callout>
          <Callout role="alert" severity="error" title="Explicit alert">
            需要立即处理的错误可以使用 alert，让辅助技术及时播报。
          </Callout>
        </StoryCard>
      </StorySection>

      <StorySection title="Progress" description="value / max 决定比例；value 为 null 时显示不确定进度。">
        <StoryCard>
          <StoryRow align="end">
            <StoryField label="Value">
              <NumberInput
                aria-label="Progress value"
                value={value}
                min={0}
                max={max}
                onValueChange={(next) => setValue(next)}
              />
            </StoryField>
            <StoryField label="Max">
              <NumberInput
                aria-label="Progress max"
                value={max}
                min={1}
                onValueChange={(next) => setMax(Math.max(1, next))}
              />
            </StoryField>
            <Checkbox checked={indeterminate} onCheckedChange={setIndeterminate} label="Indeterminate" size="md" />
          </StoryRow>
          <div className={css({ display: 'grid', gap: 'var(--space-3)' })}>
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <div key={size} className={css({ display: 'grid', gap: 'var(--space-1)' })}>
                <Text size="xs" tone="muted">
                  {size}
                </Text>
                <Progress size={size} label={`${size} progress`} value={indeterminate ? null : value} max={max} />
              </div>
            ))}
          </div>
          <Text size="sm" tone="muted">
            {indeterminate ? 'Indeterminate' : `${Math.round((Math.max(0, Math.min(max, value)) / max) * 100)}%`}
          </Text>
        </StoryCard>
      </StorySection>

      <StorySection title="Spin" description="独立使用时提供 label；放在已有忙碌状态的控件里时设 decorative。">
        <StoryCard>
          <StoryRow>
            <Spin size="xs" label="Loading thumbnail" />
            <Spin size="sm" label="Loading asset" />
            <Spin size="md" label="Loading scene" />
            <Spin color="default" label="Default loading" />
            <span style={{ color: 'var(--colors-successText)' }}>
              <Spin color="inherit" label="Inherited loading" />
            </span>
            <Spin decorative />
            <Button loading>Loading button</Button>
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<Callout severity="warning" title="Unsaved changes">
  Save before switching objects.
</Callout>

<Progress value={done} max={total} />

<Spin label="Loading scene" />`}
          />
          <StoryCard title="Notes">
            <Text size="sm" tone="muted">
              Callout 是持续可见的说明，不替代对话框；Progress 的 value=null 表示未知进度；Spin 的 label
              只在独立使用时需要。
            </Text>
          </StoryCard>
        </StoryGrid>
      </StorySection>
      <StoryState
        label="Progress model"
        value={{
          value: indeterminate ? null : value,
          max,
          percentage: indeterminate ? null : (Math.max(0, Math.min(max, value)) / max) * 100,
        }}
      />
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <FeedbackExample /> }

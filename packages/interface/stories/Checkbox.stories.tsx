import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox, type CheckboxState } from '../src/widgets/choices/Checkbox'
import { Button } from '../src/widgets/buttons'
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
  StoryKeyboard,
} from './support/StoryPage'

const sizes = [
  { size: 'sm', label: 'sm · 14px' },
  { size: 'md', label: 'md · 18px' },
  { size: 'lg', label: 'lg · 22px' },
] as const

const meta = {
  title: 'Widgets/Choices/Checkbox',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Checkbox 用于切换单个布尔选项，也能展示多个对象值不一致的混合状态。checked 接受 true、false 或 indeterminate；用户激活始终请求布尔值，由应用决定是否回写。readOnly 保留查看与聚焦，disabled 表示整个控件暂不可用。',
      },
    },
  },
  component: Checkbox,
} satisfies Meta<typeof Checkbox>
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = { render: () => <CheckboxPage /> }

function CheckboxPage() {
  const [visible, setVisible] = useState(true)
  const [mixed, setMixed] = useState<CheckboxState>('indeterminate')
  const [requests, setRequests] = useState<boolean[]>([])
  const [uncontrolledKey, setUncontrolledKey] = useState(0)
  const [lastRequest, setLastRequest] = useState<boolean | null>(null)

  const reset = () => {
    setVisible(true)
    setMixed('indeterminate')
    setRequests([])
    setUncontrolledKey((value) => value + 1)
    setLastRequest(null)
  }

  return (
    <StoryPage
      eyebrow="Widgets / Choices"
      title="Checkbox"
      summary="单个布尔选项的开关。受控用法把 checked 和 onCheckedChange 连到应用状态；混合状态只影响显示，用户第一次激活仍请求 true。"
      meta={
        <>
          <span>boolean / indeterminate</span>
          <span>·</span>
          <span>readOnly / disabled</span>
          <span>·</span>
          <span>label association</span>
        </>
      }
      actions={
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
      }>
      <StorySection
        title="Variants"
        description="选中显示勾，混合显示短横线；提供 label 时点击文字也能切换，并自动建立标签关联。">
        <StoryGrid>
          <StoryCard title="Unchecked">
            <Checkbox aria-label="Unchecked checkbox" />
          </StoryCard>
          <StoryCard title="Checked">
            <Checkbox aria-label="Checked checkbox" defaultChecked />
          </StoryCard>
          <StoryCard title="Indeterminate">
            <Checkbox aria-label="Indeterminate checkbox" checked="indeterminate" />
          </StoryCard>
          <StoryCard title="With label">
            <Checkbox label="Visible in viewport" defaultChecked size="md" />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Sizes"
        description="Checkbox 的尺寸是选择框本身 14/18/22px，不是 20/24/32px 的控件高度。放在紧凑行（24px）或常规行（32px）时，选择框建议分别使用 sm/md。">
        <StoryCard>
          <StoryRow align="start">
            {sizes.map(({ size, label }) => (
              <StoryField key={size} label={label}>
                <Checkbox size={size} aria-label={`${label} checkbox`} defaultChecked />
              </StoryField>
            ))}
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="States"
        description="disabled 移出键盘焦点并降低不透明度；readOnly 仍可聚焦查看，但拒绝修改。Checkbox 没有 invalid 外观，校验错误由外层字段展示。">
        <StoryGrid>
          <StoryCard title="Default">
            <Checkbox label="Default" defaultChecked />
          </StoryCard>
          <StoryCard title="Disabled">
            <Checkbox label="Disabled" defaultChecked disabled />
          </StoryCard>
          <StoryCard title="Read only">
            <Checkbox
              label="Read only"
              defaultChecked
              readOnly
              onCheckedChange={(next) => setRequests((current) => [...current, next])}
            />
          </StoryCard>
          <StoryCard title="Mixed">
            <Checkbox label="Enabled on selected objects" checked={mixed} onCheckedChange={(next) => setMixed(next)} />
            <Text size="sm" tone="muted">
              state: {String(mixed)}
            </Text>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Controlled and uncontrolled"
        description="受控时由应用回写 checked；非受控时组件保存内部状态，可用 key 重建实例恢复初始值。">
        <StoryGrid>
          <StoryCard title="Controlled" description="checked 与 onCheckedChange 连接 React state。">
            <Checkbox label="Visible in viewport" checked={visible} onCheckedChange={setVisible} size="md" />
            <Text size="sm" tone="muted">
              checked: {String(visible)}
            </Text>
          </StoryCard>
          <StoryCard title="Uncontrolled" description="defaultChecked 只在首次渲染使用；key 变化会重建实例。">
            <div key={uncontrolledKey}>
              <Checkbox
                label="Remember this setting"
                defaultChecked
                size="md"
                onCheckedChange={(next) => setLastRequest(next)}
              />
            </div>
            <StoryRow>
              <Button size="sm" variant="outline" onClick={() => setUncontrolledKey((value) => value + 1)}>
                Reset instance
              </Button>
              <Text size="sm" tone="muted">
                last request: {String(lastRequest)}
              </Text>
            </StoryRow>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection
        title="Rejected by parent"
        description="应用可以记录请求但保留原值；本例保持 checked=false，观察请求列表而不接受修改。">
        <StoryCard>
          <Checkbox
            label="Rejected by parent"
            checked={false}
            onCheckedChange={(next) => setRequests((current) => [...current, next])}
            size="md"
          />
          <Text size="sm" tone="muted">
            控件保持未选中，请求仍会被记录。
          </Text>
        </StoryCard>
        <StoryState label="Checkbox state" value={{ visible, mixed, requests, lastRequest }} />
      </StorySection>

      <StorySection
        title="Keyboard and accessibility"
        description="Space 切换；label 建立关联；indeterminate 只是显示状态。">
        <StoryKeyboard
          rows={[
            { keys: 'Space', action: '切换当前布尔值（readOnly 除外）' },
            { keys: 'Tab', action: '把焦点移到控件或相邻字段' },
          ]}
        />
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const [visible, setVisible] = useState(true)

<Checkbox
  label="Visible in viewport"
  checked={visible}
  onCheckedChange={setVisible}
/>

<Checkbox
  label="Enabled on selected objects"
  checked="indeterminate"
/>`}
          />
          <StoryProps
            rows={[
              { name: 'checked', type: 'boolean | "indeterminate"', description: '受控值；indeterminate 只影响显示。' },
              { name: 'defaultChecked', type: 'boolean', defaultValue: 'false', description: '非受控初始值。' },
              {
                name: 'onCheckedChange',
                type: '(checked: boolean) => void',
                description: '用户激活请求；混合状态首次请求 true。',
              },
              { name: 'readOnly', type: 'boolean', defaultValue: 'false', description: '可聚焦查看，拒绝修改。' },
              { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '移出焦点顺序并降低不透明度。' },
              { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'sm'", description: '选择框 14/18/22px。' },
              { name: 'label', type: 'ReactNode', description: '提供时建立 label 关联。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  )
}

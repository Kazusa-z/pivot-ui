import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Kbd, KbdGroup } from '../src/display/Kbd'
import { Input } from '../src/controls/inputs/Input'
import { Button } from '../src/controls/buttons'
import { Text } from '../src/foundation/typography'
import { formatShortcut } from '../src/values/shortcut'
import { css } from '../styled-system/css'
import { StoryPage, StorySection, StoryCard, StoryRow, StoryField, StoryGrid, StoryCode } from './support/StoryPage'

const normalization = [
  { label: 'extra spaces', value: ' Ctrl + SHIFT + d ' },
  { label: 'explicit tokens', value: [' Ctrl ', 'SHIFT', 'd'] },
  { label: 'named keys', value: ' Command + Option + Enter ' },
  { label: 'symbols', value: ['Ctrl', '+'] },
  { label: 'comma', value: 'Ctrl+Comma' },
  { label: 'lower case', value: 'foo + BAR' },
]

const gestures = ['shift + mld', 'mrd,mdd', 'touch-one + touch-two']

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Kbd 显示单个键名，KbdGroup 组合快捷键或鼠标、触摸手势。KbdGroup 统一空格、大小写和常见按键名称；size 控制密度。快捷键监听和执行由应用注册。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Display/Kbd',
  component: KbdGroup,
} satisfies Meta<typeof KbdGroup>
export default meta
type Story = StoryObj<typeof meta>

function ShortcutExample() {
  const [value, setValue] = useState(' Ctrl + Shift + d ')
  return (
    <StoryPage
      eyebrow="Display"
      title="Kbd"
      summary="把快捷键和手势显示成紧凑的键帽。解析和展示由组件负责，实际键盘事件由应用注册。"
      meta={
        <>
          <span>keys</span>
          <span>·</span>
          <span>gestures</span>
          <span>·</span>
          <span>Ctrl / ⌘</span>
        </>
      }>
      <StorySection title="Shortcut" description="输入文字即时解析；非法或空白输入不显示键帽。">
        <StoryCard>
          <StoryRow align="end">
            <StoryField label="Shortcut text" hint="Space-separated or array input">
              <Input aria-label="Shortcut text" value={value} onValueChange={setValue} />
            </StoryField>
            <Button variant="outline" onClick={() => setValue(' Ctrl + Shift + d ')}>
              Reset
            </Button>
          </StoryRow>
          <KbdGroup shortcuts={value} />
          <Text size="sm" tone="muted">
            {formatShortcut(value)
              .map((token) => token.label)
              .join(' + ') || 'No shortcut'}
          </Text>
        </StoryCard>
      </StorySection>

      <StorySection title="Normalization" description="别名、大小写和多余空格会被统一；应用只负责注册实际快捷键。">
        <StoryGrid>
          {normalization.map((item) => (
            <StoryCard key={item.label} title={item.label}>
              <KbdGroup shortcuts={item.value} />
            </StoryCard>
          ))}
          <StoryCard title="preserve case">
            <KbdGroup shortcuts="foo + BAR" letterCase="preserve" />
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection title="Sizes" description="键帽随快捷键密度选择尺寸；同一组内保持一致。">
        <StoryCard>
          <StoryRow>
            {(['xs', 'sm', 'md'] as const).map((size) => (
              <div key={size} className={css({ display: 'grid', gap: 'var(--space-1)' })}>
                <Text size="xs" tone="muted">
                  {size}
                </Text>
                <KbdGroup shortcuts="Ctrl+Shift+MLD" size={size} />
              </div>
            ))}
          </StoryRow>
          <Text size="sm" tone="muted">
            <Kbd letterCase="preserve">Escape</Kbd> 用于关闭当前弹出面板。
          </Text>
        </StoryCard>
      </StorySection>

      <StorySection title="Gestures" description="鼠标和触摸手势使用图标 + 修饰键；图标旁边保留可访问名称。">
        <StoryGrid>
          {gestures.map((gesture) => (
            <StoryCard key={gesture} title={gesture}>
              <KbdGroup shortcuts={gesture} />
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection title="Usage">
        <StoryCode
          label="tsx"
          code={`<KbdGroup shortcuts="Ctrl+Shift+D" />
<KbdGroup shortcuts={['Ctrl', 'K']} size="sm" />
<Kbd>Esc</Kbd>`}
        />
      </StorySection>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <ShortcutExample /> }

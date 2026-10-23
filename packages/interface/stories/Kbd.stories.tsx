import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { css } from '../styled-system/css'
import { Kbd, KbdGroup } from '../src/widgets/display/Kbd'
import { formatShortcut } from '../src/values/shortcut'

const stack = css({ display: 'flex', flexDirection: 'column', gap: '12px', width: 'min(440px, 90vw)' })
const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Kbd 显示单个键名，KbdGroup 用于组合快捷键或鼠标、触摸手势提示。KbdGroup 的 shortcuts 接受字符串或数组，并统一空格、大小写和常见按键名称；size 控制提示密度。快捷键监听和执行由应用注册，提示文字应与应用的实际快捷键配置保持一致。',
      },
    },
  },
  title: 'Display/Kbd',
  component: KbdGroup,
} satisfies Meta<typeof KbdGroup>
export default meta
type Story = StoryObj<typeof meta>

function ShortcutExample() {
  const [value, setValue] = useState(' Ctrl + Shift + d ')
  return (
    <div className={stack}>
      <label>
        Shortcut text <input value={value} onChange={(event) => setValue(event.target.value)} />
      </label>
      <KbdGroup shortcuts={value} />
      <output>
        {formatShortcut(value)
          .map((token) => token.label)
          .join(' + ') || 'No shortcut'}
      </output>
      <button type="button" onClick={() => setValue(' Ctrl + Shift + d ')}>
        Reset
      </button>
      <p>修改输入文字可查看快捷键提示的排版；应用应另外注册相应的键盘事件处理。</p>
    </div>
  )
}

export const Overview: Story = { render: () => <ShortcutExample /> }

export const Normalization: Story = {
  render: () => (
    <div className={stack}>
      <KbdGroup shortcuts=" Ctrl + SHIFT + d " />
      <KbdGroup shortcuts={[' Ctrl ', 'SHIFT', 'd']} />
      <KbdGroup shortcuts=" Command + Option + Enter " />
      <KbdGroup shortcuts={['Ctrl', '+']} />
      <KbdGroup shortcuts="Ctrl++" />
      <KbdGroup shortcuts="Ctrl+Comma" />
      <KbdGroup shortcuts="foo + BAR" letterCase="lower" />
      <KbdGroup shortcuts="foo + BAR" letterCase="preserve" />
      <KbdGroup shortcuts="   " />
    </div>
  ),
}

export const Gestures: Story = {
  render: () => (
    <div className={stack}>
      <KbdGroup shortcuts="shift + mld" />
      <KbdGroup shortcuts={['SHIFT', 'MLD']} />
      <KbdGroup shortcuts="mrd,mdd" />
      <KbdGroup shortcuts={['of', 'TF']} />
      <KbdGroup shortcuts="touch-one + touch-two" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className={stack}>
      <KbdGroup shortcuts="Ctrl+Shift+MLD" size="xs" />
      <KbdGroup shortcuts="Ctrl+Shift+MLD" size="sm" />
      <KbdGroup shortcuts="Ctrl+Shift+MLD" size="md" />
      <span>
        <Kbd letterCase="preserve">Escape</Kbd> 用于关闭当前弹出面板。
      </span>
    </div>
  ),
}

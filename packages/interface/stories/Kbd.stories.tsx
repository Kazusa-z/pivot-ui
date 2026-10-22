import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { css } from '../styled-system/css'
import { Kbd, KbdGroup } from '../src/widgets/display/Kbd'
import { formatShortcut } from '../src/values/shortcut'

const stack = css({ display: 'flex', flexDirection: 'column', gap: '12px', width: 'min(440px, 90vw)' })
const meta = { title: 'Display/Kbd', component: KbdGroup } satisfies Meta<typeof KbdGroup>
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
      <p>This example formats text only; it does not register a shortcut.</p>
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
        <Kbd letterCase="preserve">Escape</Kbd> closes the active popup.
      </span>
    </div>
  ),
}

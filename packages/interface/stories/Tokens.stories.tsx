import type { Meta, StoryObj } from '@storybook/react'
import { css } from '@pivot-ui/react/styling/css'
import { styled } from '@pivot-ui/react/styling/jsx'
import { token } from '@pivot-ui/react/styling/tokens'

const Frame = styled('section', {
  base: {
    width: 'min(680px, calc(100vw - 40px))',
    display: 'grid',
    gap: '16px',
    color: 'var(--colors-text)',
    fontFamily: 'var(--fonts-default)',
    padding: '20px',
    border: '1px solid',
    borderColor: 'var(--colors-border)',
    borderRadius: '8px',
  },
})

const swatches = ['appBg', 'panelBg', 'primary', 'text', 'textMuted', 'border'] as const

function TokenCatalog() {
  return (
    <Frame aria-label="Design tokens">
      <h2 className={css({ margin: '0', fontSize: '18px' })}>Shared design tokens</h2>
      <p className={css({ margin: '0', color: 'var(--colors-textMuted)', lineHeight: '1.6' })}>
        Use the theme toolbar to compare light and dark values. These styles are extracted through the public styling
        entry points and the shared Panda preset.
      </p>
      <div className={css({ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' })}>
        {swatches.map((name) => (
          <div key={name}>
            <div
              aria-hidden="true"
              className={css({
                height: '48px',
                border: '1px solid',
                borderColor: 'var(--colors-border)',
                borderRadius: '4px',
              })}
              style={{ background: token.var(`colors.${name}`) }}
            />
            <code>{name}</code>
          </div>
        ))}
      </div>
      <div className={css({ display: 'flex', alignItems: 'end', gap: '8px' })}>
        {[4, 8, 16, 24, 32].map((size) => (
          <div key={size} className={css({ display: 'grid', gap: '4px', justifyItems: 'center' })}>
            <div style={{ width: size, height: size, background: token.var('colors.primary') }} />
            <code>{size}px</code>
          </div>
        ))}
      </div>
    </Frame>
  )
}

const meta = { title: 'Foundation/Tokens', component: TokenCatalog } satisfies Meta<typeof TokenCatalog>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = {}

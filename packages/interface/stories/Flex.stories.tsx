import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Flex, type FlexProps } from '../src/layout/Flex'
import { css } from '../styled-system/css'

const item = css({
  padding: '8px',
  border: '1px solid var(--colors-border)',
  background: 'var(--colors-surfaceSubtle)',
  borderRadius: '4px',
  minWidth: '64px',
})
const frame = css({
  width: 'min(420px, 85vw)',
  minHeight: '160px',
  padding: '8px',
  border: '1px solid var(--colors-border)',
})
const meta = { title: 'Layout/Flex', component: Flex } satisfies Meta<typeof Flex>
export default meta
type Story = StoryObj<typeof meta>

function FlexExample() {
  const [direction, setDirection] = useState<FlexProps['direction']>('row')
  const [align, setAlign] = useState<FlexProps['align']>('center')
  const [justify, setJustify] = useState<FlexProps['justify']>('between')
  return (
    <div>
      <Flex gap="sm" wrap="wrap" css={{ marginBottom: '12px' }}>
        <label>
          Direction{' '}
          <select value={direction} onChange={(event) => setDirection(event.target.value as FlexProps['direction'])}>
            <option>row</option>
            <option>column</option>
            <option>row-reverse</option>
            <option>column-reverse</option>
          </select>
        </label>
        <label>
          Align{' '}
          <select value={align} onChange={(event) => setAlign(event.target.value as FlexProps['align'])}>
            <option>start</option>
            <option>center</option>
            <option>end</option>
            <option>stretch</option>
            <option>baseline</option>
          </select>
        </label>
        <label>
          Justify{' '}
          <select value={justify} onChange={(event) => setJustify(event.target.value as FlexProps['justify'])}>
            <option>start</option>
            <option>center</option>
            <option>end</option>
            <option>between</option>
            <option>around</option>
            <option>evenly</option>
          </select>
        </label>
      </Flex>
      <Flex direction={direction} align={align} justify={justify} gap="sm" className={frame}>
        <div className={item}>First</div>
        <div className={item} style={{ minHeight: 60 }}>
          Second
        </div>
        <div className={item}>Third</div>
      </Flex>
      <output>
        Direction: {direction}; align: {align}; justify: {justify}
      </output>
      <button
        type="button"
        onClick={() => {
          setDirection('row')
          setAlign('center')
          setJustify('between')
        }}>
        Reset
      </button>
    </div>
  )
}
export const Overview: Story = { render: () => <FlexExample /> }
export const Directions: Story = {
  render: () => (
    <Flex direction="column" gap="lg">
      {(['row', 'column', 'row-reverse', 'column-reverse'] as const).map((direction) => (
        <div key={direction}>
          <p>{direction}</p>
          <Flex direction={direction} gap="xs">
            <span className={item}>One</span>
            <span className={item}>Two</span>
            <span className={item}>Three</span>
          </Flex>
        </div>
      ))}
    </Flex>
  ),
}
export const WrapAndLongContent: Story = {
  render: () => (
    <Flex direction="column" gap="lg" css={{ width: '240px' }}>
      <Flex gap="sm" wrap="wrap">
        {['Short', 'Another item', 'More content', 'Last item'].map((text) => (
          <span key={text} className={item}>
            {text}
          </span>
        ))}
      </Flex>
      <Flex gap="sm" align="start">
        <span className={item}>Label</span>
        <p className={css({ minWidth: 0, overflowWrap: 'anywhere' })}>
          A-long-unbroken-value-that-can-wrap-without-forcing-the-layout-to-grow
        </p>
      </Flex>
    </Flex>
  ),
}

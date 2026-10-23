import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ScrollArea, ScrollAreaRoot, ScrollAreaViewport } from '../src/widgets/display/ScrollArea'
import { Flex } from '../src/layout/Flex'
import { css } from '../styled-system/css'

const frame = css({
  width: 'min(340px, 85vw)',
  height: '220px',
  border: '1px solid var(--colors-border)',
  borderRadius: '4px',
})
const row = css({ padding: '12px', borderBottom: '1px solid var(--colors-border)', overflowWrap: 'anywhere' })
const meta = { title: 'Display/ScrollArea', component: ScrollArea } satisfies Meta<typeof ScrollArea>
export default meta
type Story = StoryObj<typeof meta>

function ScrollExample() {
  const rootRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [target, setTarget] = useState('No scroll event yet')
  const [count, setCount] = useState(12)
  return (
    <Flex direction="column" gap="sm">
      <Flex gap="sm" wrap="wrap">
        <button type="button" onClick={() => viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight })}>
          Scroll to bottom
        </button>
        <button type="button" onClick={() => viewportRef.current?.scrollTo({ top: 0 })}>
          Scroll to top
        </button>
        <button type="button" onClick={() => setCount((value) => (value === 12 ? 2 : 12))}>
          Toggle short content
        </button>
      </Flex>
      <ScrollAreaRoot ref={rootRef} className={frame} scrollbars="vertical" type="always" shadows>
        <ScrollAreaViewport
          ref={viewportRef}
          aria-label="Scrollable rows"
          onScroll={(event) => {
            setOffset(Math.round(event.currentTarget.scrollTop))
            setTarget(
              event.currentTarget === viewportRef.current && event.currentTarget !== rootRef.current
                ? 'Viewport event and ref agree'
                : 'Unexpected event target'
            )
          }}>
          {Array.from({ length: count }, (_, index) => (
            <div key={index} className={row}>
              Row {index + 1}: editable properties and contextual details
            </div>
          ))}
        </ScrollAreaViewport>
      </ScrollAreaRoot>
      <output>
        Scroll top: {offset}; {target}
      </output>
    </Flex>
  )
}
export const Overview: Story = { render: () => <ScrollExample /> }
export const Horizontal: Story = {
  render: () => (
    <ScrollArea
      className={frame}
      scrollbars="horizontal"
      type="always"
      shadows
      viewportProps={{ 'aria-label': 'Horizontal strip', contentLayout: 'intrinsic' }}>
      <Flex gap="md" css={{ width: '880px', padding: '16px' }}>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className={row}>
            Card {index + 1}
          </div>
        ))}
      </Flex>
    </ScrollArea>
  ),
}
export const BothAxes: Story = {
  render: () => (
    <ScrollArea
      className={frame}
      scrollbars="both"
      type="always"
      scrollbarVariant="track"
      shadows
      viewportProps={{ 'aria-label': 'Two dimensional content', contentLayout: 'intrinsic' }}>
      <div className={css({ width: '720px' })}>
        {Array.from({ length: 12 }, (_, index) => (
          <div key={index} className={row}>
            Wide row {index + 1}: column A — column B — column C — column D — column E
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}
function ContentHeightExample() {
  const [long, setLong] = useState(false)
  return (
    <Flex direction="column" gap="sm" css={{ width: '280px' }}>
      <button type="button" onClick={() => setLong((value) => !value)}>
        Toggle long content
      </button>
      <ScrollArea
        sizing="content"
        scrollbars="vertical"
        type="auto"
        shadows
        css={{ maxHeight: '180px', border: '1px solid var(--colors-border)' }}
        viewportProps={{ 'aria-label': 'Content sized scroll area' }}>
        {Array.from({ length: long ? 10 : 2 }, (_, index) => (
          <p key={index} className={row}>
            Content row {index + 1}
          </p>
        ))}
      </ScrollArea>
      <span>The viewport grows with content and stops at 180px.</span>
    </Flex>
  )
}
export const ContentHeight: Story = { render: () => <ContentHeightExample /> }

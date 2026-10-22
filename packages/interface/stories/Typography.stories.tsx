import type { Meta, StoryObj } from '@storybook/react'
import { css } from '../styled-system/css'
import { Text, Bold, Link, Title, type TextSize } from '../src/foundation/typography'

const stack = css({ display: 'flex', flexDirection: 'column', gap: '12px', width: 'min(480px, 90vw)' })

const meta = { title: 'Foundation/Typography', component: Text } satisfies Meta<typeof Text>
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <section className={stack}>
      <Title as="h1" size={3}>
        Typography
      </Title>
      <Text>
        A paragraph can contain <Bold>important text</Bold> and a{' '}
        <Link href="#typography-destination">working link</Link>.
      </Text>
      <Text tone="muted">Muted supporting text.</Text>
      <Text tone="strong">Strong text.</Text>
      <Text tone="danger">A readable error description.</Text>
      <Text as="code" monospace selectable>
        object.position.x = 2
      </Text>
      <Text as="del">Semantically deleted text</Text>
      <Text truncate title="This long value remains available in its native title" css={{ maxWidth: '180px' }}>
        This long value remains available in its native title
      </Text>
      <Text id="typography-destination">Link destination</Text>
    </section>
  ),
}

const textSizes: TextSize[] = ['xs', 'sm', 'md', 'lg', 'xl', 5]

export const Sizes: Story = {
  render: () => (
    <section className={stack}>
      {textSizes.map((size) => (
        <Text key={size} size={size}>
          Text size {size}
        </Text>
      ))}
    </section>
  ),
}

export const HeadingSemantics: Story = {
  render: () => (
    <section className={stack}>
      <Title as="h1" size={1}>
        Heading level 1, visual size 1
      </Title>
      <Title as="h2" size={4}>
        Heading level 2, visual size 4
      </Title>
      <Title as="h3" size={2}>
        Heading level 3, visual size 2
      </Title>
      <Text as="span" size={4}>
        A large span remains ordinary text
      </Text>
    </section>
  ),
}

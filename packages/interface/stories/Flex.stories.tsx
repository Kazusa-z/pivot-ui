import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Flex, type FlexProps } from '../src/layout/Flex'
import { Select } from '../src/controls/choices/Select'
import { Button } from '../src/controls/buttons'
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
  StoryProps,
  StoryState,
} from './support/StoryPage'

const item = css({
  padding: 'var(--space-2)',
  border: '1px solid var(--colors-border)',
  background: 'var(--colors-surfaceSubtle)',
  borderRadius: 'var(--radii-control)',
  minWidth: '64px',
  fontSize: 'var(--fontSizes-control)',
})
const frame = css({
  width: 'min(420px, 100%)',
  minHeight: '160px',
  padding: 'var(--space-2)',
  border: '1px solid var(--colors-border)',
  borderRadius: 'var(--radii-controlMd)',
})

const directionOptions = [
  { key: 'row', label: 'row', value: 'row' },
  { key: 'column', label: 'column', value: 'column' },
  { key: 'row-reverse', label: 'row-reverse', value: 'row-reverse' },
  { key: 'column-reverse', label: 'column-reverse', value: 'column-reverse' },
]
const alignOptions = [
  { key: 'start', label: 'start', value: 'start' },
  { key: 'center', label: 'center', value: 'center' },
  { key: 'end', label: 'end', value: 'end' },
  { key: 'stretch', label: 'stretch', value: 'stretch' },
  { key: 'baseline', label: 'baseline', value: 'baseline' },
]
const justifyOptions = [
  { key: 'start', label: 'start', value: 'start' },
  { key: 'center', label: 'center', value: 'center' },
  { key: 'end', label: 'end', value: 'end' },
  { key: 'between', label: 'between', value: 'between' },
  { key: 'around', label: 'around', value: 'around' },
  { key: 'evenly', label: 'evenly', value: 'evenly' },
]

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Flex 沿一个方向排列内容，并控制 gap、对齐和换行。direction 决定主轴，align/justify 控制交叉轴与主轴，wrap 控制换行；复杂尺寸和滚动交给外层容器或 css。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Layout/Flex',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function Playground() {
  const [direction, setDirection] = useState<NonNullable<FlexProps['direction']>>('row')
  const [align, setAlign] = useState<NonNullable<FlexProps['align']>>('center')
  const [justify, setJustify] = useState<NonNullable<FlexProps['justify']>>('between')
  const [gap, setGap] = useState<NonNullable<FlexProps['gap']>>('sm')
  const [wrap, setWrap] = useState<NonNullable<FlexProps['wrap']>>('nowrap')
  return (
    <StoryCard title="Playground" description="改变属性观察主轴、交叉轴和换行；尺寸由外侧 frame 约束。">
      <StoryRow align="end">
        <StoryField label="Direction">
          <Select
            aria-label="Direction"
            value={direction}
            options={directionOptions}
            onValueChange={(value) => setDirection(value as NonNullable<FlexProps['direction']>)}
          />
        </StoryField>
        <StoryField label="Align">
          <Select
            aria-label="Align"
            value={align}
            options={alignOptions}
            onValueChange={(value) => setAlign(value as NonNullable<FlexProps['align']>)}
          />
        </StoryField>
        <StoryField label="Justify">
          <Select
            aria-label="Justify"
            value={justify}
            options={justifyOptions}
            onValueChange={(value) => setJustify(value as NonNullable<FlexProps['justify']>)}
          />
        </StoryField>
        <StoryField label="Gap">
          <Select
            aria-label="Gap"
            value={gap}
            options={['none', 'xxs', 'xs', 'sm', 'md', 'lg'].map((value) => ({
              key: value,
              label: value,
              value,
            }))}
            onValueChange={(value) => setGap(value as NonNullable<FlexProps['gap']>)}
          />
        </StoryField>
        <StoryField label="Wrap">
          <Select
            aria-label="Wrap"
            value={wrap}
            options={['nowrap', 'wrap', 'wrap-reverse'].map((value) => ({ key: value, label: value, value }))}
            onValueChange={(value) => setWrap(value as NonNullable<FlexProps['wrap']>)}
          />
        </StoryField>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setDirection('row')
            setAlign('center')
            setJustify('between')
            setGap('sm')
            setWrap('nowrap')
          }}>
          Reset
        </Button>
      </StoryRow>
      <Flex direction={direction} align={align} justify={justify} gap={gap} wrap={wrap} className={frame}>
        <div className={item}>First</div>
        <div className={item} style={{ minHeight: 60 }}>
          Second
        </div>
        <div className={item}>Third</div>
      </Flex>
      <Text size="sm" tone="muted">
        direction: {direction}; align: {align}; justify: {justify}; gap: {gap}; wrap: {wrap}
      </Text>
      <StoryState label="Flex props" value={{ direction, align, justify, gap, wrap }} />
    </StoryCard>
  )
}

export const Overview: Story = {
  render: () => (
    <StoryPage
      eyebrow="Layout"
      title="Flex"
      summary="一维排列的基础布局组件。用 gap token 保持间距节奏；方向、对齐和换行都是显式 prop。"
      meta={
        <>
          <span>row / column</span>
          <span>·</span>
          <span>6 gap steps</span>
          <span>·</span>
          <span>wrap</span>
        </>
      }>
      <StorySection title="Playground">
        <Playground />
      </StorySection>

      <StorySection
        title="Directions"
        description="四种主轴方向；row-reverse/column-reverse 只改变视觉顺序，不改变 DOM 顺序。">
        <StoryGrid>
          {(['row', 'column', 'row-reverse', 'column-reverse'] as const).map((direction) => (
            <StoryCard key={direction} title={direction}>
              <Flex direction={direction} gap="xs">
                <span className={item}>One</span>
                <span className={item}>Two</span>
                <span className={item}>Three</span>
              </Flex>
            </StoryCard>
          ))}
        </StoryGrid>
      </StorySection>

      <StorySection title="Gap scale" description="none / xxs 2 / xs 4 / sm 8 / md 12 / lg 16。">
        <StoryCard>
          {(['none', 'xxs', 'xs', 'sm', 'md', 'lg'] as const).map((gap) => (
            <StoryRow key={gap}>
              <Text size="xs" tone="muted" css={{ width: '48px' }}>
                {gap}
              </Text>
              <Flex gap={gap}>
                <span className={item}>A</span>
                <span className={item}>B</span>
                <span className={item}>C</span>
              </Flex>
            </StoryRow>
          ))}
        </StoryCard>
      </StorySection>

      <StorySection
        title="Wrap and long content"
        description="容器变窄时换行；长字符串通过 minWidth: 0 + overflowWrap 换行。">
        <StoryGrid>
          <StoryCard title="Wrap">
            <Flex gap="sm" wrap="wrap" css={{ width: '240px' }}>
              {['Short', 'Another item', 'More content', 'Last item'].map((text) => (
                <span key={text} className={item}>
                  {text}
                </span>
              ))}
            </Flex>
          </StoryCard>
          <StoryCard title="Long content">
            <Flex gap="sm" align="start" css={{ width: '240px' }}>
              <span className={item}>Label</span>
              <p className={css({ margin: 0, minWidth: 0, overflowWrap: 'anywhere' })}>
                A-long-unbroken-value-that-can-wrap-without-forcing-the-layout-to-grow
              </p>
            </Flex>
          </StoryCard>
        </StoryGrid>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`<Flex direction="row" gap="sm" align="center" justify="between" wrap="wrap">
  <Button>Cancel</Button>
  <Button variant="solid">Save</Button>
</Flex>`}
          />
          <StoryProps
            rows={[
              {
                name: 'direction',
                type: 'row | column | row-reverse | column-reverse',
                defaultValue: 'row',
                description: '主轴方向。',
              },
              {
                name: 'gap',
                type: 'none | xxs | xs | sm | md | lg',
                defaultValue: 'none',
                description: '间距 token。',
              },
              {
                name: 'align',
                type: 'start | center | end | stretch | baseline',
                defaultValue: 'stretch',
                description: '交叉轴对齐。',
              },
              {
                name: 'justify',
                type: 'start | center | end | between | around | evenly',
                defaultValue: 'start',
                description: '主轴分布。',
              },
              { name: 'wrap', type: 'nowrap | wrap | wrap-reverse', defaultValue: 'nowrap', description: '换行策略。' },
            ]}
          />
        </StoryGrid>
      </StorySection>
    </StoryPage>
  ),
}

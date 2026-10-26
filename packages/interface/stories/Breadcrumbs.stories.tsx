import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumbs, type BreadcrumbEntry } from '../src/widgets/navigation/Breadcrumbs'
import { Button } from '../src/widgets/buttons/Button'
import {
  StoryPage,
  StorySection,
  StoryCard,
  StoryRow,
  StoryGrid,
  StoryField,
  StoryCode,
  StoryProps,
  StoryState,
  StoryKeyboard,
  StoryNote,
} from './support/StoryPage'

const path: readonly BreadcrumbEntry[] = [
  { key: 'assets', label: 'Assets' },
  { key: 'materials', label: 'Materials' },
  { key: 'paint', label: 'Car paint' },
]

const meta = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Breadcrumbs 显示当前位置的层级路径，适合文件目录、资源库或多层页面。上级项可以用 href 直接导航，也可以用 onNavigate 请求应用切换路径；当前项带有 aria-current="page"。禁用项用于表示当前无法到达的位置。',
      },
    },
    layout: 'fullscreen',
  },
  title: 'Navigation/Breadcrumbs',
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function BreadcrumbsExample() {
  const [depth, setDepth] = useState(path.length)
  const [refused, setRefused] = useState<string[]>([])
  const items = path.slice(0, depth)
  return (
    <StoryPage
      eyebrow="Navigation"
      title="Breadcrumbs"
      summary="用一条可换行的路径表达层级位置。紧凑档 20、常规档 24；当前页是文字，其余位置可以是链接或请求按钮。"
      meta={
        <>
          <span>2 sizes</span>
          <span>·</span>
          <span>aria-current</span>
          <span>·</span>
          <span>可控导航</span>
        </>
      }
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setDepth(path.length)
            setRefused([])
          }}>
          Reset path
        </Button>
      }>
      <StorySection title="Variants" description="默认用分隔符连接层级；可以替换分隔符，也可以给上级项提供 href。">
        <StoryCard>
          <StoryRow align="center">
            <Breadcrumbs items={path} aria-label="Default path" />
          </StoryRow>
          <StoryRow align="center">
            <Breadcrumbs items={path} size="md" separator="›" aria-label="Chevron path" />
          </StoryRow>
          <StoryRow align="center">
            <Breadcrumbs items={path.map((item) => ({ ...item, href: `#${item.key}` }))} aria-label="Linked path" />
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection title="Sizes" description="紧凑档 20/12，常规档 24/14；路径与分隔符一起缩放。">
        <StoryGrid>
          <StoryField label="Compact · 20">
            <StoryCard>
              <Breadcrumbs items={path} size="sm" aria-label="Compact breadcrumbs" />
            </StoryCard>
          </StoryField>
          <StoryField label="Regular · 24">
            <StoryCard>
              <Breadcrumbs items={path} size="md" aria-label="Regular breadcrumbs" />
            </StoryCard>
          </StoryField>
        </StoryGrid>
      </StorySection>

      <StorySection title="States" description="整条路径或单个位置都可以禁用；空路径仍保留 nav 的可访问名称。">
        <StoryCard>
          <StoryRow align="center">
            <Breadcrumbs items={path} disabled aria-label="Disabled path" />
          </StoryRow>
          <StoryRow align="center">
            <Breadcrumbs
              items={path.map((item) => ({ ...item, disabled: item.key === 'materials' }))}
              aria-label="Partially disabled path"
            />
          </StoryRow>
          <StoryRow align="center">
            <Breadcrumbs items={[]} aria-label="Empty path" />
            <StoryNote>Empty path (nav label remains)</StoryNote>
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="Behavior"
        description="点击上级项只发出请求，应用决定是否缩短路径。下面的路径会接受请求；第二条路径记录并拒绝请求。">
        <StoryCard>
          <StoryRow align="center">
            <Breadcrumbs
              items={items}
              onNavigate={(key) => {
                const index = path.findIndex((item) => item.key === key)
                if (index >= 0) setDepth(index + 1)
              }}
              aria-label="Accepted navigation"
            />
            <Button size="sm" variant="subtle" onClick={() => setDepth((value) => Math.min(value + 1, path.length))}>
              Go deeper
            </Button>
          </StoryRow>
          <StoryRow align="center">
            <Breadcrumbs
              items={path}
              onNavigate={(key) => setRefused((current) => [...current, String(key)])}
              aria-label="Refused navigation"
            />
          </StoryRow>
        </StoryCard>
      </StorySection>

      <StorySection
        title="Keyboard and accessibility"
        description="链接和按钮保留浏览器/按钮的键盘行为；导航区域有名称，当前页用 aria-current 标记。">
        <StoryKeyboard
          rows={[
            { keys: 'Tab', action: '在上一个可交互位置、链接与下一个位置之间移动。' },
            { keys: ['Enter', 'Space'], action: '按钮形式的位置触发 onNavigate；链接使用浏览器导航。' },
            { keys: 'Shift + Tab', action: '反向移动；禁用项不进入 Tab 顺序。' },
          ]}
        />
        <StoryNote>
          当前页使用 <code>aria-current="page"</code>；如果路径本身是导航区，给 Breadcrumbs 传入明确的{' '}
          <code>aria-label</code>，避免页面上出现多个同名 navigation。
        </StoryNote>
      </StorySection>

      <StorySection title="Usage">
        <StoryGrid>
          <StoryCode
            label="tsx"
            code={`const path = [
  { key: 'assets', label: 'Assets' },
  { key: 'materials', label: 'Materials' },
  { key: 'paint', label: 'Car paint' },
]

<Breadcrumbs items={path} onNavigate={goToLevel} />
<Breadcrumbs items={path} size="md" separator="›" />`}
          />
          <StoryProps
            rows={[
              { name: 'items', type: 'readonly BreadcrumbEntry[]', description: 'key、label，可选 href/disabled。' },
              { name: 'onNavigate', type: '(key: CollectionKey) => void', description: '按钮形式的位置发出导航请求。' },
              { name: 'size', type: "'sm' | 'md'", defaultValue: "'sm'", description: '20/12 或 24/14。' },
              { name: 'disabled', type: 'boolean', defaultValue: 'false', description: '禁用整条路径。' },
              { name: 'separator', type: 'ReactNode', defaultValue: "'/'", description: '非当前项之后的分隔符。' },
            ]}
          />
        </StoryGrid>
      </StorySection>

      <StoryState label="Breadcrumb state" value={{ depth, current: items.map((item) => item.key), refused }} />
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <BreadcrumbsExample /> }

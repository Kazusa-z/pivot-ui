import { forwardRef, useRef, useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button, ActionButton, ActionButtonGroup } from '../src/widgets/buttons'
import { ContractFrame, StatePanel, contractStyles } from './support/ContractFrame'

function AddIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
      <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ButtonOverview() {
  const [clicks, setClicks] = useState(0)
  return (
    <ContractFrame
      title="文字按钮与图标按钮"
      description="根据空间和操作重要程度选择 size 与 variant。点击可用按钮会增加下方计数；普通按钮默认 type=`button`，图标按钮通过 aria-label 告知操作名称。"
      onReset={() => setClicks(0)}>
      <div className={contractStyles.row}>
        {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
          <Button key={size} size={size} onClick={() => setClicks((value) => value + 1)}>
            {size.toUpperCase()}
          </Button>
        ))}
      </div>
      <div className={contractStyles.row}>
        {(['outline', 'soft', 'solid', 'subtle', 'inverted'] as const).map((variant) => (
          <Button key={variant} variant={variant} onClick={() => setClicks((value) => value + 1)}>
            {variant}
          </Button>
        ))}
      </div>
      <div className={contractStyles.row}>
        <Button startSlot={<AddIcon />} endSlot="↗">
          Slots
        </Button>
        <Button critical variant="solid">
          Critical
        </Button>
        <Button positive variant="soft">
          Positive
        </Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </div>
      <div className={contractStyles.row}>
        <Button
          size="lg"
          css={{
            height: '18px',
            color: 'var(--colors-orange11)',
            '&:hover': { color: 'var(--colors-orange11)' },
          }}
          onClick={() => setClicks((value) => value + 1)}>
          CSS override: 18px
        </Button>
      </div>
      <div className={contractStyles.row}>
        {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
          <ActionButton
            key={size}
            size={size}
            aria-label={`Add ${size}`}
            onClick={() => setClicks((value) => value + 1)}>
            <AddIcon />
          </ActionButton>
        ))}
        <ActionButton active aria-label="Active action">
          <AddIcon />
        </ActionButton>
        <ActionButton disabled aria-label="Disabled action">
          <AddIcon />
        </ActionButton>
        <ActionButton loading aria-label="Loading action">
          <AddIcon />
        </ActionButton>
        <ActionButton corner aria-label="Open action menu">
          <AddIcon />
        </ActionButton>
      </div>
      <StatePanel label="Click count" value={clicks} />
    </ContractFrame>
  )
}

type ActionKind = 'text' | 'icon'
type PendingAction = { resolve: () => void; reject: (error: Error) => void }
function AsyncButtonsExample() {
  const pending = useRef<Partial<Record<ActionKind, PendingAction>>>({})
  const generation = useRef(0)
  const [started, setStarted] = useState({ text: 0, icon: 0 })
  const [completed, setCompleted] = useState({ text: 0, icon: 0 })
  const [errors, setErrors] = useState<string[]>([])
  const [externalLoading, setExternalLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)

  async function run(kind: ActionKind) {
    const currentGeneration = generation.current
    setStarted((previous) => ({ ...previous, [kind]: previous[kind] + 1 }))
    await new Promise<void>((resolve, reject) => {
      pending.current[kind] = { resolve, reject }
    })
    if (currentGeneration === generation.current)
      setCompleted((previous) => ({ ...previous, [kind]: previous[kind] + 1 }))
  }
  function settle(kind: ActionKind, reject = false) {
    const action = pending.current[kind]
    delete pending.current[kind]
    if (reject) action?.reject(new Error(`${kind} request rejected`))
    else action?.resolve()
  }
  function reset() {
    generation.current += 1
    settle('text')
    settle('icon')
    setStarted({ text: 0, icon: 0 })
    setCompleted({ text: 0, icon: 0 })
    setErrors([])
    setExternalLoading(false)
    setDisabled(false)
  }
  return (
    <ContractFrame
      title="等待异步操作完成"
      description="异步按钮适合保存或加载等需要等待的操作。点击 Start 后，用 Resolve 完成请求或用 Reject 返回错误；按钮等待 Promise 结束后恢复可用。应用可额外传入 loading，异步操作通过 async 传入，失败信息由 onAsyncError 接收。"
      onReset={reset}>
      <div className={contractStyles.row}>
        <label>
          <input
            type="checkbox"
            checked={externalLoading}
            onChange={(event) => setExternalLoading(event.currentTarget.checked)}
          />{' '}
          External loading
        </label>
        <label>
          <input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.currentTarget.checked)} />{' '}
          Disabled
        </label>
      </div>
      <div className={contractStyles.row}>
        <Button
          async={() => run('text')}
          loading={externalLoading}
          disabled={disabled}
          onAsyncError={(error) => setErrors((previous) => [...previous, String(error)])}>
          Start text request
        </Button>
        <ActionButton
          async={() => run('icon')}
          loading={externalLoading}
          disabled={disabled}
          aria-label="Start icon request"
          onAsyncError={(error) => setErrors((previous) => [...previous, String(error)])}>
          <AddIcon />
        </ActionButton>
      </div>
      <div className={contractStyles.row}>
        <Button onClick={() => settle('text')}>Resolve text</Button>
        <Button onClick={() => settle('text', true)}>Reject text</Button>
        <Button onClick={() => settle('icon')}>Resolve icon</Button>
        <Button onClick={() => settle('icon', true)}>Reject icon</Button>
      </div>
      <StatePanel label="Requests" value={{ started, completed, errors }} />
    </ContractFrame>
  )
}

const CustomButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function CustomButton(props, ref) {
    return <button {...props} ref={ref} />
  }
)
const CustomLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  function CustomLink(props, ref) {
    return <a {...props} ref={ref} />
  }
)

function AsChildExample() {
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [calls, setCalls] = useState({ child: 0, parent: 0, span: 0, wrappedButton: 0, wrappedLink: 0 })
  const [formSubmits, setFormSubmits] = useState(0)
  const childRef = useRef<HTMLAnchorElement>(null)
  const [refAttached, setRefAttached] = useState(false)
  return (
    <ContractFrame
      title="组合链接与键盘操作"
      description="asChild 可把按钮行为组合到链接或自定义元素上。此处记录子元素与外层按钮的回调次数；disabled 或 loading 会阻止激活。Span button 可用 Enter/Space 操作，Tab 可移到下一控件，子元素的 ref 和 className 继续有效。"
      onReset={() => {
        setDisabled(false)
        setLoading(false)
        setCalls({ child: 0, parent: 0, span: 0, wrappedButton: 0, wrappedLink: 0 })
        setFormSubmits(0)
        setRefAttached(false)
      }}>
      <div className={contractStyles.row}>
        <label>
          <input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.currentTarget.checked)} />{' '}
          Disabled
        </label>
        <label>
          <input type="checkbox" checked={loading} onChange={(event) => setLoading(event.currentTarget.checked)} />{' '}
          Loading
        </label>
      </div>
      <div className={contractStyles.row}>
        <Button
          asChild
          disabled={disabled}
          loading={loading}
          startSlot={<AddIcon />}
          onClick={(event) => {
            event.preventDefault()
            setCalls((previous) => ({ ...previous, parent: previous.parent + 1 }))
          }}>
          <a
            href="#button-demo"
            ref={childRef}
            className="child-link"
            onClick={() => setCalls((previous) => ({ ...previous, child: previous.child + 1 }))}>
            Composed link
          </a>
        </Button>
        <Button
          asChild
          disabled={disabled}
          loading={loading}
          onClick={() => setCalls((previous) => ({ ...previous, span: previous.span + 1 }))}>
          <span>Span button</span>
        </Button>
        <Button onClick={() => setRefAttached(childRef.current?.tagName === 'A')}>Check child ref</Button>
        <Button>Next focus target</Button>
      </div>
      <form
        className={contractStyles.row}
        onSubmit={(event) => {
          event.preventDefault()
          setFormSubmits((count) => count + 1)
        }}>
        <Button
          asChild
          disabled={disabled}
          loading={loading}
          onClick={() => setCalls((previous) => ({ ...previous, wrappedButton: previous.wrappedButton + 1 }))}>
          <CustomButton>Wrapped button</CustomButton>
        </Button>
        <Button
          asChild
          disabled={disabled}
          loading={loading}
          onClick={(event) => {
            event.preventDefault()
            setCalls((previous) => ({ ...previous, wrappedLink: previous.wrappedLink + 1 }))
          }}>
          <CustomLink href="#wrapped-button-demo">Wrapped link</CustomLink>
        </Button>
        <Button type="submit">Submit form</Button>
      </form>
      <p>
        Wrapped button 执行普通点击，Submit form 提交表单并增加 formSubmits。封装自己的按钮组件时，将收到的 props 和 ref
        转发到真实 DOM 元素。
      </p>
      <StatePanel label="Composed behavior" value={{ calls, formSubmits, refAttached }} />
    </ContractFrame>
  )
}

function ActionGroupExample() {
  const [selected, setSelected] = useState('move')
  return (
    <ContractFrame
      title="排列一组操作按钮"
      description="ActionButtonGroup 将相关按钮排成一组并衔接边角，每个按钮通过 Tab 单独聚焦。本例在 onClick 中保存当前操作；需要方向键切换的工具组可使用 ToggleGroup。"
      onReset={() => setSelected('move')}>
      {(['horizontal', 'vertical'] as const).map((direction) => (
        <ActionButtonGroup key={direction} direction={direction} role="group" aria-label={`${direction} actions`}>
          {['move', 'rotate', 'scale'].map((action) => (
            <ActionButton
              key={action}
              aria-label={`${direction} ${action}`}
              active={selected === action}
              onClick={() => setSelected(action)}>
              {action[0]?.toUpperCase()}
            </ActionButton>
          ))}
        </ActionButtonGroup>
      ))}
      <StatePanel label="Selected action" value={selected} />
    </ContractFrame>
  )
}

const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Buttons',
  parameters: {
    docs: {
      description: {
        component:
          'Button 用于带文字的操作，ActionButton 用于紧凑的图标操作，ActionButtonGroup 用于排列一组按钮。onClick 接收普通点击，async 接收返回 Promise 的操作；等待期间按钮显示加载状态并阻止重复请求，失败交给 onAsyncError 处理。普通按钮默认 type="button"；提交表单时显式使用 type="submit"，图标按钮提供 aria-label。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <ButtonOverview /> }
export const AsyncState: Story = { render: () => <AsyncButtonsExample /> }
export const AsChild: Story = { render: () => <AsChildExample /> }
export const Groups: Story = { render: () => <ActionGroupExample /> }

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
      title="Buttons"
      description="共享按钮行为，保留不同密度与强调方式。所有普通按钮默认 type=button；图标按钮提供可访问名称。"
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
      title="Async buttons"
      description="启动后手动 Resolve 或 Reject。等待期间重复点击、键盘激活不会重复调用；取消外部 loading 不应解除仍在运行的内部请求。"
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
      title="asChild and keyboard"
      description="Link 同时统计子元素与父按钮回调；禁用或 loading 时两者都不执行。Span button 支持 Enter/Space；Tab 始终允许移出。子元素 ref 和 className 会保留。"
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
        Wrapped button 默认不会提交表单；只有 Submit form 增加 formSubmits。包装组件必须向真实元素转发 props 和 ref。
      </p>
      <StatePanel label="Composed behavior" value={{ calls, formSubmits, refAttached }} />
    </ContractFrame>
  )
}

function ActionGroupExample() {
  const [selected, setSelected] = useState('move')
  return (
    <ContractFrame
      title="Action button groups"
      description="分组仅控制布局和边角，不实现 Toolbar 的方向键导航。每个按钮仍可用 Tab 独立聚焦。"
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

const meta = { title: 'Widgets/Buttons', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <ButtonOverview /> }
export const AsyncState: Story = { render: () => <AsyncButtonsExample /> }
export const AsChild: Story = { render: () => <AsChildExample /> }
export const Groups: Story = { render: () => <ActionGroupExample /> }

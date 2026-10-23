import { StrictMode, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  createConfirmationService,
  ConfirmationProvider,
  useConfirmation,
  type ConfirmationRequest,
  type ConfirmationResult,
  type ConfirmationService,
} from '../src/widgets/dialogs'
import { ContractFrame, ControlButton, StatePanel, contractStyles } from './support/ContractFrame'

function RequestControls({ onResult }: { onResult: (result: ConfirmationResult) => void }) {
  const service = useConfirmation()
  return (
    <ControlButton
      onClick={() => {
        void service
          .request({
            title: 'Apply settings?',
            description: '此确认框由当前应用的 ConfirmationProvider 展示，并使用该区域的主题。',
          })
          .result.then(onResult)
      }}>
      Request using context
    </ControlButton>
  )
}

function QueueExample() {
  const [service] = useState(createConfirmationService)
  const [results, setResults] = useState<ConfirmationResult[]>([])
  const [identity, setIdentity] = useState<boolean | null>(null)
  const snapshot = useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot)
  const last = useRef<ConfirmationRequest | null>(null)
  const record = (result: ConfirmationResult) => setResults((values) => [...values, result])
  const enqueue = (title: string) => {
    const request = service.request({ title, description: '确认请求按发起顺序依次显示。' })
    last.current = request
    void request.result.then(record)
    return request
  }
  return (
    <ContractFrame
      title="按顺序等待用户确认"
      description="连续发起确认时，请求会按顺序显示。应用等待 request.result，再根据结果执行或取消操作；用户完成选择后焦点回到发起按钮。重复调用同一请求的 confirm、cancel 或 close 会取得同一个最终结果。"
      onReset={() => {
        for (const request of snapshot.requests) void request.close()
        setResults([])
        setIdentity(null)
        last.current = null
      }}>
      <ConfirmationProvider service={service}>
        <div className={contractStyles.row}>
          <RequestControls onResult={record} />
          <ControlButton
            onClick={() => {
              enqueue('First request')
              enqueue('Second request')
            }}>
            Queue two requests
          </ControlButton>
          <ControlButton
            onClick={() => {
              const request = enqueue('Immediately settled request')
              setIdentity(request.confirm() === request.cancel() && request.close() === request.result)
            }}>
            Confirm/cancel/close repeatedly
          </ControlButton>
          <ControlButton
            disabled={!last.current}
            onClick={() => {
              const request = last.current!
              setIdentity(request.confirm() === request.cancel() && request.close() === request.result)
            }}>
            Repeat last settlement
          </ControlButton>
        </div>
      </ConfirmationProvider>
      <StatePanel
        label="Queue state"
        value={{
          connected: snapshot.connected,
          pending: snapshot.requests.map((request) => ({ id: request.id, title: request.options.title })),
          samePromise: identity,
          results,
        }}
      />
    </ContractFrame>
  )
}

function UnmountExample() {
  const [service] = useState(createConfirmationService)
  const [mounted, setMounted] = useState(true)
  const [results, setResults] = useState<ConfirmationResult[]>([])
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const snapshot = useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot)
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <ContractFrame
      title="确认区域移除后的请求结果"
      description="此例发起两个请求，并在一秒后移除显示它们的 Provider；所有请求随后返回 unmounted。应用应在挂载 ConfirmationProvider 后发起交互式确认；缺少 Provider 时，结果为 unavailable，可据此采用其他提示方式。"
      onReset={() => {
        clearTimeout(timer.current)
        setMounted(true)
        setResults([])
      }}>
      <div className={contractStyles.row}>
        <ControlButton
          disabled={!mounted}
          onClick={() => {
            for (const title of ['Visible request', 'Queued request'])
              void service.request({ title }).result.then((result) => setResults((values) => [...values, result]))
            timer.current = setTimeout(() => setMounted(false), 1000)
          }}>
          Queue two and unmount in 1 second
        </ControlButton>
        <ControlButton disabled={mounted} onClick={() => setMounted(true)}>
          Mount host
        </ControlButton>
        <ControlButton
          onClick={() => {
            const unhosted = createConfirmationService()
            void unhosted
              .request({ title: 'No host' })
              .result.then((result) => setResults((values) => [...values, result]))
          }}>
          Request without host
        </ControlButton>
      </div>
      {mounted && <ConfirmationProvider service={service} />}
      <StatePanel
        label="Host state"
        value={{ mounted, connected: snapshot.connected, pending: snapshot.requests.length, results }}
      />
    </ContractFrame>
  )
}

function StrictRequest({ onResult }: { onResult: (result: ConfirmationResult) => void }) {
  const service = useConfirmation()
  const requested = useRef(false)
  useEffect(() => {
    if (requested.current) return
    requested.current = true
    void service
      .request({
        title: 'StrictMode effect request',
        description: '此请求来自组件的挂载 effect；请在弹窗中选择结果，下方会记录该决定。',
      })
      .result.then(onResult)
  }, [service, onResult])
  return null
}
function StrictExample() {
  const [service] = useState(createConfirmationService)
  const [mounted, setMounted] = useState(false)
  const [results, setResults] = useState<ConfirmationResult[]>([])
  return (
    <ContractFrame
      title="在 StrictMode 中发起确认"
      description="子组件挂载后通过 effect 发起确认，外层启用 React StrictMode。确认后可重新挂载发起下一次请求；结果区显示每次用户决定，应用可据此继续对应操作。"
      onReset={() => {
        setMounted(false)
        setResults([])
      }}>
      <ControlButton onClick={() => setMounted((value) => !value)}>
        {mounted ? 'Unmount StrictMode host' : 'Mount StrictMode host'}
      </ControlButton>
      {mounted && (
        <StrictMode>
          <ConfirmationProvider service={service}>
            <StrictRequest onResult={(result) => setResults((values) => [...values, result])} />
          </ConfirmationProvider>
        </StrictMode>
      )}
      <StatePanel label="StrictMode results" value={results} />
    </ContractFrame>
  )
}

function IndependentHost({ service, name }: { service: ConfirmationService; name: string }) {
  return (
    <ConfirmationProvider service={service}>
      <ControlButton
        onClick={() => {
          void service.request({ title: `${name} request` })
        }}>
        {name}
      </ControlButton>
    </ConfirmationProvider>
  )
}
function IndependentExample() {
  const [services, setServices] = useState(() => [createConfirmationService(), createConfirmationService()])
  return (
    <ContractFrame
      title="多个独立确认区域"
      description="两个区域分别创建 service，因此各自的请求和主题独立。一个 service 对应一个 ConfirmationProvider；需要多个独立确认区域时分别创建服务实例，避免把同一实例连接到多个显示区域。"
      onReset={() => setServices([createConfirmationService(), createConfirmationService()])}>
      <div className={contractStyles.row}>
        {services.map((service, index) => (
          <IndependentHost key={index} service={service} name={`Application ${index + 1}`} />
        ))}
      </div>
    </ContractFrame>
  )
}
const meta = {
  tags: ['autodocs'],
  title: 'Widgets/Confirmation',
  parameters: {
    docs: {
      description: {
        component:
          '确认服务适合在执行删除、覆盖等操作前等待用户决定。应用创建 createConfirmationService，并通过 ConfirmationProvider 展示请求；request(...).result 返回确认、取消或关闭等结果。多个请求按顺序显示，应用收到确认结果后再执行对应操作；每个应用区域应使用自己的服务实例。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Queue: Story = { render: () => <QueueExample /> }
export const HostUnmount: Story = { render: () => <UnmountExample /> }
export const StrictLifecycle: Story = { render: () => <StrictExample /> }
export const IndependentHosts: Story = { render: () => <IndependentExample /> }

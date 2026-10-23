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
          .request({ title: 'Apply settings?', description: 'The injected provider owns this dialog and its theme.' })
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
    const request = service.request({ title, description: 'Requests are displayed in FIFO order.' })
    last.current = request
    void request.result.then(record)
    return request
  }
  return (
    <ContractFrame
      title="Injected confirmation queue"
      description="两个请求依次显示；结束后焦点回到发起按钮。重复终结返回同一个 Promise 与不可变结果，不重复执行事务。服务结果与调用方回调独立。"
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
      title="Unmount settles the queue"
      description="启动两个请求并在一秒后卸载 Provider；包括尚未显示的请求，全部返回 unmounted。无宿主调用立即返回 unavailable，不遗留 Promise。"
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
        description: 'The effect disconnect/reconnect must not cancel this request.',
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
      title="StrictMode lifecycle"
      description="挂载时由子组件 effect 发起请求，StrictMode 的模拟清理不应产生 unmounted 或重复对话框。Confirm 后可重新挂载验证下一次请求。"
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
      title="Independent application hosts"
      description="每个应用使用独立 service。一个实例只能连接一个 Provider；重复宿主抛出明确错误，且不会覆盖原队列。"
      onReset={() => setServices([createConfirmationService(), createConfirmationService()])}>
      <div className={contractStyles.row}>
        {services.map((service, index) => (
          <IndependentHost key={index} service={service} name={`Application ${index + 1}`} />
        ))}
      </div>
    </ContractFrame>
  )
}
const meta = { title: 'Widgets/Confirmation', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Queue: Story = { render: () => <QueueExample /> }
export const HostUnmount: Story = { render: () => <UnmountExample /> }
export const StrictLifecycle: Story = { render: () => <StrictExample /> }
export const IndependentHosts: Story = { render: () => <IndependentExample /> }

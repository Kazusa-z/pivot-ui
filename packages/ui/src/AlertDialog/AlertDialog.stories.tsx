import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { createConfirmationService, ConfirmationProvider, type ConfirmationResult } from '@pivot-ui/react'
import { Button } from '../Button'
import { AlertDialog, showAlert } from '.'

function OverviewExample() {
  const [last, setLast] = useState('none')
  return (
    <>
      <AlertDialog
        title="Apply settings?"
        description="Confirm the pending local changes."
        trigger={<Button variant="solid">Open Alert Dialog</Button>}
        onClose={() => setLast('cancelled')}
        onConfirm={() => setLast('confirmed')}
      />
      <p>Last action: {last}</p>
    </>
  )
}
function InjectedServiceExample() {
  const [service] = useState(createConfirmationService)
  const [result, setResult] = useState<ConfirmationResult | null>(null)
  const [callbackCount, setCallbackCount] = useState(0)
  return (
    <ConfirmationProvider service={service}>
      <Button
        onClick={() => {
          const request = showAlert(
            {
              title: 'Injected legacy request',
              description: 'showAlert receives the application service explicitly.',
              onConfirm: () => setCallbackCount((count) => count + 1),
              onClose: () => setCallbackCount((count) => count + 1),
            },
            service
          )
          void request.result.then(setResult)
        }}>
        showAlert with injected service
      </Button>
      <pre>{JSON.stringify({ result, callbackCount }, null, 2)}</pre>
    </ConfirmationProvider>
  )
}
const meta = { title: 'Overlay/AlertDialog', component: AlertDialog } satisfies Meta<typeof AlertDialog>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { args: { title: 'Apply settings?' }, render: () => <OverviewExample /> }
export const InjectedService: Story = {
  args: { title: 'Injected legacy request' },
  render: () => <InjectedServiceExample />,
}

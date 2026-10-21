import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import { Button } from '../Button'
import { Dialog } from '../Dialog'
import { Text, Title } from '../Typography'
import { PandaDialog } from './PandaDialog'

export default {
  title: 'Panda Pilot/Dialog',
} as Meta

const body = (
  <>
    <Title size={2}>Register</Title>
    <Text>Register use password or OAuth2.0</Text>
  </>
)

export const Comparison: StoryFn = () => {
  const [stitchesOpen, setStitchesOpen] = useState(false)
  const [pandaOpen, setPandaOpen] = useState(false)

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <Dialog
        open={stitchesOpen}
        closable
        title="Stitches Dialog"
        trigger={<Button onClick={() => setStitchesOpen(true)}>Open Stitches</Button>}
        onOpenChange={setStitchesOpen}>
        {body}
      </Dialog>
      <PandaDialog
        open={pandaOpen}
        closable
        title="Panda Dialog"
        trigger={<Button onClick={() => setPandaOpen(true)}>Open Panda</Button>}
        onOpenChange={setPandaOpen}>
        {body}
      </PandaDialog>
    </div>
  )
}

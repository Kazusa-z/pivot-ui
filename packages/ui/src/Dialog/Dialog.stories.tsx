import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Flex } from '../Flex'
import { Button } from '../Button'
import { Select, SelectItem } from '../Select'
import { Text, Title } from '../Typography'
import { Dialog } from '.'

function OverviewExample() {
  const [open, setOpen] = useState(false)
  return (
    <Flex gap="md">
      <Dialog
        title="Register"
        open={open}
        closable
        onOpenChange={setOpen}
        trigger={
          <Button variant="outline" size="md">
            Open Dialog
          </Button>
        }>
        <Flex direction="column" gap="xs" css={{ marginBottom: '24px' }}>
          <Title size={2}>Register</Title>
          <Text>Register using password or OAuth2.0</Text>
        </Flex>
        <Select placeholder="Select Fruits..." defaultValue="apple" width="initial">
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </Select>
      </Dialog>
    </Flex>
  )
}
const meta = { title: 'Dialog', component: Dialog } satisfies Meta<typeof Dialog>
export default meta
type Story = StoryObj<typeof meta>
export const Overview: Story = { render: () => <OverviewExample /> }

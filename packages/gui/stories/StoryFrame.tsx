import type { ReactNode } from 'react'
import { Button, Flex } from '@pivot-ui/editor'

interface StoryFrameProps {
  children: ReactNode
  value: unknown
  onReset?: () => void
  width?: number
}

export function StoryFrame({ children, value, onReset, width = 380 }: StoryFrameProps) {
  return (
    <Flex direction="column" gap="md" style={{ width, maxWidth: '100%' }}>
      {children}
      <pre
        aria-label="Current value"
        style={{
          margin: 0,
          fontSize: 12,
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          maxHeight: 280,
          overflow: 'auto',
        }}>
        {JSON.stringify(value, null, 2)}
      </pre>
      {onReset && <Button onClick={onReset}>Reset</Button>}
    </Flex>
  )
}

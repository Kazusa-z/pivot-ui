import React, { useEffect, useId, useRef } from 'react'
import { StoryFn } from '@storybook/react'

import { Flex } from '../Flex'
import { Button } from '../Button'
import { Text } from '../'

import { toast, Toaster } from './'

export default {
  title: 'Overlay/Toast',
}

export const Overview: StoryFn = () => {
  const toasterId = useId()
  const timers = useRef(new Set<number>())
  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer))
      pending.clear()
      toast.removeAll(toasterId)
    }
  }, [toasterId])

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer)
      callback()
    }, delay)
    timers.current.add(timer)
  }

  return (
    <Flex gap="md">
      <Toaster toasterId={toasterId} />
      <Button onClick={() => toast('hello!', { toasterId })}>info</Button>
      <Button
        onClick={() => {
          const id = toast.loading('hello!', { toasterId })
          schedule(() => toast.dismiss(id), 3000)
        }}>
        loading
      </Button>
      <Button
        onClick={() => {
          const promise = new Promise<void>((resolve) => schedule(resolve, 3000))
          toast.promise(
            promise,
            {
              loading: 'loading...',
              success: 'success',
              error: 'error',
            },
            { toasterId }
          )
        }}>
        toast with promise
      </Button>
      <Button onClick={() => toast.success('Member Added!', { toasterId })}>success</Button>
      <Button onClick={() => toast.error('hello!', { toasterId })}>error</Button>
      <Button
        onClick={() => {
          toast(
            (t) => {
              return (
                <Flex align="v">
                  <Text size="sm" muted>
                    Custom and Undoable toast
                  </Text>
                  <Button css={{ marginLeft: '8px' }} size="sm" onClick={() => toast.dismiss(t.id)} variant="soft">
                    Undo
                  </Button>
                </Flex>
              )
            },
            {
              toasterId,
              duration: 6000,
            }
          )
        }}>
        toast custom
      </Button>
    </Flex>
  )
}

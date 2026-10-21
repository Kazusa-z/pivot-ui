import type { SVGProps } from 'react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { IconGripHorizontal } from '@tabler/icons-react'
import { useDraggablePanel } from './useDraggablePanel'
import { Flex, ActionButton, ScrollArea } from '@pivot-ui/editor'
import { styled } from '../../../styled-system/jsx'

function mergeRefs<T = any>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T> | undefined | null>
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }
}

const IconTriangleRightFilled = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  function IconTriangleRightFilled(props, ref) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 20 20" {...props} ref={ref}>
        <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
          <path d="M4.501 10.866a1 1 0 0 1 0-1.732l10-5.769A1 1 0 0 1 16 4.231V15.77a1 1 0 0 1-1.5.866z" />
          <path d="M14.5 3.365a1 1 0 0 1 1.5.866V15.77a1 1 0 0 1-1.5.866l-9.999-5.769a1 1 0 0 1 0-1.732zM9.003 10L13 12.306V7.694z" />
        </g>
      </svg>
    )
  }
)

const StyledPanel = styled('div', {
  base: {
    position: 'fixed',
    display: 'flex',
    top: 20,
    right: 20,
    maxHeight: '100vh',
    flexDirection: 'column',
    borderRadius: '8px',
    border: '1px solid var(--colors-grayA4)',
    backgroundColor: 'var(--colors-gray2)',
    width: '300px',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
})

const PanelHeader = styled(Flex, {
  base: {
    padding: '6px 4px',
    flexShrink: 0,
    backgroundColor: 'var(--colors-grayA4)',
    color: 'var(--colors-grayA10)',
    transition: 'background-color 0.3s',
    '& > svg': { transition: 'transform 0.2s' },
    cursor: 'grab',
    '&:active': {
      cursor: 'grabbing',
      '& > svg': { transform: 'scale(0.85)' },
    },
    '&:hover': { backgroundColor: 'var(--colors-grayA6)' },
  },
})

const PanelContent = styled('div', {
  base: { transition: 'height 0.3s, padding 0.3s' },
  variants: {
    collapsed: {
      true: { height: '0 !important', padding: '0 4px', opacity: 0 },
    },
  },
})

const CollapsedIcon = styled(IconTriangleRightFilled, {
  base: { transition: 'transform 0.3s', transform: 'rotate(-90deg)' },
  variants: {
    collapsed: { true: { transform: 'rotate(0deg)' } },
  },
})

export interface PanelProps {
  children?: React.ReactNode
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(props, forwardedRef) {
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { dragging, handleMouseDown } = useDraggablePanel(panelRef)
  const [collapsed, setCollapsed] = useState(false)
  const heightRef = useRef(0)

  function handleCollapse(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    setCollapsed(!collapsed)
  }

  useEffect(() => {
    if (contentRef.current) {
      heightRef.current = contentRef.current.clientHeight
      contentRef.current.style.height = `${heightRef.current}px`
    }
  }, [])

  return (
    <StyledPanel ref={mergeRefs([forwardedRef, panelRef])}>
      <PanelHeader align="both" onMouseDown={handleMouseDown} justify="around">
        <ActionButton
          size="xs"
          variant="ghost"
          css={{
            position: 'absolute',
            right: 4,
          }}
          onClick={handleCollapse}>
          <CollapsedIcon height="10px" width="10px" collapsed={collapsed} />
        </ActionButton>
        <IconGripHorizontal size="18px" />
      </PanelHeader>
      <PanelContent ref={contentRef} collapsed={collapsed}>
        <ScrollArea css={{ padding: '4px' }}>{props.children}</ScrollArea>
      </PanelContent>
    </StyledPanel>
  )
})

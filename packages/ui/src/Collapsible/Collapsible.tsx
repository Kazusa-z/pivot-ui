import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { IconTriangleInvertedFilled } from '@tabler/icons-react'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import type { ComponentProps, ReactNode } from 'react'
import type { SystemStyleObject } from '../../styled-system/types'

import { css, cx } from '../../styled-system/css'

const rootClass = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  color: 'var(--colors-text)',
  borderRadius: '4px',
  overflow: 'hidden',
  '& [data-part="root"]': {
    backgroundColor: 'var(--colors-panelBg)',
    paddingLeft: '4px',
    '&::before': {
      display: 'none',
    },
    '& [data-part="title"]': {
      paddingLeft: '4px',
    },
    '& > [data-part="content"]': {
      position: 'relative',
      padding: 0,
    },
  },
})

const subtleClass = css({
  backgroundColor: 'var(--colors-appBg)',
  borderRadius: '6px',
  border: '1px solid var(--colors-border)',
  '& > [data-part="title"]': {
    minHeight: '30px',
  },
  '& > [data-part="content"]': {
    backgroundColor: 'var(--colors-surface)',
    borderRadius: '6px',
    padding: '4px 8px 4px',
  },
  '&[data-state=open] > [data-part="title"]': {
    borderBottom: '1px solid var(--colors-border)',
  },
})

const transparentClass = css({
  backgroundColor: 'transparent',
  '& [data-part="root"]': {
    backgroundColor: 'transparent',
  },
  '& > [data-part="title"]': {
    backgroundColor: 'transparent',
  },
  '& > [data-part="content"]': {
    backgroundColor: 'transparent',
  },
})

const nestingClass = css({
  borderBottom: 'none',
  '& > [data-part="title"] > svg': {
    display: 'none',
  },
})

const contentClass = css({
  borderRadius: '0 0 4px 4px',
  padding: '0 4px 4px 4px',
  backgroundColor: 'var(--colors-panelBg)',
  '&:empty': {
    padding: 0,
  },
})

const guidelineClass = css({
  position: 'relative',
  paddingLeft: '4px !important',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '1px',
    height: '100%',
    backgroundColor: 'var(--colors-grayA5)',
    left: -1,
  },
})

const titleClass = css({
  border: 'none',
  fontFamily: 'inherit',
  textAlign: 'left',
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  lineHeight: 1,
  justifyContent: 'space-between',
  color: 'var(--colors-text)',
  padding: '0 4px 0 4px',
  minHeight: '30px',
  fontSize: '12px',
  userSelect: 'none',
  backgroundColor: 'var(--colors-panelBg)',
  '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '-2px' },
})

const titleContentClass = css({ flex: 1 })

const triggerClass = css({
  all: 'unset',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  height: '24px',
  width: '24px',
  cursor: 'pointer',
  '&:focus-visible': {
    boxShadow: '0 0 0 2px var(--colors-focusRingMuted)',
  },
})

const chevronClass = css({
  margin: '0 6px 0 4px',
  height: '6px',
  width: '6px',
  transform: 'rotate(-90deg)',
})

const chevronOpenClass = css({ transform: 'rotate(0)' })

export type CollapsibleProps = Omit<ComponentProps<typeof CollapsiblePrimitive.Root>, 'title'> & {
  title?: ReactNode
  triggerTitle?: boolean
  collapsible?: boolean
  transparent?: boolean
  subtle?: boolean
  nesting?: boolean
  guideline?: boolean
  css?: SystemStyleObject
}

function Collapsible(props: CollapsibleProps) {
  const {
    children,
    title,
    guideline = false,
    transparent = false,
    subtle = false,
    nesting = false,
    collapsible = true,
    triggerTitle = true,
    className,
    css: cssProp,
    ...rest
  } = props

  const [open, setOpen] = useControllableState({
    prop: props.open,
    onChange: props.onOpenChange,
    defaultProp: props.defaultOpen ?? false,
  })

  const handleOnOpenChange = (nextOpen) => {
    if (!collapsible) return
    setOpen(nextOpen)
  }

  return (
    <CollapsiblePrimitive.Root
      {...rest}
      data-part="root"
      className={cx(
        'collapsible',
        rootClass,
        subtle && subtleClass,
        transparent && transparentClass,
        nesting && nestingClass,
        cssProp && css(cssProp),
        className
      )}
      open={open}
      onOpenChange={handleOnOpenChange}
      disabled={!collapsible}>
      {triggerTitle ? (
        <CollapsiblePrimitive.Trigger data-part="title" className={titleClass} disabled={!collapsible}>
          {collapsible && <IconTriangleInvertedFilled className={cx(chevronClass, open && chevronOpenClass)} />}
          <span className={titleContentClass}>{title}</span>
        </CollapsiblePrimitive.Trigger>
      ) : (
        <div data-part="title" className={titleClass}>
          {collapsible && (
            <CollapsiblePrimitive.Trigger className={triggerClass} disabled={!collapsible}>
              <IconTriangleInvertedFilled className={cx(chevronClass, open && chevronOpenClass)} />
            </CollapsiblePrimitive.Trigger>
          )}
          <div className={titleContentClass}>{title}</div>
        </div>
      )}
      <CollapsiblePrimitive.Content data-part="content" className={cx(contentClass, guideline && guidelineClass)}>
        {children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

export { Collapsible }

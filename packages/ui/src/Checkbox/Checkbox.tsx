import React, { forwardRef } from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckboxProps as PrimitiveProps } from '@radix-ui/react-checkbox'
import { IconCheck } from '@tabler/icons-react'

import { css } from '../../styled-system/css'
import { Flex } from '../Flex'

const rootClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '14px',
  height: '14px',
  borderRadius: '4px',
  boxShadow: 'var(--shadows-prepend)',
  transition: 'box-shadow .2s ease',
  backgroundColor: 'var(--colors-softBg)',
  border: '1px solid var(--colors-border)',
  padding: 0,
  '&[data-state="checked"]': {
    backgroundColor: 'var(--colors-selectionBg)',
    borderColor: 'var(--colors-selectionBorder)',
    color: 'var(--colors-selectionText)',
    fill: 'var(--colors-selectionText)',
  },
  '&[disabled]': {
    backgroundColor: 'var(--colors-surfaceSubtle)',
    borderColor: 'var(--colors-border)',
    color: 'var(--colors-textMuted)',
  },
  '&[data-focused="true"]': {
    boxShadow: '0 0 0 3px var(--colors-focusRingMuted)',
  },
  '&:focus-visible': {
    outline: '2px solid var(--colors-focusRing)',
  },
})

const labelClass = css({
  fontSize: '12px',
  color: 'var(--colors-text)',
  marginLeft: '8px',
  userSelect: 'none',
})

export interface CheckboxProps extends PrimitiveProps {
  /**
   * The label of the checkbox. You could pass a string or a ReactNode.
   */
  withLabel?: boolean
  label?: string | React.ReactNode
  onCheckedChange?: (checked: boolean) => void
}

/**
 * The basic `Checkbox` component.
 *
 * This component built on top of the `@radix-ui/react-checkbox` and you could use `ref` to access the underlying slider DOM element.
 *
 * This component provide both controlled and uncontrolled modes.
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  props: CheckboxProps,
  forwardedRef
) {
  const { id, label, withLabel, onCheckedChange, ...rest } = props

  let handleCheckChange

  if (onCheckedChange) {
    handleCheckChange = (checked) => {
      if (typeof checked === 'boolean') {
        onCheckedChange(checked)
      }
    }
  }

  return (
    <Flex align="v">
      <CheckboxPrimitive.Root
        className={rootClass}
        onCheckedChange={handleCheckChange}
        id={id}
        {...rest}
        ref={forwardedRef}>
        <CheckboxPrimitive.Indicator asChild>
          <IconCheck size="10px" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {withLabel && label && (
        <LabelPrimitive.Label className={labelClass} htmlFor={id}>
          {props.label}
        </LabelPrimitive.Label>
      )}
    </Flex>
  )
})

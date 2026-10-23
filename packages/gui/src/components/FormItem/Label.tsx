import { type ReactNode } from 'react'
import { PropertyDescription, PropertyLabel } from '@pivot-ui/react'
import type { SystemStyleObject } from '../../../styled-system/types'

export interface LabelProps {
  id?: string
  info?: ReactNode
  label: string
  startSlot?: ReactNode
  endSlot?: ReactNode
  htmlFor?: string
  css?: SystemStyleObject
}

/** Compatibility adapter; descriptions are visible instead of requiring a hover interaction. */
export function Label({ info, label, ...props }: LabelProps) {
  return (
    <>
      <PropertyLabel {...props}>{label}</PropertyLabel>
      {info != null && <PropertyDescription>{info}</PropertyDescription>}
    </>
  )
}

import { css, cx } from '../../../styled-system/css'
import type { SystemStyleObject } from '../../../styled-system/types'
import { getOverlaySurfaceClass } from '../overlays/shared'

export function getDialogOverlayClass(overrides?: SystemStyleObject) {
  return css(
    {
      position: 'fixed',
      inset: 0,
      zIndex: 'var(--pivot-overlay-layer, 50)',
      backgroundColor: 'var(--colors-overlayScrim)',
    },
    overrides
  )
}

export function getDialogContentClass(overrides?: SystemStyleObject) {
  return getOverlaySurfaceClass(
    css.raw(
      {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(440px, calc(100vw - 32px))',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100dvh - 32px)',
        boxSizing: 'border-box',
        overflow: 'auto',
        padding: '16px',
        borderRadius: '8px',
        '&:focus': { outline: 'none' },
      },
      overrides
    )
  )
}

/** Convenience confirmations keep the decision buttons outside the scrolling body. */
export function getAlertDialogLayoutStyles(overrides?: SystemStyleObject) {
  return css.raw({ display: 'flex', flexDirection: 'column', overflow: 'hidden' }, overrides)
}

export function getDialogTitleClass(overrides?: SystemStyleObject) {
  return css(
    {
      margin: 0,
      paddingInlineEnd: '28px',
      fontSize: '18px',
      lineHeight: '26px',
      fontWeight: 600,
      color: 'var(--colors-textStrong)',
      overflowWrap: 'anywhere',
    },
    overrides
  )
}

export function getDialogDescriptionClass(overrides?: SystemStyleObject) {
  return css(
    {
      margin: '8px 0 0',
      fontSize: '14px',
      lineHeight: '20px',
      whiteSpace: 'pre-line',
      color: 'var(--colors-textMuted)',
      overflowWrap: 'anywhere',
    },
    overrides
  )
}

export const dialogClasses = {
  hidden: css({
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    border: 0,
  }),
  body: css({ marginTop: '16px', minWidth: 0 }),
  alertHeader: css({ flexShrink: 0 }),
  alertBody: css({ minWidth: 0, minHeight: 0, overflow: 'auto', overscrollBehavior: 'contain' }),
  footer: css({
    display: 'flex',
    flexShrink: 0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '20px',
  }),
  close: css({ position: 'absolute', top: '8px', right: '8px' }),
}

export { cx }

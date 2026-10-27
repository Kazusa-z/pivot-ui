import { css, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'
import { getOverlaySurfaceClass } from '../overlays/shared'

export function getDialogOverlayClass(overrides?: SystemStyleObject) {
  return css(
    {
      position: 'fixed',
      inset: 0,
      zIndex: 'var(--pivot-overlay-layer, 50)',
      backgroundColor: 'var(--colors-overlayScrim)',
      '&[data-state="open"]': {
        animationName: 'overlayFadeIn',
        animationDuration: '150ms',
        animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      '@media (prefers-reduced-motion: reduce)': {
        '&[data-state="open"]': { animation: 'none' },
      },
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
        padding: 'var(--space-5)',
        borderRadius: 'var(--radii-modal)',
        boxShadow: 'var(--shadows-modal)',
        '&:focus': { outline: 'none' },
        '&[data-state="open"]': {
          animationName: 'contentShow',
          animationDuration: '180ms',
          animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '&[data-state="open"]': { animation: 'none' },
        },
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
      paddingInlineEnd: 'var(--space-7)',
      fontSize: 'var(--fontSizes-heading)',
      lineHeight: 'var(--lineHeights-3)',
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
      margin: 'var(--space-2) 0 0',
      fontSize: 'var(--fontSizes-controlLarge)',
      lineHeight: 'var(--lineHeights-2)',
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
  body: css({ marginTop: 'var(--space-4)', minWidth: 0 }),
  alertHeader: css({ flexShrink: 0 }),
  alertBody: css({ minWidth: 0, minHeight: 0, overflow: 'auto', overscrollBehavior: 'contain' }),
  footer: css({
    display: 'flex',
    flexShrink: 0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 'var(--space-2)',
    marginTop: 'var(--space-5)',
  }),
  close: css({ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)' }),
}

export { cx }

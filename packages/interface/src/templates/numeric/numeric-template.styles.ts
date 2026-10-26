import { css } from '../../../styled-system/css'

export const numericTemplateClasses = {
  group: css({
    display: 'flex',
    alignItems: 'flex-end',
    gap: 'var(--space-1_5)',
    minWidth: 0,
    width: '100%',
  }),
  axes: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 72px), 1fr))',
    gap: 'var(--space-1_5)',
    flex: 1,
    minWidth: 0,
  }),
  axis: css({ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', minWidth: 0 }),
  label: css({
    fontSize: 'var(--fontSizes-micro)',
    color: 'var(--colors-textMuted)',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  slider: css({
    display: 'grid',
    gridTemplateColumns: 'minmax(72px, 1fr) minmax(72px, 2fr)',
    gap: 'var(--space-2_5)',
    alignItems: 'center',
    minWidth: 0,
    width: '100%',
    '@media (max-width: 360px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  }),
  hidden: css({
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  }),
}

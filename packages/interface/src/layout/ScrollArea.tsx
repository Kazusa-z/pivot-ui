import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type Ref,
} from 'react'
import * as Primitive from '@radix-ui/react-scroll-area'
import { css, cva, cx } from '../../styled-system/css'
import type { SystemStyleObject } from '../../styled-system/types'

type Edges = { top: boolean; bottom: boolean; left: boolean; right: boolean }
const emptyEdges: Edges = { top: false, bottom: false, left: false, right: false }
type Scrollbars = 'vertical' | 'horizontal' | 'both'
type Sizing = 'fill' | 'content'

const ScrollContext = createContext<{
  scrollbars: Scrollbars
  sizing: Sizing
  shadows: boolean
  reportEdges: (edges: Edges) => void
} | null>(null)

const rootRecipe = cva({
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
    minHeight: 0,
    maxHeight: 'inherit',
    overflow: 'hidden',
  },
  variants: { sizing: { fill: { height: '100%' }, content: { height: 'auto' } } },
})
const viewportRecipe = cva({
  base: {
    width: '100%',
    minWidth: 0,
    minHeight: 0,
    maxHeight: 'inherit',
    borderRadius: 'inherit',
    boxSizing: 'border-box',
    '&:focus-visible': { outline: '2px solid var(--colors-focusRing)', outlineOffset: '-2px' },
  },
  variants: { sizing: { fill: { height: '100%' }, content: { height: 'auto' } } },
})
const scrollbarRecipe = cva({
  base: {
    display: 'flex',
    boxSizing: 'content-box',
    userSelect: 'none',
    touchAction: 'none',
    zIndex: 2,
    '&[data-orientation="vertical"]': { width: '4px', padding: '2px' },
    '&[data-orientation="horizontal"]': { flexDirection: 'column', height: '4px', padding: '2px' },
  },
  variants: {
    variant: {
      subtle: { background: 'transparent', '&:hover': { background: 'var(--colors-scrollbarTrackHover)' } },
      track: { background: 'var(--colors-scrollbarTrack)' },
    },
  },
})
const thumbClass = css({
  flex: 1,
  background: 'var(--colors-scrollbarThumb)',
  borderRadius: 'var(--radii-pill)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    minWidth: '8px',
    minHeight: '8px',
  },
})
const shadowRecipe = cva({
  base: { position: 'absolute', pointerEvents: 'none', zIndex: 1 },
  variants: {
    edge: {
      top: {
        top: 0,
        left: 0,
        right: 0,
        height: '10px',
        background: 'linear-gradient(to bottom, var(--colors-borderStrong), transparent)',
      },
      bottom: {
        bottom: 0,
        left: 0,
        right: 0,
        height: '10px',
        background: 'linear-gradient(to top, var(--colors-borderStrong), transparent)',
      },
      left: {
        top: 0,
        bottom: 0,
        left: 0,
        width: '10px',
        background: 'linear-gradient(to right, var(--colors-borderStrong), transparent)',
      },
      right: {
        top: 0,
        bottom: 0,
        right: 0,
        width: '10px',
        background: 'linear-gradient(to left, var(--colors-borderStrong), transparent)',
      },
    },
  },
})

export interface ScrollAreaRootProps extends Omit<
  ComponentPropsWithoutRef<typeof Primitive.Root>,
  'asChild' | 'onScroll' | 'onScrollCapture'
> {
  /** `fill` 填满父元素给定的高度（默认）；`content` 随内容增长，配合 `maxHeight` 使用。 */
  sizing?: Sizing
  /** 允许滚动的方向：`both`（默认）、`vertical` 或 `horizontal`。 */
  scrollbars?: Scrollbars
  /** `subtle` 只有滑块（默认）；`track` 带轨道底色，适合需要明确可滚动的区域。 */
  scrollbarVariant?: 'subtle' | 'track'
  /** 内容超出时在边缘显示渐隐阴影，提示还可以滚动。 */
  shadows?: boolean
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}

/** Layout and scrollbar policy belong to the root. Its ref points to the outer div. */
export const ScrollAreaRoot = forwardRef<HTMLDivElement, ScrollAreaRootProps>(function ScrollAreaRoot(
  {
    sizing = 'fill',
    scrollbars = 'both',
    scrollbarVariant = 'subtle',
    shadows = false,
    type = 'hover',
    css: cssProp,
    className,
    children,
    ...props
  },
  ref
) {
  const [edges, setEdges] = useState(emptyEdges)
  const reportEdges = useCallback((next: Edges) => {
    setEdges((previous) =>
      previous.top === next.top &&
      previous.bottom === next.bottom &&
      previous.left === next.left &&
      previous.right === next.right
        ? previous
        : next
    )
  }, [])
  const context = useMemo(
    () => ({ sizing, scrollbars, shadows, reportEdges }),
    [sizing, scrollbars, shadows, reportEdges]
  )
  return (
    <ScrollContext.Provider value={context}>
      <Primitive.Root
        {...props}
        ref={ref}
        type={type}
        className={cx(css(rootRecipe.raw({ sizing }), cssProp), className)}>
        {children}
        {(['horizontal', 'vertical'] as const).map((orientation) =>
          scrollbars === 'both' || scrollbars === orientation ? (
            <Primitive.Scrollbar
              key={orientation}
              orientation={orientation}
              className={scrollbarRecipe({ variant: scrollbarVariant })}>
              <Primitive.Thumb className={thumbClass} />
            </Primitive.Scrollbar>
          ) : null
        )}
        <Primitive.Corner className={css({ background: 'var(--colors-scrollbarTrackHover)' })} />
        {shadows &&
          (['top', 'bottom', 'left', 'right'] as const).map((edge) =>
            edges[edge] ? (
              <span key={edge} aria-hidden="true" data-scroll-shadow={edge} className={shadowRecipe({ edge })} />
            ) : null
          )}
      </Primitive.Root>
    </ScrollContext.Provider>
  )
})

export interface ScrollAreaViewportProps extends Omit<
  ComponentPropsWithoutRef<typeof Primitive.Viewport>,
  'asChild' | 'disableImplicitContentElement'
> {
  /** `block` 内容按视口宽度换行（默认）；`intrinsic` 内容保持自身宽度，用于横向滚动的表格。 */
  contentLayout?: 'block' | 'intrinsic'
  /** 追加 Panda 样式对象。 */
  css?: SystemStyleObject
}

/** Scroll events, keyboard focus, and the imperative scrolling ref belong to the viewport. */
export const ScrollAreaViewport = forwardRef<HTMLDivElement, ScrollAreaViewportProps>(function ScrollAreaViewport(
  { css: cssProp, className, children, tabIndex = 0, contentLayout = 'block', ...props },
  forwardedRef
) {
  const context = useContext(ScrollContext)
  if (!context) throw new Error('ScrollAreaViewport must be rendered inside ScrollAreaRoot.')
  const { sizing, scrollbars, shadows, reportEdges } = context
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const setViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node
      if (typeof forwardedRef === 'function') return forwardedRef(node)
      if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef]
  )

  useEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!shadows || !viewport || !content) return
    const update = () => {
      const vertical = scrollbars !== 'horizontal'
      const horizontal = scrollbars !== 'vertical'
      const maxX = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
      const x = Math.abs(viewport.scrollLeft)
      const rtl = viewport.ownerDocument.defaultView?.getComputedStyle(viewport).direction === 'rtl'
      reportEdges({
        top: vertical && viewport.scrollTop > 1,
        bottom: vertical && viewport.scrollTop < viewport.scrollHeight - viewport.clientHeight - 1,
        left: horizontal && (rtl ? x < maxX - 1 : x > 1),
        right: horizontal && (rtl ? x > 1 : x < maxX - 1),
      })
    }
    update()
    viewport.addEventListener('scroll', update, { passive: true })
    const ResizeObserverClass = viewport.ownerDocument.defaultView?.ResizeObserver
    const observer = ResizeObserverClass ? new ResizeObserverClass(update) : undefined
    observer?.observe(viewport)
    observer?.observe(content)
    return () => {
      viewport.removeEventListener('scroll', update)
      observer?.disconnect()
      reportEdges(emptyEdges)
    }
  }, [shadows, scrollbars, reportEdges])

  return (
    <Primitive.Viewport
      {...props}
      ref={setViewportRef}
      tabIndex={tabIndex}
      disableImplicitContentElement
      className={cx(css(viewportRecipe.raw({ sizing }), cssProp), className)}>
      <Primitive.Content ref={contentRef} style={{ display: contentLayout === 'block' ? 'block' : 'table' }}>
        {children}
      </Primitive.Content>
    </Primitive.Viewport>
  )
})

export interface ScrollAreaProps extends ScrollAreaRootProps {
  /** 传给滚动视口的属性。 */
  viewportProps?: Omit<ScrollAreaViewportProps, 'children'>
  /** 滚动视口的 ref，可用于读取或设置滚动位置。 */
  viewportRef?: Ref<HTMLDivElement>
}

/** Convenient composition; root layout props and viewport event props remain separate. */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { children, viewportProps, viewportRef, ...props },
  ref
) {
  return (
    <ScrollAreaRoot {...props} ref={ref}>
      <ScrollAreaViewport {...viewportProps} ref={viewportRef}>
        {children}
      </ScrollAreaViewport>
    </ScrollAreaRoot>
  )
})

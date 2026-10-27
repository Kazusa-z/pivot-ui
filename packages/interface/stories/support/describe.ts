export interface ComponentDescription {
  /** 一句话说明组件用来做什么。 */
  summary: string
  /** 适合的场景。 */
  use?: readonly string[]
  /** 不适合的场景，并指出应该改用什么。 */
  avoid?: readonly string[]
  /** 容易混淆的组件及区别，例如 ['`Slider`：只有滑块，没有输入框']。 */
  related?: readonly string[]
  /** 键盘操作：[按键, 作用]。 */
  keyboard?: readonly (readonly [string, string])[]
  /** 与应用数据或服务的接入要点。 */
  notes?: readonly string[]
}

const list = (items: readonly string[]) => items.map((item) => `- ${item}`).join('\n')

/**
 * Docs parameters for a component page. The summary becomes the subtitle right under the
 * title, so the page reads: what it is → the typical example → when to use it → API →
 * more examples. Spread the result into the meta's `parameters`.
 */
export function describeComponent({ summary, use, avoid, related, keyboard, notes }: ComponentDescription) {
  const parts: string[] = []
  if (use?.length) parts.push(`#### 适合\n\n${list(use)}`)
  if (avoid?.length) parts.push(`#### 不适合\n\n${list(avoid)}`)
  if (related?.length) parts.push(`#### 相近组件\n\n${list(related)}`)
  if (notes?.length) parts.push(`#### 接入要点\n\n${list(notes)}`)
  if (keyboard?.length) {
    const rows = keyboard.map(([keys, action]) => `| ${keys} | ${action} |`).join('\n')
    parts.push(`#### 键盘\n\n| 按键 | 作用 |\n| --- | --- |\n${rows}`)
  }
  return { componentSubtitle: summary, docs: { description: { component: parts.join('\n\n') } } }
}

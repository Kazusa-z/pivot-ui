export type ShortcutInput = string | readonly string[]
export type ShortcutLetterCase = 'upper' | 'lower' | 'preserve'
export type ShortcutGesture = 'mouse-left' | 'mouse-right' | 'mouse-double' | 'touch-one' | 'touch-two'
export type ShortcutToken =
  | { readonly kind: 'key'; readonly key: string; readonly display: string; readonly label: string }
  | { readonly kind: 'gesture'; readonly key: ShortcutGesture; readonly label: string }

const keys: Record<string, readonly [display: string, label: string]> = {
  backspace: ['⌫', 'Backspace'],
  delete: ['Del', 'Delete'],
  del: ['Del', 'Delete'],
  cmd: ['⌘', 'Command'],
  command: ['⌘', 'Command'],
  meta: ['⌘', 'Command'],
  '⌘': ['⌘', 'Command'],
  alt: ['⌥', 'Alt'],
  option: ['⌥', 'Alt'],
  '⌥': ['⌥', 'Alt'],
  ctrl: ['⌃', 'Control'],
  control: ['⌃', 'Control'],
  '⌃': ['⌃', 'Control'],
  shift: ['⇧', 'Shift'],
  '⇧': ['⇧', 'Shift'],
  enter: ['↩', 'Enter'],
  return: ['↩', 'Enter'],
  '↩': ['↩', 'Enter'],
  escape: ['Esc', 'Escape'],
  esc: ['Esc', 'Escape'],
  tab: ['⇥', 'Tab'],
  capslock: ['⇪', 'Caps Lock'],
  'caps lock': ['⇪', 'Caps Lock'],
  space: ['Space', 'Space'],
  spacebar: ['Space', 'Space'],
  arrowup: ['↑', 'Up arrow'],
  up: ['↑', 'Up arrow'],
  '↑': ['↑', 'Up arrow'],
  arrowdown: ['↓', 'Down arrow'],
  down: ['↓', 'Down arrow'],
  '↓': ['↓', 'Down arrow'],
  arrowleft: ['←', 'Left arrow'],
  left: ['←', 'Left arrow'],
  '←': ['←', 'Left arrow'],
  arrowright: ['→', 'Right arrow'],
  right: ['→', 'Right arrow'],
  '→': ['→', 'Right arrow'],
  plus: ['+', 'Plus'],
  '+': ['+', 'Plus'],
  comma: [',', 'Comma'],
  ',': [',', 'Comma'],
}

const gestures: Record<string, readonly [key: ShortcutGesture, label: string]> = {
  mld: ['mouse-left', 'Left mouse button'],
  'mouse-left': ['mouse-left', 'Left mouse button'],
  mrd: ['mouse-right', 'Right mouse button'],
  'mouse-right': ['mouse-right', 'Right mouse button'],
  mdd: ['mouse-double', 'Double click'],
  'mouse-double': ['mouse-double', 'Double click'],
  of: ['touch-one', 'One-finger gesture'],
  'touch-one': ['touch-one', 'One-finger gesture'],
  tf: ['touch-two', 'Two-finger gesture'],
  'touch-two': ['touch-two', 'Two-finger gesture'],
}

function splitKeys(value: string): string[] {
  const trimmed = value.trim()
  if (trimmed === '+' || trimmed === ',') return [trimmed]
  const parts = trimmed
    .split(/[,+]/)
    .map((part) => part.trim())
    .filter(Boolean)
  // A literal plus is also accepted as "Ctrl++", "Ctrl+Plus" or ['Ctrl', '+'].
  if (/\+\s*\+$/.test(trimmed)) parts.push('+')
  return parts
}

/** Formats labels only. This module has no platform detection or input listeners. */
export function formatShortcut(
  shortcuts: ShortcutInput | undefined,
  letterCase: ShortcutLetterCase = 'upper'
): ShortcutToken[] {
  const inputs = typeof shortcuts === 'string' ? [shortcuts] : (shortcuts ?? [])
  return inputs.flatMap(splitKeys).map((key) => {
    const normalized = key.toLowerCase()
    const gesture = Object.prototype.hasOwnProperty.call(gestures, normalized) ? gestures[normalized] : undefined
    if (gesture) return { kind: 'gesture', key: gesture[0], label: gesture[1] }
    const named = Object.prototype.hasOwnProperty.call(keys, normalized) ? keys[normalized] : undefined
    const display =
      named?.[0] ?? (letterCase === 'upper' ? key.toUpperCase() : letterCase === 'lower' ? key.toLowerCase() : key)
    return {
      kind: 'key',
      key: named ? named[1].toLowerCase().replace(/\s+/g, '-') : normalized,
      display,
      label: named?.[1] ?? display,
    }
  })
}

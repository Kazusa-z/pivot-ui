import {
  assertCurveValue,
  copyCurveValue,
  type CurvePreset,
  type CurvePresetService,
  type CurvePresetSummary,
} from '@pivot-ui/react'

type PresetStorage = Pick<Storage, 'getItem' | 'setItem'>

/** Explicit application opt-in. The controls never choose storage or migrate old keys themselves. */
export function createBrowserCurvePresetService(
  storage: PresetStorage,
  key = 'pivot.curve-presets.v1',
  createId: () => string = () => crypto.randomUUID()
): CurvePresetService {
  function read(): CurvePreset[] {
    const text = storage.getItem(key)
    if (text === null) return []
    const document: unknown = JSON.parse(text)
    if (
      !document ||
      typeof document !== 'object' ||
      !('version' in document) ||
      document.version !== 1 ||
      !('presets' in document) ||
      !Array.isArray(document.presets)
    ) {
      throw new Error('Unsupported curve preset storage format.')
    }
    const ids = new Set<string>()
    return document.presets.map((item: unknown) => {
      if (
        !item ||
        typeof item !== 'object' ||
        !('id' in item) ||
        typeof item.id !== 'string' ||
        !item.id.trim() ||
        ids.has(item.id) ||
        !('label' in item) ||
        typeof item.label !== 'string' ||
        !item.label.trim() ||
        !('value' in item)
      ) {
        throw new Error('Invalid curve preset record.')
      }
      ids.add(item.id)
      assertCurveValue(item.value)
      return { id: item.id, label: item.label, value: copyCurveValue(item.value) }
    })
  }
  function write(presets: readonly CurvePreset[]) {
    storage.setItem(key, JSON.stringify({ version: 1, presets }))
  }
  const summary = ({ id, label }: CurvePreset): CurvePresetSummary => ({ id, label })
  return {
    async list() {
      return read().map(summary)
    },
    async load(id) {
      const preset = read().find((item) => item.id === id)
      if (!preset) throw new Error('Curve preset no longer exists.')
      return copyCurveValue(preset.value)
    },
    async save({ label, value }) {
      const name = label.trim()
      if (!name) throw new Error('A preset name is required.')
      const curve = copyCurveValue(value)
      const presets = read(),
        id = createId()
      if (typeof id !== 'string' || !id.trim() || presets.some((preset) => preset.id === id))
        throw new Error('Curve preset ID must be new and nonempty.')
      const preset: CurvePreset = { id, label: name, value: curve }
      write([...presets, preset])
      return summary(preset)
    },
    async remove(id) {
      const presets = read()
      if (!presets.some((preset) => preset.id === id)) throw new Error('Curve preset no longer exists.')
      write(presets.filter((preset) => preset.id !== id))
    },
  }
}

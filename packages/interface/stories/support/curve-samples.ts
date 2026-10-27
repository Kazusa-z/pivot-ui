import { useMemo } from 'react'
import type { CurvePreset, CurvePresetService } from '../../src/contracts/curve'
import { defaultCurvePresets } from '../../src/editors/curve/CurvePresets'
import { copyCurveValue, type CurveValue } from '../../src/values/curve'

// Shared sample values for the Editors/Curve pages.

export const easeCurve: CurveValue = defaultCurvePresets[1].value

/** A falloff curve in real units: distance 0–10 m on X, intensity 0–2 on Y. */
export const falloffCurve: CurveValue = {
  interpolation: 'bezier',
  points: [
    { id: 'near', x: 0, y: 2, outHandle: { x: 3, y: 2 } },
    { id: 'far', x: 10, y: 0, inHandle: { x: 4, y: 0 } },
  ],
}

/** In-memory personal preset storage, standing in for an application service. */
export function useMemoryPresetService(): CurvePresetService {
  return useMemo<CurvePresetService>(() => {
    const entries = new Map<string, CurvePreset>([
      ['stored-arch', { id: 'stored-arch', label: 'Stored arch', value: defaultCurvePresets[2].value }],
    ])
    let next = 0
    return {
      async list() {
        return [...entries.values()].map(({ id, label }) => ({ id, label }))
      },
      async load(id) {
        const entry = entries.get(id)
        if (!entry) throw new Error('This preset no longer exists. Refresh the list.')
        return copyCurveValue(entry.value)
      },
      async save(input) {
        const id = `stored-${++next}`
        entries.set(id, { id, label: input.label, value: copyCurveValue(input.value) })
        return { id, label: input.label }
      },
      async remove(id) {
        entries.delete(id)
      },
    }
  }, [])
}

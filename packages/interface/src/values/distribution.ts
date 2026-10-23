export interface DistributionConstraints {
  total?: number
  minSegment?: number
}

function nonnegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${label} must be finite and nonnegative.`)
  return value
}

export function getDistributionTotal(values: readonly number[]): number {
  const total = values.reduce((sum, value) => sum + nonnegative(value, 'Segment length'), 0)
  return nonnegative(total, 'Distribution total')
}

/** Validates without rescaling: segment lengths and their total are application values. */
export function validateDistribution(values: readonly number[], constraints: DistributionConstraints = {}): number {
  const sum = getDistributionTotal(values)
  const total = nonnegative(constraints.total ?? sum, 'Distribution total')
  const minimum = nonnegative(constraints.minSegment ?? 0, 'Minimum segment')
  const epsilon = Math.max(1, total) * 1e-10
  if (Math.abs(sum - total) > epsilon) throw new RangeError('Segment lengths must add up to the distribution total.')
  if (values.some((value) => value + epsilon < minimum)) throw new RangeError('A segment is smaller than minSegment.')
  return total
}

/** n lengths have exactly n - 1 editable cumulative boundaries, including coincident zero-length segments. */
export function distributionToBoundaries(
  values: readonly number[],
  constraints: DistributionConstraints = {}
): number[] {
  validateDistribution(values, constraints)
  let sum = 0
  return values.slice(0, -1).map((value) => (sum += value))
}

export function boundariesToDistribution(boundaries: readonly number[], total: number, minSegment = 0): number[] {
  nonnegative(total, 'Distribution total')
  nonnegative(minSegment, 'Minimum segment')
  let previous = 0
  const values = [...boundaries, total].map((boundary) => {
    nonnegative(boundary, 'Boundary')
    if (boundary < previous || boundary > total) throw new RangeError('Boundaries must be ordered within the total.')
    const length = boundary - previous
    previous = boundary
    return length
  })
  validateDistribution(values, { total, minSegment })
  return values
}

/** Moves only the adjacent pair, preserving total, segment count and every other segment. */
export function moveDistributionBoundary(
  values: readonly number[],
  index: number,
  position: number,
  constraints: DistributionConstraints = {}
): number[] {
  const total = validateDistribution(values, constraints)
  if (!Number.isInteger(index) || index < 0 || index >= values.length - 1)
    throw new RangeError('Invalid distribution boundary index.')
  if (!Number.isFinite(position)) throw new RangeError('Boundary position must be finite.')
  const boundaries = distributionToBoundaries(values)
  const minimum = constraints.minSegment ?? 0
  const lower = (boundaries[index - 1] ?? 0) + minimum
  const upper = (boundaries[index + 1] ?? total) - minimum
  boundaries[index] = Math.min(upper, Math.max(lower, position))
  return boundariesToDistribution(boundaries, total, minimum)
}

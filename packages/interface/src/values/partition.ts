export interface PartitionConstraints {
  total?: number
  minSegment?: number
}

function nonnegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${label} must be finite and nonnegative.`)
  return value
}

export function getPartitionTotal(values: readonly number[]): number {
  const total = values.reduce((sum, value) => sum + nonnegative(value, 'Segment length'), 0)
  return nonnegative(total, 'Partition total')
}

/** Validates without rescaling: segment lengths and their total are application values. */
export function validatePartition(values: readonly number[], constraints: PartitionConstraints = {}): number {
  const sum = getPartitionTotal(values)
  const total = nonnegative(constraints.total ?? sum, 'Partition total')
  const minimum = nonnegative(constraints.minSegment ?? 0, 'Minimum segment')
  const epsilon = Math.max(1, total) * 1e-10
  if (Math.abs(sum - total) > epsilon) throw new RangeError('Segment lengths must add up to the partition total.')
  if (values.some((value) => value + epsilon < minimum)) throw new RangeError('A segment is smaller than minSegment.')
  return total
}

/** n lengths have exactly n - 1 editable cumulative boundaries, including coincident zero-length segments. */
export function partitionToBoundaries(values: readonly number[], constraints: PartitionConstraints = {}): number[] {
  validatePartition(values, constraints)
  let sum = 0
  return values.slice(0, -1).map((value) => (sum += value))
}

export function boundariesToPartition(boundaries: readonly number[], total: number, minSegment = 0): number[] {
  nonnegative(total, 'Partition total')
  nonnegative(minSegment, 'Minimum segment')
  let previous = 0
  const values = [...boundaries, total].map((boundary) => {
    nonnegative(boundary, 'Boundary')
    if (boundary < previous || boundary > total) throw new RangeError('Boundaries must be ordered within the total.')
    const length = boundary - previous
    previous = boundary
    return length
  })
  validatePartition(values, { total, minSegment })
  return values
}

/** Moves only the adjacent pair, preserving total, segment count and every other segment. */
export function movePartitionBoundary(
  values: readonly number[],
  index: number,
  position: number,
  constraints: PartitionConstraints = {}
): number[] {
  const total = validatePartition(values, constraints)
  if (!Number.isInteger(index) || index < 0 || index >= values.length - 1)
    throw new RangeError('Invalid partition boundary index.')
  if (!Number.isFinite(position)) throw new RangeError('Boundary position must be finite.')
  const boundaries = partitionToBoundaries(values)
  const minimum = constraints.minSegment ?? 0
  const lower = (boundaries[index - 1] ?? 0) + minimum
  const upper = (boundaries[index + 1] ?? total) - minimum
  boundaries[index] = Math.min(upper, Math.max(lower, position))
  return boundariesToPartition(boundaries, total, minimum)
}

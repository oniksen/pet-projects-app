import { describe, expect, it } from 'vitest'
import { computeProgress, computeStageCounts } from '../../src/features/projects/projectProgress'

describe('computeProgress', () => {
  it('returns 0 when there are no stages', () => {
    expect(computeProgress(0, 0)).toBe(0)
  })

  it('returns 100 when every stage is done', () => {
    expect(computeProgress(4, 4)).toBe(100)
  })

  it('rounds to the nearest integer', () => {
    expect(computeProgress(3, 1)).toBe(33)
    expect(computeProgress(3, 2)).toBe(67)
  })
})

describe('computeStageCounts', () => {
  it('counts done stages and computes progress', () => {
    expect(
      computeStageCounts([
        { status: 'done' },
        { status: 'current' },
        { status: 'planned' },
      ]),
    ).toEqual({ stageCount: 3, doneStageCount: 1, progress: 33 })
  })

  it('handles an empty list', () => {
    expect(computeStageCounts([])).toEqual({ stageCount: 0, doneStageCount: 0, progress: 0 })
  })
})

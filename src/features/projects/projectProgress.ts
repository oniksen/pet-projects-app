import type { Stage } from '../../types/models'

export function computeProgress(stageCount: number, doneStageCount: number): number {
  if (stageCount <= 0) return 0
  return Math.round((doneStageCount / stageCount) * 100)
}

export function computeStageCounts(stages: Pick<Stage, 'status'>[]) {
  const stageCount = stages.length
  const doneStageCount = stages.filter((stage) => stage.status === 'done').length
  return {
    stageCount,
    doneStageCount,
    progress: computeProgress(stageCount, doneStageCount),
  }
}

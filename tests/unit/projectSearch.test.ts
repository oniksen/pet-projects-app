import { describe, expect, it } from 'vitest'
import { Timestamp } from 'firebase/firestore'
import type { Project } from '../../src/types/models'
import { filterProjects } from '../../src/features/projects/projectSearch'

const now = Timestamp.now()

function project(overrides: Partial<Project>): Project {
  return {
    id: 'p1',
    title: 'Luma Notes',
    description: 'Умные заметки',
    status: 'in_progress',
    visibility: 'public',
    tech: ['React', 'AI'],
    accent: '#D78961',
    icon: 'sparkles',
    progress: 50,
    stageCount: 2,
    doneStageCount: 1,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe('filterProjects', () => {
  const projects = [
    project({ id: '1', title: 'Luma Notes', progress: 50 }),
    project({ id: '2', title: 'Atlas', description: 'Карта мест', tech: ['Swift'], progress: 100 }),
  ]

  it('returns everything for an empty query and all filter', () => {
    expect(filterProjects(projects, '', 'all')).toHaveLength(2)
  })

  it('searches by title, description and tech', () => {
    expect(filterProjects(projects, 'luma', 'all').map((item) => item.id)).toEqual(['1'])
    expect(filterProjects(projects, 'карта', 'all').map((item) => item.id)).toEqual(['2'])
    expect(filterProjects(projects, 'swift', 'all').map((item) => item.id)).toEqual(['2'])
  })

  it('filters active and done projects', () => {
    expect(filterProjects(projects, '', 'active').map((item) => item.id)).toEqual(['1'])
    expect(filterProjects(projects, '', 'done').map((item) => item.id)).toEqual(['2'])
  })

  it('is case insensitive and ignores surrounding spaces', () => {
    expect(filterProjects(projects, '  ATLAS  ', 'all').map((item) => item.id)).toEqual(['2'])
  })
})

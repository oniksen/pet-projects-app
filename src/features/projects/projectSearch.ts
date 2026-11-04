import type { Project } from '../../types/models'

export type ProjectFilter = 'all' | 'active' | 'done'

export function filterProjects(projects: Project[], query: string, filter: ProjectFilter): Project[] {
  const normalized = query.trim().toLowerCase()
  return projects.filter((project) => {
    if (filter === 'active' && project.progress >= 100) return false
    if (filter === 'done' && project.progress < 100) return false
    if (!normalized) return true
    const haystack = `${project.title} ${project.description} ${project.tech.join(' ')}`.toLowerCase()
    return haystack.includes(normalized)
  })
}

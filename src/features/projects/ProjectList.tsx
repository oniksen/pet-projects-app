import { motion } from 'framer-motion'
import { ArrowUpRight, Circle, Code2, Leaf, Map, Sparkles } from 'lucide-react'
import type { Project, ProjectIcon } from '../../types/models'
import { PROJECT_STATUS_LABELS } from '../../types/models'
import { formatRelative } from '../../lib/dates'
import { VisibilityBadge } from '../../components/ui'

const icons: Record<ProjectIcon, typeof Sparkles> = {
  sparkles: Sparkles,
  circle: Circle,
  code: Code2,
  leaf: Leaf,
  map: Map,
}

export function ProjectList({
  projects,
  isAdmin,
  onOpen,
}: {
  projects: Project[]
  isAdmin: boolean
  onOpen: (projectId: string) => void
}) {
  return (
    <div className="project-list">
      {projects.map((project) => {
        const Icon = icons[project.icon] ?? Sparkles
        return (
          <motion.article
            key={project.id}
            className="project-row"
            role="button"
            tabIndex={0}
            aria-label={`Открыть проект ${project.title}`}
            onClick={() => onOpen(project.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onOpen(project.id)
              }
            }}
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="row-icon" style={{ '--accent': project.accent } as React.CSSProperties}>
              <Icon size={18} />
            </div>
            <div className="row-main">
              <div className="row-title-line">
                <h3>{project.title}</h3>
                {isAdmin && project.visibility === 'private' && <VisibilityBadge visibility="private" />}
                <span className="row-status">{PROJECT_STATUS_LABELS[project.status]}</span>
              </div>
              <p>{project.description || 'Без описания'}</p>
            </div>
            <div className="row-meta">
              <span>{project.tech.slice(0, 3).join(' · ') || 'Без технологий'}</span>
              <span>{formatRelative(project.updatedAt)}</span>
            </div>
            <div className="row-progress">
              <div className="progress-track">
                <div className="progress-value" style={{ width: `${project.progress}%`, background: project.accent }} />
              </div>
              <strong>{project.progress}%</strong>
            </div>
            <ArrowUpRight size={18} className="row-arrow" />
          </motion.article>
        )
      })}
    </div>
  )
}

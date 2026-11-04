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

export function ProjectCard({
  project,
  isAdmin,
  onOpen,
}: {
  project: Project
  isAdmin: boolean
  onOpen: () => void
}) {
  const Icon = icons[project.icon] ?? Sparkles

  return (
    <motion.article
      className="project-card"
      onClick={onOpen}
      tabIndex={0}
      role="button"
      aria-label={`Открыть проект ${project.title}`}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen()
        }
      }}
      whileHover={{ y: -7, boxShadow: '13px 16px 30px #cec6bb, -13px -13px 27px #ffffff' }}
      whileTap={{ scale: 0.985, boxShadow: 'inset 6px 6px 12px #d1c9be, inset -6px -6px 12px #ffffff' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="project-topline">
        <div className="project-icon" style={{ '--accent': project.accent } as React.CSSProperties}>
          <Icon size={21} />
        </div>
        <div className="project-topline-right">
          {isAdmin && project.visibility === 'private' && <VisibilityBadge visibility="private" />}
          <span className="stage">
            <i style={{ background: project.accent, boxShadow: `0 0 0 4px ${project.accent}1f` }} />
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
        </div>
      </div>
      <div className="project-copy">
        <h2>{project.title}</h2>
        <p>{project.description || 'Без описания'}</p>
      </div>
      <div className="tags">
        {project.tech.length > 0 ? (
          project.tech.map((item) => <span key={item}>{item}</span>)
        ) : (
          <span>Без технологий</span>
        )}
      </div>
      <div className="progress-head">
        <span>Прогресс · {project.doneStageCount} / {project.stageCount}</span>
        <strong>{project.progress}%</strong>
      </div>
      <div className="progress-track">
        <motion.div
          className="progress-value"
          style={{ background: project.accent }}
          initial={{ width: 0 }}
          animate={{ width: `${project.progress}%` }}
          transition={{ duration: 0.8, delay: 0.15 }}
        />
      </div>
      <div className="card-footer">
        <span>Обновлено {formatRelative(project.updatedAt)}</span>
        <span className="open-label">Открыть <ArrowUpRight size={15} /></span>
      </div>
    </motion.article>
  )
}

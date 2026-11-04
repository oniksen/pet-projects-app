import { useMemo, useState } from 'react'
import { LayoutGrid, List, Plus, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthProvider'
import { EmptyState, SoftButton } from '../../components/ui'
import { useLocalStorage } from '../../lib/useLocalStorage'
import { useProjects } from './useProjects'
import { filterProjects, type ProjectFilter } from './projectSearch'
import { ProjectCard } from './ProjectCard'
import { ProjectList } from './ProjectList'
import { ProjectFormModal } from './ProjectFormModal'

const filters: { value: ProjectFilter; label: string }[] = [
  { value: 'all', label: 'Все проекты' },
  { value: 'active', label: 'В работе' },
  { value: 'done', label: 'Завершённые' },
]

export function ProjectsPage() {
  const { projects, loading, error } = useProjects()
  const { isAdmin, status, retryAdminCheck } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ProjectFilter>('all')
  const [view, setView] = useLocalStorage<'grid' | 'list'>('workspace:view', 'grid')
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = useMemo(() => filterProjects(projects, query, filter), [projects, query, filter])
  const inProgress = projects.filter((project) => project.progress < 100).length

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <section className="hero">
        <div className="hero-label"><span /> ЛИЧНОЕ ПРОСТРАНСТВО</div>
        <h1>Здесь мои проекты,<br />их статус и <em>прогресс.</em></h1>
        <p>
          Публичная часть открыта всем: можно смотреть проекты, этапы и прогресс.
          <br className="desktop-break" /> Управление доступно только владельцу после входа.
        </p>
        <div className="hero-meta">
          <div><strong>{String(projects.length).padStart(2, '0')}</strong><span>всего проектов</span></div>
          <div className="meta-separator" />
          <div><strong>{String(inProgress).padStart(2, '0')}</strong><span>в работе</span></div>
        </div>
      </section>

      <section className="projects-section">
        <div className="projects-heading">
          <div>
            <span className="section-index">01 / ПРОЕКТЫ</span>
            <h2>Проекты в работе</h2>
          </div>
          {isAdmin && (
            <SoftButton className="new-project" onClick={() => setCreateOpen(true)}>
              <Plus size={17} /> Новый проект
            </SoftButton>
          )}
        </div>

        <div className="toolbar project-toolbar">
          <div className="filters">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`filter ${filter === item.value ? 'active' : ''}`}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="search-field project-search">
            <Search size={17} />
            <input
              id="project-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по проектам..."
              aria-label="Поиск по проектам"
            />
          </label>

          <div className="view-toggle" role="group" aria-label="Режим отображения">
            <button
              type="button"
              className={view === 'grid' ? 'active' : ''}
              aria-pressed={view === 'grid'}
              aria-label="Сетка"
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={view === 'list' ? 'active' : ''}
              aria-pressed={view === 'list'}
              aria-label="Список"
              onClick={() => setView('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {status === 'offline' && (
          <div className="form-warning inline-warning">
            Нет сети, чтобы проверить статус владельца. Показан гостевой режим.
            <button type="button" className="text-button" onClick={() => void retryAdminCheck()}>
              Повторить
            </button>
          </div>
        )}

        {error && (
          <div className="error-panel" role="alert">
            <strong>Не удалось загрузить проекты</strong>
            <span>{error}</span>
            <span className="muted">Проверьте, что Firestore Rules задеплоены и в проекте создана база.</span>
          </div>
        )}

        {loading ? (
          <div className="project-grid">
            {[0, 1, 2].map((item) => (
              <div className="project-card skeleton-card" key={item}>
                <div className="skeleton skeleton-icon" />
                <div className="skeleton skeleton-line wide" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line short" />
              </div>
            ))}
          </div>
        ) : error ? null : filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={24} />}
            title={query ? 'Ничего не найдено' : 'Здесь пока пусто'}
            text={query ? 'Попробуйте изменить запрос или фильтр.' : isAdmin ? 'Создайте первый проект.' : 'Публичных проектов пока нет.'}
          />
        ) : view === 'grid' ? (
          <div className="project-grid">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isAdmin={isAdmin}
                onOpen={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </div>
        ) : (
          <ProjectList
            projects={filtered}
            isAdmin={isAdmin}
            onOpen={(projectId) => navigate(`/projects/${projectId}`)}
          />
        )}
      </section>

      {createOpen && (
        <ProjectFormModal
          onClose={() => setCreateOpen(false)}
          onSaved={() => setCreateOpen(false)}
        />
      )}
    </motion.div>
  )
}

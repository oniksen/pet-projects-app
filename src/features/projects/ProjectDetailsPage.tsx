import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  GitBranch,
  LockKeyhole,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import type { Note, Stage } from '../../types/models'
import { NOTE_CATEGORY_LABELS, PROJECT_STATUS_LABELS, STAGE_STATUS_LABELS } from '../../types/models'
import { useAuth } from '../../app/providers/AuthProvider'
import { useToast } from '../../app/providers/ToastProvider'
import { ConfirmDialog, EmptyState, LoadingPage, SoftButton, Spinner, VisibilityBadge } from '../../components/ui'
import { formatDateTime, formatRelative, formatShortDate } from '../../lib/dates'
import { deleteNote } from '../notes/notesRepo'
import { NoteFormModal } from '../notes/NoteFormModal'
import { useNotes } from '../notes/useNotes'
import { useProject, useStages } from './useProjects'
import { deleteProject, deleteStage, recalcProject } from './projectsRepo'
import { ProjectFormModal } from './ProjectFormModal'
import { StageFormModal } from './StageFormModal'
import { NotFoundPage } from '../misc/NotFoundPage'

export function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { project, loading, notFound, error } = useProject(projectId)
  const { stages, loading: stagesLoading } = useStages(projectId)
  const { isAdmin } = useAuth()
  const { notes } = useNotes(projectId ?? null)
  const { push } = useToast()
  const navigate = useNavigate()

  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [stageModal, setStageModal] = useState<'create' | Stage | null>(null)
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false)
  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null)
  const [noteModal, setNoteModal] = useState<'create' | Note | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading) return <LoadingPage text="Загружаем проект…" />
  if (notFound) return <NotFoundPage />
  if (error) {
    return (
      <div className="inner-page">
        <div className="error-panel" role="alert">
          <strong>Не удалось открыть проект</strong>
          <span>{error}</span>
          <Link to="/" className="text-button">Вернуться к проектам</Link>
        </div>
      </div>
    )
  }
  if (!project) return <NotFoundPage />

  const onDeleteProject = async () => {
    setBusy(true)
    try {
      await deleteProject(project.id)
      push('Проект удалён.', 'success')
      navigate('/')
    } catch (deleteError) {
      push(`Не удалось удалить проект: ${(deleteError as Error).message}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  const onDeleteStage = async () => {
    if (!stageToDelete) return
    setBusy(true)
    try {
      await deleteStage(project.id, stageToDelete.id, stages)
      push('Этап удалён.', 'success')
      setStageToDelete(null)
    } catch (deleteError) {
      push(`Не удалось удалить этап: ${(deleteError as Error).message}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  const onDeleteNote = async () => {
    if (!noteToDelete) return
    setBusy(true)
    try {
      await deleteNote(noteToDelete.id)
      push('Заметка удалена.', 'success')
      setNoteToDelete(null)
    } catch (deleteError) {
      push(`Не удалось удалить заметку: ${(deleteError as Error).message}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  const onRecalc = async () => {
    try {
      await recalcProject(project.id)
      push('Прогресс пересчитан.', 'success')
    } catch (recalcError) {
      push(`Не удалось пересчитать: ${(recalcError as Error).message}`, 'error')
    }
  }

  return (
    <motion.div className="inner-page project-details-page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Link to="/" className="back-link"><ArrowLeft size={15} /> Все проекты</Link>

      <div className="detail-header">
        <div>
          <div className="eyebrow">
            {project.visibility === 'private' ? 'ПРИВАТНЫЙ ПРОЕКТ' : 'ПУБЛИЧНЫЙ ПРОЕКТ'}
            {project.visibility === 'private' && <LockKeyhole size={12} />}
          </div>
          <h1>{project.title}</h1>
          <div className="detail-meta">
            <span>{PROJECT_STATUS_LABELS[project.status]}</span>
            <span>·</span>
            <span>Обновлено {formatRelative(project.updatedAt)}</span>
            {isAdmin && <VisibilityBadge visibility={project.visibility} />}
          </div>
        </div>
        {isAdmin && (
          <div className="detail-actions">
            <SoftButton className="icon-button" label="Редактировать проект" onClick={() => setEditProjectOpen(true)}>
              <Pencil size={18} />
            </SoftButton>
            <SoftButton className="icon-button danger-button" label="Удалить проект" onClick={() => setDeleteProjectOpen(true)}>
              <Trash2 size={18} />
            </SoftButton>
          </div>
        )}
      </div>

      <div className="detail-grid">
        <section className="detail-main">
          <div className="section-title">
            <div>
              <span>ROADMAP</span>
              <h3>От идеи до релиза</h3>
            </div>
            {isAdmin && (
              <SoftButton className="tiny-button" onClick={() => setStageModal('create')}>
                <Plus size={15} /> Добавить этап
              </SoftButton>
            )}
          </div>

          {stagesLoading ? (
            <div className="page-loading"><Spinner /></div>
          ) : stages.length === 0 ? (
            <EmptyState
              title="Этапов пока нет"
              text={isAdmin ? 'Добавьте первый этап, чтобы отслеживать прогресс.' : 'Владелец ещё не добавил этапы.'}
            />
          ) : (
            <div className="roadmap">
              {stages.map((stage, index) => (
                <div className="roadmap-row" key={stage.id}>
                  <div className={`roadmap-marker ${stage.status === 'done' ? 'done' : stage.status === 'current' ? 'current' : ''}`}>
                    {stage.status === 'done' ? <Check size={14} /> : <span>{index + 1}</span>}
                  </div>
                  <div className="roadmap-copy">
                    <span>{STAGE_STATUS_LABELS[stage.status]}</span>
                    <h4>{stage.title}</h4>
                    {stage.description && <p>{stage.description}</p>}
                  </div>
                  {isAdmin && (
                    <div className="stage-actions">
                      <button type="button" className="icon-plain" aria-label="Редактировать этап" onClick={() => setStageModal(stage)}>
                        <Pencil size={14} />
                      </button>
                      <button type="button" className="icon-plain danger-text" aria-label="Удалить этап" onClick={() => setStageToDelete(stage)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="detail-side">
          <div className="progress-panel">
            <span className="panel-kicker">ОБЩИЙ ПРОГРЕСС</span>
            <div className="progress-number">{project.progress}<span>%</span></div>
            <div className="progress-track wide">
              <motion.div
                className="progress-value"
                style={{ background: project.accent }}
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 0.9 }}
              />
            </div>
            <div className="metric-row"><span>Этапы</span><strong>{project.doneStageCount} / {project.stageCount}</strong></div>
            <div className="metric-row"><span>Обновлён</span><strong>{formatShortDate(project.updatedAt)}</strong></div>
          </div>

          <div className="meta-panel">
            <div className="commit-heading"><CalendarDays size={17} /> О проекте</div>
            <p className="detail-description">{project.description || 'Без описания'}</p>
            {project.tech.length > 0 && (
              <div className="tags">
                {project.tech.map((item) => <span key={item}>{item}</span>)}
              </div>
            )}
            {project.githubUrl && (
              <a className="github-link" href={project.githubUrl} target="_blank" rel="noreferrer">
                <GitBranch size={14} /> Открыть на GitHub
              </a>
            )}
            {isAdmin && (
              <button type="button" className="text-button recalc-button" onClick={() => void onRecalc()}>
                <RefreshCw size={14} /> Пересчитать прогресс
              </button>
            )}
          </div>
        </aside>
      </div>

      {isAdmin && (
        <section className="detail-notes">
          <div className="section-title">
            <div>
              <span>ЗАМЕТКИ</span>
              <h3>Планы и мысли</h3>
            </div>
            <SoftButton className="tiny-button" onClick={() => setNoteModal('create')}>
              <Plus size={15} /> Добавить заметку
            </SoftButton>
          </div>

          {notes.length === 0 ? (
            <EmptyState title="Заметок пока нет" text="Запишите план или небольшую мысль по проекту." />
          ) : (
            <div className="detail-notes-grid">
              {notes.map((note) => (
                <article className="note-card project-note" key={note.id}>
                  <div className="note-meta">
                    <span>{NOTE_CATEGORY_LABELS[note.category]}</span>
                    <span>{formatDateTime(note.updatedAt)}</span>
                  </div>
                  <h3>{note.title}</h3>
                  <p className="note-body">{note.body}</p>
                  <div className="note-actions">
                    <button type="button" className="icon-plain" aria-label="Редактировать заметку" onClick={() => setNoteModal(note)}>
                      <Pencil size={14} />
                    </button>
                    <button type="button" className="icon-plain danger-text" aria-label="Удалить заметку" onClick={() => setNoteToDelete(note)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {editProjectOpen && (
        <ProjectFormModal project={project} onClose={() => setEditProjectOpen(false)} onSaved={() => setEditProjectOpen(false)} />
      )}
      {stageModal && (
        <StageFormModal
          projectId={project.id}
          stage={stageModal === 'create' ? undefined : stageModal}
          existingStages={stages}
          onClose={() => setStageModal(null)}
          onSaved={() => setStageModal(null)}
        />
      )}
      {deleteProjectOpen && (
        <ConfirmDialog
          title="Удалить проект?"
          text={`Проект «${project.title}», его этапы и заметки будут удалены без возможности восстановления.`}
          onCancel={() => setDeleteProjectOpen(false)}
          onConfirm={() => void onDeleteProject()}
          busy={busy}
        />
      )}
      {stageToDelete && (
        <ConfirmDialog
          title="Удалить этап?"
          text={`Этап «${stageToDelete.title}» будет удалён, прогресс пересчитается.`}
          onCancel={() => setStageToDelete(null)}
          onConfirm={() => void onDeleteStage()}
          busy={busy}
        />
      )}
      {noteModal && (
        <NoteFormModal
          projects={[project]}
          note={noteModal === 'create' ? undefined : noteModal}
          defaultProjectId={project.id}
          onClose={() => setNoteModal(null)}
          onSaved={() => setNoteModal(null)}
        />
      )}
      {noteToDelete && (
        <ConfirmDialog
          title="Удалить заметку?"
          text={`Заметка «${noteToDelete.title}» будет удалена.`}
          onCancel={() => setNoteToDelete(null)}
          onConfirm={() => void onDeleteNote()}
          busy={busy}
        />
      )}
    </motion.div>
  )
}

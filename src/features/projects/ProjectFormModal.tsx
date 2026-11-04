import { useState, type FormEvent } from 'react'
import { Plus, Save } from 'lucide-react'
import type { Project, ProjectFormValues } from '../../types/models'
import { PROJECT_STATUS_LABELS } from '../../types/models'
import { Modal, SoftButton } from '../../components/ui'
import { projectFormSchema } from '../../lib/validation'
import { createProject, updateProject } from './projectsRepo'

export function ProjectFormModal({
  project,
  onClose,
  onSaved,
}: {
  project?: Project
  onClose: () => void
  onSaved: () => void
}) {
  const [values, setValues] = useState<ProjectFormValues>({
    title: project?.title ?? '',
    description: project?.description ?? '',
    status: project?.status ?? 'idea',
    visibility: project?.visibility ?? 'public',
    tech: project?.tech.join(', ') ?? '',
    accent: project?.accent ?? '#C97B56',
    icon: project?.icon ?? 'sparkles',
    githubUrl: project?.githubUrl ?? '',
  })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const setField = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    const parsed = projectFormSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Проверьте поля формы')
      return
    }

    setBusy(true)
    try {
      if (project) {
        await updateProject(project.id, values)
      } else {
        await createProject(values)
      }
      onSaved()
      onClose()
    } catch (submitError) {
      setError((submitError as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      kicker={project ? 'РЕДАКТИРОВАНИЕ' : 'НОВЫЙ ПРОЕКТ'}
      title={project ? 'Настройки проекта' : 'Что будем строить?'}
      onClose={onClose}
      wide
    >
      <form className="entry-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Название</span>
          <input
            autoFocus
            value={values.title}
            maxLength={120}
            onChange={(event) => setField('title', event.target.value)}
            placeholder="Название проекта"
          />
        </label>

        <label className="field">
          <span>Описание</span>
          <textarea
            value={values.description}
            maxLength={2000}
            onChange={(event) => setField('description', event.target.value)}
            placeholder="Коротко опишите проект"
          />
        </label>

        <div className="form-grid">
          <label className="field">
            <span>Статус</span>
            <select value={values.status} onChange={(event) => setField('status', event.target.value as ProjectFormValues['status'])}>
              {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Доступ</span>
            <select
              value={values.visibility}
              onChange={(event) => setField('visibility', event.target.value as ProjectFormValues['visibility'])}
            >
              <option value="public">Публичный</option>
              <option value="private">Приватный</option>
            </select>
          </label>

          <label className="field">
            <span>Иконка</span>
            <select value={values.icon} onChange={(event) => setField('icon', event.target.value as ProjectFormValues['icon'])}>
              <option value="sparkles">Sparkles</option>
              <option value="circle">Circle</option>
              <option value="code">Code</option>
              <option value="leaf">Leaf</option>
              <option value="map">Map</option>
            </select>
          </label>

          <label className="field">
            <span>Акцент</span>
            <input type="color" value={values.accent} onChange={(event) => setField('accent', event.target.value)} />
          </label>
        </div>

        <label className="field">
          <span>Технологии</span>
          <input
            value={values.tech}
            maxLength={200}
            onChange={(event) => setField('tech', event.target.value)}
            placeholder="React, TypeScript, Firebase"
          />
        </label>

        <label className="field">
          <span>GitHub URL <small>необязательно</small></span>
          <input
            value={values.githubUrl ?? ''}
            maxLength={300}
            onChange={(event) => setField('githubUrl', event.target.value)}
            placeholder="https://github.com/..."
          />
        </label>

        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="text-button" onClick={onClose} disabled={busy}>Отмена</button>
          <SoftButton className="save-button" type="submit" disabled={busy}>
            {project ? <Save size={16} /> : <Plus size={16} />}
            {busy ? 'Сохраняем…' : project ? 'Сохранить' : 'Создать проект'}
          </SoftButton>
        </div>
      </form>
    </Modal>
  )
}

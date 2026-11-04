import { useState, type FormEvent } from 'react'
import { Plus, Save } from 'lucide-react'
import type { Note, NoteFormValues, Project } from '../../types/models'
import { NOTE_CATEGORY_LABELS } from '../../types/models'
import { Modal, SoftButton } from '../../components/ui'
import { noteFormSchema } from '../../lib/validation'
import { createNote, updateNote } from './notesRepo'

export function NoteFormModal({
  projects,
  note,
  defaultProjectId,
  onClose,
  onSaved,
}: {
  projects: Project[]
  note?: Note
  defaultProjectId?: string
  onClose: () => void
  onSaved: () => void
}) {
  const [values, setValues] = useState<NoteFormValues>({
    projectId: note?.projectId ?? defaultProjectId ?? projects[0]?.id ?? '',
    title: note?.title ?? '',
    body: note?.body ?? '',
    category: note?.category ?? 'note',
  })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    const parsed = noteFormSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Проверьте поля формы')
      return
    }
    if (!values.projectId) {
      setError('Сначала создайте проект')
      return
    }

    setBusy(true)
    try {
      if (note) {
        await updateNote(note.id, values)
      } else {
        await createNote(values)
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
      kicker={note ? 'РЕДАКТИРОВАНИЕ' : 'НОВАЯ ЗАМЕТКА'}
      title={note ? 'Изменить заметку' : 'Записать план или мысль'}
      onClose={onClose}
      wide
    >
      {projects.length === 0 ? (
        <div className="form-warning">Сначала создайте хотя бы один проект.</div>
      ) : (
        <form className="entry-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Проект</span>
            <select
              value={values.projectId}
              onChange={(event) => setValues((current) => ({ ...current, projectId: event.target.value }))}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Заголовок</span>
            <input
              autoFocus
              value={values.title}
              maxLength={160}
              onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
              placeholder="О чём заметка"
            />
          </label>

          <label className="field">
            <span>Текст</span>
            <textarea
              value={values.body}
              maxLength={5000}
              onChange={(event) => setValues((current) => ({ ...current, body: event.target.value }))}
              placeholder="План, мысль или небольшой текст"
              className="note-body-input"
            />
          </label>

          <label className="field">
            <span>Категория</span>
            <select
              value={values.category}
              onChange={(event) => setValues((current) => ({ ...current, category: event.target.value as NoteFormValues['category'] }))}
            >
              {Object.entries(NOTE_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          {error && <div className="form-error" role="alert">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="text-button" onClick={onClose} disabled={busy}>Отмена</button>
            <SoftButton className="save-button" type="submit" disabled={busy}>
              {note ? <Save size={16} /> : <Plus size={16} />}
              {busy ? 'Сохраняем…' : note ? 'Сохранить' : 'Добавить заметку'}
            </SoftButton>
          </div>
        </form>
      )}
    </Modal>
  )
}

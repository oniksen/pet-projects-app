import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Plus, Rss, Search, Trash2 } from 'lucide-react'
import type { Note, NoteCategory } from '../../types/models'
import { NOTE_CATEGORY_LABELS } from '../../types/models'
import { useToast } from '../../app/providers/ToastProvider'
import { ConfirmDialog, EmptyState, SoftButton } from '../../components/ui'
import { formatDateTime } from '../../lib/dates'
import { useProjects } from '../projects/useProjects'
import { deleteNote } from './notesRepo'
import { NoteFormModal } from './NoteFormModal'
import { useNotes } from './useNotes'

const categories: { value: NoteCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'plan', label: 'Планы' },
  { value: 'note', label: 'Заметки' },
  { value: 'idea', label: 'Идеи' },
]

export function NotesPage() {
  const { notes, loading } = useNotes(null)
  const { projects } = useProjects()
  const { push } = useToast()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<NoteCategory | 'all'>('all')
  const [noteModal, setNoteModal] = useState<'create' | Note | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)
  const [busy, setBusy] = useState(false)

  const projectNames = useMemo(
    () => new Map(projects.map((project) => [project.id, project.title])),
    [projects],
  )

  const filtered = notes.filter((note) => {
    if (category !== 'all' && note.category !== category) return false
    const normalized = query.trim().toLowerCase()
    if (!normalized) return true
    return `${note.title} ${note.body} ${NOTE_CATEGORY_LABELS[note.category]}`.toLowerCase().includes(normalized)
  })

  const onDelete = async () => {
    if (!noteToDelete) return
    setBusy(true)
    try {
      await deleteNote(noteToDelete.id)
      push('Заметка удалена.', 'success')
      setNoteToDelete(null)
    } catch (error) {
      push(`Не удалось удалить заметку: ${(error as Error).message}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div className="inner-page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <section className="page-intro notes-intro">
        <div>
          <div className="hero-label"><span /> ЗАМЕТКИ</div>
          <h1>Пишу о проектах,<br />дизайне и <em>коде.</em></h1>
          <p>Планы, небольшие заметки и идеи, привязанные к проектам.</p>
          <SoftButton className="new-project notes-add" onClick={() => setNoteModal('create')}>
            <Plus size={16} /> Добавить заметку
          </SoftButton>
        </div>
        <div className="notes-count"><Rss size={18} /><strong>{notes.length}</strong><span>заметок</span></div>
      </section>

      <div className="notes-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти заметку..." />
        </label>
        <div className="filters notes-filters">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`filter ${category === item.value ? 'active' : ''}`}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="page-loading"><span className="spinner" /> <span>Загружаем заметки…</span></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title={query ? 'Ничего не найдено' : 'Заметок пока нет'}
          text={query ? 'Попробуйте изменить запрос.' : 'Создайте первую заметку.'}
        />
      ) : (
        <section className="notes-grid">
          {filtered.map((note, index) => (
            <motion.article
              className={`note-card soft-panel ${index === 0 ? 'featured' : ''}`}
              key={note.id}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="note-meta">
                <span>{NOTE_CATEGORY_LABELS[note.category]}</span>
                <span>{formatDateTime(note.updatedAt)}</span>
              </div>
              <h2>{note.title}</h2>
              <p className="note-body">{note.body}</p>
              <div className="note-footer">
                <span className="note-project">{projectNames.get(note.projectId) ?? 'Проект удалён'}</span>
                <div className="note-actions">
                  <button type="button" className="icon-plain" aria-label="Редактировать заметку" onClick={() => setNoteModal(note)}>
                    <Pencil size={14} />
                  </button>
                  <button type="button" className="icon-plain danger-text" aria-label="Удалить заметку" onClick={() => setNoteToDelete(note)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </section>
      )}

      {noteModal && (
        <NoteFormModal
          projects={projects}
          note={noteModal === 'create' ? undefined : noteModal}
          onClose={() => setNoteModal(null)}
          onSaved={() => setNoteModal(null)}
        />
      )}
      {noteToDelete && (
        <ConfirmDialog
          title="Удалить заметку?"
          text={`Заметка «${noteToDelete.title}» будет удалена.`}
          onCancel={() => setNoteToDelete(null)}
          onConfirm={() => void onDelete()}
          busy={busy}
        />
      )}
    </motion.div>
  )
}

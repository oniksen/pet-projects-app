import { useState, type FormEvent } from 'react'
import { Plus, Save } from 'lucide-react'
import type { Stage, StageFormValues } from '../../types/models'
import { STAGE_STATUS_LABELS } from '../../types/models'
import { Modal, SoftButton } from '../../components/ui'
import { stageFormSchema } from '../../lib/validation'
import { addStage, updateStage } from './projectsRepo'

export function StageFormModal({
  projectId,
  stage,
  existingStages,
  onClose,
  onSaved,
}: {
  projectId: string
  stage?: Stage
  existingStages: Stage[]
  onClose: () => void
  onSaved: () => void
}) {
  const [values, setValues] = useState<StageFormValues>({
    title: stage?.title ?? '',
    description: stage?.description ?? '',
    status: stage?.status ?? 'planned',
  })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    const parsed = stageFormSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Проверьте поля формы')
      return
    }

    setBusy(true)
    try {
      if (stage) {
        await updateStage(projectId, stage.id, values, existingStages)
      } else {
        await addStage(projectId, values, existingStages)
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
      kicker="ROADMAP"
      title={stage ? 'Редактировать этап' : 'Добавить новый этап'}
      onClose={onClose}
    >
      <form className="entry-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Название</span>
          <input
            autoFocus
            value={values.title}
            maxLength={120}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            placeholder="Название этапа"
          />
        </label>

        <label className="field">
          <span>Описание</span>
          <textarea
            value={values.description}
            maxLength={2000}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
            placeholder="Что должно быть готово на этом этапе"
          />
        </label>

        <label className="field">
          <span>Статус</span>
          <select
            value={values.status}
            onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as StageFormValues['status'] }))}
          >
            {Object.entries(STAGE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="text-button" onClick={onClose} disabled={busy}>Отмена</button>
          <SoftButton className="save-button" type="submit" disabled={busy}>
            {stage ? <Save size={16} /> : <Plus size={16} />}
            {busy ? 'Сохраняем…' : stage ? 'Сохранить' : 'Добавить этап'}
          </SoftButton>
        </div>
      </form>
    </Modal>
  )
}

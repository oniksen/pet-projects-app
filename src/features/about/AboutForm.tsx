import { useState, type FormEvent } from 'react'
import { Save } from 'lucide-react'
import type { AboutContentData, AboutFormValues } from '../../types/models'
import { Modal, SoftButton } from '../../components/ui'
import {
  aboutFormSchema,
  parsePrinciples,
  parseSkills,
  parseStats,
  parseStory,
  serializePrinciples,
  serializeSkills,
  serializeStats,
  serializeStory,
} from '../../lib/validation'
import { saveAbout } from './aboutRepo'

export function AboutForm({
  content,
  onClose,
  onSaved,
}: {
  content: AboutContentData
  onClose: () => void
  onSaved: () => void
}) {
  const [values, setValues] = useState<AboutFormValues>({
    headline: content.headline,
    intro: content.intro,
    story: serializeStory(content.story),
    stats: serializeStats(content.stats),
    skills: serializeSkills(content.skills),
    principles: serializePrinciples(content.principles),
    portraitMonogram: content.portraitMonogram,
    contactEmail: content.contactEmail,
    cvUrl: content.cvUrl ?? '',
  })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const setField = <K extends keyof AboutFormValues>(key: K, value: AboutFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    const parsed = aboutFormSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Проверьте поля формы')
      return
    }

    setBusy(true)
    try {
      await saveAbout({
        headline: values.headline.trim(),
        intro: values.intro.trim(),
        story: parseStory(values.story),
        stats: parseStats(values.stats),
        skills: parseSkills(values.skills),
        principles: parsePrinciples(values.principles),
        portraitMonogram: values.portraitMonogram.trim(),
        contactEmail: values.contactEmail.trim(),
        ...(values.cvUrl?.trim() ? { cvUrl: values.cvUrl.trim() } : {}),
      })
      onSaved()
      onClose()
    } catch (submitError) {
      setError((submitError as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal kicker="ОБО МНЕ" title="Редактировать страницу" onClose={onClose} wide>
      <form className="entry-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Заголовок</span>
          <input
            autoFocus
            value={values.headline}
            maxLength={200}
            onChange={(event) => setField('headline', event.target.value)}
            placeholder="Я разработчик. Делаю сайты и приложения."
          />
        </label>

        <label className="field">
          <span>Короткое вступление</span>
          <textarea
            value={values.intro}
            maxLength={1000}
            onChange={(event) => setField('intro', event.target.value)}
            placeholder="Одна-две строки о себе"
          />
        </label>

        <label className="field">
          <span>История <small>абзацы разделяйте пустой строкой</small></span>
          <textarea
            value={values.story}
            maxLength={6000}
            onChange={(event) => setField('story', event.target.value)}
            className="about-textarea"
          />
        </label>

        <div className="form-grid">
          <label className="field">
            <span>Монограмма</span>
            <input
              value={values.portraitMonogram}
              maxLength={4}
              onChange={(event) => setField('portraitMonogram', event.target.value)}
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              value={values.contactEmail}
              maxLength={200}
              onChange={(event) => setField('contactEmail', event.target.value)}
              placeholder="hello@example.com"
            />
          </label>
        </div>

        <label className="field">
          <span>Статистика <small>каждая строка: значение | подпись</small></span>
          <textarea
            value={values.stats}
            maxLength={2000}
            onChange={(event) => setField('stats', event.target.value)}
            placeholder="6+ | лет опыта"
          />
        </label>

        <label className="field">
          <span>Инструменты <small>через запятую</small></span>
          <input
            value={values.skills}
            maxLength={1000}
            onChange={(event) => setField('skills', event.target.value)}
            placeholder="React, TypeScript, Figma"
          />
        </label>

        <label className="field">
          <span>Принципы <small>каждая строка: заголовок | текст</small></span>
          <textarea
            value={values.principles}
            maxLength={4000}
            onChange={(event) => setField('principles', event.target.value)}
            placeholder="Понять задачу | Сначала выясняю, какую проблему нужно решить."
          />
        </label>

        <label className="field">
          <span>Ссылка на CV <small>необязательно</small></span>
          <input
            value={values.cvUrl ?? ''}
            maxLength={300}
            onChange={(event) => setField('cvUrl', event.target.value)}
            placeholder="https://..."
          />
        </label>

        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="text-button" onClick={onClose} disabled={busy}>Отмена</button>
          <SoftButton className="save-button" type="submit" disabled={busy}>
            <Save size={16} /> {busy ? 'Сохраняем…' : 'Сохранить'}
          </SoftButton>
        </div>
      </form>
    </Modal>
  )
}

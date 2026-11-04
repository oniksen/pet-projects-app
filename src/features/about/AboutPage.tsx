import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Mail, Pencil } from 'lucide-react'
import { defaultAbout } from '../../content/about'
import { useAuth } from '../../app/providers/AuthProvider'
import { SoftButton } from '../../components/ui'
import type { AboutContentData } from '../../types/models'
import { useAbout } from './useAbout'
import { AboutForm } from './AboutForm'

function AboutHeadline({ text }: { text: string }) {
  const sentences = text.split(/(?<=\.)\s+/).filter(Boolean)
  if (sentences.length < 2) return <h1>{text}</h1>
  return (
    <h1>
      {sentences[0]}
      <br />
      <em>{sentences.slice(1).join(' ')}</em>
    </h1>
  )
}

export function AboutPage() {
  const { about } = useAbout()
  const { isAdmin } = useAuth()
  const [editOpen, setEditOpen] = useState(false)

  const content: AboutContentData = about
    ? {
        headline: about.headline,
        intro: about.intro,
        story: about.story,
        stats: about.stats,
        skills: about.skills,
        principles: about.principles,
        portraitMonogram: about.portraitMonogram,
        contactEmail: about.contactEmail,
        cvUrl: about.cvUrl,
      }
    : defaultAbout

  const storyHeading = content.story[0] ?? content.intro
  const storyParagraphs = content.story.slice(1)

  return (
    <motion.div className="inner-page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <section className="page-intro about-intro">
        <div>
          <div className="hero-label"><span /> ОБО МНЕ</div>
          <AboutHeadline text={content.headline} />
        </div>
        <div className="portrait-card">
          <div className="portrait-monogram">{content.portraitMonogram || 'AV'}</div>
          <span>{content.contactEmail || 'Открыт к проектам'}</span>
        </div>
      </section>

      <section className="about-grid">
        <div className="about-story soft-panel">
          <div className="about-story-top">
            <span className="section-index">01 / КОРОТКО</span>
            {isAdmin && (
              <SoftButton className="tiny-button" onClick={() => setEditOpen(true)}>
                <Pencil size={14} /> Редактировать
              </SoftButton>
            )}
          </div>
          <h2>{storyHeading}</h2>
          {storyParagraphs.map((paragraph, index) => (
            <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
          ))}
          {content.intro && storyHeading !== content.intro && !content.story.includes(content.intro) && <p>{content.intro}</p>}
          <div className="about-actions">
            <a className="soft-button new-project" href={`mailto:${content.contactEmail || 'hello@example.com'}`}>
              <Mail size={16} /> Связаться
            </a>
            {content.cvUrl && (
              <a className="soft-button new-project ghost" href={content.cvUrl} target="_blank" rel="noreferrer">
                <Download size={16} /> Скачать CV
              </a>
            )}
          </div>
        </div>

        <div className="about-aside">
          {content.stats.map((stat, index) => (
            <div className="stat-panel soft-panel" key={`${stat.value}-${index}`}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
          <div className="stack-panel soft-panel">
            <span className="section-index">ИНСТРУМЕНТЫ</span>
            <div className="skill-cloud">
              {content.skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </div>
        </div>
      </section>

      {content.principles.length > 0 && (
        <section className="principles">
          <div className="projects-heading">
            <div>
              <span className="section-index">02 / РАБОТА</span>
              <h2>Что для меня важно</h2>
            </div>
          </div>
          <div className="principle-grid">
            {content.principles.map((principle, index) => (
              <div className="principle soft-panel" key={`${principle.title}-${index}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {editOpen && (
        <AboutForm content={content} onClose={() => setEditOpen(false)} onSaved={() => setEditOpen(false)} />
      )}
    </motion.div>
  )
}

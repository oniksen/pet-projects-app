import type { Timestamp } from 'firebase/firestore'

export type ProjectStatus = 'idea' | 'prototype' | 'in_progress' | 'launched' | 'archived'
export type Visibility = 'public' | 'private'
export type ProjectIcon = 'sparkles' | 'circle' | 'code' | 'leaf' | 'map'
export type StageStatus = 'planned' | 'current' | 'done'
export type NoteCategory = 'plan' | 'note' | 'idea'

export type Project = {
  id: string
  title: string
  description: string
  status: ProjectStatus
  visibility: Visibility
  tech: string[]
  accent: string
  icon: ProjectIcon
  githubUrl?: string
  progress: number
  stageCount: number
  doneStageCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Stage = {
  id: string
  title: string
  description: string
  status: StageStatus
  order: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Note = {
  id: string
  projectId: string
  title: string
  body: string
  category: NoteCategory
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type AboutStat = { value: string; label: string }
export type AboutPrinciple = { title: string; body: string }

export type AboutContent = {
  headline: string
  intro: string
  story: string[]
  stats: AboutStat[]
  skills: string[]
  principles: AboutPrinciple[]
  portraitMonogram: string
  contactEmail: string
  cvUrl?: string
  updatedAt: Timestamp
}

export type AboutContentData = Omit<AboutContent, 'updatedAt'>

export type ProjectFormValues = {
  title: string
  description: string
  status: ProjectStatus
  visibility: Visibility
  tech: string
  accent: string
  icon: ProjectIcon
  githubUrl?: string
}

export type StageFormValues = {
  title: string
  description: string
  status: StageStatus
}

export type NoteFormValues = {
  projectId: string
  title: string
  body: string
  category: NoteCategory
}

export type AboutFormValues = {
  headline: string
  intro: string
  story: string
  stats: string
  skills: string
  principles: string
  portraitMonogram: string
  contactEmail: string
  cvUrl?: string
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  idea: 'Идея',
  prototype: 'Прототип',
  in_progress: 'В разработке',
  launched: 'Запущен',
  archived: 'В архиве',
}

export const STAGE_STATUS_LABELS: Record<StageStatus, string> = {
  planned: 'Дальше',
  current: 'Сейчас',
  done: 'Готово',
}

export const NOTE_CATEGORY_LABELS: Record<NoteCategory, string> = {
  plan: 'План',
  note: 'Заметка',
  idea: 'Идея',
}

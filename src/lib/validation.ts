import { z } from 'zod'
import type { AboutPrinciple, AboutStat } from '../types/models'

const httpsUrl = /^https:\/\/.+/i

export const projectFormSchema = z.object({
  title: z.string().trim().min(1, 'Введите название').max(120, 'Слишком длинное название'),
  description: z.string().trim().max(2000, 'Слишком длинное описание'),
  status: z.enum(['idea', 'prototype', 'in_progress', 'launched', 'archived']),
  visibility: z.enum(['public', 'private']),
  tech: z.string().max(200, 'Слишком много технологий'),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Цвет должен быть в формате #RRGGBB'),
  icon: z.enum(['sparkles', 'circle', 'code', 'leaf', 'map']),
  githubUrl: z
    .string()
    .trim()
    .max(300)
    .refine((value) => value === '' || httpsUrl.test(value), 'Ссылка должна начинаться с https://')
    .optional(),
})

export const stageFormSchema = z.object({
  title: z.string().trim().min(1, 'Введите название').max(120, 'Слишком длинное название'),
  description: z.string().trim().max(2000, 'Слишком длинное описание'),
  status: z.enum(['planned', 'current', 'done']),
})

export const noteFormSchema = z.object({
  projectId: z.string().min(1, 'Выберите проект'),
  title: z.string().trim().min(1, 'Введите заголовок').max(160, 'Слишком длинный заголовок'),
  body: z.string().trim().max(5000, 'Слишком длинный текст'),
  category: z.enum(['plan', 'note', 'idea']),
})

export const aboutFormSchema = z.object({
  headline: z.string().trim().max(200),
  intro: z.string().trim().max(1000),
  story: z.string().max(6000),
  stats: z.string().max(2000),
  skills: z.string().max(1000),
  principles: z.string().max(4000),
  portraitMonogram: z.string().trim().max(4),
  contactEmail: z.string().trim().max(200),
  cvUrl: z
    .string()
    .trim()
    .max(300)
    .refine((value) => value === '' || httpsUrl.test(value), 'Ссылка должна начинаться с https://')
    .optional(),
})

export function techToArray(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, 12)
}

export function parseStory(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20)
}

export function serializeStory(story: string[]): string {
  return story.join('\n\n')
}

export function parseSkills(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, 30)
}

export function serializeSkills(skills: string[]): string {
  return skills.join(', ')
}

export function parseStats(value: string): AboutStat[] {
  return value
    .split('\n')
    .map((line) => line.split('|'))
    .map(([rawValue, ...rest]) => ({
      value: (rawValue ?? '').trim(),
      label: rest.join('|').trim(),
    }))
    .filter((item) => item.value || item.label)
    .slice(0, 10)
}

export function serializeStats(stats: AboutStat[]): string {
  return stats.map((item) => `${item.value} | ${item.label}`).join('\n')
}

export function parsePrinciples(value: string): AboutPrinciple[] {
  return value
    .split('\n')
    .map((line) => line.split('|'))
    .map(([title, ...rest]) => ({
      title: (title ?? '').trim(),
      body: rest.join('|').trim(),
    }))
    .filter((item) => item.title || item.body)
    .slice(0, 10)
}

export function serializePrinciples(principles: AboutPrinciple[]): string {
  return principles.map((item) => `${item.title} | ${item.body}`).join('\n')
}

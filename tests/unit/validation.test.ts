import { describe, expect, it } from 'vitest'
import {
  parsePrinciples,
  parseSkills,
  parseStats,
  parseStory,
  projectFormSchema,
  techToArray,
} from '../../src/lib/validation'

describe('projectFormSchema', () => {
  const valid = {
    title: 'Luma Notes',
    description: 'Умные заметки',
    status: 'in_progress',
    visibility: 'public',
    tech: 'React, TypeScript',
    accent: '#C97B56',
    icon: 'sparkles',
    githubUrl: '',
  }

  it('accepts a valid project', () => {
    expect(projectFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an invalid accent color', () => {
    expect(projectFormSchema.safeParse({ ...valid, accent: 'orange' }).success).toBe(false)
  })

  it('rejects a non-https github url', () => {
    expect(projectFormSchema.safeParse({ ...valid, githubUrl: 'http://example.com' }).success).toBe(false)
  })

  it('rejects an empty title', () => {
    expect(projectFormSchema.safeParse({ ...valid, title: '   ' }).success).toBe(false)
  })
})

describe('form parsers', () => {
  it('splits technologies by comma, trims and deduplicates', () => {
    expect(techToArray(' React, TypeScript, React,  , Firebase ')).toEqual(['React', 'TypeScript', 'Firebase'])
  })

  it('splits story paragraphs by a blank line', () => {
    expect(parseStory('Первый абзац.\n\nВторой абзац.\n\n')).toEqual(['Первый абзац.', 'Второй абзац.'])
  })

  it('parses skills by comma or newline', () => {
    expect(parseSkills('React, TypeScript\nFigma')).toEqual(['React', 'TypeScript', 'Figma'])
  })

  it('parses stats lines', () => {
    expect(parseStats('6+ | лет опыта\n24 | проекта')).toEqual([
      { value: '6+', label: 'лет опыта' },
      { value: '24', label: 'проекта' },
    ])
  })

  it('parses principles lines', () => {
    expect(parsePrinciples('Понять задачу | Сначала выясняю проблему')).toEqual([
      { title: 'Понять задачу', body: 'Сначала выясняю проблему' },
    ])
  })
})

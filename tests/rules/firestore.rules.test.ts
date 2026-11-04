import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'

const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8')
const ownerUid = rules.match(/request\.auth\.uid == '([^']+)'/)?.[1]

if (!ownerUid) throw new Error('Could not read the owner uid from firestore.rules')

let testEnv: RulesTestEnvironment

const now = firebase.firestore.Timestamp.now()

function projectData(visibility: 'public' | 'private') {
  return {
    title: visibility === 'public' ? 'Public project' : 'Private project',
    description: 'Description',
    status: 'in_progress',
    visibility,
    tech: ['React'],
    accent: '#C97B56',
    icon: 'sparkles',
    progress: 50,
    stageCount: 1,
    doneStageCount: 0,
    createdAt: now,
    updatedAt: now,
  }
}

function stageData() {
  return {
    title: 'Stage',
    description: 'Stage description',
    status: 'planned',
    order: 0,
    createdAt: now,
    updatedAt: now,
  }
}

async function seed() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await db.doc('projects/public').set(projectData('public'))
    await db.doc('projects/private').set(projectData('private'))
    await db.doc('projects/public/stages/s1').set(stageData())
    await db.doc('projects/private/stages/s2').set(stageData())
    await db.doc('notes/n1').set({
      projectId: 'public',
      title: 'Note',
      body: 'Body',
      category: 'plan',
      createdAt: now,
      updatedAt: now,
    })
    await db.doc('content/about').set({
      headline: 'Headline',
      intro: 'Intro',
      story: ['Story'],
      stats: [],
      skills: [],
      principles: [],
      portraitMonogram: 'AV',
      contactEmail: 'hello@example.com',
      updatedAt: now,
    })
    await db.doc('meta/owner').set({ initialized: true })
  })
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-av-workspace',
    firestore: { rules },
  })
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await seed()
})

afterAll(async () => {
  if (testEnv) await testEnv.cleanup()
})

describe('guest access', () => {
  it('can read a public project', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertSucceeds(db.doc('projects/public').get())
  })

  it('cannot read a private project', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(db.doc('projects/private').get())
  })

  it('can list public projects only with the visibility filter', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertSucceeds(db.collection('projects').where('visibility', '==', 'public').get())
    await assertFails(db.collection('projects').get())
  })

  it('can read stages of a public project but not of a private one', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertSucceeds(db.doc('projects/public/stages/s1').get())
    await assertFails(db.doc('projects/private/stages/s2').get())
  })

  it('cannot read notes', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(db.doc('notes/n1').get())
    await assertFails(db.collection('notes').get())
  })

  it('can read about but cannot write it', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertSucceeds(db.doc('content/about').get())
    await assertFails(db.doc('content/about').set({ headline: 'Hacked' }))
  })

  it('cannot read the owner probe', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(db.doc('meta/owner').get())
  })

  it('cannot write projects, stages or notes', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(db.doc('projects/new').set(projectData('public')))
    await assertFails(db.doc('projects/public/stages/new').set(stageData()))
    await assertFails(db.doc('notes/new').set({ title: 'Nope' }))
  })
})

describe('non-owner access', () => {
  it('is treated like a guest for private data', async () => {
    const db = testEnv.authenticatedContext('someone-else').firestore()
    await assertSucceeds(db.doc('projects/public').get())
    await assertFails(db.doc('projects/private').get())
    await assertFails(db.doc('notes/n1').get())
    await assertFails(db.doc('meta/owner').get())
  })

  it('cannot write anything', async () => {
    const db = testEnv.authenticatedContext('someone-else').firestore()
    await assertFails(db.doc('projects/new').set(projectData('public')))
    await assertFails(db.doc('content/about').set({ headline: 'Hacked' }))
  })
})

describe('owner access', () => {
  it('can read private projects, notes and the owner probe', async () => {
    const db = testEnv.authenticatedContext(ownerUid).firestore()
    await assertSucceeds(db.doc('projects/private').get())
    await assertSucceeds(db.doc('notes/n1').get())
    await assertSucceeds(db.doc('meta/owner').get())
  })

  it('can create and update a valid project', async () => {
    const db = testEnv.authenticatedContext(ownerUid).firestore()
    await assertSucceeds(db.doc('projects/new').set(projectData('public')))
    await assertSucceeds(db.doc('projects/new').update({ title: 'Updated' }))
  })

  it('cannot write an invalid project', async () => {
    const db = testEnv.authenticatedContext(ownerUid).firestore()
    await assertFails(db.doc('projects/invalid').set({ title: 'No fields' }))
    await assertFails(
      db.doc('projects/invalid').set({ ...projectData('public'), visibility: 'secret' }),
    )
  })

  it('can write stages and notes', async () => {
    const db = testEnv.authenticatedContext(ownerUid).firestore()
    await assertSucceeds(db.doc('projects/public/stages/new').set(stageData()))
    await assertSucceeds(
      db.doc('notes/new').set({
        projectId: 'public',
        title: 'New note',
        body: 'Body',
        category: 'idea',
        createdAt: now,
        updatedAt: now,
      }),
    )
  })
})

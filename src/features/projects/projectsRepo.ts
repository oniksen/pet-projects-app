import {
  collection,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
} from 'firebase/firestore'
import type {
  Note,
  Project,
  ProjectFormValues,
  Stage,
  StageFormValues,
} from '../../types/models'
import { db } from '../../lib/firebase'
import { markWriteStarted } from '../../lib/sync'
import { techToArray } from '../../lib/validation'
import { computeStageCounts } from './projectProgress'

function asProject(id: string, data: Record<string, unknown>): Project {
  return { id, ...(data as Omit<Project, 'id'>) }
}

function sortByUpdatedAtDesc<T extends { updatedAt?: Timestamp }>(items: T[]): T[] {
  const time = (value: Timestamp | undefined) => (value instanceof Timestamp ? value.toMillis() : 0)
  return [...items].sort((a, b) => time(b.updatedAt) - time(a.updatedAt))
}

export function subscribeProjects(
  isAdmin: boolean,
  onData: (projects: Project[]) => void,
  onError: (error: Error) => void,
) {
  const projects = collection(db, 'projects')
  const request = isAdmin
    ? query(projects)
    : query(projects, where('visibility', '==', 'public'))

  return onSnapshot(
    request,
    (snapshot) => {
      onData(sortByUpdatedAtDesc(snapshot.docs.map((item) => asProject(item.id, item.data()))))
    },
    (error) => onError(error as Error),
  )
}

export function subscribeProject(
  projectId: string,
  onData: (project: Project | null) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    doc(db, 'projects', projectId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null)
        return
      }
      onData(asProject(snapshot.id, snapshot.data()))
    },
    (error) => onError(error as Error),
  )
}

export function subscribeStages(
  projectId: string,
  onData: (stages: Stage[]) => void,
  onError: (error: Error) => void,
) {
  const stages = collection(db, 'projects', projectId, 'stages')
  return onSnapshot(
    query(stages, orderBy('order', 'asc')),
    (snapshot) => {
      onData(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Stage, 'id'>) })))
    },
    (error) => onError(error as Error),
  )
}

export function subscribeNotes(
  projectId: string | null,
  onData: (notes: Note[]) => void,
  onError: (error: Error) => void,
) {
  const notes = collection(db, 'notes')
  const request = projectId
    ? query(notes, where('projectId', '==', projectId))
    : query(notes)

  return onSnapshot(
    request,
    (snapshot) => {
      onData(
        sortByUpdatedAtDesc(
          snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Note, 'id'>) })),
        ),
      )
    },
    (error) => onError(error as Error),
  )
}

export async function createProject(values: ProjectFormValues): Promise<string> {
  markWriteStarted()
  const projectRef = doc(collection(db, 'projects'))
  const now = Timestamp.now()
  const data: Omit<Project, 'id'> = {
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
    visibility: values.visibility,
    tech: techToArray(values.tech),
    accent: values.accent,
    icon: values.icon,
    progress: 0,
    stageCount: 0,
    doneStageCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  if (values.githubUrl?.trim()) data.githubUrl = values.githubUrl.trim()
  await setDoc(projectRef, data)
  return projectRef.id
}

export async function updateProject(projectId: string, values: ProjectFormValues): Promise<void> {
  markWriteStarted()
  await updateDoc(doc(db, 'projects', projectId), {
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
    visibility: values.visibility,
    tech: techToArray(values.tech),
    accent: values.accent,
    icon: values.icon,
    githubUrl: values.githubUrl?.trim() ? values.githubUrl.trim() : deleteField(),
    updatedAt: serverTimestamp(),
  })
}

async function deleteReferences(refs: DocumentReference[]): Promise<void> {
  const chunkSize = 450
  for (let index = 0; index < refs.length; index += chunkSize) {
    const batch = writeBatch(db)
    for (const ref of refs.slice(index, index + chunkSize)) batch.delete(ref)
    await batch.commit()
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  markWriteStarted()
  const [stagesSnapshot, notesSnapshot] = await Promise.all([
    getDocs(collection(db, 'projects', projectId, 'stages')),
    getDocs(query(collection(db, 'notes'), where('projectId', '==', projectId))),
  ])

  const refs: DocumentReference[] = [
    ...stagesSnapshot.docs.map((item) => item.ref),
    ...notesSnapshot.docs.map((item) => item.ref),
    doc(db, 'projects', projectId),
  ]
  await deleteReferences(refs)
}

export async function addStage(
  projectId: string,
  values: StageFormValues,
  existingStages: Stage[],
): Promise<void> {
  markWriteStarted()
  const stageRef = doc(collection(db, 'projects', projectId, 'stages'))
  const now = Timestamp.now()
  const stage: Omit<Stage, 'id'> = {
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
    order: existingStages.length,
    createdAt: now,
    updatedAt: now,
  }
  const counts = computeStageCounts([...existingStages, { id: stageRef.id, ...stage }])
  const batch = writeBatch(db)
  batch.set(stageRef, stage)
  batch.update(doc(db, 'projects', projectId), {
    ...counts,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
}

export async function updateStage(
  projectId: string,
  stageId: string,
  values: StageFormValues,
  existingStages: Stage[],
): Promise<void> {
  markWriteStarted()
  const nextStages = existingStages.map((stage) =>
    stage.id === stageId ? { ...stage, ...values } : stage,
  )
  const counts = computeStageCounts(nextStages)
  const batch = writeBatch(db)
  batch.update(doc(db, 'projects', projectId, 'stages', stageId), {
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
    updatedAt: serverTimestamp(),
  })
  batch.update(doc(db, 'projects', projectId), {
    ...counts,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
}

export async function deleteStage(
  projectId: string,
  stageId: string,
  existingStages: Stage[],
): Promise<void> {
  markWriteStarted()
  const nextStages = existingStages.filter((stage) => stage.id !== stageId)
  const counts = computeStageCounts(nextStages)
  const batch = writeBatch(db)
  batch.delete(doc(db, 'projects', projectId, 'stages', stageId))
  batch.update(doc(db, 'projects', projectId), {
    ...counts,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
}

export async function recalcProject(projectId: string): Promise<void> {
  markWriteStarted()
  const snapshot = await getDocs(collection(db, 'projects', projectId, 'stages'))
  const counts = computeStageCounts(
    snapshot.docs.map((item) => item.data() as Omit<Stage, 'id'>),
  )
  await updateDoc(doc(db, 'projects', projectId), {
    ...counts,
    updatedAt: serverTimestamp(),
  })
}

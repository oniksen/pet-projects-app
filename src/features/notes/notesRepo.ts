import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import type { Note, NoteFormValues } from '../../types/models'
import { db } from '../../lib/firebase'
import { markWriteStarted } from '../../lib/sync'

export async function createNote(values: NoteFormValues): Promise<string> {
  markWriteStarted()
  const noteRef = doc(collection(db, 'notes'))
  const now = Timestamp.now()
  const note: Omit<Note, 'id'> = {
    projectId: values.projectId,
    title: values.title.trim(),
    body: values.body.trim(),
    category: values.category,
    createdAt: now,
    updatedAt: now,
  }
  await setDoc(noteRef, note)
  return noteRef.id
}

export async function updateNote(noteId: string, values: NoteFormValues): Promise<void> {
  markWriteStarted()
  await updateDoc(doc(db, 'notes', noteId), {
    projectId: values.projectId,
    title: values.title.trim(),
    body: values.body.trim(),
    category: values.category,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteNote(noteId: string): Promise<void> {
  markWriteStarted()
  await deleteDoc(doc(db, 'notes', noteId))
}

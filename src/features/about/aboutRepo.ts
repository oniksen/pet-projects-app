import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import type { AboutContent, AboutContentData } from '../../types/models'
import { db } from '../../lib/firebase'
import { markWriteStarted } from '../../lib/sync'

export function subscribeAbout(
  onData: (about: AboutContent | null) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    doc(db, 'content', 'about'),
    (snapshot) => {
      onData(snapshot.exists() ? (snapshot.data() as AboutContent) : null)
    },
    (error) => onError(error as Error),
  )
}

export async function saveAbout(values: AboutContentData): Promise<void> {
  markWriteStarted()
  await setDoc(doc(db, 'content', 'about'), {
    ...values,
    updatedAt: serverTimestamp(),
  })
}
